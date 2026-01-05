# Reglas de Ingeniería: React Frontend (Next.js 15 Ecosystem)

**Descripción:** Estándares para el desarrollo de la interfaz de usuario utilizando React 19, priorizando Server Components y el desacoplamiento de la lógica de negocio.
**Archivos afectados:** `app/**/*.tsx`, `components/**/*.tsx`, `hooks/**/*.ts`

## 1. Arquitectura de Componentes (RSC vs. Client)

* **Default: Server Components (RSC).** Todos los componentes de la interfaz deben ser Server Components por defecto para reducir el bundle de JavaScript en el cliente y mejorar el SEO/LCP.
* **Client Components:** Solo se permite el uso de `'use client'` en:
* Componentes con interactividad (event listeners como `onClick`, `onChange`).
* Uso de React Hooks (`useState`, `useEffect`, `useContext`).
* Consumo de APIs del navegador (LocalStorage, Geolocation).


* **Composición:** Prefiere pasar componentes cliente como `children` de componentes servidor para mantener la mayor parte de la app en el servidor.

## 2. Desacoplamiento de Lógica (Clean Architecture en UI)

* **Prohibición de Lógica de Negocio:** Los componentes de React **no** deben contener lógica de validación o reglas de negocio. Solo deben gestionar el estado de la UI.
* **Custom Hooks como Adaptadores:** Utiliza Hooks para actuar como puentes entre la capa de **Aplicación** (Casos de Uso) y la **UI**.
* *Ejemplo:* Un hook `useAuth()` que internamente llama al caso de uso `LoginUser`, pero que para el componente React solo expone `{ login, isLoading, user }`.


* **Presentational vs. Container:** Separa componentes que solo renderizan datos (Presentational) de aquellos que manejan la integración con el sistema (Container/Smart).

## 3. Manejo de Estado y Datos

* **Server Actions:** Para mutaciones de datos (formularios, clics), utiliza **Server Actions** nativas de Next.js.
* **Optimistic UI:** Implementa el hook `useOptimistic` de React 19 para actualizaciones instantáneas en la interfaz antes de que Supabase confirme la operación.
* **Estado Global:** Evita proveedores de estado global pesados (como Redux) si no es estrictamente necesario. Prefiere **React Context** para datos transversales (Auth, Tema) y **URL Search Params** para estados de filtros/búsqueda.

## 4. Estándares de Implementación (React 19)

* **Formularios:** Utiliza el hook `useActionState` para gestionar el estado de los formularios, errores y estados de carga de forma nativa.
* **Fragmentos y Keys:** Nunca uses índices de array como `key`. Utiliza IDs únicos provenientes del dominio (UIDs de Supabase).
* **Efectos:** Evita `useEffect` para fetching de datos. Utiliza Server Components asíncronos o librerías de caché como SWR/React Query si es necesario un fetch dinámico en el cliente.

## 5. UI Dinámica y Accesibilidad (Tailwind v4)

* **Accesibilidad (A11y):** Es obligatorio el uso de etiquetas semánticas (`<main>`, `<nav>`, `<article>`) y atributos ARIA cuando el componente sea interactivo.
* **Esqueleto de Carga:** Utiliza archivos `loading.tsx` y el componente `<Suspense>` para manejar estados de carga de forma granular sin bloquear toda la página.
* **Diseño Atómico:** Organiza los componentes en:
* `atoms/`: Botones, inputs, etiquetas (puros).
* `molecules/`: Grupos de átomos (un campo de búsqueda).
* `organisms/`: Secciones complejas (Navbar, CardGrid).



---

## 6. Ejemplo de Componente Desacoplado (Clean React)

```tsx
// src/modules/auth/infrastructure/components/LoginForm.tsx
'use client'

import { useActionState } from 'react';
import { loginAction } from '@/app/_actions/auth'; // Server Action (Infrastructure)

export function LoginForm() {
  // React 19: Manejo nativo de estados de servidor
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input name="email" type="email" required className="border p-2" />
      <input name="password" type="password" required className="border p-2" />
      
      <button disabled={isPending} className="bg-blue-500 text-white p-2">
        {isPending ? 'Cargando...' : 'Iniciar Sesión'}
      </button>

      {state?.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}
