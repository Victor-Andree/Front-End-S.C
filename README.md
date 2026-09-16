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
- features: autenticación demo, dashboard, ventas y catálogo mock de productos; datos, tipos y hooks separados.
- types/role.ts: roles futuros ADMIN y ASISTENTE; navegación preparada con metadatos opcionales, sin restricciones inventadas.
- lib/api: punto documentado para el futuro cliente REST de Spring Boot.

## Rutas

/login, /inicio, /ventas/nueva, /ventas/pendientes, /clientes, /productos, /inventario y /administracion. La raíz redirige a /login. Las páginas de clientes, productos, inventario y administración conservan los placeholders originales; no requieren módulos vacíos.

## Estado de la demostración

El login solo navega a /inicio; no valida credenciales ni crea una sesión. Las rutas son accesibles directamente. Los datos y resúmenes son mock y no se persisten. Completar una venta mantiene el comportamiento original: navega a pendientes sin guardar una operación. El carrito se reinicia al salir de nueva venta.

Filtros de categoría, selección de cliente, guardar/confirmar pendientes, historial, notificaciones y acciones de los placeholders siguen pendientes de implementación. No se conectó el backend ni se añadieron endpoints o JWT. La integración posterior con Spring Boot sustituirá los mocks y la lógica demo; el servidor será la autoridad para autenticación y autorización.

El repositorio sigue vinculado a [v0](https://v0.app/chat/projects/prj_bX2S4hisomvzlMOh2Gw5Ta3jd5Z6). Según la configuración original, los merges a main despliegan automáticamente.
