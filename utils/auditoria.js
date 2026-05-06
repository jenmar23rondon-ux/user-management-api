const pool = require("../config/db");

/**
 * Registra una acción en la tabla de auditoría.
 * Nunca lanza excepción para no interrumpir el flujo principal.
 */
async function registrarAuditoria(usuarioEmail, accion) {
  try {
    await pool.query(
      "INSERT INTO auditoria (usuario_email, accion) VALUES ($1, $2)",
      [usuarioEmail, accion]
    );
  } catch (error) {
    console.error("Error al registrar auditoría:", error.message);
  }
}

module.exports = registrarAuditoria;
