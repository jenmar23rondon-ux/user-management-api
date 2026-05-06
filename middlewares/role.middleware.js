function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({
        error: "No tienes permisos para esta acción"
      });
    }

    next();
  };
}

module.exports = verificarRol;