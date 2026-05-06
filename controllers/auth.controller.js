const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const registrarAuditoria = require("../utils/auditoria");

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Contraseña válida si:
 * - Al menos 8 caracteres (antes era 6)
 * - Al menos una letra y un número
 */
function passwordValida(password) {
  if (typeof password !== "string" || password.trim().length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

const register = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    if (!emailValido(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    if (!passwordValida(password)) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 8 caracteres, una letra y un número"
      });
    }

    const existe = await pool.query(
      "SELECT id FROM auth_users WHERE email = $1",
      [email]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO auth_users (email, password, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at`,
      [email, passwordHash, "user"]
    );

    await registrarAuditoria(email, "Registro de usuario auth");

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error en register:", error.message);
    res.status(500).json({ error: "Error interno al registrar usuario" });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son obligatorios" });
    }

    if (!emailValido(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    const result = await pool.query(
      "SELECT id, email, password, role FROM auth_users WHERE email = $1",
      [email]
    );

    // Mensaje genérico para no revelar si el email existe o no
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const usuario = result.rows[0];

    const passwordOk = await bcrypt.compare(password, usuario.password);

    if (!passwordOk) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await registrarAuditoria(usuario.email, "Inicio de sesión");

    res.json({
      mensaje: "Login correcto",
      token,
      expiresIn: 3600
    });
  } catch (error) {
    console.error("Error en login:", error.message);
    res.status(500).json({ error: "Error interno en login" });
  }
};

module.exports = { register, login };
