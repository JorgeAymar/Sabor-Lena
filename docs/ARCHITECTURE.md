# Arquitectura del Sistema

## Visión general

Sabor & Leña Admin es una aplicación monolítica **server-first** construida con Next.js 16 App Router. La lógica de mutación de datos vive en Server Actions (no hay una API REST separada). El frontend se renderiza en el servidor (RSC) y los componentes interactivos reciben datos como props.

```
┌─────────────────────────────────────────────────┐
│  Browser                                        │
│  Client Components (React)                      │
│    ↓ form action / onClick                      │
│  Server Actions  ←──── Auth Guard               │
│    ↓                       ↓                    │
│  Prisma ORM            NextAuth v5              │
│    ↓                       ↓                    │
│  PostgreSQL 16         JWT Cookie               │
└─────────────────────────────────────────────────┘
```

---

## Estructura de directorios

```
src/
├── app/
│   ├── (dashboard)/          # Grupo de rutas protegidas por middleware
│   │   ├── layout.tsx         # Layout compartido: Sidebar + contenido
│   │   ├── page.tsx           # / → Dashboard (KPIs, pedidos recientes)
│   │   ├── menu/page.tsx      # /menu → Gestión de productos
│   │   ├── orders/page.tsx    # /orders → Kanban de pedidos
│   │   ├── customers/page.tsx # /customers → Tabla de clientes
│   │   ├── users/page.tsx     # /users → Gestión de usuarios
│   │   ├── inventory/page.tsx # /inventory → Control de stock
│   │   ├── settings/page.tsx  # /settings → Configuración del restaurante
│   │   └── reports/page.tsx   # /reports → Gráficos de ventas
│   ├── actions/               # Server Actions (lógica de negocio)
│   │   ├── auth.ts            # authenticate (login)
│   │   ├── auth-actions.ts    # logout
│   │   ├── products.ts        # CRUD productos + toggle disponibilidad
│   │   ├── orders.ts          # updateOrderStatus
│   │   ├── customers.ts       # CRUD clientes
│   │   └── users.ts           # CRUD usuarios
│   ├── api/auth/[...nextauth]/route.ts  # Handler NextAuth
│   ├── login/page.tsx         # Página pública de login
│   └── layout.tsx             # Root layout (fuentes, metadata)
├── components/
│   ├── Sidebar.tsx            # Navegación lateral + logout
│   ├── LoginForm.tsx          # Formulario de login
│   ├── Modal.tsx              # Modal genérico reutilizable
│   ├── MenuClient.tsx         # UI interactiva de /menu
│   ├── OrdersClient.tsx       # Kanban interactivo de /orders
│   ├── CustomersClient.tsx    # Tabla + modal de /customers
│   ├── UsersClient.tsx        # Tabla + modal de /users
│   └── SalesChart.tsx         # Gráfico de ventas (Recharts)
├── lib/
│   ├── prisma.ts              # Singleton PrismaClient
│   └── auth-guard.ts          # Guards de autorización por rol
├── types/
│   ├── index.ts               # Tipos compartidos
│   └── next-auth.d.ts         # Augmentación del tipo Session
├── auth.ts                    # Configuración NextAuth (authorize + callbacks)
├── auth.config.ts             # Configuración middleware NextAuth
└── middleware.ts              # Protección de rutas (Edge Runtime)
```

---

## Flujo de autenticación

```
1. POST /login
   └── LoginForm.tsx
       └── authenticate() [Server Action]
           └── signIn('credentials', { email, password, redirectTo: '/' })
               └── auth.ts → authorize()
                   ├── prisma.user.findUnique({ where: { email } })
                   ├── bcrypt.compare(password, user.password)
                   └── return { id, name, email, role }  ← sin password hash

2. JWT creado con callbacks:
   jwt: token.role = user.role
   session: session.user.role = token.role

3. Cada request al dashboard:
   middleware.ts → NextAuth(authConfig).auth
   └── authorized({ auth }) → si !auth.user → redirect /login
```

---

## Flujo de una Server Action protegida

```
Client Component
  └── handleSubmit(formData)
      └── createProduct(undefined, formData)  [Server Action]
          ├── requireAdmin()           ← lanza UnauthorizedError / ForbiddenError
          ├── Zod.safeParse(rawData)   ← valida input
          ├── prisma.product.create()  ← persiste
          └── revalidatePath('/menu') ← invalida caché RSC
```

---

## Modelo de datos (ERD)

```
User
  id, name, email (unique), password (bcrypt), role (ADMIN|WAITER|KITCHEN), status, createdAt

Product
  id, name, categoryId → Category, price, image?, description?, isAvailable, createdAt
  └── OrderItem[] (1:N)
  └── InventoryItem (1:1)

Category
  id, name (unique)
  └── Product[] (1:N)

Order
  id, tableNumber, status (PENDING|COOKING|READY|DELIVERED|CANCELLED), total, createdAt
  └── OrderItem[] (1:N)

OrderItem
  id, orderId → Order, productId → Product, quantity, price

Customer
  id, name, phone?, email (unique)?, totalSpent, lastVisit, createdAt

InventoryItem
  id, productId → Product (unique), quantity, unit, minStock

Setting
  id, key (unique), value
```

**Índices disponibles:**

| Modelo | Índice |
|--------|--------|
| User | role, status, createdAt |
| Product | categoryId, isAvailable, name |
| Order | status, createdAt, tableNumber |
| Customer | name, lastVisit, createdAt |
| InventoryItem | productId, quantity |

---

## Autorización por rol

```
src/lib/auth-guard.ts

requireAuth()           → cualquier usuario autenticado
requireAdmin()          → solo ADMIN
requireAdminOrWaiter()  → ADMIN o WAITER
requireAdminOrKitchen() → ADMIN o KITCHEN
```

| Acción | Guard requerido |
|--------|----------------|
| CRUD productos | `requireAdmin` |
| CRUD usuarios | `requireAdmin` |
| Configuración | `requireAdmin` |
| Listar categorías | `requireAdmin` |
| CRUD clientes | `requireAdminOrWaiter` |
| Actualizar stock | `requireAdminOrWaiter` |
| Cambiar estado de pedido | `requireAdminOrKitchen` |

---

## Headers de seguridad HTTP

Definidos en `next.config.ts`:

| Header | Valor |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; ...` |
