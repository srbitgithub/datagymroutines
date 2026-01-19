import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase con Service Role Key para operaciones administrativas.
 * SOLO debe ser usado en el lado del servidor y detrás de una autenticación de administrador.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Faltan variables de entorno de Supabase (URL o Service Role Key).");
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
