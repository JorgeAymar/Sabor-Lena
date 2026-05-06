# Sabor & Leña — Admin Dashboard

Panel de administración para restaurante construido con **Next.js 16**, **PostgreSQL**, **Prisma ORM** y **NextAuth v5**. Desplegable en VPS con **Docker Compose** y **Nginx**.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router), Tailwind CSS, Recharts |
| Auth | NextAuth v5 beta (Credentials + JWT) |
| ORM | Prisma + PostgreSQL 16 |
| Validación | Zod |
| Infraestructura | Docker Compose, Nginx |

## Roles de usuario

| Rol | Acceso |
|-----|--------|
| `ADMIN` | Todo: productos, usuarios, configuración, inventario, clientes |
| `WAITER` | Pedidos, clientes, inventario |
| `KITCHEN` | Cambio de estado de pedidos |

---

## Requisitos Previos

- **Docker** y **Docker Compose**
- **Nginx** (producción)
- **Node.js 20+** (desarrollo local)

```bash
# Instalación rápida de Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Nginx
sudo apt update && sudo apt install nginx -y
```

---

## Instalación en Producción (VPS)

### 1. Clonar el repositorio
```bash
cd /opt
sudo git clone https://github.com/JorgeAymar/Sabor-Lena.git sabor-lena
cd sabor-lena
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
nano .env
```

Variables requeridas:
```ini
# Base de datos (host = nombre del servicio en Docker)
DATABASE_URL="postgresql://admin:STRONG_PASSWORD@postgres:5432/sabor_lena?schema=public"

# Secreto JWT — genera uno fuerte:
# openssl rand -base64 32
AUTH_SECRET="tu-secreto-de-32-bytes-aqui"

AUTH_URL="https://tu-dominio.com"
NODE_ENV="production"
```

> **Importante:** `AUTH_SECRET` debe definirse una sola vez. Usar `openssl rand -base64 32` para generarlo.

### 3. Levantar con Docker Compose
```bash
sudo docker compose up -d --build
```

### 4. Inicializar la base de datos
```bash
sudo docker compose exec app npx prisma db push
sudo docker compose exec app npx prisma db seed
```

### 5. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/sabor-lena
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sabor-lena /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

---

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Levantar base de datos
docker compose up -d postgres

# Aplicar schema y seed
npx prisma db push
npx prisma db seed

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000` (o el siguiente puerto disponible).

**Credenciales de desarrollo:**
```
admin@sabor.com / password123
```

> Cambiar estas credenciales antes de cualquier despliegue en producción.

---

## Actualización

```bash
cd /opt/sabor-lena
sudo git pull origin main
sudo docker compose up -d --build

# Si hubo cambios en el schema de Prisma:
sudo docker compose exec app npx prisma db push
```

---

## Comandos útiles

```bash
# Logs de la aplicación
sudo docker compose logs -f app

# Logs de la base de datos
sudo docker compose logs -f postgres

# Reiniciar todo
sudo docker compose restart

# Acceder a Prisma Studio (desarrollo)
npx prisma studio
```

---

## Seguridad

Este proyecto implementa las siguientes medidas de seguridad:

- Autenticación JWT con NextAuth v5 — `role` propagado explícitamente en callbacks
- Guards de autorización por rol en todas las server actions (`requireAdmin`, `requireAdminOrWaiter`, `requireAdminOrKitchen`)
- Validación de inputs con Zod en todas las mutaciones
- Sin SQL raw — solo Prisma ORM (elimina riesgo de SQL injection)
- Headers de seguridad: `HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `CSP`
- Password hashing con bcrypt (factor 10)
- El hash de contraseña nunca se incluye en el token JWT

Ver historial de auditoría de seguridad en `docs/SECURITY_AUDIT.md`.
