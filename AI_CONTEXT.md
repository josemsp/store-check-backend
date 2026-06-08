# Store Check Backend - AI Context

Este documento es la fuente de contexto operativo para agentes de IA que
continuen el backend. Debe leerse antes de diseñar o implementar una feature.

## 1. Objetivo

Store Check es un SaaS multiempresa para administrar organizaciones,
ubicaciones, empleados, catalogo, inventario, compras, transferencias,
transformaciones, caja, cierres diarios, notificaciones y auditoria.

El backend usa:

```text
Runtime: Cloudflare Workers
Framework HTTP: Hono
Contrato API: OpenAPI 3.1 con @hono/zod-openapi
Validacion: Zod
Auth: Supabase Auth
Database: Supabase PostgreSQL
Storage: Supabase Storage
Email: Resend HTTP API
Package manager: pnpm 10.15.0
Language: TypeScript estricto
Tests: Vitest
```

## 2. Decisiones Inmutables

No redisenar estas decisiones sin una solicitud explicita:

- Base de datos compartida multi-tenant.
- Las tablas de negocio usan `organization_id`.
- El aislamiento se aplica mediante PostgreSQL RLS.
- Registro publico deshabilitado; todo acceso comienza por invitacion.
- `platform_admins` es independiente del RBAC de organizaciones.
- Un usuario puede pertenecer a varias organizaciones.
- `locations` unifica almacen, sucursal y produccion.
- `product_variants` es la unidad real de inventario y venta.
- Inventario basado en `inventory_movements` y `inventory_balances`.
- Operaciones criticas pasan por Worker y RPC transaccional.
- El service role nunca se expone al frontend.
- No eliminar fisicamente informacion operativa importante.
- Root no opera procesos de negocio directamente.
- La impersonacion y las acciones sensibles deben auditarse.
- El backend OpenAPI es la fuente de verdad para el cliente Orval.

## 3. Fuente De Verdad

La base completa se encuentra en:

```text
supabase/migrations/
```

Las migraciones `000` a `012` provienen del esquema original de
`C:\Users\Manuel\Documents\store-check db`.

Migraciones posteriores:

```text
013_seed_permissions.sql  Permisos globales ejecutables
014_seed_defaults.sql     Tipos de notificacion globales
015_rpc_contracts.sql     Numero reservado para contratos historicos
016_final_hardening.sql   Indices, checks, triggers y tablas finales
017_invitations.sql       RPC y hardening de Invitations
```

No crear un segundo modelo de tablas dentro del backend. Los nombres reales
incluyen:

```text
profiles.name
platform_admin_role
member_status
invitation_scope
invitations.scope
invitations.invited_by_user_id
invitation_platform_roles.role
```

Antes de usar una tabla o columna, comprobar su migracion.

## 4. Arquitectura Del Codigo

```text
src/
  app.ts
  index.ts
  modules/
    health/
    invitations/
  shared/
    domain-events/
    errors/
    middlewares/
    openapi/
    supabase/
    types/
    utils/
supabase/
  config.toml
  migrations/
test/
  modules/
  shared/
docs/
```

Cada feature debe seguir, cuando aplique:

```text
feature.types.ts       Tipos del dominio
feature.schemas.ts     Zod y componentes OpenAPI
feature.ports.ts       Contratos externos/testeables
feature.service.ts     Orquestacion y reglas de aplicacion
feature.repository.ts  Acceso a RPC/PostgreSQL
feature.routes.ts      HTTP, OpenAPI y respuestas
```

Adaptadores externos adicionales, como Auth o correo, viven dentro del modulo
con nombres explicitos.

## 5. Responsabilidades

### Routes

- Declaran metodo, path, tags, `operationId`, seguridad y respuestas.
- Validan mediante schemas Zod.
- Traducen HTTP hacia el servicio.
- No contienen reglas de negocio ni queries.

### Service

- Coordina el caso de uso.
- Depende de puertos, no de Hono ni del contexto HTTP.
- Implementa compensaciones entre sistemas externos.
- Es la unidad principal de pruebas de comportamiento.

### Repository

- Encapsula RPC y persistencia.
- Traduce errores PostgreSQL a `AppError`.
- No decide reglas de autorizacion; PostgreSQL las vuelve a validar.

### PostgreSQL RPC

- Ejecuta operaciones criticas en una transaccion.
- Bloquea filas con `FOR UPDATE` cuando existe concurrencia.
- Valida actor, tenant, roles, locations y estados.
- Escribe auditoria y domain events dentro de la misma transaccion.

## 6. Contrato HTTP

Prefijo:

```text
/api/v1
```

Documentacion:

```text
GET /openapi.json
GET /docs
```

Convenciones:

- Cada operacion tiene un `operationId` unico y estable.
- Respuesta exitosa: `{ success: true, data, meta }`.
- Error: `{ success: false, error, meta }`.
- Todas las propiedades de responses HTTP usan `snake_case`, incluidos objetos
  anidados, errores y metadata.
- `meta.request_id` permite correlacion.
- El dominio TypeScript conserva `camelCase`; `successResponse` y
  `errorResponse` convierten recursivamente las claves en el limite HTTP.
- Las rutas privadas declaran `BearerAuth`.
- Los schemas reutilizables deben tener nombre OpenAPI.
- Cambios incompatibles requieren nueva version de API.

El frontend genera tipos y hooks con Orval. No mantener DTOs duplicados
manualmente en el frontend.

## 7. Feature Implementada: Invitations

Endpoints:

```text
GET  /api/v1/invitations/validate?token=...
POST /api/v1/invitations
POST /api/v1/invitations/accept
POST /api/v1/invitations/{id}/cancel
POST /api/v1/invitations/{id}/resend
```

Archivos principales:

```text
src/modules/invitations/
supabase/migrations/017_invitations.sql
docs/invitations.md
test/modules/invitations/
```

Reglas:

- El token real solo viaja por correo.
- PostgreSQL almacena `token_hash` SHA-256.
- Validar una invitacion no produce efectos.
- PLATFORM y NEW_ORGANIZATION requieren ROOT.
- ORGANIZATION requiere Owner, platform admin o `employee.invite`.
- Roles y locations deben pertenecer a la organizacion.
- La aceptacion soporta usuarios nuevos y existentes.
- Un usuario existente puede unirse a otra organizacion.
- El email de Supabase Auth debe coincidir con la invitacion.
- Si Auth crea un usuario y PostgreSQL falla, se elimina el usuario creado.
- Si falla el correo inicial, el servicio cancela la invitacion.
- La aceptacion crea auditoria y `InvitationAccepted`.
- La organizacion nueva recibe roles, unidades y motivos de merma base.

La base permite un solo `platform_admin_role` por usuario. El contrato usa
`platformRole` singular.

## 8. Seguridad

- `SUPABASE_SERVICE_ROLE_KEY` solo se utiliza dentro del Worker.
- Los clientes autenticados usan `SUPABASE_ANON_KEY` y Bearer JWT.
- Las tablas sensibles tienen RLS.
- Las mutaciones criticas no se realizan directamente desde React.
- Las funciones `security definer` fijan `search_path`.
- Los RPC de backend revocan acceso publico y conceden `service_role`.
- Nunca registrar tokens, passwords o service-role keys.
- No confiar en IDs de roles, locations u organizaciones enviados por el
  frontend sin validarlos en PostgreSQL.

## 9. Variables De Entorno

Ver `.env.example`:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
FRONTEND_URL
RESEND_API_KEY
EMAIL_FROM
ENVIRONMENT
CORS_ORIGINS
```

Para desarrollo de Wrangler, usar `.dev.vars`. Nunca versionar secretos.

## 10. Comandos

Usar pnpm, no npm:

```bash
pnpm install
pnpm dev
pnpm check
pnpm lint
pnpm typecheck
pnpm test
pnpm cf-typegen
pnpm db:start
pnpm db:reset
pnpm db:lint
pnpm deploy
```

`pnpm check` ejecuta lint, TypeScript y pruebas.

## 11. Estrategia De Pruebas

- Preferir TDD con ciclos pequenos.
- Probar comportamiento publico, no metodos privados.
- Servicios usan puertos falsos o repositorios en memoria.
- Rutas prueban validacion, autenticacion y contrato OpenAPI.
- Las pruebas no deben requerir Supabase remoto.
- Los RPC deben validarse con `pnpm db:reset` y `pnpm db:lint` cuando Docker
  Desktop este disponible.

Estado verificado al crear este documento:

```text
25 tests passing
ESLint passing
TypeScript passing
Wrangler dry-run passing
pnpm audit without known vulnerabilities
```

## 12. Flujo Para Una Nueva Feature

1. Leer las migraciones y el dominio relevante.
2. Definir comportamiento y contrato HTTP.
3. Escribir una prueba tracer.
4. Crear tipos, schemas y puertos.
5. Implementar el servicio sin dependencias de Hono.
6. Implementar repository y RPC transaccional.
7. Registrar rutas OpenAPI con `operationId` estable.
8. Agregar pruebas de servicio, rutas y OpenAPI.
9. Ejecutar `pnpm check`.
10. Ejecutar `pnpm db:reset` y `pnpm db:lint` si la feature cambia SQL.
11. Ejecutar `pnpm exec wrangler deploy --dry-run`.
12. Actualizar este documento si cambia una decision arquitectonica.

## 13. Orden De Features

Orden recomendado:

```text
1. Invitations                         Implementado
2. Organizations + RBAC               Pendiente
3. Locations + Catalog                Pendiente
4. Inventory shared services          Pendiente
5. Purchases                           Pendiente
6. Transfers                           Pendiente
7. Transformations                     Pendiente
8. Cash + Daily Closures              Pendiente
9. Notifications + async event worker Pendiente
```

## 14. Riesgos Y Trabajo Pendiente

- Ejecutar todas las migraciones desde cero contra Supabase local.
- Completar y revisar RLS tabla por tabla antes de produccion.
- Generar tipos Supabase desde el esquema aplicado.
- Implementar providers de domain events persistentes/colas.
- Revisar permisos exactos de roles base conforme avance cada feature.
- Agregar pruebas SQL para concurrencia, ultimo Owner y organizaciones
  suspendidas.
- No asumir que los contratos historicos de `015_rpc_contracts.sql` ya estan
  implementados; cada RPC debe llegar con su feature.

## 15. Reglas Para Agentes

- No copiar codigo del proyecto antiguo basado en `owners` y `branches`.
- No introducir registro publico.
- No guardar tokens de invitacion en texto plano.
- No hacer mutaciones de inventario desde el frontend.
- No usar `any` para evitar modelar contratos.
- No mezclar Hono dentro de servicios de dominio.
- No agregar dependencias si el stack existente resuelve el problema.
- No modificar archivos generados de Orval manualmente.
- No usar npm; usar pnpm.
- No borrar cambios existentes que no pertenezcan a la tarea.
- Mantener cambios pequenos, testeables y alineados con las migraciones.
