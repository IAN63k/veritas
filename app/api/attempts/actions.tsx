'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startEvaluationAttempt(evaluationId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'No autenticado' }
    }

    // Verificar cuántos intentos tiene
    const { count } = await supabase
        .from('evaluation_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('evaluation_id', evaluationId)
        .eq('student_id', user.id)

    // Obtener la evaluación para verificar max_attempts
    const { data: evaluation } = await supabase
        .from('evaluations')
        .select('max_attempts')
        .eq('id', evaluationId)
        .single() as { data: { max_attempts: number } | null; error: any }

    if (!evaluation) {
        return { data: null, error: 'Evaluación no encontrada' }
    }

    if ((count || 0) >= evaluation.max_attempts) {
        return { data: null, error: 'Has alcanzado el máximo de intentos permitidos' }
    }

    // Crear nuevo intento
    const { data, error } = await supabase
        .from('evaluation_attempts')
        .insert({
            evaluation_id: evaluationId,
            student_id: user.id,
            attempt_number: (count || 0) + 1,
            status: 'in_progress',
        } as never)
        .select()
        .single()

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function getStudentAttempt(evaluationId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { data: null, error: 'No autenticado' }
    }

    // Obtener intento en progreso
    const { data, error } = await supabase
        .from('evaluation_attempts')
        .select('*')
        .eq('evaluation_id', evaluationId)
        .eq('student_id', user.id)
        .eq('status', 'in_progress')
        .single()

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function submitEvaluationAttempt(
    attemptId: string,
    answers: Record<string, any>
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('evaluation_attempts')
        .update({
            status: 'completed',
            end_time: new Date().toISOString(),
            answers,
        } as never)
        .eq('id', attemptId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/student/my-courses')
    return { error: null }
}

export async function getSuspiciousEvents(attemptId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('suspicious_events')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('timestamp', { ascending: false })

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}