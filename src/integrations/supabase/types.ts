export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      candidatos: {
        Row: {
          curriculo_url: string | null
          data_inscricao: string | null
          email: string | null
          empresa_id: number | null
          id: number
          nome: string | null
          status: string | null
          telefone: string | null
        }
        Insert: {
          curriculo_url?: string | null
          data_inscricao?: string | null
          email?: string | null
          empresa_id?: number | null
          id?: number
          nome?: string | null
          status?: string | null
          telefone?: string | null
        }
        Update: {
          curriculo_url?: string | null
          data_inscricao?: string | null
          email?: string | null
          empresa_id?: number | null
          id?: number
          nome?: string | null
          status?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidatos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          created_at: string | null
          id: number
          nome: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          nome: string
        }
        Update: {
          created_at?: string | null
          id?: number
          nome?: string
        }
        Relationships: []
      }
      entrevistas: {
        Row: {
          candidato_id: number | null
          data_hora: string | null
          empresa_id: number | null
          entrevistador_id: string | null
          feedback: string | null
          id: number
          link_video: string | null
          local: string | null
          parecer: string | null
          vaga_id: number | null
        }
        Insert: {
          candidato_id?: number | null
          data_hora?: string | null
          empresa_id?: number | null
          entrevistador_id?: string | null
          feedback?: string | null
          id?: number
          link_video?: string | null
          local?: string | null
          parecer?: string | null
          vaga_id?: number | null
        }
        Update: {
          candidato_id?: number | null
          data_hora?: string | null
          empresa_id?: number | null
          entrevistador_id?: string | null
          feedback?: string | null
          id?: number
          link_video?: string | null
          local?: string | null
          parecer?: string | null
          vaga_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "entrevistas_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrevistas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrevistas_entrevistador_id_fkey"
            columns: ["entrevistador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entrevistas_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline: {
        Row: {
          candidato_id: number | null
          data_movimentacao: string | null
          empresa_id: number | null
          etapa: string | null
          id: number
          vaga_id: number | null
        }
        Insert: {
          candidato_id?: number | null
          data_movimentacao?: string | null
          empresa_id?: number | null
          etapa?: string | null
          id?: number
          vaga_id?: number | null
        }
        Update: {
          candidato_id?: number | null
          data_movimentacao?: string | null
          empresa_id?: number | null
          etapa?: string | null
          id?: number
          vaga_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "vagas"
            referencedColumns: ["id"]
          },
        ]
      }
      testes: {
        Row: {
          candidato_id: number | null
          data_aplicacao: string | null
          empresa_id: number | null
          id: number
          resultado: Json | null
          tipo: string | null
        }
        Insert: {
          candidato_id?: number | null
          data_aplicacao?: string | null
          empresa_id?: number | null
          id?: number
          resultado?: Json | null
          tipo?: string | null
        }
        Update: {
          candidato_id?: number | null
          data_aplicacao?: string | null
          empresa_id?: number | null
          id?: number
          resultado?: Json | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testes_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          created_at: string | null
          email: string | null
          empresa_id: number | null
          id: string
          nome: string | null
          perfil: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          empresa_id?: number | null
          id: string
          nome?: string | null
          perfil?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          empresa_id?: number | null
          id?: string
          nome?: string | null
          perfil?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      vagas: {
        Row: {
          created_at: string | null
          descricao: string | null
          empresa_id: number | null
          id: number
          nivel: string | null
          requisitos: string | null
          responsavel_id: string | null
          salario: number | null
          setor: string | null
          status: string | null
          tipo_contrato: string | null
          titulo: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          empresa_id?: number | null
          id?: number
          nivel?: string | null
          requisitos?: string | null
          responsavel_id?: string | null
          salario?: number | null
          setor?: string | null
          status?: string | null
          tipo_contrato?: string | null
          titulo: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          empresa_id?: number | null
          id?: number
          nivel?: string | null
          requisitos?: string | null
          responsavel_id?: string | null
          salario?: number | null
          setor?: string | null
          status?: string | null
          tipo_contrato?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "vagas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vagas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
