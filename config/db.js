require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 10,                    // máximo de conexiones simultáneas
  idleTimeoutMillis: 30000,   // cerrar conexión idle después de 30s
  connectionTimeoutMillis: 5000 // error si no conecta en 5s
});

// Capturar errores de conexión inesperados sin tumbar el proceso
pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err.message);
});

module.exports = pool;