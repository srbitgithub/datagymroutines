import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSideClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        const missing = []
        if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
        if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

        const errorMessage = `Faltan variables de entorno de Supabase: ${missing.join(', ')}. Verifica la configuración de tu servidor.`

        // If we're not inside the Next.js build process, we throw a loud error
        if (process.env.NEXT_PHASE !== 'phase-production-build') {
            throw new Error(errorMessage)
        }

        console.error(`[SupabaseServerClient] Ocurrió un error en el build (prerendering): ${errorMessage}`);
    }

    const cookieStore = await cookies()

    return createServerClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder',
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // The `remove` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
