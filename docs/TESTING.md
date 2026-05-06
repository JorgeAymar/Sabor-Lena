# Guía de Pruebas

## Resumen de cobertura

| Suite | Herramienta | Tests | Estado |
|-------|-------------|-------|--------|
| Unit — products | Jest | 16 | ✅ |
| Unit — customers | Jest | 13 | ✅ |
| Unit — users | Jest | 10 | ✅ |
| Unit — orders | Jest | 9 | ✅ |
| Unit — auth-actions | Jest | 6 | ✅ |
| E2E — Login | Playwright | 5 | ✅ |
| E2E — Dashboard | Playwright | 10 | ✅ |
| E2E — Menú | Playwright | 9 | ✅ |
| E2E — Pedidos | Playwright | 6 | ✅ |
| E2E — Clientes | Playwright | 10 | ✅ |
| E2E — Usuarios | Playwright | 11 | ✅ |
| E2E — Inventario | Playwright | 6 | ✅ |
| E2E — Configuración | Playwright | 5 | ✅ |
| E2E — Seguridad | Playwright | 4 | ✅ |
| **Total** | | **120** | **✅** |

---

## 1. Pruebas Unitarias (Jest)

Validan la lógica de cada Server Action de forma aislada, sin tocar la base de datos ni la red.

### Prerrequisitos

```bash
npm install   # dependencias ya incluyen jest, ts-jest
```

### Ejecución

```bash
# Todas las suites
npx jest --testPathPattern="tests/unit"

# Suite específica
npx jest tests/unit/products.test.ts

# Con cobertura
npx jest --coverage --testPathPattern="tests/unit"
```

### Estructura

```
tests/
├── mocks/
│   ├── auth.ts          # Mock de @/auth (signIn, signOut, handlers)
│   └── next-auth.ts     # Mock de next-auth (AuthError)
└── unit/
    ├── products.test.ts    # createProduct, updateProduct, deleteProduct, toggleAvailability
    ├── customers.test.ts   # createCustomer, updateCustomer, deleteCustomer
    ├── users.test.ts       # createUser, updateUser, deleteUser
    ├── orders.test.ts      # updateOrderStatus
    └── auth-actions.test.ts  # authenticate, logout
```

### Patrón de mock para auth-guard

Cada suite que prueba una acción protegida debe mockear `@/lib/auth-guard`:

```typescript
jest.mock('@/lib/auth-guard', () => ({
  requireAdmin: jest.fn(),
  requireAdminOrWaiter: jest.fn(),
  requireAdminOrKitchen: jest.fn(),
  handleAuthError: jest.fn((error) => {
    if (error instanceof UnauthorizedError) return { success: false, error: 'Unauthorized' };
    if (error instanceof ForbiddenError) return { success: false, error: 'Forbidden' };
    return { success: false, error: 'Unknown' };
  }),
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(msg = 'Unauthorized') { super(msg); this.name = 'UnauthorizedError'; }
  },
  ForbiddenError: class ForbiddenError extends Error {
    constructor(msg = 'Forbidden') { super(msg); this.name = 'ForbiddenError'; }
  },
}));
```

> Las clases de error deben redeclararse dentro del factory del mock para que `instanceof` funcione correctamente en el scope del mock de Jest.

### Casos cubiertos por suite

**products.test.ts**
- `createProduct`: campo requerido faltante, precio negativo, categoría vacía, éxito completo, error de BD
- `updateProduct`: validación de UUID, éxito de actualización, error de BD
- `deleteProduct`: éxito, error de BD
- `toggleProductAvailability`: cambia `true → false`, cambia `false → true`
- `getCategories`: retorna lista, maneja error de BD

**customers.test.ts**
- `createCustomer`: nombre muy corto, email inválido, duplicado, éxito solo-nombre, éxito completo
- `updateCustomer`: email inválido, éxito de actualización
- `deleteCustomer`: éxito, error de BD

**users.test.ts**
- `createUser`: email inválido, rol inválido, email duplicado, éxito
- Respuesta segura: verifica que no incluye `password`, `status`, `createdAt`
- `updateUser`: éxito de actualización
- `deleteUser`: éxito, error de BD

**orders.test.ts**
- `updateOrderStatus`: transiciones válidas (PENDING→COOKING, COOKING→READY, READY→DELIVERED)
- Estado inválido rechazado por Zod
- UUID inválido rechazado
- Error de BD manejado

**auth-actions.test.ts**
- `authenticate`: llama `signIn` con campos correctos, maneja `CredentialsSignin`, maneja otros `AuthError`, relanza errores no-auth, no expone internals, incluye `redirectTo: '/'`
- `logout`: llama `signOut`

---

## 2. Pruebas E2E (Playwright)

Validan flujos completos desde el navegador contra la aplicación real.

### Prerrequisitos

```bash
# Servidor corriendo en localhost:3000
npm run dev

# DB disponible con datos seed
npx prisma db seed

# Playwright instalado
pip install playwright
playwright install chromium
```

### Ejecución

```bash
# Asegurar seed fresco antes de correr (los tests avanzan pedidos)
npx prisma db seed && python3 tests/e2e/e2e_tests.py
```

### Archivo de tests

`tests/e2e/e2e_tests.py` — script Python con Playwright sync API.

### IDs de test y qué verifican

| ID | Sección | Descripción |
|----|---------|-------------|
| S-01 | Seguridad | `/customers` sin sesión redirige a `/login` |
| S-02 | Seguridad | `/settings` sin sesión redirige a `/login` |
| S-03 | Seguridad | `/users` sin sesión redirige a `/login` |
| E-AUTH-01 | Login | Login exitoso redirige al dashboard |
| E-AUTH-02 | Login | Credenciales incorrectas permanece en `/login` |
| E-AUTH-03 | Login | Campo email con type=email presente |
| E-AUTH-04 | Login | Campo password con type=password presente |
| E-AUTH-05a | Login | Botón "Iniciar Sesión" presente |
| E-AUTH-08 | Seguridad | Botón "Cerrar Sesión" presente en sidebar |
| E-DASH-01 | Dashboard | KPI "Pedidos Hoy" visible |
| E-DASH-02 | Dashboard | KPI "Ventas Hoy" visible |
| E-DASH-03 | Dashboard | KPI "En Cocina" visible |
| E-DASH-04 | Dashboard | Tabla "Pedidos Recientes" con columnas |
| E-NAV-01 | Navegación | Sidebar con ≥5 links |
| E-NAV-03a–e | Navegación | Links a /orders, /menu, /customers, /users, /settings |
| E-MENU-01 | Menú | `/menu` carga correctamente |
| E-MENU-02 | Menú | Modal "Crear Nuevo Producto" se abre |
| E-MENU-03a–c | Menú | Campos Nombre, Precio, Categoría en modal |
| E-MENU-04 | Menú | Submit sin nombre bloquea creación |
| E-MENU-06 | Menú | Producto creado aparece en tabla |
| E-MENU-10 | Menú | Toggle disponibilidad funciona |
| E-ORD-01 | Pedidos | `/orders` carga correctamente |
| E-ORD-01a–d | Pedidos | Columnas PENDING, COOKING, READY, DELIVERED visibles |
| E-ORD-08 | Pedidos | "Avanzar Etapa" mueve pedido a siguiente columna |
| E-CUST-01a–b | Clientes | Columnas Nombre y Email en tabla |
| E-CUST-02 | Clientes | Modal "Nuevo Cliente" se abre |
| E-CUST-03a–c | Clientes | Campos Nombre, Email, Teléfono en modal |
| E-CUST-05 | Clientes | Email inválido no crea cliente |
| E-CUST-06 | Clientes | Crear cliente solo con nombre |
| E-CUST-07 | Clientes | Crear cliente con todos los campos |
| E-CUST-13 | Clientes | Cancelar/Escape cierra el modal |
| E-USR-01a–c | Usuarios | Columnas Nombre, Rol, Estado en tabla |
| E-USR-03 | Usuarios | Badges de rol visibles |
| E-USR-06 | Usuarios | Modal "Crear Nuevo Usuario" se abre |
| E-USR-07a–b | Usuarios | Campos Nombre y Email en modal |
| E-USR-08 | Usuarios | Select Rol presente |
| E-USR-08a | Usuarios | Select tiene 3 opciones (Camarero, Cocina, Administrador) |
| E-USR-09 | Usuarios | Email inválido no crea usuario |
| E-USR-10 | Usuarios | Nuevo usuario aparece en tabla |
| E-INV-01a–d | Inventario | Columnas Producto, Stock Actual, Mínimo, Estado |
| E-INV-04 | Inventario | Inputs de quantity editables |
| E-INV-05 | Inventario | Actualizar stock funciona |
| E-SET-01a | Configuración | Campo Nombre del Restaurante |
| E-SET-01c | Configuración | Campo Impuesto |
| E-SET-02 | Configuración | Select Moneda con opciones |
| E-SET-04 | Configuración | Nombre persiste tras guardar |
| E-SET-05 | Configuración | Moneda CLP persiste tras guardar |

### Nota sobre AUTH_URL

Los tests de seguridad (S-01/S-02/S-03) verifican que rutas protegidas redirijan a `/login`. Para que esto funcione, `AUTH_URL` en `.env` **debe** coincidir con el puerto donde corre el servidor:

```ini
AUTH_URL="http://localhost:3000"
```

Si el valor es incorrecto, NextAuth redirige al puerto equivocado y Playwright recibe `ERR_CONNECTION_REFUSED`.

### Por qué los tests de seguridad van primero

Los tests S-01/S-02/S-03 se ejecutan al inicio del script, antes de cualquier Server Action que llame a `revalidatePath`. Esto evita que el dev server de Next.js haga hot-reload durante la prueba y corte las conexiones del segundo contexto de navegador.
