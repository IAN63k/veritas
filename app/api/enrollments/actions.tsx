'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { BulkEnrollmentStudent, BulkEnrollmentResult } from '@/app/types/index'
import { createAdminClient } from '@/lib/supabase/admin'
 
export async function searchStudents(query: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('students')
        .select('id, name, email, student_code')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,student_code.ilike.%${query}%`)
        .limit(10)

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function enrollStudent(courseId: string, studentId: string) {
    const supabase = await createClient()

    // Verificar si ya está inscrito
    const { data: existing } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .single()

    if (existing) {
        return { error: 'El estudiante ya está inscrito en este curso' }
    }

    const { error } = await supabase
        .from('enrollments')
        .insert([{ course_id: courseId, student_id: studentId }] as any)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/teacher/courses/${courseId}/students`)
    revalidatePath('/student/my-courses')
    return { error: null }
}

export async function unenrollStudent(enrollmentId: string, courseId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/teacher/courses/${courseId}/students`)
    revalidatePath('/student/my-courses')
    return { error: null }
}

export async function getEnrolledStudents(courseId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('enrollments')
        .select(`
      id,
      enrolled_at,
      students (
        id,
        name,
        email,
        student_code
      )
    `)
        .eq('course_id', courseId)
        .order('enrolled_at', { ascending: false })

    if (error) {
        return { data: null, error: error.message }
    }

    return { data, error: null }
}

export async function getStudentCourses() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // 🔥 Llamar a la función RPC que hace el JOIN en SQL
  const { data: rows, error } = await supabase
    .rpc('get_student_courses', { user_id: user.id } as any) as { data: any[] | null; error: any }

  if (error) {
    console.error('Error en get_student_courses:', error)
    return { data: null, error: error.message }
  }

  if (!rows || rows.length === 0) {
    return { data: [], error: null }
  }

  // Transformar al formato esperado por el componente
  const result = rows.map((row: any) => ({
    id: row.enrollment_id,
    enrolled_at: row.enrolled_at,
    courses: {
      id: row.course_id,
      name: row.course_name,
      code: row.course_code,
      period: row.course_period,
      description: row.course_description,
      teachers: {
        name: row.teacher_name
      }
    }
  }))

  return { data: result, error: null }
}




export async function bulkEnrollStudents(
  courseId: string,
  students: BulkEnrollmentStudent[]
): Promise<{ data: BulkEnrollmentResult | null; error: string | null }> {
  const supabase = await createClient() // Cliente normal
  const adminClient = createAdminClient() // Cliente admin

  const result: BulkEnrollmentResult = {
    success: 0,
    failed: 0,
    details: [],
  }

  for (const student of students) {
    try {
      // 1. Verificar si el estudiante existe
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id, name, email, student_code')
        .eq('email', student.email)
        .single() as { data: { id: string; name: string; email: string; student_code: string } | null; error: any }

      let studentId: string

      if (existingStudent) {
        studentId = existingStudent.id
        result.details.push({
          ...student,
          status: 'exists',
          message: `Ya existe: ${existingStudent.name} (${existingStudent.student_code})`,
        })
      } else {
        // 2. Crear nuevo estudiante con admin client
        const tempPassword = `Temp${student.student_code}2024!`
        
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email: student.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: 'student',
            name: student.name,
            student_code: student.student_code,
          },
        })

        if (authError || !authData.user) {
          result.failed++
          result.details.push({
            ...student,
            status: 'error',
            message: `Error: ${authError?.message}`,
          })
          continue
        }

        studentId = authData.user.id
        result.success++
        result.details.push({
          ...student,
          status: 'created',
          message: `Creado. Password: ${tempPassword}`,
        })
      }

      // 3. Verificar inscripción
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .single()

      if (existingEnrollment) {
        const idx = result.details.findIndex(d => d.email === student.email)
        if (idx >= 0) {
          result.details[idx].message += ' | Ya inscrito'
        }
        continue
      }

      // 4. Inscribir
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([{ course_id: courseId, student_id: studentId }] as any)

      if (enrollError) {
        result.failed++
        const idx = result.details.findIndex(d => d.email === student.email)
        if (idx >= 0) {
          result.details[idx].status = 'error'
          result.details[idx].message += ` | Error: ${enrollError.message}`
        }
      } else {
        const idx = result.details.findIndex(d => d.email === student.email)
        if (idx >= 0) {
          result.details[idx].message += ' | ✓ Inscrito'
        }
      }
    } catch (error: any) {
      result.failed++
      result.details.push({
        ...student,
        status: 'error',
        message: error.message,
      })
    }
  }

  revalidatePath(`/teacher/courses/${courseId}/students`)
  return { data: result, error: null }
}