const pool = require("../db");

// Validar ID
function validarId(id) {
    const idNumero = Number(id);
    return Number.isInteger(idNumero) && idNumero > 0;
}

// Validar datos del usuario
function validarUsuario(nombre, edad) {
    if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
        return "El nombre es obligatorio y debe ser un texto válido";
    }

    if (!Number.isInteger(edad) || edad < 0) {
        return "La edad debe ser un número entero válido";
    }

    return null;
}

// GET -> todos los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM usuarios ORDER BY id ASC");

        res.json({
            mensaje: "Lista de usuarios",
            data: result.rows
        });
    } catch (error) {
        console.error("Error al obtener usuarios:", error.message);
        res.status(500).json({ error: "Error interno al obtener usuarios" });
    }
};

// GET -> usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validarId(id)) {
            return res.status(400).json({
                error: "El ID debe ser un número entero positivo"
            });
        }

        const result = await pool.query(
            "SELECT * FROM usuarios WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }

        res.json({
            mensaje: "Usuario encontrado",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error al buscar usuario:", error.message);
        res.status(500).json({ error: "Error interno al buscar usuario" });
    }
};

// POST -> crear usuario
const crearUsuario = async (req, res) => {
    try {
        const { nombre, edad } = req.body;

        const errorValidacion = validarUsuario(nombre, edad);
        if (errorValidacion) {
            return res.status(400).json({ error: errorValidacion });
        }

        const result = await pool.query(
            "INSERT INTO usuarios (nombre, edad) VALUES ($1, $2) RETURNING *",
            [nombre.trim(), edad]
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

// PUT -> actualizar usuario
const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, edad } = req.body;

        if (!validarId(id)) {
            return res.status(400).json({
                error: "El ID debe ser un número entero positivo"
            });
        }

        const errorValidacion = validarUsuario(nombre, edad);
        if (errorValidacion) {
            return res.status(400).json({ error: errorValidacion });
        }

        const result = await pool.query(
            "UPDATE usuarios SET nombre = $1, edad = $2 WHERE id = $3 RETURNING *",
            [nombre.trim(), edad, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }

        res.json({
            mensaje: "Usuario actualizado correctamente",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error al actualizar usuario:", error.message);
        res.status(500).json({ error: "Error interno al actualizar usuario" });
    }
};

// DELETE -> eliminar usuario
const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validarId(id)) {
            return res.status(400).json({
                error: "El ID debe ser un número entero positivo"
            });
        }

        const result = await pool.query(
            "DELETE FROM usuarios WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }

        res.json({
            mensaje: "Usuario eliminado correctamente",
            data: result.rows[0]
        });
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