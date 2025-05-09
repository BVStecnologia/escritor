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
      Capitulo: {
        Row: {
          id: number
          created_at: string
          texto: string | null
          livro_id: number
          titulo: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          texto?: string | null
          livro_id: number
          titulo?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          texto?: string | null
          livro_id?: number
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_capitulo_livro"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "Livros"
            referencedColumns: ["id"]
          }
        ]
      }
      Embeddings: {
        Row: {
          id: number
          created_at: string
          content: string
          embedding: unknown // This is the vector type
          origem_id: number
          tipo_origem: string
        }
        Insert: {
          id?: number
          created_at?: string
          content: string
          embedding: unknown
          origem_id: number
          tipo_origem: string
        }
        Update: {
          id?: number
          created_at?: string
          content?: string
          embedding?: unknown
          origem_id?: number
          tipo_origem?: string
        }
        Relationships: []
      }
      Livros: {
        Row: {
          id: number
          created_at: string
          "Nome do livro": string | null
          "Autor": string | null
          email_user: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          "Nome do livro"?: string | null
          "Autor"?: string | null
          email_user?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          "Nome do livro"?: string | null
          "Autor"?: string | null
          email_user?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_embeddings: {
        Args: {
          query_text: string
          match_threshold: number
          match_count: number
          filter_tipo_origem?: string
        }
        Returns: {
          id: number
          content: string
          similarity: number
          origem_id: number
          tipo_origem: string
        }[]
      }
      trigger_capitulo_embedding: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      trigger_livro_embedding: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}