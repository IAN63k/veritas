'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'


/**
 * Server Action: Autentica un usuario con correo electrónico y contraseña.
 *
 * @remarks
 * - Valida las credenciales contra Supabase Auth.
 * - Obtiene el rol del usuario desde los metadatos de sesión.
 * - Revalida el layout raíz para sincronizar el estado de autenticación.
 * - Redirige según el rol del usuario: 'teacher' → dashboard del profesor, 'student' → mis cursos, otros → inicio.
 *
 * @param formData - Los datos del formulario que contienen el correo electrónico y la contraseña del usuario.
 * @returns Un objeto con la propiedad `error` si la autenticación falla; de lo contrario, redirige al usuario.
 */
export async function signIn(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error, data: authData } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    // Obtener el rol del usuario
    const role = authData.user?.user_metadata?.role

    revalidatePath('/', 'layout')

    if (role === 'teacher') {
        redirect('/teacher/dashboard')
    } else if (role === 'student') {
        redirect('/student/my-courses')
    } else {
        redirect('/')
    }
}

export async function signUp(formData: FormData) {
    const supabase = await createClient()

    const role = formData.get('role') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const studentCode = formData.get('student_code') as string | null

    const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role,
                name,
                ...(role === 'student' && studentCode ? { student_code: studentCode } : {}),
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')

    if (role === 'teacher') {
        redirect('/teacher/dashboard')
    } else {
        redirect('/student/my-courses')
    }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}