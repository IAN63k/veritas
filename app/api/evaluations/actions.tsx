'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Evaluation, EvaluationAttempt } from '@/app/types'

interface CourseWithTeacherRPC {
  course_id: string
  course_name: string
  course_code: string
  course_period: string
  course_description: string | null
  teacher_id: string
  teacher_name: string
  teacher_email: string
}

export async function getEvaluations(courseId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function getEvaluation(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function createEvaluation(courseId: string, formData: FormData) {
    const supabase = await createClient()

    // Convertir fechas de datetime-local (hora local) a ISO UTC
    const startDate = new Date(formData.get('start_date') as string).toISOString()
    const endDate = new Date(formData.get('end_date') as string).toISOString()

    const evaluationData = {
        course_id: courseId,
        title: formData.get('title') as string,
        description: formData.get('description') as string || null,
        start_date: startDate,
        end_date: endDate,
        duration_minutes: parseInt(formData.get('duration_minutes') as string),
        max_attempts: parseInt(formData.get('max_attempts') as string),
        protection_level: formData.get('protection_level') as 'low' | 'medium' | 'high',
        is_active: formData.get('is_active') === 'true',
    }

    const { data, error } = await supabase
        .from('evaluations')
        .insert([evaluationData as never])
        .select()
        .single()

    if (error) {
        return { data: null, error: error.message }
    }

    revalidatePath(`/teacher/courses/${courseId}/evaluations`)
    return { data, error: null }
}

export async function updateEvaluation(id: string, courseId: string, formData: FormData) {
    const supabase = await createClient()

    // Convertir fechas de datetime-local (hora local) a ISO UTC
    const startDate = new Date(formData.get('start_date') as string).toISOString()
    const endDate = new Date(formData.get('end_date') as string).toISOString()

    const evaluationData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || null,
        start_date: startDate,
        end_date: endDate,
        duration_minutes: parseInt(formData.get('duration_minutes') as string),
        max_attempts: parseInt(formData.get('max_attempts') as string),
        protection_level: formData.get('protection_level') as 'low' | 'medium' | 'high',
        is_active: formData.get('is_active') === 'true',
    }

    const { error } = await supabase
        .from('evaluations')
        .update(evaluationData as never)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/teacher/courses/${courseId}/evaluations`)
    return { error: null }
}

export async function deleteEvaluation(id: string, courseId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/teacher/courses/${courseId}/evaluations`)
    return { error: null }
}

export async function toggleEvaluationStatus(id: string, courseId: string, isActive: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('evaluations')
        .update({ is_active: isActive } as never)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/teacher/courses/${courseId}/evaluations`)
    return { error: null }
}

export async function getEvaluationStats(evaluationId: string) {
    const supabase = await createClient()

    // Contar preguntas
    const { count: questionsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('evaluation_id', evaluationId)

    // Contar intentos
    const { count: attemptsCount } = await supabase
        .from('evaluation_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('evaluation_id', evaluationId)

    // Contar completados
    const { count: completedCount } = await supabase
        .from('evaluation_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('evaluation_id', evaluationId)
        .eq('status', 'completed')

    return {
        questions: questionsCount || 0,
        attempts: attemptsCount || 0,
        completed: completedCount || 0,
    }
}

export async function getStudentEvaluations(courseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  console.log('🔍 DEBUG getStudentEvaluations:')
  console.log('  User ID:', user?.id)
  console.log('  Course ID:', courseId)

  // Ya no necesitamos verificar enrollment aquí porque 
  // getCourseForStudent ya lo hizo

  // Obtener evaluaciones activas directamente
  // La política RLS permite a estudiantes ver evaluaciones activas de cursos inscritos
  const { data: evaluations, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('start_date', { ascending: false })
    .returns<Evaluation[]>()

  console.log('  Evaluations query result:', { count: evaluations?.length, error })

  if (error) {
    console.error('❌ Error obteniendo evaluaciones:', error)
    return { data: null, error: error.message }
  }

  // Para cada evaluación, obtener el estado del estudiante
  const evaluationsWithStatus = await Promise.all(
    (evaluations || []).map(async (evaluation) => {
      const { data: attempts } = await supabase
        .from('evaluation_attempts')
        .select('*')
        .eq('evaluation_id', evaluation.id)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .returns<EvaluationAttempt[]>()

      console.log(`  Attempts for eval ${evaluation.id}:`, attempts?.length)

      const hasInProgressAttempt = attempts?.some((a) => a.status === 'in_progress')
      const completedAttempts = attempts?.filter((a) => a.status === 'completed') || []
      const blockedAttempts = attempts?.filter((a) => a.status === 'blocked') || []

      return {
        ...evaluation,
        student_status: {
          attempts_count: attempts?.length || 0,
          completed_count: completedAttempts.length,
          blocked_count: blockedAttempts.length,
          has_in_progress: hasInProgressAttempt,
          can_attempt:
            !hasInProgressAttempt &&
            (attempts?.length || 0) < evaluation.max_attempts &&
            blockedAttempts.length === 0,
          last_attempt: attempts?.[0] || null,
        },
      }
    })
  )

  console.log('  Final evaluations with status:', evaluationsWithStatus.length)

  return { data: evaluationsWithStatus, error: null }
}

export async function getCourseForStudent(courseId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('🔍 DEBUG getCourseForStudent:')
  console.log('  User ID:', user?.id)
  console.log('  Course ID:', courseId)

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // Usar función RPC que bypasea RLS
  const { data, error } = await supabase
    .rpc('get_course_with_teacher', {
      p_course_id: courseId,
      p_student_id: user.id
    } as any)

  console.log('  RPC result:', { data, error })

  if (error) {
    console.error('❌ Error RPC:', error)
    if (error.message.includes('No estás inscrito')) {
      return { data: null, error: 'No estás inscrito en este curso' }
    }
    return { data: null, error: error.message }
  }

  const typedData = data as CourseWithTeacherRPC[] | null

  if (!typedData || typedData.length === 0) {
    return { data: null, error: 'Curso no encontrado' }
  }

  // Transformar el resultado
  const courseData = typedData[0]
  
  return {
    data: {
      id: courseData.course_id,
      name: courseData.course_name,
      code: courseData.course_code,
      period: courseData.course_period,
      description: courseData.course_description,
      teacher_id: courseData.teacher_id,
      teachers: {
        name: courseData.teacher_name,
        email: courseData.teacher_email
      }
    },
    error: null
  }
}