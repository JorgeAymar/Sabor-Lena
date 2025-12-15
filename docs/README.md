# Sabor & Leña - Admin Panel

Panel de administración para el restaurante Sabor & Leña, construido con Next.js, Prisma y Postgres.

## Características Principales
- **Dashboard**: Vista general de métricas del restaurante.
- **Pedidos**: Gestión de comandas en tiempo real.
- **Menú**: Administración de productos y categorías.
- **Usuarios**: Gestión de personal y roles (Admin, Camarero, Cocina).
- **Inventario**: Control de stock de ingredientes.

## Tecnologías
- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: NextAuth.js v5 (Beta)
- **UI**: TailwindCSS
- **Pruebas**: Jest (Unitarias) + Playwright (E2E)

## Estructura del Proyecto
- `src/app`: Rutas y vistas de la aplicación.
- `src/components`: Componentes reutilizables (Sidebar, Forms, UI).
- `src/lib`: Utilidades (cliente Prisma).
- `prisma`: Esquema de BD y scripts de seed.
- `tests`: Tests E2E y unitarios.
