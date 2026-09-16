# Nexo

Frontend de gestión comercial con Next.js App Router, React, TypeScript estricto y Tailwind CSS.

## Ejecutar

Usa Node.js compatible con Next.js 16 y pnpm (versión declarada en package.json).

```sh
pnpm install --frozen-lockfile
pnpm dev
# Validación y ejecución de producción
pnpm build
pnpm start
```

No hay lint configurado. El build comprueba TypeScript. Se usa webpack explícitamente porque Turbopack falla al iniciar su proceso de CSS en el entorno Windows de validación (acceso denegado); no se cambiaron las versiones de dependencias. Se puede reevaluar Turbopack en el entorno de despliegue.

## Estructura

- app: rutas; (auth) contiene el login y (dashboard) comparte el layout.
- components/layout: shell, sidebar, topbar y navegación móvil.
- components/shared: encabezados, badges y las vistas de preparación compartidas.
- components/ui: componentes Base UI existentes.
- features: autenticación real contra Spring Boot, dashboard, ventas y catálogo mock de productos; datos, tipos y hooks separados.
- types/role.ts: roles futuros ADMIN y ASISTENTE; navegación preparada con metadatos opcionales, sin restricciones inventadas.
- lib/api: cliente `fetch`, configuración y errores tipados para la API REST.

## Rutas

/login, /inicio, /ventas/nueva, /ventas/pendientes, /clientes, /productos, /inventario y /administracion. La raíz redirige a /login. Las páginas de clientes, productos, inventario y administración conservan los placeholders originales; no requieren módulos vacíos.

## Autenticación y entorno

Configura el backend copiando `.env.example` a `.env.local`. El login usa `POST /api/v1/authentication/login`. La sesión se conserva centralmente en `localStorage` con el JWT, nombre, tipo de token y fecha de expiración calculada; no se almacena la contraseña ni ningún secreto del backend. Las rutas del dashboard comprueban esta sesión para UX, mientras que Spring Security sigue siendo la autoridad de seguridad.

El almacenamiento web permite persistencia sencilla para este MVP, pero un script que lograra ejecutarse en el origen podría leer el JWT. Antes de producción debe evaluarse una estrategia BFF con cookies `HttpOnly`, `Secure` y `SameSite`. El contrato actual no entrega refresh token ni rol explícito, por lo que no se implementan renovación ni autorización por rol.

## Módulos aún simulados

Los datos y resúmenes comerciales son mock y no se persisten. Completar una venta mantiene el comportamiento original: navega a pendientes sin guardar una operación. El carrito se reinicia al salir de nueva venta.

Filtros de categoría, selección de cliente, guardar/confirmar pendientes, historial, notificaciones y acciones de los placeholders siguen pendientes de implementación. La integración posterior con Spring Boot sustituirá estos mocks; el servidor será la autoridad para autorización y reglas de negocio.

El repositorio sigue vinculado a [v0](https://v0.app/chat/projects/prj_bX2S4hisomvzlMOh2Gw5Ta3jd5Z6). Según la configuración original, los merges a main despliegan automáticamente.
