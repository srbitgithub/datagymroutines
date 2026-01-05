# Reglas de Ingeniería: Next.js App Router + Supabase Integration

Estas reglas rigen el desarrollo de APIs y Endpoints, priorizando la seguridad, el tipado fuerte y la integración con Supabase.

## 1. Validación de Credenciales (Protocolo Inicial)

* **Regla de Oro:** Antes de proceder con cualquier tarea de desarrollo o generación de código, se debe verificar la existencia de `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
* **Acción:** Si el usuario no ha proporcionado estas llaves, el asistente **debe detenerse** y solicitar:
> "Para continuar, por favor proporciona tu **Supabase URL** y **Anon Key**. Son necesarias para configurar el cliente de autenticación y base de datos."



## 2. Configuración e Instalación Base

Para un entorno basado en Next.js 14/15+:

* **Framework:** Next.js (App Router).
* **Validación:** `npm install zod` (Obligatorio para Type-safety).
* **Supabase:** `npm install @supabase/supabase-js @supabase/ssr` (Para manejo de sesiones en servidor y cliente).
* **Tipado:** Generar tipos de TypeScript automáticamente mediante el CLI de Supabase siempre que sea posible.

## 3. Convenciones de Archivos y Estructura

* **Ubicación:** Endpoints en `app/api/[resource]/route.ts`.
* **Naming:** El archivo debe llamarse exclusivamente `route.ts`.
* **Prohibición:** No mezclar `page.tsx` y `route.ts` en el mismo nivel de carpeta.
* **Cliente Supabase:** Crear un archivo de utilidad (ej. `utils/supabase/server.ts`) para instanciar el cliente de Supabase dentro de los Route Handlers usando `@supabase/ssr`.

## 4. Implementación de Autenticación (Auth)

El sistema debe gestionar los siguientes flujos mediante los helpers de Supabase:

* **Registro/Login:** Uso de `supabase.auth.signUp()` y `supabase.auth.signInWithPassword()`.
* **Recuperación:** Implementar `supabase.auth.resetPasswordForEmail()` y el endpoint de callback para procesar el intercambio de tokens.
* **Sesión:** Validar siempre la sesión en el servidor usando `supabase.auth.getUser()` (no `getSession()` por seguridad).

## 5. Arquitectura de los Route Handlers

* **Métodos:** Exportar funciones nombradas: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
* **Validación con Zod:** Es **obligatorio** validar el `body` (en POST/PUT) y los `searchParams` (en GET).
* **Sin `any`:** Todo dato de entrada o salida debe estar tipado o inferido de Zod/Supabase.
* **Caché:** Configurar `export const dynamic = 'force-dynamic'` si el endpoint depende de cookies o headers de autenticación.

## 6. Manejo de Errores y Respuestas

* **Estructura Estándar:** Retornar siempre `NextResponse.json({ data, error, message })`.
* **Status Codes:**
* `200/201`: Éxito.
* `400`: Error de validación Zod.
* `401`: Sesión no válida o inexistente.
* `500`: Error interno de base de datos o servidor.



## 7. Seguridad y Persistencia (User Data)

* **Tabla Profiles:** Cada usuario debe tener una entrada en una tabla `profiles` vinculada por `id` a `auth.users`.
* **RLS (Row Level Security):** Se asume que la seguridad reside en la base de datos. Las peticiones desde la API deben usar el cliente de Supabase que hereda el token del usuario (`auth.uid()`).
* **Middleware:** Utilizar `middleware.ts` para refrescar la sesión del usuario antes de que la petición llegue al Route Handler.

## 8. Ejemplo de Implementación Estándar (POST con Auth)

```typescript
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const profileSchema = z.object({
  username: z.string().min(3),
  full_name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. Validar Autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // 2. Validar Entrada
    const body = await req.json();
    const validatedData = profileSchema.parse(body);

    // 3. Persistencia en Supabase
    const { data, error: dbError } = await supabase
      .from('profiles')
      .update(validatedData)
      .eq('id', user.id);

    if (dbError) throw dbError;

    return NextResponse.json({ data: 'Perfil actualizado' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validación fallida', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
