# Arquitectura del Sistema

## Diagrama de Datos (ERD Simplificado)
El sistema utiliza un modelo relacional gestionado por Prisma.

- **User**: Usuarios del sistema (Admin, Camareros).
- **Product**: Items del menú, vinculados a Categorías.
- **Order**: Comandas, contienen múltiples `OrderItem`.
- **InventoryItem**: Stock vinculado a Productos.
- **Customer**: Clientes registrados (fidelización).

## Flujo de Autenticación
Utiliza `NextAuth.js v5` con estrategia `Credentials`.
1.  Formulario de Login envía credenciales a Server Action `authenticate`.
2.  `auth.ts` verifica email/password contra la BD (con bcrypt).
3.  Sesión se mantiene vía cookies JWT.
4.  `middleware.ts` intercepta rutas protegidas y verifica el token de sesión.

## Server Actions
La lógica de mutación de datos reside en `src/app/actions/`.
- `auth-actions.ts`: Login/Logout.
- `users.ts`: Creación y edición de usuarios.
- `products.ts`: Gestión del menú.
- `orders.ts`: Procesamiento de pedidos.

Están diseñadas para ser llamadas directamente desde Client Components o Forms.
