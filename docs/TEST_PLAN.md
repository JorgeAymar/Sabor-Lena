# Plan de Pruebas — Sabor & Leña Admin Panel

Generado mediante exploración Playwright de todas las pantallas de la aplicación.

## Resumen

| Área | Tipo | Casos |
|------|------|-------|
| Auth Guard + validación Zod | Unitaria (Jest) | 22 |
| Login / Logout | E2E | 6 |
| Dashboard | E2E | 5 |
| Menú (productos) | E2E | 9 |
| Pedidos (kanban) | E2E | 6 |
| Clientes | E2E | 6 |
| Usuarios | E2E | 8 |
| Inventario | E2E | 5 |
| Configuración | E2E | 5 |
| Navegación y sidebar | E2E | 5 |
| Seguridad | E2E | 4 |
| **Total** | | **81** |

---

## 1. Pruebas Unitarias (Jest)

### 1.1 Auth Guard (`src/lib/auth-guard.ts`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| U-01 | Sin sesión activa | Lanza `redirect('/login')` |
| U-02 | Rol WAITER accede a ruta ADMIN | Lanza `redirect('/')` |
| U-03 | Rol ADMIN accede a ruta ADMIN | Retorna sesión válida |
| U-04 | Rol KITCHEN accede a ruta WAITER | Retorna sesión válida |

### 1.2 Validación Zod — Productos

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| U-05 | `name` vacío | Error: campo requerido |
| U-06 | `price` negativo | Error: precio inválido |
| U-07 | `price` no numérico | Error de tipo |
| U-08 | `categoryId` ausente | Error: campo requerido |
| U-09 | Payload completo válido | `{ success: true, data: Product }` |

### 1.3 Validación Zod — Pedidos

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| U-10 | `tableNumber` = 0 | Error: número de mesa inválido |
| U-11 | `items` array vacío | Error: pedido sin items |
| U-12 | `status` fuera de enum | Error de validación |
| U-13 | Payload completo válido | `{ success: true, data: Order }` |

### 1.4 Validación Zod — Clientes

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| U-14 | `email` formato inválido | Error: email inválido |
| U-15 | `name` vacío | Error: campo requerido |
| U-16 | Sin email ni teléfono | `{ success: true }` (ambos opcionales) |

### 1.5 Validación Zod — Usuarios

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| U-17 | `role` fuera de enum | Error de validación |
| U-18 | `email` duplicado en DB | Error: email ya existe |
| U-19 | `password` < 8 caracteres | Error: contraseña muy corta |

### 1.6 Configuración

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| U-20 | `taxRate` > 100 | Error: porcentaje inválido |
| U-21 | `currency` vacío | Error: campo requerido |
| U-22 | Payload completo válido | `{ success: true }` |

---

## 2. Pruebas E2E (Playwright)

**URL base:** `http://localhost:3000` (dev) / `http://localhost:8050` (Docker)  
**Credenciales:** `admin@sabor.com` / `password123`

### 2.1 Autenticación

| ID | Caso | Pasos | Resultado esperado |
|----|------|-------|--------------------|
| E-01 | Login exitoso | Email + password correctos → "Iniciar Sesión" | Redirige a `/` |
| E-02 | Credenciales incorrectas | Email/password erróneos → submit | Mensaje de error, permanece en `/login` |
| E-03 | Email vacío | Submit sin email | Validación HTML5 nativa |
| E-04 | Logout | Click "Cerrar Sesión" | Redirige a `/login`, sesión destruida |
| E-05 | Acceso sin sesión | Navegar a `/menu` sin login | Redirige a `/login` |
| E-06 | Versión en sidebar | Ver sidebar tras login | Muestra `v1.0.0` en botón Cerrar Sesión |

### 2.2 Dashboard (`/`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-07 | KPIs | 4 tarjetas: Pedidos Hoy, Ventas Hoy, En Cocina, Satisfacción |
| E-08 | Tabla pedidos recientes | Columnas: MESA, ITEMS, ESTADO, TOTAL, HORA |
| E-09 | Link "Ver todos" | Redirige a `/orders` |
| E-10 | Link "Ver Menú Completo" | Redirige a `/menu` |
| E-11 | Gráfico de ventas | Renderiza sin errores JS |

### 2.3 Menú (`/menu`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-12 | Lista productos | Grilla con productos y precios |
| E-13 | Modal Nuevo Producto | Campos: nombre, precio, categoría, imagen, descripción |
| E-14 | Crear producto válido | Aparece en lista, modal cierra |
| E-15 | Crear sin nombre | Error de validación |
| E-16 | Crear sin precio | Error de validación |
| E-17 | Editar producto | Modal pre-cargado con datos actuales |
| E-18 | Guardar edición | Precio actualizado en lista |
| E-19 | Toggle disponibilidad | Estado cambia y persiste al recargar |
| E-20 | Eliminar producto | Producto desaparece de la lista |

### 2.4 Pedidos (`/orders`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-21 | Vista kanban | 4 columnas: Pendiente, Cocinando, Listo, Entregado |
| E-22 | Cards de pedido | Muestran mesa, items y total |
| E-23 | Pendiente → Cocinando | Card se mueve a columna Cocinando |
| E-24 | Cocinando → Listo | Card se mueve a columna Listo |
| E-25 | Listo → Entregado | Card se mueve a columna Entregado |
| E-26 | Estado final | Botón "Avanzar Etapa" no disponible |

### 2.5 Clientes (`/customers`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-27 | Lista clientes | Columnas: NOMBRE, EMAIL, TELÉFONO, ACCIONES |
| E-28 | Crear cliente completo | Aparece en tabla |
| E-29 | Crear sin email | Funciona (email opcional) |
| E-30 | Email duplicado | Error de validación |
| E-31 | Editar cliente | Modal pre-cargado, guardar actualiza fila |
| E-32 | Eliminar cliente | Fila desaparece |

### 2.6 Usuarios (`/users`)

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

### 2.7 Inventario (`/inventory`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-41 | Tabla inventario | Columnas: PRODUCTO, CATEGORÍA, STOCK ACTUAL, MÍNIMO, ESTADO |
| E-42 | Stock bajo | Celda ESTADO muestra alerta visual |
| E-43 | Actualizar cantidad | Persiste al recargar |
| E-44 | Exportar CSV | Descarga archivo `.csv` |
| E-45 | Historial | Muestra log de cambios de stock |

### 2.8 Configuración (`/settings`)

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-46 | Carga campos | Pre-cargados con valores actuales de BD |
| E-47 | Guardar nombre restaurante | Toast de confirmación |
| E-48 | Cambiar moneda | Moneda actualizada |
| E-49 | Tax rate > 100 | Error de validación |
| E-50 | Persistencia | Valores siguen cargados tras recargar |

### 2.9 Navegación y sidebar

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| E-51 | Link activo | Item con fondo naranja + font-bold |
| E-52 | Navegación completa | Cada item navega a su ruta correcta |
| E-53 | Sidebar móvil | Viewport < 768px: hamburguesa abre sidebar |
| E-54 | Cerrar sidebar | Click en overlay lo cierra |
| E-55 | Iconos Material Symbols | Renderizan como símbolos, no como texto |

### 2.10 Seguridad

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| S-01 | XSS en campo nombre | Se almacena como texto plano, no ejecuta |
| S-02 | Acceso a ruta protegida sin sesión | Redirige a `/login` |
| S-03 | Token de sesión expirado | Redirige a `/login` |
| S-04 | WAITER accede a ruta ADMIN | Redirige a `/` o muestra 403 |

---

## 3. Orden de ejecución recomendado

```bash
# 1. Unitarias
npx jest --testPathPattern="tests/unit"

# 2. Seed fresco (los tests E2E avanzan pedidos de estado)
npx prisma db seed

# 3. E2E — requiere servidor corriendo en localhost:3000
python3 tests/e2e/e2e_tests.py
```

> Verificar que `AUTH_URL=http://localhost:3000` en `.env` antes de correr E2E.
