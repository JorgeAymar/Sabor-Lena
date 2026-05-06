# Modelo de Datos

Schema completo en `prisma/schema.prisma`. Base de datos: **PostgreSQL 16**.

---

## Modelos

### User

Usuarios del sistema con rol y estado.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (UUID) | PK |
| name | String | Nombre completo |
| email | String | Único |
| password | String? | Hash bcrypt, nullable (OAuth futuro) |
| role | UserRole | ADMIN \| WAITER \| KITCHEN |
| status | String | "active" \| "inactive" |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Índices: `role`, `status`, `createdAt`

---

### Product

Ítems del menú.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (UUID) | PK |
| name | String | Nombre del plato |
| categoryId | String | FK → Category |
| price | Float | Precio en la moneda configurada |
| image | String? | URL de imagen |
| description | String? | Descripción opcional |
| isAvailable | Boolean | true por defecto |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Índices: `categoryId`, `isAvailable`, `name`

Relaciones:
- `category` → Category (N:1)
- `orderItems` → OrderItem[] (1:N)
- `inventory` → InventoryItem (1:1, opcional)

---

### Category

Categorías del menú (ej. "Entradas", "Principales", "Bebidas").

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (UUID) | PK |
| name | String | Único |

Relaciones: `products` → Product[] (1:N)

---

### Order

Comanda de una mesa.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (UUID) | PK |
| tableNumber | Int | Número de mesa |
| status | OrderStatus | PENDING \| COOKING \| READY \| DELIVERED \| CANCELLED |
| total | Float | 0 por defecto, actualizado manualmente |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Índices: `status`, `createdAt`, `tableNumber`

Flujo de estados:
```
PENDING → COOKING → READY → DELIVERED
                          ↘ CANCELLED (desde cualquier estado)
```

Relaciones: `items` → OrderItem[] (1:N)

---

### OrderItem

Línea de un pedido (producto + cantidad + precio snapshot).

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (UUID) | PK |
| orderId | String | FK → Order |
| productId | String | FK → Product |
| quantity | Int | Cantidad pedida |
| price | Float | Precio al momento del pedido (snapshot) |

Índices: `orderId`, `productId`

> El campo `price` es un snapshot del precio del producto en el momento del pedido. Si el precio del producto cambia posteriormente, el total del pedido no se ve afectado.

---

### Customer

Clientes registrados para fidelización.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (UUID) | PK |
| name | String | Nombre completo |
| phone | String? | Teléfono opcional |
| email | String? | Único, opcional |
| totalSpent | Float | 0 por defecto |
| lastVisit | DateTime | Actualizado en cada visita |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Índices: `name`, `lastVisit`, `createdAt`

---

### InventoryItem

Stock de cada producto.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (UUID) | PK |
| productId | String | FK → Product, único (1:1) |
| quantity | Int | Stock actual |
| unit | String | "units" por defecto |
| minStock | Int | 10 por defecto — alerta si quantity < minStock |
| updatedAt | DateTime | Auto |

Índices: `productId`, `quantity`

---

### Setting

Configuración clave-valor del restaurante.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | String (UUID) | PK |
| key | String | Único (ej. "restaurantName", "currency", "taxRate") |
| value | String | Valor como string |

Claves usadas actualmente:
- `restaurantName` — nombre del restaurante
- `currency` — código de moneda (ej. "CLP", "USD")
- `taxRate` — porcentaje de impuesto (ej. "19")

---

## Enums

```prisma
enum UserRole {
  ADMIN
  WAITER
  KITCHEN
}

enum OrderStatus {
  PENDING
  COOKING
  READY
  DELIVERED
  CANCELLED
}
```

---

## Migraciones y seed

```bash
# Aplicar schema a la BD (sin migraciones formales — uso de db push)
npx prisma db push

# Poblar con datos de desarrollo
npx prisma db seed

# Explorar datos
npx prisma studio
```

El seed crea:
- 1 usuario ADMIN (`admin@sabor.com` / `password123`)
- Categorías y productos de ejemplo
- Pedidos en distintos estados
- Clientes de ejemplo
- Items de inventario para cada producto
- Configuración inicial del restaurante
