const express = require("express");
const router = express.Router();

const usuariosController = require("../controllers/usuarios.controller");
const verificarToken = require("../middlewares/auth.middleware");
const verificarRol = require("../middlewares/role.middleware");

router.get("/", verificarToken, usuariosController.obtenerUsuarios);
router.get("/:id", verificarToken, usuariosController.obtenerUsuarioPorId);
router.post("/", verificarToken, usuariosController.crearUsuario);
router.put("/:id", verificarToken, usuariosController.actualizarUsuario);
router.delete("/:id", verificarToken, verificarRol("admin"), usuariosController.eliminarUsuario);

module.exports = router;