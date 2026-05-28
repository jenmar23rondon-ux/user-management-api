# mi-proyecto-backend

A REST API for user management built with **Node.js**, **Express** and **PostgreSQL**, featuring JWT authentication, role-based access control, and production-ready security middleware.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Server and routing |
| PostgreSQL + pg | Database |
| JWT (jsonwebtoken) | Authentication |
| bcrypt | Password hashing |
| Helmet | HTTP security headers |
| CORS | Cross-origin resource sharing |
| express-rate-limit | Request throttling |
| dotenv | Environment variables |

---

## Project Structure

```
mi-proyecto-backend/
├── config/
│   └── db.js                  # PostgreSQL connection pool
├── controllers/
│   ├── auth.controller.js     # Register and login logic
│   └── usuarios.controller.js # User CRUD operations
├── database/
│   └── schema.sql             # Database schema and indexes
├── middlewares/
│   └── auth.middleware.js     # JWT verification middleware
├── routes/
│   ├── auth.routes.js         # Authentication routes
│   └── usuarios.routes.js     # User routes
├── utils/
│   └── auditoria.js           # Audit log helper
├── frontend/                  # Static client files
├── server.js                  # Application entry point
├── .env.example               # Environment variables template
└── package.json
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jenmar23rondon-ux/mi-proyecto-backend.git
cd mi-proyecto-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Fill in your values in `.env`:

```env
PORT=3000

DB_USER=postgres
DB_HOST=localhost
DB_NAME=mi_app
DB_PASSWORD=your_password
DB_PORT=5432

JWT_SECRET=your_long_random_secret
ALLOWED_ORIGINS=http://127.0.0.1:5500,http://localhost:5500
```

> Generate a secure JWT_SECRET with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 4. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE mi_app;"
psql -U postgres -d mi_app -f database/schema.sql
```

### 5. Run the server

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

Server will be available at `http://localhost:3000`

---

## API Endpoints

### Authentication

| Method | Route | Description | Auth required |
|--------|-------|-------------|---------------|
| POST | `/auth/register` | Register a new account | No |
| POST | `/auth/login` | Log in and get a token | No |

#### POST /auth/register
```json
{
  "email": "user@example.com",
  "password": "MyPass123"
}
```

#### POST /auth/login
```json
{
  "email": "user@example.com",
  "password": "MyPass123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "7d"
}
```

---

### Users

> All user endpoints require the header:
> `Authorization: Bearer <token>`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/usuarios` | List all users |
| GET | `/usuarios/:id` | Get a user by ID |
| POST | `/usuarios` | Create a new user |
| PUT | `/usuarios/:id` | Update a user |
| DELETE | `/usuarios/:id` | Delete a user |

#### POST /usuarios — Request body
```json
{
  "nombre": "John Doe",
  "edad": 30
}
```

---

## Security Features

- **JWT** authentication with 7-day expiration
- **bcrypt** password hashing (10 salt rounds)
- **Helmet** with Content Security Policy enabled
- **CORS** with configurable origin whitelist
- **Rate limiting**: max 100 requests per 15 minutes
- **Audit log**: all actions recorded in the database
- **Input validation**: password requires min. 8 chars with letters and numbers
- **Payload limit**: max 10kb per request

---

## Database Schema

**`usuarios`** — Application users
```sql
id, nombre, edad, created_at, updated_at
```

**`auth_users`** — Authentication credentials
```sql
id, email, password, role (user | admin), created_at
```

**`auditoria`** — Action audit log
```sql
id, usuario_email, accion, creado_en
```

---

## Deployment

This project is deployed on [Railway](https://railway.app).

Required environment variables on Railway:
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
ALLOWED_ORIGINS=https://your-frontend.vercel.app
NODE_ENV=production
```

---

## Author

**Arcangel Rondon** — [@jenmar23rondon-ux](https://github.com/jenmar23rondon-ux)
