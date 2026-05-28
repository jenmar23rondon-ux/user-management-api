# mi-proyecto-backend

API REST de usuarios construida con **Node.js**, **Express** y **PostgreSQL**, con autenticación JWT, seguridad con Helmet y control de acceso por roles.

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor y rutas |
| PostgreSQL + pg | Base de datos |
| JWT (jsonwebtoken) | Autenticación |
| bcrypt | Hash de contraseñas |
| Helmet | Seguridad HTTP |
| CORS | Control de orígenes |
| express-rate-limit | Límite de peticiones |
| dotenv | Variables de entorno |

---

## Estructura del proyecto

```
mi-proyecto-backend/
├── config/
│   └── db.js                  # Conexión al pool de PostgreSQL
├── controllers/
│   ├── auth.controller.js     # Lógica de registro y login
│   └── usuarios.controller.js # CRUD de usuarios
├── database/
│   └── schema.sql             # Script de creación de tablas
├── middlewares/
│   └── auth.middleware.js     # Verificación de JWT
├── routes/
│   ├── auth.routes.js         # Rutas de autenticación
│   └── usuarios.routes.js     # Rutas de usuarios
├── utils/
│   └── auditoria.js           # Registro de auditoría
├── frontend/                  # Archivos estáticos del cliente
├── server.js                  # Punto de entrada principal
├── .env.example               # Plantilla de variables de entorno
└── package.json
```

---

## Instalación local

### 1. Clonar el repositorio

```bash
git clone https://github.com/jenmar23rondon-ux/mi-proyecto-backend.git
cd mi-proyecto-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```env
PORT=3000

DB_USER=postgres
DB_HOST=localhost
DB_NAME=mi_app
DB_PASSWORD=tu_password
DB_PORT=5432

JWT_SECRET=genera_uno_con_openssl_rand_-hex_64
ALLOWED_ORIGINS=http://127.0.0.1:5500,http://localhost:5500
```

> Genera un JWT_SECRET seguro con:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 4. Crear la base de datos

```bash
psql -U postgres -c "CREATE DATABASE mi_app;"
psql -U postgres -d mi_app -f database/schema.sql
```

### 5. Iniciar el servidor

```bash
# Produccion
npm start

# Desarrollo (recarga automatica)
npm run dev
```

El servidor estara disponible en `http://localhost:3000`

---

## Endpoints

### Autenticacion

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesion | No |

#### POST /auth/register
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPass123"
}
```

#### POST /auth/login
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPass123"
}
```
**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "7d"
}
```

---

### Usuarios

> Todos los endpoints de usuarios requieren el header:
> `Authorization: Bearer <token>`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/usuarios` | Listar todos los usuarios |
| GET | `/usuarios/:id` | Obtener un usuario por ID |
| POST | `/usuarios` | Crear un usuario |
| PUT | `/usuarios/:id` | Actualizar un usuario |
| DELETE | `/usuarios/:id` | Eliminar un usuario |

#### POST /usuarios
```json
{
  "nombre": "Juan Perez",
  "edad": 30
}
```

---

## Seguridad implementada

- **JWT** con expiracion de 7 dias
- **bcrypt** para hash de contrasenas (salt rounds: 10)
- **Helmet** con Content Security Policy activado
- **CORS** con lista blanca de origenes configurables
- **Rate limiting**: maximo 100 peticiones cada 15 minutos
- **Auditoria**: registro de acciones en base de datos
- **Validacion**: contrasena minimo 8 caracteres, con letras y numeros
- **Payload limitado**: maximo 10kb por peticion

---

## Base de datos

### Tablas

**`usuarios`** — Datos de los usuarios
```sql
id, nombre, edad, created_at, updated_at
```

**`auth_users`** — Credenciales de autenticacion
```sql
id, email, password, role (user | admin), created_at
```

**`auditoria`** — Registro de acciones
```sql
id, usuario_email, accion, creado_en
```

---

## Despliegue en Railway

Este proyecto esta desplegado en [Railway](https://railway.app).

Variables de entorno requeridas en Railway:
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
ALLOWED_ORIGINS=https://tu-frontend.vercel.app
NODE_ENV=production
```

---

## Autor

**Arcangel Rondon** — [@jenmar23rondon-ux](https://github.com/jenmar23rondon-ux)
