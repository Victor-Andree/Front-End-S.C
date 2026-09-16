# Cliente API

`apiRequest` usa `NEXT_PUBLIC_API_URL`, serializa cuerpos JSON y convierte respuestas no exitosas en `ApiError`. Las peticiones futuras que requieran sesión deben pasar `authenticated: true`; el cliente obtiene el token mediante la abstracción de autenticación y adjunta `Authorization: Bearer <token>`.

La única integración activa es `POST /api/v1/authentication/login`. Los módulos de productos, clientes, inventario y ventas continúan usando datos mock.
