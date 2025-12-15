# Sabor & Leña - Admin Dashboard

Este proyecto es una aplicación **Next.js** con base de datos **PostgreSQL**, diseñada para ser desplegada en un VPS utilizando **Docker Compose** y **Nginx** como proxy inverso.

## Requisitos Previos

En tu VPS (Ubuntu/Debian recomendado), asegúrate de tener instalado:
- **Git**
- **Docker** y **Docker Compose**
- **Nginx**

```bash
# Instalación rápida de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Nginx
sudo apt update
sudo apt install nginx -y
```

---

## 🚀 Instalación desde Cero

Sigue estos pasos para desplegar la aplicación por primera vez.

### 1. Clonar el Repositorio
```bash
cd /opt
sudo git clone https://github.com/JorgeAymar/Sabor-Lena.git sabor-lena
cd sabor-lena
```

### 2. Configurar Variables de Entorno
Crea el archivo `.env` basado en el ejemplo (o crea uno nuevo):

```bash
cp .env.example .env
nano .env
```

Asegúrate de configurar `DATABASE_URL` para que apunte al servicio de Docker (la red interna):
```ini
# En producción con Docker Compose, el host es el nombre del servicio 'postgres'
DATABASE_URL="postgresql://admin:password123@postgres:5432/sabor_lena?schema=public"
```

### 3. Ejecutar con Docker Compose
Este comando levantará la base de datos y la aplicación.

```bash
# Construir y levantar contenedores en segundo plano
sudo docker compose up -d --build
```

### 4. Inicializar la Base de Datos
Una vez que el contenedor de base de datos esté listo, ejecuta las migraciones y el seed inicial.

```bash
# Entrar al contenedor de la app (asegúrate de saber el nombre, ej: sabor-lena-app-1)
sudo docker compose exec app npx prisma db push
sudo docker compose exec app npx prisma db seed
```

### 5. Configurar Nginx
Crea un archivo de configuración para el sitio:

```bash
sudo nano /etc/nginx/sites-available/sabor-lena
```

Pega el siguiente contenido (ajusta `tu-dominio.com`):

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000; # Puerto interno de la app Next.js
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activa el sitio y reinicia Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/sabor-lena /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔄 Actualización (Update)

Para actualizar la aplicación cuando haya cambios en el repositorio:

### 1. Descargar Cambios
```bash
cd /opt/sabor-lena
sudo git pull origin main
```

### 2. Reconstruir y Reiniciar
```bash
sudo docker compose up -d --build
```

### 3. Migraciones de Base de Datos (si es necesario)
Si hubo cambios en el esquema de Prisma:

```bash
sudo docker compose exec app npx prisma db push
```

---

## Comandos Útiles

- **Ver logs de la aplicación:**
  ```bash
  sudo docker compose logs -f app
  ```

- **Ver logs de la base de datos:**
  ```bash
  sudo docker compose logs -f postgres
  ```

- **Reiniciar todo:**
  ```bash
  sudo docker compose restart
  ```
