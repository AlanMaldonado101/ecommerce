export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      andresses: {
        Row: {
          adress_line1: string | null
          adress_line2: string | null
          city: string
          country: string
          created_at: string
          customer_od: string | null
          id: string
          posta_code: string | null
          state: string
        }
        Insert: {
          adress_line1?: string | null
          adress_line2?: string | null
          city: string
          country?: string
          created_at?: string
          customer_od?: string | null
          id?: string
          posta_code?: string | null
          state: string
        }
        Update: {
          adress_line1?: string | null
          adress_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          customer_od?: string | null
          id?: string
          posta_code?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "andresses_customer_od_fkey"
            columns: ["customer_od"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string
          font: string
          full_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          font: string
          full_name: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          font?: string
          full_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: number
          price: number
          quantity: number
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: number
          price: number
          quantity: number
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: number
          price?: number
          quantity?: number
          variant_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          adress_id: string
          created_at: string
          customers_id: string
          id: number
          status: string
          total_amount: number
        }
        Insert: {
          adress_id: string
          created_at?: string
          customers_id: string
          id?: number
          status?: string
          total_amount: number
        }
        Update: {
          adress_id?: string
          created_at?: string
          customers_id?: string
          id?: number
          status?: string
          total_amount?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          subcategory_id: string | null
          provider_id: string | null
          tags: string[] | null
          created_at: string
          description: Json
          feature: string[]
          features: Json | null
          id: string
          images: string[]
          name: string
          slug: string
        }
        Insert: {
          category: string
          subcategory_id?: string | null
          provider_id?: string | null
          tags?: string[] | null
          created_at?: string
          description: Json
          feature: string[]
          features?: Json | null
          id?: string
          images: string[]
          name: string
          slug: string
        }
        Update: {
          category?: string
          subcategory_id?: string | null
          provider_id?: string | null
          tags?: string[] | null
          created_at?: string
          description?: Json
          feature?: string[]
          features?: Json | null
          id?: string
          images?: string[]
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          id: number
          role: string
          user_id: string | null
        }
        Insert: {
          id?: number
          role: string
          user_id?: string | null
        }
        Update: {
          id?: number
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      variants: {
        Row: {
          color: string
          color_name: string
          id: string
          price: number
          price_wholesale?: number
          product_id: string
          stock: number
          storage: string
        }
        Insert: {
          color: string
          color_name: string
          id?: string
          price: number
          price_wholesale?: number
          product_id: string
          stock: number
          storage: string
        }
        Update: {
          color?: string
          color_name?: string
          id?: string
          price?: number
          price_wholesale?: number
          product_id?: string
          stock?: number
          storage?: string
        }
        Relationships: [
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          id: string
          name: string
          slug: string
          category_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      providers: {
        Row: {
          id: string
          name: string
          contact_info: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_info?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_info?: string | null
          created_at?: string
        }
        Relationships: []
      }
      occasions: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      product_occasions: {
        Row: {
          product_id: string
          occasion_id: string
        }
        Insert: {
          product_id: string
          occasion_id: string
        }
        Update: {
          product_id?: string
          occasion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_occasions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_occasions_occasion_id_fkey"
            columns: ["occasion_id"]
            isOneToOne: false
            referencedRelation: "occasions"
            referencedColumns: ["id"]
          }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
