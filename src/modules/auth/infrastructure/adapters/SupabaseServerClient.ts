import { createServerClient } from '@supabase/ssr'
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
    const allCookies = cookieStore.getAll();
    console.info(`[SupabaseServerClient] Creando cliente. Cookies: ${allCookies.length}`);
    if (allCookies.length > 0) {
        console.log("Cookie names:", allCookies.map(c => c.name).join(', '));
    }

    return createServerClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
