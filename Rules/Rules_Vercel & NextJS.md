# Reglas de Ingeniería: Vercel & Next.js (High Performance)

**Descripción:** Guía de mejores prácticas para el desarrollo en Next.js 15+ y despliegue optimizado en la infraestructura de Vercel.
**Archivos afectados:** `app/**/*.{ts,tsx}`, `next.config.js`, `middleware.ts`, `vercel.json`, `.env.example`

## 1. Arquitectura de Componentes (RSC First)

* **Server Components (RSC):** Todos los componentes son servidores por defecto. Minimiza el uso de `'use client'`. Solo úsalo para:
* Hooks de React (`useState`, `useEffect`).
* Interactividad basada en eventos (clicks, formularios complejos).
* Consumo de Contextos de Supabase (Auth/Session).


* **Partial Prerendering (PPR):** Habilita PPR en `next.config.js` para renderizar partes estáticas de la página instantáneamente mientras se espera por los datos dinámicos (especialmente útil para dashboards con datos de Supabase).

## 2. Data Fetching y Caching (Next.js 15+ Standards)

* **Explicit Caching:** En Next.js 15, los `fetch` no se cachean por defecto. Usa `{ cache: 'force-cache' }` para datos estáticos o `revalidateTag` para purgar datos de la base de datos de Supabase de forma granular.
* **Server Actions:** Utiliza Server Actions para todas las mutaciones (POST, PUT, DELETE). Asegúrate de usar `useOptimistic` en el cliente para una respuesta instantánea en la UI.
* **Type-Safety:** Valida los retornos de las APIs de Supabase con **Zod** antes de pasarlos a componentes visuales.

## 3. Despliegue y Runtimes en Vercel

* **Edge Runtime:** Utiliza `export const runtime = 'edge'` exclusivamente en:
* `middleware.ts` (Obligatorio para Auth de Supabase).
* Endpoints de API que requieren latencia ultra-baja y no dependen de librerías pesadas de Node.js.


* **Serverless Runtime:** Úsalo para operaciones pesadas de base de datos o lógica de negocio compleja para evitar limitaciones de tamaño en el Edge.
* **Vercel Functions:** Configura las regiones de tus funciones cerca de tu base de datos de Supabase (ej. `us-east-1` o `eu-central-1`) para reducir el "cold start" y la latencia de red.

## 4. Gestión de Variables de Entorno y Seguridad

* **Prefijos:** * `NEXT_PUBLIC_`: Solo para la URL y Anon Key de Supabase.
* Sin prefijo: Para llaves de servicio de Supabase o secretos de API. Nunca las expongas en el cliente.


* **Validación:** Crea un archivo `env.ts` (usando Zod) que valide que todas las variables necesarias existen en el inicio de la aplicación para evitar errores en runtime en Vercel.

## 5. Optimización de Core Web Vitals

* **Imágenes:** Uso obligatorio de `next/image`. Define `priority` para la imagen del LCP.
* **Fuentes:** Utiliza `next/font`. No importes fuentes externas mediante `@import` en CSS para evitar Layout Shifts.
* **Monitoring:** Es obligatorio tener habilitados `@vercel/analytics` y `@vercel/speed-insights`. Un puntaje de Performance < 90 en Vercel Dashboard requiere revisión inmediata.

## 6. Flujo de Trabajo y CI/CD

* **Build Local:** Ejecuta `npm run build` antes de cada push importante. Si el build falla localmente, no se sube a Vercel.
* **Preview Deployments:** Utiliza las URLs de previsualización de Vercel para probar el flujo de autenticación de Supabase (asegúrate de añadir estas URLs en los "Redirect URLs" de Supabase Auth).
* **Middleware Auth:** El archivo `middleware.ts` debe proteger las rutas de `/dashboard` o similares, verificando la sesión de Supabase antes de permitir el renderizado de la página.
