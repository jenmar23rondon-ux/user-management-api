const pool = require("../config/db");
const registrarAuditoria = require("../utils/auditoria");

function validarId(id) {
  const idNumero = Number(id);
  return Number.isInteger(idNumero) && idNumero > 0;
}

function validarUsuario(nombre, edad) {
  if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2) {
    return "El nombre debe tener al menos 2 caracteres";
  }

  if (nombre.trim().length > 100) {
    return "El nombre no puede superar los 100 caracteres";
  }

  const edadNumero = Number(edad);

  if (!Number.isInteger(edadNumero) || edadNumero < 0 || edadNumero > 120) {
    return "La edad debe ser un número entero entre 0 y 120";
  }

  return null;
}

const obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, edad, created_at, updated_at FROM usuarios ORDER BY id ASC"
    );

    res.json({
      mensaje: "Lista de usuarios",
      total: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);
    res.status(500).json({ error: "Error interno al obtener usuarios" });
  }
};

const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validarId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const result = await pool.query(
      "SELECT id, nombre, edad, created_at, updated_at FROM usuarios WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      mensaje: "Usuario encontrado",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error.message);
    res.status(500).json({ error: "Error interno al obtener usuario" });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const { nombre, edad } = req.body;
    const errorValidacion = validarUsuario(nombre, edad);

    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, edad)
       VALUES ($1, $2)
       RETURNING id, nombre, edad, created_at`,
      [nombre.trim(), Number(edad)]
    );

    await registrarAuditoria(
      req.usuario?.email || "desconocido",
      `Creó usuario ${result.rows[0].nombre}`
    );

    res.status(201).json({
      mensaje: "Usuario creado correctamente",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error al crear usuario:", error.message);
    res.status(500).json({ error: "Error interno al crear usuario" });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, edad } = req.body;

    if (!validarId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const errorValidacion = validarUsuario(nombre, edad);

    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = $1, edad = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, nombre, edad, updated_at`,
      [nombre.trim(), Number(edad), id]
    );

    await registrarAuditoria(
      req.usuario?.email || "desconocido",
      `Actualizó usuario ID ${id}`
    );

    res.json({
      mensaje: "Usuario actualizado correctamente",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error.message);
    res.status(500).json({ error: "Error interno al actualizar usuario" });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validarId(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const existe = await pool.query(
      "SELECT id, nombre FROM usuarios WHERE id = $1",
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);

    await registrarAuditoria(
      req.usuario?.email || "desconocido",
      `Eliminó usuario ID ${id} (${existe.rows[0].nombre})`
    );

    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error.message);
    res.status(500).json({ error: "Error interno al eliminar usuario" });
  }
};

module.exports = {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};
