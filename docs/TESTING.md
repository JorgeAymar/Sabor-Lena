# Guía de Pruebas

Este proyecto utiliza una estrategia de pruebas híbrida combinando pruebas unitarias y funcionales (E2E).

## 1. Pruebas Unitarias (Jest)
Validan la lógica de negocio y Server Actions de forma aislada.

### Ejecución
```bash
npm run test
```

### Ubicación
- `tests/unit/`: Contiene los archivos de prueba unitarios (e.g., `users.test.ts`, `auth-actions.test.ts`).
- `tests/mocks/`: Mocks para dependencias externas como `next-auth`.

## 2. Pruebas End-to-End (Playwright)
Validan los flujos de usuario completos simulando un navegador real.

### Prerrequisitos
- Servidor de desarrollo corriendo: `npm run dev` (Puerto 3000)
- Base de datos disponible.

### Ejecución
```bash
# Ejecutar todos los tests (Chromium por defecto)
npx playwright test --project=chromium

# Ejecutar con interfaz gráfica (debug)
npx playwright test --ui

# Ver reporte HTML
npx playwright show-report
```

### Ubicación
- `tests/e2e/`: Contiene los escenarios de prueba (e.g., `auth.spec.ts`, `users.spec.ts`).

## Cobertura Actual
- **Autenticación**: Login (éxito/fallo), Logout, Redirección.
- **Navegación**: Verificación de enlaces del Sidebar.
- **Usuarios**: Listado, Modal de creación, Validación de formularios.
