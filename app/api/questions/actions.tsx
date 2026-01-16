'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getQuestions(evaluationId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('evaluation_id', evaluationId)
        .order('order_number', { ascending: true })

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function getQuestion(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function createQuestion(evaluationId: string, questionData: {
    type: string
    content: any
    points: number
}) {
    const supabase = await createClient()

    // Obtener el siguiente número de orden
    const { count } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('evaluation_id', evaluationId)

    const orderNumber = (count || 0) + 1

    const { data, error } = await supabase
        .from('questions')
        .insert([{
            evaluation_id: evaluationId,
            type: questionData.type,
            content: questionData.content,
            points: questionData.points,
            order_number: orderNumber,
        }] as never)
        .select()
        .single()

    if (error) {
        return { data: null, error: error.message }
    }

    revalidatePath(`/teacher/courses/[id]/evaluations/${evaluationId}/questions`)
    return { data, error: null }
}

export async function updateQuestion(id: string, questionData: {
    type: string
    content: any
    points: number
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('questions')
        .update({
            type: questionData.type,
            content: questionData.content,
            points: questionData.points,
        } as never)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/teacher/courses/[id]/evaluations/[evaluationId]/questions`)
    return { error: null }
}

export async function deleteQuestion(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/teacher/courses/[id]/evaluations/[evaluationId]/questions`)
    return { error: null }
}

export async function reorderQuestions(evaluationId: string, questionIds: string[]) {
    const supabase = await createClient()

    // Actualizar el order_number de cada pregunta
    const updates = questionIds.map((id, index) => ({
        id,
        order_number: index + 1,
    }))

    for (const update of updates) {
        await supabase
            .from('questions')
            .update({ order_number: update.order_number } as never)
            .eq('id', update.id)
    }

    revalidatePath(`/teacher/courses/[id]/evaluations/${evaluationId}/questions`)
    return { error: null }
}