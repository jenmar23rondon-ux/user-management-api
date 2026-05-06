require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const usuariosRoutes = require("./routes/usuarios.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Helmet con CSP básico habilitado
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    }
  })
);

// CORS — leer orígenes desde variable de entorno o usar defaults de desarrollo
const rawOrigins = process.env.ALLOWED_ORIGINS || "http://127.0.0.1:5500,http://localhost:5500";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

const esDev = process.env.NODE_ENV !== "production";

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (Postman, curl, etc.)
      // En desarrollo también se permite origin null (archivo abierto directo en browser)
      if (!origin || allowedOrigins.includes(origin) || (esDev && origin === "null")) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origen no permitido → ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas peticiones. Intenta más tarde."
  }
});

app.use(limiter);

// Leer JSON con límite de tamaño explícito
app.use(express.json({ limit: "10kb" }));

// Logging con método, ruta, status y tiempo de respuesta
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - inicio;
    console.log(`${req.method} ${req.url} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// Ruta principal
app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando con PostgreSQL" });
});

// Rutas
app.use("/usuarios", usuariosRoutes);
app.use("/auth", authRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Error handler global — captura cualquier error no manejado en controladores
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});