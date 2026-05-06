# Server Actions — Referencia

Toda la lógica de mutación de datos está en `src/app/actions/`. Las funciones son Server Actions de Next.js 16 (`'use server'`): se ejecutan en el servidor, nunca exponen lógica al cliente.

## Convenciones generales

1. **Auth Guard primero**: toda acción protegida llama a un guard antes de cualquier otra operación.
2. **Zod segundo**: valida el input con `safeParse`. Si falla, retorna `{ errors, message }`.
3. **Prisma tercero**: ejecuta la operación de BD.
4. **`revalidatePath`** al final: invalida el cache RSC de la ruta afectada.
5. **`handleAuthError`**: captura `UnauthorizedError` / `ForbiddenError` en el catch y retorna `{ success: false, error }` sin lanzar al cliente.

---

## `auth.ts` — Autenticación

### `authenticate(prevState, formData)`

**Guard:** ninguno (pública)

| Campo | Tipo | Validación |
|-------|------|-----------|
| email | string | — |
| password | string | — |

**Retorno:**
- `undefined` → login exitoso, NextAuth redirige a `/`
- `"Invalid credentials."` → credenciales incorrectas
- `"Something went wrong."` → otro error de NextAuth
- Relanza errores no-auth (ej. fallo de BD)

---

## `auth-actions.ts` — Logout

### `logout()`

**Guard:** ninguno

Llama a `signOut()`. En producción hace redirect al login. En dev Next.js puede reiniciar el servidor brevemente.

---

## `products.ts` — Gestión de productos

**Guard base:** `requireAdmin()`

### `createProduct(prevState, formData)`

| Campo | Tipo | Validación |
|-------|------|-----------|
| name | string | min 2 chars |
| price | number | ≥ 0 |
| categoryId | string | min 1 char |
| description | string | opcional |
| image | string URL | opcional |

**Efectos secundarios:** crea un `InventoryItem` con `quantity: 0, minStock: 10`.

**Retorno:** `{ message }` en éxito | `{ errors, message }` en validación | `{ success: false, error }` en auth

### `updateProduct(id, prevState, formData)`

Mismos campos que `createProduct` + `id` (UUID).

### `deleteProduct(id)`

Elimina primero el `InventoryItem` asociado (FK constraint), luego el producto.

### `toggleProductAvailability(id, currentStatus)`

Invierte `isAvailable`. `currentStatus` es el valor actual (`true`/`false`); la función aplica `!currentStatus`.

### `getCategories()`

Retorna `Category[]`. Requiere `requireAdmin()`.

---

## `orders.ts` — Pedidos

**Guard base:** `requireAdminOrKitchen()`

### `updateOrderStatus(id, status)`

| Parámetro | Tipo | Validación |
|-----------|------|-----------|
| id | string | UUID válido |
| status | OrderStatus | PENDING\|COOKING\|READY\|DELIVERED\|CANCELLED |

Actualiza el estado del pedido. No valida transiciones de estado (cualquier estado a cualquier estado es permitido).

---

## `customers.ts` — Clientes

**Guard base:** `requireAdminOrWaiter()`

### `createCustomer(prevState, formData)`

| Campo | Tipo | Validación |
|-------|------|-----------|
| name | string | min 2 chars |
| email | string | formato email, opcional |
| phone | string | opcional |

**Error especial:** email duplicado → `{ errors: { email: ['El email ya está registrado'] } }`

### `updateCustomer(id, prevState, formData)`

Mismos campos que `createCustomer`.

### `deleteCustomer(id)`

Elimina cliente por ID. No verifica órdenes asociadas (el modelo no tiene FK de Customer a Order).

---

## `users.ts` — Usuarios del sistema

**Guard base:** `requireAdmin()`

### `createUser(prevState, formData)`

| Campo | Tipo | Validación |
|-------|------|-----------|
| name | string | min 2 chars |
| email | string | formato email |
| role | UserRole | ADMIN\|WAITER\|KITCHEN |
| password | string | min 6 chars |

**Seguridad:** la contraseña se hashea con bcrypt (factor 10) antes de persistir. La respuesta **nunca incluye** `password`, `status` ni timestamps.

**Retorno en éxito:** `{ id, name, email, role }` únicamente.

### `updateUser(id, prevState, formData)`

Actualiza nombre, email y rol. No permite cambiar contraseña desde este endpoint.

### `deleteUser(id)`

Elimina usuario por ID.

---

## Tipos de retorno comunes

```typescript
// Éxito con mensaje
{ message: string }

// Error de validación Zod
{ errors: Record<string, string[]>, message: string }

// Error de autorización (de handleAuthError)
{ success: false, error: string }

// Error genérico de BD
{ message: string }  // mensaje genérico, no expone detalles
```

Los Client Components deben manejar los tres casos:

```typescript
if ('errors' in result && result.errors) {
  setErrors(result.errors);           // mostrar errores de campo
} else if ('success' in result && !result.success) {
  handleClose();                      // cerrar modal — error de auth
} else if ('message' in result && result.message) {
  handleClose();                      // cerrar modal — éxito
}
```
