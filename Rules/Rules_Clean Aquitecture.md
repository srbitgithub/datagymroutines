# Reglas de Ingeniería: Clean Architecture & Modularización Estricta

**Descripción:** Estas reglas definen la jerarquía de dependencias y la estructura de carpetas para garantizar que el núcleo del negocio sea independiente de la tecnología.
**Principio Fundamental:** La Regla de Dependencia. Las dependencias solo pueden apuntar hacia adentro (hacia el Círculo del Dominio).

## 1. División de Capas y Responsabilidades

### A. Capa de Dominio (Entidades y Reglas de Negocio)

* **Ubicación:** `src/modules/[feature]/domain/`
* **Contenido:** Entidades (clases/tipos que representan conceptos del negocio), Objetos de Valor, e **Interfaces de Repositorios** (Ports).
* **Restricción:** Está estrictamente prohibido importar cualquier cosa de `node_modules` que no sea lógica pura. No se permite `@supabase/supabase-js`, `next/navigation`, etc.
* **Lógica:** Aquí reside la validación de negocio que no cambia, independientemente de si usamos una base de datos SQL o NoSQL.

### B. Capa de Aplicación (Casos de Uso)

* **Ubicación:** `src/modules/[feature]/application/`
* **Contenido:** Casos de uso (ej: `RegisterUser.ts`, `UpdateProfile.ts`).
* **Responsabilidad:** Orquestar el flujo de datos. Recibe un puerto (interfaz), ejecuta la lógica y devuelve un resultado.
* **Regla de Dependencia:** Solo conoce el Dominio. No conoce la implementación real de Supabase.

### C. Capa de Infraestructura (Detalles y Adaptadores)

* **Ubicación:** `src/modules/[feature]/infrastructure/`
* **Contenido:** * **Adapters:** Implementaciones reales de las interfaces del dominio (ej: `SupabaseUserRepository`).
* **Mappers:** Clases que transforman el JSON "sucio" de Supabase en una Entidad de Dominio limpia.
* **Controllers:** Lógica específica para los Route Handlers de Next.js.


* **Responsabilidad:** Gestionar la comunicación con el mundo exterior (Supabase, APIs de terceros, File System).

## 2. Estructura de Directorios Modular (Anti-Monolito)

El proyecto debe organizarse por **módulos de funcionalidad** (Vertical Slicing) en lugar de carpetas genéricas:

```text
src/
├── core/                # Lógica compartida por toda la app (Errors, Config)
├── modules/             # Capas de Clean Architecture por funcionalidad
│   ├── auth/            # Módulo de Autenticación
│   │   ├── domain/
│   │   ├── application/
│   │   └── infrastructure/
│   ├── users/           # Módulo de Perfiles/Usuarios
│   └── shared/          # Interfaces compartidas entre módulos
└── app/                 # DELIVERY: Capa de Next.js (Solo entrada y salida)
    ├── (auth)/          # Rutas de login/registro
    └── api/             # Endpoints que instancian los Casos de Uso

```

## 3. Reglas de Implementación para "Google Antigravity"

1. **Aislamiento de Supabase:** Ninguna función de Supabase (ej: `from('table').select()`) puede existir fuera de la carpeta `infrastructure/adapters/`. Si se encuentra en un componente o un caso de uso, se considera **error técnico grave**.
2. **Uso de DTOs y Mappers:** Los datos que vienen de la base de datos deben ser mapeados a entidades de dominio inmediatamente.
* *Ejemplo:* El campo `created_at` de la DB (string) debe ser mapeado a un objeto `Date` de JS en la entidad.


3. **Inyección de Dependencias (DI):** Los casos de uso no deben instanciar sus repositorios. Deben recibirlos como parámetros para facilitar el **Testing** (Unit Tests con Mocks).
```typescript
// Correcto: Recibe la interfaz
const useCase = new RegisterUserUseCase(new SupabaseUserRepository());

```


4. **Route Handlers como "Thin Wrappers":** Los archivos `route.ts` de Next.js no deben tener lógica de negocio. Solo deben:
* Validar la entrada con Zod.
* Llamar al Caso de Uso.
* Manejar la respuesta HTTP (200, 400, 500).



## 4. Gestión de Errores

* Define errores de dominio personalizados (ej. `UserAlreadyExistsError`).
* Los adaptadores deben capturar errores de red/base de datos y lanzarlos como errores de dominio.
* Esto permite que la UI (Next.js) sepa exactamente qué mensaje mostrar sin conocer errores técnicos de SQL.
