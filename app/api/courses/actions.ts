'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Course } from '@/app/types'

export async function getCourses(): Promise<{ data: Course[] | null; error: string | null }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'No autenticado' }
    }

    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function getCourse(id: string): Promise<{ data: Course | null; error: string | null }> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function createCourse(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autenticado' }
    }

    const courseData = {
        teacher_id: user.id,
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        period: formData.get('period') as string,
        description: formData.get('description') as string || null,
    }

    const { error } = await supabase
        .from('courses')
        .insert([courseData] as any)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/teacher/courses')
    return { error: null }
}

export async function updateCourse(id: string, formData: FormData) {
    const supabase = await createClient()

    const courseData: Partial<Course> = {
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        period: formData.get('period') as string,
        description: formData.get('description') as string || null,
    }

    const { error } = await supabase
        .from('courses')
        .update(courseData as never)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/teacher/courses')
    return { error: null }
}

export async function deleteCourse(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/teacher/courses')
    return { error: null }
}

export async function getCourseStats(courseId: string) {
    const supabase = await createClient()

    // Contar estudiantes inscritos
    const { count: studentsCount } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)

    // Contar evaluaciones
    const { count: evaluationsCount } = await supabase
        .from('evaluations')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)

    return {
        students: studentsCount || 0,
        evaluations: evaluationsCount || 0,
    }
}