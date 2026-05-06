# Guía de Despliegue

## Arquitectura de producción

```
Internet → Nginx (reverse proxy) → Next.js (puerto 3000) → PostgreSQL (puerto 5432)
```

Todo corre en contenedores Docker en un único VPS.

---

## Despliegue inicial en VPS

### 1. Instalar Docker y Docker Compose

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Nueva sesión para aplicar el grupo
```

### 2. Instalar Nginx

```bash
sudo apt update && sudo apt install nginx -y
```

### 3. Clonar el repositorio

```bash
cd /opt
sudo git clone https://github.com/JorgeAymar/Sabor-Lena.git sabor-lena
sudo chown -R $USER:$USER /opt/sabor-lena
cd /opt/sabor-lena
```

### 4. Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

```ini
DATABASE_URL="postgresql://admin:CONTRASEÑA_FUERTE@postgres:5432/sabor_lena?schema=public"
AUTH_SECRET="<openssl rand -base64 32>"
AUTH_URL="https://tu-dominio.com"
NODE_ENV="production"
```

> El host de la DB es `postgres` (nombre del servicio en Docker Compose), no `localhost`.

### 5. Levantar la aplicación

```bash
docker compose up -d --build
```

### 6. Inicializar la base de datos

```bash
docker compose exec app npx prisma db push
docker compose exec app npx prisma db seed
```

### 7. Configurar Nginx

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sabor-lena /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL con Let's Encrypt (recomendado)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

Certbot actualiza automáticamente la configuración de Nginx para HTTPS.

---

## Actualización

### Opción A — Rebuild desde código fuente (VPS actual)

El VPS monta el repositorio como volumen en `/opt/sabor-lena/app-files` y construye la imagen en el contenedor con `node:20`.

```bash
# 1. Entrar al VPS
ssh -p 9022 root@217.216.49.191

# 2. Pull del código
cd /opt/sabor-lena && git -C app-files pull origin main

# 3. Recrear el contenedor para forzar rebuild completo
docker compose stop sabor-lena-app
docker compose rm -f sabor-lena-app
docker compose up -d sabor-lena-app

# 4. Verificar que levantó correctamente
docker logs sabor-lena-app --tail 20
```

> Usar `docker compose restart` NO es suficiente — reutiliza el caché de `.next` anterior.

### Opción B — Imagen Docker Hub

Si el VPS usa la imagen `jorge134/sabor-lena`:

```bash
# En local: build + push
docker build --platform linux/amd64 -t jorge134/sabor-lena:X.X.X -t jorge134/sabor-lena:latest .
docker push jorge134/sabor-lena:X.X.X
docker push jorge134/sabor-lena:latest

# En VPS: pull + recrear
docker compose pull
docker compose stop && docker compose rm -f && docker compose up -d
```

### Si hubo cambios en el schema de Prisma

```bash
docker compose exec sabor-lena-app npx prisma db push
```

---

## Variables de entorno

| Variable | Descripción | Ejemplo producción |
|----------|-------------|-------------------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://admin:PASS@postgres:5432/sabor_lena?schema=public` |
| `AUTH_SECRET` | Secreto JWT (≥32 bytes) | `openssl rand -base64 32` |
| `AUTH_URL` | URL pública de la app | `https://tu-dominio.com` |
| `NODE_ENV` | Entorno | `production` |

---

## Comandos operativos

```bash
# Ver logs de la app
docker compose logs -f app

# Ver logs de la base de datos
docker compose logs -f postgres

# Reiniciar todos los servicios
docker compose restart

# Detener todo
docker compose down

# Detener y eliminar volúmenes (¡borra la BD!)
docker compose down -v

# Shell en el contenedor de la app
docker compose exec app sh

# Acceder a Prisma Studio (solo desarrollo)
npx prisma studio
```

---

## Respaldos de base de datos

```bash
# Dump
docker compose exec postgres pg_dump -U admin sabor_lena > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T postgres psql -U admin sabor_lena < backup_20260101.sql
```

---

## Checklist antes de producción

- [ ] `AUTH_SECRET` generado con `openssl rand -base64 32` (nunca reusar el de desarrollo)
- [ ] `AUTH_URL` apunta al dominio real (no localhost)
- [ ] `NODE_ENV=production`
- [ ] Contraseña de PostgreSQL diferente a `password123`
- [ ] SSL configurado con Let's Encrypt
- [ ] Credenciales de admin cambiadas desde el panel de Usuarios
- [ ] Respaldo automático de la BD configurado (cron)
