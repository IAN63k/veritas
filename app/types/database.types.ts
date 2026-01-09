export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          student_code: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          student_code: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          student_code?: string
          email?: string
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          teacher_id: string
          name: string
          code: string
          period: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          name: string
          code: string
          period: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          name?: string
          code?: string
          period?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          enrolled_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          enrolled_at?: string
        }
      }
      evaluations: {
        Row: {
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
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          start_date: string
          end_date: string
          duration_minutes: number
          max_attempts?: number
          protection_level?: 'low' | 'medium' | 'high'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          duration_minutes?: number
          max_attempts?: number
          protection_level?: 'low' | 'medium' | 'high'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          evaluation_id: string
          type: 'multiple_choice' | 'open' | 'code' | 'true_false'
          content: Json
          points: number
          order_number: number
          created_at: string
        }
        Insert: {
          id?: string
          evaluation_id: string
          type: 'multiple_choice' | 'open' | 'code' | 'true_false'
          content: Json
          points: number
          order_number: number
          created_at?: string
        }
        Update: {
          id?: string
          evaluation_id?: string
          type?: 'multiple_choice' | 'open' | 'code' | 'true_false'
          content?: Json
          points?: number
          order_number?: number
          created_at?: string
        }
      }
      evaluation_attempts: {
        Row: {
          id: string
          evaluation_id: string
          student_id: string
          attempt_number: number
          start_time: string
          end_time: string | null
          status: 'in_progress' | 'completed' | 'blocked' | 'abandoned'
          score: number | null
          answers: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          evaluation_id: string
          student_id: string
          attempt_number: number
          start_time?: string
          end_time?: string | null
          status?: 'in_progress' | 'completed' | 'blocked' | 'abandoned'
          score?: number | null
          answers?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          evaluation_id?: string
          student_id?: string
          attempt_number?: number
          start_time?: string
          end_time?: string | null
          status?: 'in_progress' | 'completed' | 'blocked' | 'abandoned'
          score?: number | null
          answers?: Json | null
          created_at?: string
        }
      }
      suspicious_events: {
        Row: {
          id: string
          attempt_id: string
          event_type: string
          timestamp: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          attempt_id: string
          event_type: string
          timestamp?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          attempt_id?: string
          event_type?: string
          timestamp?: string
          metadata?: Json | null
        }
      }
    }
  }
}