# Guía de Contribución

## Setup inicial

```bash
git clone https://github.com/JorgeAymar/Sabor-Lena.git
cd Sabor-Lena
npm install
cp .env.example .env   # editar con tus valores locales
docker compose up -d postgres
npx prisma db push
npx prisma db seed
npm run dev
```

La app corre en `http://localhost:3000`. Credenciales dev: `admin@sabor.com` / `password123`.

---

## Variables de entorno locales

```ini
DATABASE_URL="postgresql://admin:password123@localhost:5434/sabor_lena?schema=public"
AUTH_SECRET="<genera con: openssl rand -base64 32>"
AUTH_URL="http://localhost:3000"   # debe coincidir con el puerto del dev server
NODE_ENV="development"
```

---

## Flujo de trabajo

1. Crear rama desde `main`:
   ```bash
   git checkout -b feat/nombre-feature
   ```
2. Implementar cambios.
3. Correr tests antes de hacer commit:
   ```bash
   npx jest --testPathPattern="tests/unit"
   ```
4. Hacer commit con mensaje descriptivo:
   ```bash
   git commit -m "feat: descripción del cambio"
   ```
5. Abrir PR contra `main`.

---

## Agregar una nueva Server Action

1. Crear o editar el archivo en `src/app/actions/`.
2. Marcar el archivo con `'use server'` al inicio.
3. Llamar al guard apropiado como **primera operación**:
   ```typescript
   await requireAdmin(); // o requireAdminOrWaiter(), etc.
   ```
4. Validar input con Zod antes de tocar la BD.
5. Envolver en `try/catch` y manejar errores con `handleAuthError`.
6. Llamar a `revalidatePath('/ruta')` al final para invalidar caché RSC.
7. Escribir tests unitarios en `tests/unit/` usando el patrón de mock de auth-guard (ver `docs/TESTING.md`).

---

## Agregar una nueva página

1. Crear `src/app/(dashboard)/nueva-ruta/page.tsx`.
2. La página está automáticamente protegida por el middleware (`src/middleware.ts`).
3. Fetch de datos con Prisma directamente en el Server Component (no necesita Server Action para reads).
4. Si necesita interactividad (modales, formularios), crear un Client Component en `src/components/`.
5. Pasar los datos como props al Client Component.

```typescript
// page.tsx (Server Component)
export default async function NuevaRuta() {
  const items = await prisma.someModel.findMany();
  return <NuevaRutaClient items={items} />;
}
```

---

## Agregar un índice de base de datos

Editar `prisma/schema.prisma` y agregar `@@index([campo])` al modelo correspondiente:

```prisma
model MiModelo {
  // ...campos
  @@index([campoFrecuente])
}
```

Luego aplicar:
```bash
npx prisma db push
```

---

## Convenciones de código

- **Sin comentarios obvios**: solo comentar el _por qué_, nunca el _qué_.
- **Tipos explícitos**: evitar `any`. Usar los tipos de Prisma donde sea posible.
- **Zod para validación externa**: toda entrada de usuario pasa por `safeParse`.
- **Sin SQL raw**: usar solo la API de Prisma.
- **Respuestas seguras**: los Server Actions nunca retornan campos sensibles como `password`, tokens o hashes.

---

## Comandos útiles

```bash
# Tests unitarios
npx jest --testPathPattern="tests/unit"

# Tests E2E (requiere servidor corriendo)
npx prisma db seed && python3 tests/e2e/e2e_tests.py

# Ver schema de BD
npx prisma studio

# Verificar tipos TypeScript
npx tsc --noEmit

# Lint
npx eslint src/
```
