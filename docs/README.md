# Documentación — Sabor & Leña Admin

## Índice

| Documento | Descripción |
|-----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Estructura del proyecto, flujos de auth, modelo de datos, guards de autorización |
| [DATA_MODEL.md](DATA_MODEL.md) | Referencia completa de los modelos Prisma, campos, índices y relaciones |
| [SERVER_ACTIONS.md](SERVER_ACTIONS.md) | Referencia de todas las Server Actions: guards, validaciones, tipos de retorno |
| [TESTING.md](TESTING.md) | Cómo correr tests unitarios (Jest) y E2E (Playwright), cobertura por suite |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Despliegue en VPS con Docker Compose + Nginx, SSL, respaldos |
| [SECURITY_AUDIT.md](SECURITY_AUDIT.md) | Informe completo de auditoría de seguridad y fixes aplicados |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Setup local, convenciones de código, cómo agregar features |

---

## Resumen rápido

**Stack:** Next.js 16 App Router · PostgreSQL 16 · Prisma ORM · NextAuth v5 · Zod · Tailwind CSS

**Tests:** 62 unit (Jest) + 66 E2E (Playwright/Chromium) — todos pasando

**Roles:** `ADMIN` (acceso total) · `WAITER` (pedidos + clientes + stock) · `KITCHEN` (estado de pedidos)

**Credenciales dev:** `admin@sabor.com` / `password123`
