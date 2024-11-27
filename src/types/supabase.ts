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
      categories: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          amount: number
          description: string
          date: string
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          description: string
          date: string
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          description?: string
          date?: string
          category_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      monthly_summaries: {
        Row: {
          month: string
          category_id: string
          total_amount: number
          transaction_count: number
        }
      }
    }
  }
}