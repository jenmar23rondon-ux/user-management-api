require("dotenv").config();
const express = require("express");
const usuariosRoutes = require("./routes/usuarios.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para leer JSON
app.use(express.json());

// Middleware para mostrar en consola el método y la ruta
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Ruta principal
app.get("/", (req, res) => {
    res.json({ mensaje: "API funcionando con PostgreSQL" });
});

// Rutas de usuarios
app.use("/usuarios", usuariosRoutes);

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});