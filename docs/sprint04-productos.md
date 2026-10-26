# Sprint 04 · Productos

La página `/productos` consulta productos y stock reales, permite buscar por nombre/categoría y filtrar por estado. Administración muestra activos e inactivos; ventas y notificaciones conservan la consulta de activos por defecto.

Nuevo producto y Editar abren un diálogo con categorías del backend, validaciones y errores por campo. La creación incluye stock inicial en la petición de producto; la edición no altera existencias. Tras guardar se actualizan listado y alertas. La ausencia de categorías o un fallo al cargarlas impide guardar y permite recargar.

Requiere el backend del Sprint 04 y la migración descrita en su documentación. Configurar `NEXT_PUBLIC_API_URL` con el origen de Spring Boot. No utilizar el nuevo formulario contra una versión anterior del backend: esa versión no admite la creación atómica de stock inicial.

Validación con pnpm:

```sh
pnpm install --frozen-lockfile
pnpm test:products
pnpm build
```

Las pruebas de API verifican la conservación del filtro de activos para ventas, el mapeo para edición, los errores y los contratos de creación/actualización. La compilación verifica TypeScript. Falta la aceptación visual y de extremo a extremo contra el entorno real con usuarios ADMIN/ASISTENTE.
