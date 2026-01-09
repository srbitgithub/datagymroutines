import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSideClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        if (process.env.NEXT_PHASE !== 'phase-production-build') {
            const missing = [!supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL', !supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY'].filter(Boolean);
            console.error(`[SupabaseServerClient] RUNTIME ERROR: Faltan variables de entorno: ${missing.join(', ')}`);
        }
    }

    const cookieStore = await cookies()
    console.log(`[SupabaseServerClient] Solicitando cliente. Cookies presentes: ${cookieStore.getAll().length}`);

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
                        cookieStore.delete(name)
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
