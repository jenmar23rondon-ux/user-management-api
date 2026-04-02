const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuarios.controller");

// GET -> todos los usuarios
router.get("/", usuariosController.obtenerUsuarios);

// GET -> usuario por ID
router.get("/:id", usuariosController.obtenerUsuarioPorId);

// POST -> crear usuario
router.post("/", usuariosController.crearUsuario);

// PUT -> actualizar usuario
router.put("/:id", usuariosController.actualizarUsuario);

// DELETE -> eliminar usuario
router.delete("/:id", usuariosController.eliminarUsuario);

module.exports = router;