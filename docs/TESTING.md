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

---

## 3. Plan de Pruebas Completo

Generado con exploración Playwright de todas las pantallas. Cubre los 57 casos del plan.

### 3.1 Autenticación

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-01 | Login exitoso | Redirige a `/` (Dashboard) |
| E-02 | Credenciales incorrectas | Mensaje de error, permanece en `/login` |
| E-03 | Email vacío + submit | Validación HTML5 nativa |
| E-04 | Logout | Redirige a `/login`, sesión destruida |
| E-05 | Acceso directo sin sesión a `/menu` | Redirige a `/login` |
| E-06 | Versión visible en sidebar | Muestra `v1.0.0` en botón Cerrar Sesión |

### 3.2 Dashboard (`/`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-07 | Carga KPIs | 4 tarjetas: Pedidos Hoy, Ventas Hoy, En Cocina, Satisfacción |
| E-08 | Tabla pedidos recientes | Columnas: MESA, ITEMS, ESTADO, TOTAL, HORA |
| E-09 | Link "Ver todos" | Redirige a `/orders` |
| E-10 | Link "Ver Menú Completo" | Redirige a `/menu` |
| E-11 | Gráfico de ventas | Renderiza sin errores JS |

### 3.3 Menú (`/menu`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-12 | Lista productos | Grilla con productos y precios |
| E-13 | Abrir modal Nuevo Producto | Modal con campos: nombre, precio, categoría, imagen, descripción |
| E-14 | Crear producto válido | Aparece en lista, modal cierra |
| E-15 | Crear sin nombre | Error de validación |
| E-16 | Crear sin precio | Error de validación |
| E-17 | Editar producto | Modal pre-cargado con datos actuales |
| E-18 | Guardar edición | Precio actualizado en lista |
| E-19 | Toggle disponibilidad | Estado cambia y persiste al recargar |
| E-20 | Eliminar producto | Producto desaparece de la lista |

### 3.4 Pedidos (`/orders`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-21 | Vista kanban | 4 columnas: Pendiente, Cocinando, Listo, Entregado |
| E-22 | Cards de pedido | Muestran mesa, items y total |
| E-23 | Pendiente → Cocinando | Card se mueve a columna Cocinando |
| E-24 | Cocinando → Listo | Card se mueve a columna Listo |
| E-25 | Listo → Entregado | Card se mueve a columna Entregado |
| E-26 | Estado final | Botón "Avanzar Etapa" no disponible |

### 3.5 Clientes (`/customers`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-27 | Lista clientes | Columnas: NOMBRE, EMAIL, TELÉFONO, ACCIONES |
| E-28 | Crear cliente completo | Aparece en tabla |
| E-29 | Crear sin email | Funciona (email opcional) |
| E-30 | Email duplicado | Error de validación |
| E-31 | Editar cliente | Modal pre-cargado, guardar actualiza fila |
| E-32 | Eliminar cliente | Fila desaparece |

### 3.6 Usuarios (`/users`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-33 | Lista usuarios | Columnas: NOMBRE, EMAIL, ROL, ESTADO, ACCIONES |
| E-34 | Crear ADMIN | Aparece con badge ADMIN |
| E-35 | Crear WAITER | Aparece con badge WAITER |
| E-36 | Crear KITCHEN | Aparece con badge KITCHEN |
| E-37 | Password < 8 chars | Error de validación |
| E-38 | Email duplicado | Error: email ya registrado |
| E-39 | Editar rol | Rol actualizado en tabla |
| E-40 | Eliminar usuario | Fila desaparece |

### 3.7 Inventario (`/inventory`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-41 | Tabla inventario | Columnas: PRODUCTO, CATEGORÍA, STOCK ACTUAL, MÍNIMO, ESTADO |
| E-42 | Stock bajo | Celda ESTADO muestra alerta visual |
| E-43 | Actualizar cantidad | Persiste al recargar |
| E-44 | Exportar CSV | Descarga archivo `.csv` |
| E-45 | Historial | Muestra log de cambios |

### 3.8 Configuración (`/settings`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-46 | Carga campos | Pre-cargados con valores actuales de BD |
| E-47 | Guardar nombre restaurante | Toast de confirmación |
| E-48 | Cambiar moneda | Moneda actualizada |
| E-49 | Tax rate > 100 | Error de validación |
| E-50 | Persistencia | Valores siguen cargados tras recargar |

### 3.9 Navegación y sidebar

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-51 | Link activo | Item en sidebar con fondo naranja + font-bold |
| E-52 | Navegación completa | Cada item del sidebar navega correctamente |
| E-53 | Sidebar móvil | Viewport < 768px: hamburguesa abre sidebar |
| E-54 | Cerrar sidebar | Click en overlay cierra el sidebar |
| E-55 | Iconos Material Symbols | Renderizan como símbolos gráficos, no texto |

### 3.10 Seguridad

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| S-01 | XSS en nombre | Almacena como texto plano, no ejecuta |
| S-02 | Acceso `/users` sin sesión | Redirige a `/login` |
| S-03 | Token de sesión expirado | Redirige a `/login` |
| S-04 | WAITER accede a ruta ADMIN | Redirige a `/` o muestra 403 |

### Orden de ejecución recomendado

```
1. npx jest --testPathPattern="tests/unit"   # 62 unit tests
2. npx prisma db seed                         # seed fresco
3. python3 tests/e2e/e2e_tests.py            # 66 E2E tests
```
