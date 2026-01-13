import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const tz = request.headers.get('x-vercel-ip-timezone') || 'Europe/Madrid'

    let supabaseResponse = NextResponse.next({
        request: {
            headers: new Headers(request.headers),
        },
    })
    supabaseResponse.headers.set('x-timezone', tz)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) return supabaseResponse

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid calling getUser() if we don't need auth check for specific routes
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
    const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(request.nextUrl.pathname)

    if (isDashboard || isAuthRoute) {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            console.info(`[Middleware] Usuario detectado: ${user.id} en ${request.nextUrl.pathname}`);
        } else {
            console.warn(`[Middleware] No se detectó usuario en: ${request.nextUrl.pathname}`);
        }

        if (!user && isDashboard) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (user && isAuthRoute) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
