'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// =====================================================
// LIBERACIÓN DE CALIFICACIONES
// =====================================================

export async function toggleGradesRelease(evaluationId: string, release: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    // Verificar que el profesor es dueño de la evaluación
    const { data: evaluation } = await supabase
        .from('evaluations')
        .select('*, courses!inner(teacher_id)')
        .eq('id', evaluationId)
        .single()

    if (!evaluation || evaluation.courses.teacher_id !== user.id) {
        return { error: 'No tienes permiso para esta evaluación' }
    }

    const { error } = await supabase
        .from('evaluations')
        .update({
            grades_released: release,
            release_grades_at: release ? new Date().toISOString() : null
        })
        .eq('id', evaluationId)

    if (error) return { error: error.message }

    // Registrar en audit log
    await supabase.from('grading_audit_log').insert({
        evaluation_id: evaluationId,
        teacher_id: user.id,
        action_type: release ? 'grade_released' : 'grade_hidden',
        old_value: { grades_released: !release },
        new_value: { grades_released: release }
    })

    revalidatePath(`/teacher/evaluations/${evaluationId}`)
    return { success: true }
}

export async function scheduleGradesRelease(evaluationId: string, releaseAt: Date | null) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const { error } = await supabase
        .from('evaluations')
        .update({
            release_grades_at: releaseAt?.toISOString() || null,
            auto_release_grades: releaseAt !== null
        })
        .eq('id', evaluationId)

    if (error) return { error: error.message }

    revalidatePath(`/teacher/evaluations/${evaluationId}`)
    return { success: true }
}

// =====================================================
// REVISIÓN DE INTENTOS
// =====================================================

export async function getAttemptDetails(attemptId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { data: null, error: 'No autenticado' }

    // Obtener intento con estudiante y respuestas
    const { data: attempt, error } = await supabase
        .from('evaluation_attempts')
        .select(`
      *,
      student:students(id, name, email, student_code),
      evaluation:evaluations(
        id, title, max_attempts,
        courses(teacher_id)
      )
    `)
        .eq('id', attemptId)
        .single()

    if (error) return { data: null, error: error.message }

    // Verificar permiso
    if (attempt.evaluation.courses.teacher_id !== user.id) {
        return { data: null, error: 'No tienes permiso' }
    }

    // Obtener respuestas detalladas
    const { data: answers } = await supabase
        .from('attempt_answers')
        .select(`
      *,
      question:questions(id, type, content, points, order_number)
    `)
        .eq('attempt_id', attemptId)
        .order('question(order_number)')

    // Obtener intentos disponibles
    const { data: availableAttempts } = await supabase
        .rpc('get_available_attempts', {
            p_evaluation_id: attempt.evaluation_id,
            p_student_id: attempt.student_id
        })

    return {
        data: {
            ...attempt,
            answers: answers || [],
            available_attempts: availableAttempts || 0
        },
        error: null
    }
}

export async function getEvaluationAttempts(evaluationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { data: null, error: 'No autenticado' }

    const { data: attempts, error } = await supabase
        .from('evaluation_attempts')
        .select(`
      *,
      student:students(id, name, email, student_code)
    `)
        .eq('evaluation_id', evaluationId)
        .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message }

    return { data: attempts, error: null }
}

// =====================================================
// CALIFICACIÓN MANUAL Y PUNTOS ADICIONALES
// =====================================================

export async function updateAttemptScore(
    attemptId: string,
    data: {
        manual_score?: number | null
        bonus_points?: number
        reason?: string
    }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    // Obtener intento actual para el historial
    const { data: currentAttempt } = await supabase
        .from('evaluation_attempts')
        .select('*, evaluation:evaluations(courses(teacher_id))')
        .eq('id', attemptId)
        .single()

    if (!currentAttempt) return { error: 'Intento no encontrado' }
    if (currentAttempt.evaluation.courses.teacher_id !== user.id) {
        return { error: 'No tienes permiso' }
    }

    // Preparar historial de ajustes
    const adjustments = currentAttempt.score_adjustments || []
    if (data.manual_score !== undefined || data.bonus_points !== undefined) {
        adjustments.push({
            date: new Date().toISOString(),
            old_score: currentAttempt.final_score,
            new_score: (data.manual_score ?? currentAttempt.manual_score ?? currentAttempt.auto_score ?? 0) +
                (data.bonus_points ?? currentAttempt.bonus_points ?? 0),
            reason: data.reason || 'Ajuste manual',
            adjusted_by: user.id
        })
    }

    const updateData: any = {
        score_adjustments: adjustments,
        graded_at: new Date().toISOString(),
        graded_by: user.id
    }

    if (data.manual_score !== undefined) {
        updateData.manual_score = data.manual_score
    }
    if (data.bonus_points !== undefined) {
        updateData.bonus_points = data.bonus_points
    }

    const { error } = await supabase
        .from('evaluation_attempts')
        .update(updateData)
        .eq('id', attemptId)

    if (error) return { error: error.message }

    // Registrar en audit log
    await supabase.from('grading_audit_log').insert({
        attempt_id: attemptId,
        evaluation_id: currentAttempt.evaluation_id,
        student_id: currentAttempt.student_id,
        teacher_id: user.id,
        action_type: data.bonus_points !== undefined ? 'bonus_added' : 'score_adjusted',
        old_value: {
            manual_score: currentAttempt.manual_score,
            bonus_points: currentAttempt.bonus_points,
            final_score: currentAttempt.final_score
        },
        new_value: {
            manual_score: data.manual_score,
            bonus_points: data.bonus_points
        },
        reason: data.reason
    })

    revalidatePath(`/teacher/evaluations`)
    return { success: true }
}

export async function updateAnswerScore(
    answerId: string,
    data: {
        manual_points?: number | null
        bonus_points?: number
        feedback?: string
    }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const updateData: any = {
        graded_at: new Date().toISOString(),
        graded_by: user.id
    }

    if (data.manual_points !== undefined) updateData.manual_points = data.manual_points
    if (data.bonus_points !== undefined) updateData.bonus_points = data.bonus_points
    if (data.feedback !== undefined) updateData.feedback = data.feedback

    // Calcular final_points
    const { data: currentAnswer } = await supabase
        .from('attempt_answers')
        .select('auto_points, manual_points, bonus_points')
        .eq('id', answerId)
        .single()

    if (currentAnswer) {
        const manualPts = data.manual_points ?? currentAnswer.manual_points
        const autoPts = currentAnswer.auto_points
        const bonusPts = data.bonus_points ?? currentAnswer.bonus_points ?? 0
        updateData.final_points = (manualPts ?? autoPts ?? 0) + bonusPts
    }

    const { error } = await supabase
        .from('attempt_answers')
        .update(updateData)
        .eq('id', answerId)

    if (error) return { error: error.message }

    // Recalcular score total del intento
    await recalculateAttemptScore(answerId)

    revalidatePath(`/teacher/evaluations`)
    return { success: true }
}

async function recalculateAttemptScore(answerId: string) {
    const supabase = await createClient()

    // Obtener attempt_id
    const { data: answer } = await supabase
        .from('attempt_answers')
        .select('attempt_id')
        .eq('id', answerId)
        .single()

    if (!answer) return

    // Sumar todos los puntos de las respuestas
    const { data: answers } = await supabase
        .from('attempt_answers')
        .select('final_points')
        .eq('attempt_id', answer.attempt_id)

    const totalAutoScore = answers?.reduce((sum, a) => sum + (a.final_points || 0), 0) || 0

    await supabase
        .from('evaluation_attempts')
        .update({ auto_score: totalAutoScore })
        .eq('id', answer.attempt_id)
}

// =====================================================
// GESTIÓN DE INTENTOS
// =====================================================

export async function resetAttempt(attemptId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    const { data: attempt } = await supabase
        .from('evaluation_attempts')
        .select('*, evaluation:evaluations(courses(teacher_id))')
        .eq('id', attemptId)
        .single()

    if (!attempt) return { error: 'Intento no encontrado' }
    if (attempt.evaluation.courses.teacher_id !== user.id) {
        return { error: 'No tienes permiso' }
    }

    const { error } = await supabase
        .from('evaluation_attempts')
        .update({
            is_reset: true,
            reset_at: new Date().toISOString(),
            reset_by: user.id,
            reset_reason: reason
        })
        .eq('id', attemptId)

    if (error) return { error: error.message }

    // Registrar en audit log
    await supabase.from('grading_audit_log').insert({
        attempt_id: attemptId,
        evaluation_id: attempt.evaluation_id,
        student_id: attempt.student_id,
        teacher_id: user.id,
        action_type: 'attempt_reset',
        old_value: { is_reset: false },
        new_value: { is_reset: true, reason },
        reason
    })

    revalidatePath(`/teacher/evaluations`)
    return { success: true }
}

export async function resetAllAttempts(evaluationId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    // Verificar permiso
    const { data: evaluation } = await supabase
        .from('evaluations')
        .select('courses(teacher_id)')
        .eq('id', evaluationId)
        .single()

    if (!evaluation || evaluation.courses.teacher_id !== user.id) {
        return { error: 'No tienes permiso' }
    }

    // Obtener todos los intentos para el audit log
    const { data: attempts } = await supabase
        .from('evaluation_attempts')
        .select('id, student_id')
        .eq('evaluation_id', evaluationId)
        .eq('is_reset', false)

    // Resetear todos los intentos
    const { error } = await supabase
        .from('evaluation_attempts')
        .update({
            is_reset: true,
            reset_at: new Date().toISOString(),
            reset_by: user.id,
            reset_reason: reason
        })
        .eq('evaluation_id', evaluationId)
        .eq('is_reset', false)

    if (error) return { error: error.message }

    // Registrar en audit log (un registro general)
    await supabase.from('grading_audit_log').insert({
        evaluation_id: evaluationId,
        teacher_id: user.id,
        action_type: 'attempt_reset',
        old_value: { count: attempts?.length || 0 },
        new_value: { all_reset: true },
        reason: `Reset masivo: ${reason}`
    })

    revalidatePath(`/teacher/evaluations/${evaluationId}`)
    return { success: true, count: attempts?.length || 0 }
}

// =====================================================
// INTENTOS ADICIONALES
// =====================================================

export async function addAdditionalAttempts(
    evaluationId: string,
    studentId: string,
    additionalAttempts: number,
    notes?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    // Verificar permiso
    const { data: evaluation } = await supabase
        .from('evaluations')
        .select('courses(teacher_id)')
        .eq('id', evaluationId)
        .single()

    if (!evaluation || evaluation.courses.teacher_id !== user.id) {
        return { error: 'No tienes permiso' }
    }

    // Upsert en student_evaluation_overrides
    const { data: existing } = await supabase
        .from('student_evaluation_overrides')
        .select('additional_attempts')
        .eq('evaluation_id', evaluationId)
        .eq('student_id', studentId)
        .single()

    const newTotal = (existing?.additional_attempts || 0) + additionalAttempts

    const { error } = await supabase
        .from('student_evaluation_overrides')
        .upsert({
            evaluation_id: evaluationId,
            student_id: studentId,
            additional_attempts: newTotal,
            notes,
            created_by: user.id,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'evaluation_id,student_id'
        })

    if (error) return { error: error.message }

    // Audit log
    await supabase.from('grading_audit_log').insert({
        evaluation_id: evaluationId,
        student_id: studentId,
        teacher_id: user.id,
        action_type: 'attempts_added',
        old_value: { additional_attempts: existing?.additional_attempts || 0 },
        new_value: { additional_attempts: newTotal },
        reason: notes
    })

    revalidatePath(`/teacher/evaluations/${evaluationId}`)
    return { success: true }
}

export async function addAdditionalAttemptsToAll(
    evaluationId: string,
    additionalAttempts: number,
    notes?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autenticado' }

    // Verificar permiso y obtener estudiantes del curso
    const { data: evaluation } = await supabase
        .from('evaluations')
        .select('course_id, courses(teacher_id)')
        .eq('id', evaluationId)
        .single()

    if (!evaluation || evaluation.courses.teacher_id !== user.id) {
        return { error: 'No tienes permiso' }
    }

    // Obtener todos los estudiantes inscritos
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('course_id', evaluation.course_id)

    if (!enrollments || enrollments.length === 0) {
        return { error: 'No hay estudiantes inscritos' }
    }

    // Agregar intentos a cada estudiante
    const results = await Promise.all(
        enrollments.map(e =>
            addAdditionalAttempts(evaluationId, e.student_id, additionalAttempts, notes)
        )
    )

    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
        return { error: `${errors.length} errores al agregar intentos` }
    }

    revalidatePath(`/teacher/evaluations/${evaluationId}`)
    return { success: true, count: enrollments.length }
}

// =====================================================
// VISTA GENERAL DE CALIFICACIONES
// =====================================================

export async function getEvaluationGradesOverview(evaluationId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { data: null, error: 'No autenticado' }

    // Obtener evaluación con curso
    const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .select(`
      *,
      course:courses(id, name, teacher_id)
    `)
        .eq('id', evaluationId)
        .single()

    if (evalError || !evaluation) {
        return { data: null, error: 'Evaluación no encontrada' }
    }

    if (evaluation.course.teacher_id !== user.id) {
        return { data: null, error: 'No tienes permiso' }
    }

    // Obtener estudiantes inscritos con sus intentos
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
      student:students(id, name, email, student_code)
    `)
        .eq('course_id', evaluation.course_id)

    // Obtener todos los intentos de la evaluación
    const { data: attempts } = await supabase
        .from('evaluation_attempts')
        .select('*')
        .eq('evaluation_id', evaluationId)

    // Obtener overrides
    const { data: overrides } = await supabase
        .from('student_evaluation_overrides')
        .select('*')
        .eq('evaluation_id', evaluationId)

    // Construir vista por estudiante
    const studentsGrades = enrollments?.map(e => {
        const studentAttempts = attempts?.filter(a =>
            a.student_id === e.student.id && !a.is_reset
        ) || []
        const resetAttempts = attempts?.filter(a =>
            a.student_id === e.student.id && a.is_reset
        ) || []
        const override = overrides?.find(o => o.student_id === e.student.id)
        const completedAttempts = studentAttempts.filter(a => a.status === 'completed')
        const inProgressAttempt = studentAttempts.find(a => a.status === 'in_progress')

        const maxAttempts = evaluation.max_attempts + (override?.additional_attempts || 0)
        const availableAttempts = maxAttempts - studentAttempts.length

        return {
            student_id: e.student.id,
            student_name: e.student.name,
            student_code: e.student.student_code,
            student_email: e.student.email,
            attempts_count: studentAttempts.length,
            reset_attempts_count: resetAttempts.length,
            completed_count: completedAttempts.length,
            available_attempts: availableAttempts,
            max_attempts: maxAttempts,
            additional_attempts: override?.additional_attempts || 0,
            best_score: completedAttempts.length > 0
                ? Math.max(...completedAttempts.map(a => a.final_score || 0))
                : null,
            last_score: completedAttempts[0]?.final_score || null,
            status: inProgressAttempt
                ? 'in_progress'
                : completedAttempts.length > 0
                    ? 'completed'
                    : studentAttempts.some(a => a.status === 'blocked')
                        ? 'blocked'
                        : 'not_started',
            last_attempt_at: studentAttempts[0]?.created_at || null,
            attempts: studentAttempts
        }
    }) || []

    return {
        data: {
            evaluation,
            students: studentsGrades,
            summary: {
                total_students: studentsGrades.length,
                completed: studentsGrades.filter(s => s.status === 'completed').length,
                in_progress: studentsGrades.filter(s => s.status === 'in_progress').length,
                not_started: studentsGrades.filter(s => s.status === 'not_started').length,
                average_score: studentsGrades.filter(s => s.best_score !== null).length > 0
                    ? studentsGrades.reduce((sum, s) => sum + (s.best_score || 0), 0) /
                    studentsGrades.filter(s => s.best_score !== null).length
                    : null
            }
        },
        error: null
    }
}