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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          password: string | null
          current_plan_id: string | null
          diagnostics_limit: number
          role: 'user' | 'admin'
          status: 'active' | 'inactive' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          password?: string | null
          current_plan_id?: string | null
          diagnostics_limit?: number
          role?: 'user' | 'admin'
          status?: 'active' | 'inactive' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          password?: string | null
          current_plan_id?: string | null
          diagnostics_limit?: number
          role?: 'user' | 'admin'
          status?: 'active' | 'inactive' | 'blocked'
          created_at?: string
          updated_at?: string
        }
      }
      access_plans: {
        Row: {
          id: string
          name: string
          duration_days: number
          diagnostics_limit: number
          price: number
          is_recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          duration_days: number
          diagnostics_limit: number
          price: number
          is_recurring: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          duration_days?: number
          diagnostics_limit?: number
          price?: number
          is_recurring?: boolean
          created_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'expired' | 'cancelled'
          start_date: string
          end_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: 'active' | 'expired' | 'cancelled'
          start_date: string
          end_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: 'active' | 'expired' | 'cancelled'
          start_date?: string
          end_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      diagnostics: {
        Row: {
          id: string
          user_id: string
          company_name: string
          analysis_period: string
          status: 'pending' | 'completed' | 'failed'
          general_score: number | null
          strategic_reading: string | null
          pdf_report_url: string | null
          realization_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          analysis_period: string
          status?: 'pending' | 'completed' | 'failed'
          general_score?: number | null
          strategic_reading?: string | null
          pdf_report_url?: string | null
          realization_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          analysis_period?: string
          status?: 'pending' | 'completed' | 'failed'
          general_score?: number | null
          strategic_reading?: string | null
          pdf_report_url?: string | null
          realization_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      diagnostic_details: {
        Row: {
          id: string
          diagnostic_id: string
          area: string
          question: string
          answer: string
          ai_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          diagnostic_id: string
          area: string
          question: string
          answer: string
          ai_feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          diagnostic_id?: string
          area?: string
          question?: string
          answer?: string
          ai_feedback?: string | null
          created_at?: string
        }
      }
      free_diagnostics: {
        Row: {
          id: string
          name: string
          email: string
          whatsapp: string
          instagram: string | null
          pdf_generated: boolean
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          whatsapp: string
          instagram?: string | null
          pdf_generated?: boolean
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          whatsapp?: string
          instagram?: string | null
          pdf_generated?: boolean
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      free_diagnostic_answers: {
        Row: {
          id: string
          free_diagnostic_id: string
          question_id: number
          block: 'financeiro' | 'vendas' | 'marketing' | 'futuro'
          question_text: string
          answer_value: string
          answer_label: string
          created_at: string
        }
        Insert: {
          id?: string
          free_diagnostic_id: string
          question_id: number
          block: 'financeiro' | 'vendas' | 'marketing' | 'futuro'
          question_text: string
          answer_value: string
          answer_label: string
          created_at?: string
        }
        Update: {
          id?: string
          free_diagnostic_id?: string
          question_id?: number
          block?: 'financeiro' | 'vendas' | 'marketing' | 'futuro'
          question_text?: string
          answer_value?: string
          answer_label?: string
          created_at?: string
        }
      }
    }
  }
}

