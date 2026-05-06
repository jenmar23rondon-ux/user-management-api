-- ============================================================
-- Script de inicialización de la base de datos
-- Ejecutar una sola vez: psql -U postgres -d mi_app -f schema.sql
-- ============================================================

-- Tabla de usuarios de la aplicación
CREATE TABLE IF NOT EXISTS usuarios (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL CHECK (char_length(nombre) >= 2),
  edad        SMALLINT     NOT NULL CHECK (edad >= 0 AND edad <= 120),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tabla de autenticación
CREATE TABLE IF NOT EXISTS auth_users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    TEXT         NOT NULL,
  role        VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
  id            SERIAL PRIMARY KEY,
  usuario_email VARCHAR(255),
  accion        TEXT         NOT NULL,
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índices para mejorar rendimiento en consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_auth_users_email   ON auth_users (email);
CREATE INDEX IF NOT EXISTS idx_auditoria_email    ON auditoria  (usuario_email);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha    ON auditoria  (creado_en DESC);
