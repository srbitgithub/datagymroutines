import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        return response
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.delete(name)
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.delete(name)
                },
            },
        }
    )

    // IMPORTANT: Avoid calling getUser() if we don't need auth check for specific routes
    // to improve performance and avoid unnecessary Edge Runtime calls.
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
    const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(request.nextUrl.pathname)

    if (isDashboard || isAuthRoute) {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            console.log(`[Middleware] Usuario detectado: ${user.id} en ${request.nextUrl.pathname}`);
        } else {
            console.warn(`[Middleware] No se detectó usuario en ruta protegida: ${request.nextUrl.pathname}`);
        }

        if (!user && isDashboard) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (user && isAuthRoute) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
