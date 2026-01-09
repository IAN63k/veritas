import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/app/types/database.types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Proteger rutas de profesor
  if (!user && request.nextUrl.pathname.startsWith('/teacher')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Proteger rutas de estudiante
  if (!user && request.nextUrl.pathname.startsWith('/student')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirigir usuarios autenticados desde login/register
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    // Obtener el rol del usuario
    const role = user.user_metadata?.role

    const url = request.nextUrl.clone()
    if (role === 'teacher') {
      url.pathname = '/teacher/dashboard'
    } else if (role === 'student') {
      url.pathname = '/student/my-courses'
    } else {
      url.pathname = '/'
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}