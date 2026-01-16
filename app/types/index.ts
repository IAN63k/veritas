export type UserRole = 'teacher' | 'student'

export interface Teacher {
  id: string
  name: string
  email: string
  created_at: string
}

export interface Student {
  id: string
  name: string
  student_code: string
  email: string
  created_at: string
}

export interface Course {
  id: string
  teacher_id: string
  name: string
  code: string
  period: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: string
  course_id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  duration_minutes: number
  max_attempts: number
  protection_level: 'low' | 'medium' | 'high'
  is_active: boolean
  created_at: string
  updated_at: string
}

export type QuestionType = 'multiple_choice' | 'open' | 'code' | 'true_false'

export interface Question {
  id: string
  evaluation_id: string
  type: QuestionType
  content: any // JSONB flexible
  points: number
  order_number: number
  created_at: string
}

export interface EvaluationAttempt {
  id: string
  evaluation_id: string
  student_id: string
  attempt_number: number
  start_time: string
  end_time: string | null
  status: 'in_progress' | 'completed' | 'blocked' | 'abandoned'
  score: number | null
  answers: any | null
  created_at: string
}

export interface SuspiciousEvent {
  id: string
  attempt_id: string
  event_type: string
  timestamp: string
  metadata: any | null
}

// Tipos para Enrollments
export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
}

export interface EnrollmentWithCourse {
  id: string
  enrolled_at: string
  courses: {
    id: string
    name: string
    code: string
    period: string
    description: string | null
    teacher_id: string
    teachers: {
      name: string
    }
  }
}

export interface BulkEnrollmentStudent {
  name: string
  email: string
  student_code: string
}

export interface BulkEnrollmentResult {
  success: number
  failed: number
  details: {
    name: string
    email: string
    student_code: string
    status: 'created' | 'exists' | 'enrolled' | 'error'
    message: string
  }[]
}

// Tipos de contenido para diferentes tipos de preguntas
export interface MultipleChoiceContent {
  question: string
  options: {
    id: string
    text: string
    is_correct: boolean
  }[]
  explanation?: string
}

export interface OpenQuestionContent {
  question: string
  expected_keywords?: string[]
  max_length?: number
}

export interface CodeQuestionContent {
  question: string
  language: string
  starter_code?: string
  test_cases?: {
    input: string
    expected_output: string
  }[]
}

export interface TrueFalseContent {
  statement: string
  correct_answer: boolean
  explanation?: string
}