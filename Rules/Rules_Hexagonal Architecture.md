# Reglas de Ingeniería: Arquitectura Hexagonal (Ports & Adapters)

**Descripción:** Define la estructura desacoplada del sistema, separando la lógica de negocio de los detalles técnicos (Supabase, Next.js, APIs).
**Objetivo:** Evitar el código espagueti y asegurar que la lógica de negocio sea testeable sin dependencias externas.

## 1. Estructura de Capas (Strict Separation)

El proyecto se dividirá en tres capas concéntricas. La dependencia siempre va hacia adentro: **Infraestructura -> Aplicación -> Dominio**.

### A. Capa de Dominio (El Corazón)

* **Ubicación:** `src/modules/[module]/domain/`
* **Contenido:** Entidades, Objetos de Valor (Value Objects), interfaces de Repositorios (Ports) y lógica de negocio pura.
* **Regla de Oro:** **Cero dependencias externas.** No puede importar nada de `@supabase/supabase-js`, `next/server`, ni librerías de terceros (excepto herramientas de tipos o lógica pura).
* **Puertos (Interfaces):** Define aquí cómo se deben comportar los repositorios.
* *Ejemplo:* `export interface UserRepository { getById(id: string): Promise<User>; }`



### B. Capa de Aplicación (Casos de Uso)

* **Ubicación:** `src/modules/[module]/application/`
* **Contenido:** Casos de uso (Use Cases). Orquestan el flujo de datos desde/hacia los puertos.
* **Regla:** Solo depende del Dominio. Aquí se maneja la validación de reglas de negocio antes de llamar a un repositorio.

### C. Capa de Infraestructura (Detalles Técnicos)

* **Ubicación:** `src/modules/[module]/infrastructure/`
* **Contenido:** Implementaciones concretas de los repositorios (Adapters), clientes de base de datos (Supabase), y controladores de entrada.
* **Subcarpetas:**
* `adapters/`: Implementación de las interfaces del dominio (ej. `SupabaseUserRepository.ts`).
* `controllers/`: Lógica que conecta con Next.js Route Handlers.
* `mappers/`: Conversión de datos de la base de datos (Supabase) a Entidades de Dominio.



## 2. Organización de Archivos en Next.js

Para no romper la convención de Next.js pero mantener la arquitectura, usaremos la carpeta `src/`:

```text
src/
├── core/                 # Utilidades compartidas, tipos globales
├── modules/              # Módulos de negocio (ej. 'auth', 'billing', 'users')
│   └── [module-name]/
│       ├── domain/       # Entidades e Interfaces (Ports)
│       ├── application/  # Casos de Uso
│       └── infrastructure/
│           ├── adapters/ # Implementación Supabase/APIs
│           └── controllers/
└── app/                  # ÚNICAMENTE puntos de entrada (Page, Layout, Route)
    └── api/
        └── [resource]/
            └── route.ts  # Llama al Controller de Infrastructure

```

## 3. Reglas de Implementación (Google Antigravity)

1. **Inyección de Dependencias:** Los Casos de Uso deben recibir sus repositorios a través del constructor o como argumentos de función. No deben instanciar clases directamente.
2. **Manejo de Datos (Mappers):** Nunca devuelvas el objeto "raw" de Supabase al Dominio o a la UI. Crea un `Mapper` que transforme el objeto de la base de datos en una `Entity` de dominio.
* *Razón:* Si decides cambiar Supabase por otra base de datos, solo cambias el Adaptador y el Mapper; el resto de la app ni se entera.


3. **Route Handlers como Tráfico:** Los archivos `app/api/.../route.ts` deben ser extremadamente delgados. Su única función es:
* Extraer los datos de la Request.
* Instanciar el Adaptador y el Caso de Uso.
* Ejecutar y retornar la Response.


4. **Validación:**
* **Zod** se usa en la capa de **Infraestructura** (al recibir la Request) para asegurar que los datos son correctos antes de entrar al hexágono.
* Las reglas de negocio complejas se validan en el **Dominio**.



## 4. Ejemplo de Flujo de Datos

1. `app/api/profile/route.ts` recibe la petición.
2. Llama a `UpdateProfileController` (Infra).
3. El Controller ejecuta `UpdateProfileUseCase` (App).
4. El Use Case usa `UserRepository` (Port en Dominio).
5. `SupabaseUserRepository` (Adapter en Infra) ejecuta la query y devuelve los datos.
