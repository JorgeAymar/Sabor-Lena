#!/bin/bash

# 🔒 SECURITY FIX SCRIPT - Sabor & Leña Admin
# Este script realiza las correcciones críticas de seguridad para .env

echo "🔒 Corrigiendo configuración de seguridad..."
echo ""

# 1. Generar nuevo AUTH_SECRET
echo "📝 Generando nuevo AUTH_SECRET..."
NEW_SECRET=$(openssl rand -base64 32)
echo "✅ Nuevo AUTH_SECRET generado: $NEW_SECRET"
echo ""

# 2. Crear .gitignore con archivos sensibles
echo "📝 Actualizando .gitignore..."
if ! grep -q "^\\.env$" .gitignore 2>/dev/null; then
  cat >> .gitignore << EOF
# Environment variables (NEVER commit these)
.env
.env.local
.env.*.local
.env.production.local
.env.development.local
EOF
  echo "✅ .gitignore actualizado"
else
  echo "ℹ️  .env ya está en .gitignore"
fi
echo ""

# 3. Advertencia de git
echo "⚠️  ACCIÓN REQUERIDA:"
echo "---"
echo "1. Copia tu .env actual a un lugar seguro (OUTSIDE del proyecto)"
echo "2. Ejecuta estos comandos para remover .env del historio de Git:"
echo ""
echo "   git rm --cached .env"
echo "   git commit -m 'chore: remove .env from tracking'"
echo "   git push"
echo ""
echo "3. Actualiza tu .env local con valores seguros:"
echo "   - AUTH_SECRET: $NEW_SECRET"
echo "   - DATABASE_URL: cambiar usuario y contraseña"
echo "   - AUTH_URL: cambiar según ambiente"
echo ""
echo "4. Usa .env.example como template:"
echo "   cp .env.example .env"
echo "   # Edita con tus valores reales"
echo ""
echo "⚠️  NUNCA commitees .env o archivos con secretos"
echo "---"
echo ""
echo "✅ Script completado"
