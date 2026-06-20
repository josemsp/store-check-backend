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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_user_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          impersonated_by_user_id: string | null
          ip_address: unknown
          metadata: Json
          new_data: Json | null
          old_data: Json | null
          organization_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          impersonated_by_user_id?: string | null
          ip_address?: unknown
          metadata?: Json
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_user_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          impersonated_by_user_id?: string | null
          ip_address?: unknown
          metadata?: Json
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_impersonated_by_user_id_fkey"
            columns: ["impersonated_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_expenses: {
        Row: {
          amount: number
          cash_session_id: string
          concept: string
          created_at: string
          created_by: string | null
          id: string
          impersonated_by: string | null
          location_id: string
          notes: string | null
          organization_id: string
          type: Database["public"]["Enums"]["cash_expense_type"]
        }
        Insert: {
          amount: number
          cash_session_id: string
          concept: string
          created_at?: string
          created_by?: string | null
          id?: string
          impersonated_by?: string | null
          location_id: string
          notes?: string | null
          organization_id: string
          type?: Database["public"]["Enums"]["cash_expense_type"]
        }
        Update: {
          amount?: number
          cash_session_id?: string
          concept?: string
          created_at?: string
          created_by?: string | null
          id?: string
          impersonated_by?: string | null
          location_id?: string
          notes?: string | null
          organization_id?: string
          type?: Database["public"]["Enums"]["cash_expense_type"]
        }
        Relationships: [
          {
            foreignKeyName: "cash_expenses_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_expenses_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_expenses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sessions: {
        Row: {
          actual_closing_amount: number | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          difference_amount: number | null
          expected_closing_amount: number
          id: string
          impersonated_by: string | null
          location_id: string
          notes: string | null
          opened_at: string
          opened_by: string | null
          opening_amount: number
          organization_id: string
          status: Database["public"]["Enums"]["cash_session_status"]
          updated_at: string
        }
        Insert: {
          actual_closing_amount?: number | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          difference_amount?: number | null
          expected_closing_amount?: number
          id?: string
          impersonated_by?: string | null
          location_id: string
          notes?: string | null
          opened_at?: string
          opened_by?: string | null
          opening_amount?: number
          organization_id: string
          status?: Database["public"]["Enums"]["cash_session_status"]
          updated_at?: string
        }
        Update: {
          actual_closing_amount?: number | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          difference_amount?: number | null
          expected_closing_amount?: number
          id?: string
          impersonated_by?: string | null
          location_id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string | null
          opening_amount?: number
          organization_id?: string
          status?: Database["public"]["Enums"]["cash_session_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_closure_attachments: {
        Row: {
          ai_extracted_data: Json | null
          ai_processed: boolean
          bucket: string
          created_at: string
          daily_closure_id: string
          file_name: string | null
          file_size: number | null
          id: string
          impersonated_by: string | null
          mime_type: string | null
          organization_id: string
          storage_path: string
          type: Database["public"]["Enums"]["daily_closure_attachment_type"]
          uploaded_by: string | null
        }
        Insert: {
          ai_extracted_data?: Json | null
          ai_processed?: boolean
          bucket?: string
          created_at?: string
          daily_closure_id: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          impersonated_by?: string | null
          mime_type?: string | null
          organization_id: string
          storage_path: string
          type?: Database["public"]["Enums"]["daily_closure_attachment_type"]
          uploaded_by?: string | null
        }
        Update: {
          ai_extracted_data?: Json | null
          ai_processed?: boolean
          bucket?: string
          created_at?: string
          daily_closure_id?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          impersonated_by?: string | null
          mime_type?: string | null
          organization_id?: string
          storage_path?: string
          type?: Database["public"]["Enums"]["daily_closure_attachment_type"]
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_closure_attachments_daily_closure_id_fkey"
            columns: ["daily_closure_id"]
            isOneToOne: false
            referencedRelation: "daily_closures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closure_attachments_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closure_attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closure_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_closure_sales: {
        Row: {
          created_at: string
          daily_closure_id: string
          id: string
          location_id: string
          notes: string | null
          organization_id: string
          product_variant_id: string
          quantity: number
          total_amount: number | null
          total_cost: number | null
          unit_cost: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          daily_closure_id: string
          id?: string
          location_id: string
          notes?: string | null
          organization_id: string
          product_variant_id: string
          quantity: number
          total_amount?: number | null
          total_cost?: number | null
          unit_cost?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          daily_closure_id?: string
          id?: string
          location_id?: string
          notes?: string | null
          organization_id?: string
          product_variant_id?: string
          quantity?: number
          total_amount?: number | null
          total_cost?: number | null
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_closure_sales_daily_closure_id_fkey"
            columns: ["daily_closure_id"]
            isOneToOne: false
            referencedRelation: "daily_closures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closure_sales_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closure_sales_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closure_sales_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_closures: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          cash_session_id: string | null
          closure_date: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          expenses_amount: number
          gross_profit_amount: number | null
          gross_sales_amount: number
          id: string
          impersonated_by: string | null
          location_id: string
          net_sales_amount: number | null
          notes: string | null
          organization_id: string
          status: Database["public"]["Enums"]["daily_closure_status"]
          total_cost_amount: number
          updated_at: string
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          cash_session_id?: string | null
          closure_date: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          expenses_amount?: number
          gross_profit_amount?: number | null
          gross_sales_amount?: number
          id?: string
          impersonated_by?: string | null
          location_id: string
          net_sales_amount?: number | null
          notes?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["daily_closure_status"]
          total_cost_amount?: number
          updated_at?: string
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          cash_session_id?: string | null
          closure_date?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          expenses_amount?: number
          gross_profit_amount?: number | null
          gross_sales_amount?: number
          id?: string
          impersonated_by?: string | null
          location_id?: string
          net_sales_amount?: number | null
          notes?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["daily_closure_status"]
          total_cost_amount?: number
          updated_at?: string
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_closures_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closures_cash_session_id_fkey"
            columns: ["cash_session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closures_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closures_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closures_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closures_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_events: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          created_at: string
          event_type: string
          failed_at: string | null
          failure_reason: string | null
          id: string
          organization_id: string | null
          payload: Json
          processed_at: string | null
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          created_at?: string
          event_type: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          organization_id?: string | null
          payload?: Json
          processed_at?: string | null
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          created_at?: string
          event_type?: string
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          organization_id?: string | null
          payload?: Json
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      healthcheck: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      impersonation_sessions: {
        Row: {
          active: boolean
          admin_user_id: string
          created_at: string
          ended_at: string | null
          id: string
          reason: string
          started_at: string
          target_user_id: string
        }
        Insert: {
          active?: boolean
          admin_user_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          reason: string
          started_at?: string
          target_user_id: string
        }
        Update: {
          active?: boolean
          admin_user_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          reason?: string
          started_at?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impersonation_sessions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impersonation_sessions_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_balances: {
        Row: {
          average_unit_cost: number
          id: string
          location_id: string
          lot_id: string | null
          organization_id: string
          product_variant_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          average_unit_cost?: number
          id?: string
          location_id: string
          lot_id?: string | null
          organization_id: string
          product_variant_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          average_unit_cost?: number
          id?: string
          location_id?: string
          lot_id?: string | null
          organization_id?: string
          product_variant_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_balances_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_balances_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_balances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_balances_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_count_items: {
        Row: {
          counted_quantity: number
          created_at: string
          difference_quantity: number | null
          expected_quantity: number
          id: string
          inventory_count_id: string
          location_id: string
          loss_reason_id: string | null
          lot_id: string | null
          notes: string | null
          organization_id: string
          product_variant_id: string
        }
        Insert: {
          counted_quantity?: number
          created_at?: string
          difference_quantity?: number | null
          expected_quantity?: number
          id?: string
          inventory_count_id: string
          location_id: string
          loss_reason_id?: string | null
          lot_id?: string | null
          notes?: string | null
          organization_id: string
          product_variant_id: string
        }
        Update: {
          counted_quantity?: number
          created_at?: string
          difference_quantity?: number | null
          expected_quantity?: number
          id?: string
          inventory_count_id?: string
          location_id?: string
          loss_reason_id?: string | null
          lot_id?: string | null
          notes?: string | null
          organization_id?: string
          product_variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_count_items_inventory_count_id_fkey"
            columns: ["inventory_count_id"]
            isOneToOne: false
            referencedRelation: "inventory_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_items_loss_reason_id_fkey"
            columns: ["loss_reason_id"]
            isOneToOne: false
            referencedRelation: "loss_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_items_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_counts: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          counted_at: string | null
          created_at: string
          created_by: string | null
          id: string
          impersonated_by: string | null
          location_id: string
          notes: string | null
          organization_id: string
          status: Database["public"]["Enums"]["inventory_count_status"]
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          counted_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          impersonated_by?: string | null
          location_id: string
          notes?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["inventory_count_status"]
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          counted_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          impersonated_by?: string | null
          location_id?: string
          notes?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["inventory_count_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_counts_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_counts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_counts_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_counts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_counts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_lots: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          lot_code: string
          organization_id: string
          product_variant_id: string
          source_id: string | null
          source_type: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          lot_code: string
          organization_id: string
          product_variant_id: string
          source_id?: string | null
          source_type?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          lot_code?: string
          organization_id?: string
          product_variant_id?: string
          source_id?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_lots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_lots_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          impersonated_by: string | null
          location_id: string
          loss_reason_id: string | null
          lot_id: string | null
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          organization_id: string
          product_variant_id: string
          quantity: number
          reason: string | null
          source_id: string
          source_type: string
          total_cost: number | null
          unit_cost: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          impersonated_by?: string | null
          location_id: string
          loss_reason_id?: string | null
          lot_id?: string | null
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          organization_id: string
          product_variant_id: string
          quantity: number
          reason?: string | null
          source_id: string
          source_type: string
          total_cost?: number | null
          unit_cost?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          impersonated_by?: string | null
          location_id?: string
          loss_reason_id?: string | null
          lot_id?: string | null
          movement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          organization_id?: string
          product_variant_id?: string
          quantity?: number
          reason?: string | null
          source_id?: string
          source_type?: string
          total_cost?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_loss_reason_id_fkey"
            columns: ["loss_reason_id"]
            isOneToOne: false
            referencedRelation: "loss_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_thresholds: {
        Row: {
          active: boolean
          created_at: string
          id: string
          location_id: string
          max_quantity: number | null
          min_quantity: number
          organization_id: string
          product_variant_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          location_id: string
          max_quantity?: number | null
          min_quantity?: number
          organization_id: string
          product_variant_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          location_id?: string
          max_quantity?: number | null
          min_quantity?: number
          organization_id?: string
          product_variant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_thresholds_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_thresholds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_thresholds_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_locations: {
        Row: {
          invitation_id: string
          location_id: string
        }
        Insert: {
          invitation_id: string
          location_id: string
        }
        Update: {
          invitation_id?: string
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_locations_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_platform_roles: {
        Row: {
          invitation_id: string
          role: Database["public"]["Enums"]["platform_admin_role"]
        }
        Insert: {
          invitation_id: string
          role: Database["public"]["Enums"]["platform_admin_role"]
        }
        Update: {
          invitation_id?: string
          role?: Database["public"]["Enums"]["platform_admin_role"]
        }
        Relationships: [
          {
            foreignKeyName: "invitation_platform_roles_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: true
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_roles: {
        Row: {
          invitation_id: string
          role_id: string
        }
        Insert: {
          invitation_id: string
          role_id: string
        }
        Update: {
          invitation_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_roles_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_user_id: string
          metadata: Json
          organization_id: string | null
          scope: Database["public"]["Enums"]["invitation_scope"]
          status: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by_user_id: string
          metadata?: Json
          organization_id?: string | null
          scope: Database["public"]["Enums"]["invitation_scope"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by_user_id?: string
          metadata?: Json
          organization_id?: string | null
          scope?: Database["public"]["Enums"]["invitation_scope"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_accepted_by_user_id_fkey"
            columns: ["accepted_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_members: {
        Row: {
          active: boolean
          created_at: string
          id: string
          location_id: string
          member_id: string
          organization_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          location_id: string
          member_id: string
          organization_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          location_id?: string
          member_id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_members_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          organization_id: string
          phone: string | null
          production_enabled: boolean
          purchases_enabled: boolean
          sales_enabled: boolean
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          production_enabled?: boolean
          purchases_enabled?: boolean
          sales_enabled?: boolean
          type: Database["public"]["Enums"]["location_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          production_enabled?: boolean
          purchases_enabled?: boolean
          sales_enabled?: boolean
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      loss_reasons: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loss_reasons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      member_roles: {
        Row: {
          created_at: string
          member_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          member_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          member_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_roles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "organization_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      new_organization_invitations: {
        Row: {
          invitation_id: string
          organization_name: string
          organization_slug: string
          owner_role_name: string
        }
        Insert: {
          invitation_id: string
          organization_name: string
          organization_slug: string
          owner_role_name?: string
        }
        Update: {
          invitation_id?: string
          organization_name?: string
          organization_slug?: string
          owner_role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "new_organization_invitations_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: true
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          enabled: boolean
          id: string
          notification_type_id: string
          organization_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          enabled?: boolean
          id?: string
          notification_type_id: string
          organization_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          enabled?: boolean
          id?: string
          notification_type_id?: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_notification_type_id_fkey"
            columns: ["notification_type_id"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_types: {
        Row: {
          created_at: string
          default_enabled: boolean
          description: string | null
          id: string
          key: string
          name: string
        }
        Insert: {
          created_at?: string
          default_enabled?: boolean
          description?: string | null
          id?: string
          key: string
          name: string
        }
        Update: {
          created_at?: string
          default_enabled?: boolean
          description?: string | null
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          data: Json
          failed_at: string | null
          failure_reason: string | null
          id: string
          notification_type_id: string | null
          organization_id: string | null
          read_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          notification_type_id?: string | null
          organization_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          notification_type_id?: string | null
          organization_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_notification_type_id_fkey"
            columns: ["notification_type_id"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          joined_at: string | null
          organization_id: string
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          created_at: string
          currency: string
          expiration_alert_days: number
          low_stock_enabled: boolean
          organization_id: string
          settings: Json
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          expiration_alert_days?: number
          low_stock_enabled?: boolean
          organization_id: string
          settings?: Json
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          expiration_alert_days?: number
          low_stock_enabled?: boolean
          organization_id?: string
          settings?: Json
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          slug: string
          status: Database["public"]["Enums"]["organization_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          slug: string
          status?: Database["public"]["Enums"]["organization_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["organization_status"]
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["platform_admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["platform_admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["platform_admin_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_bundle_items: {
        Row: {
          bundle_id: string
          component_variant_id: string
          created_at: string
          id: string
          organization_id: string
          quantity: number
        }
        Insert: {
          bundle_id: string
          component_variant_id: string
          created_at?: string
          id?: string
          organization_id: string
          quantity: number
        }
        Update: {
          bundle_id?: string
          component_variant_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_bundle_items_component_variant_id_fkey"
            columns: ["component_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_bundle_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_bundles: {
        Row: {
          active: boolean
          bundle_variant_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          bundle_variant_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          bundle_variant_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_bundles_bundle_variant_id_fkey"
            columns: ["bundle_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_bundles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_prices: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          location_id: string
          organization_id: string
          price: number
          product_variant_id: string
          starts_at: string
          status: Database["public"]["Enums"]["price_status"]
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          location_id: string
          organization_id: string
          price: number
          product_variant_id: string
          starts_at?: string
          status?: Database["public"]["Enums"]["price_status"]
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          location_id?: string
          organization_id?: string
          price?: number
          product_variant_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["price_status"]
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_prices_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variant_prices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variant_prices_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean
          barcode: string | null
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          organization_id: string
          product_id: string
          sku: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          barcode?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          organization_id: string
          product_id: string
          sku?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          barcode?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          organization_id?: string
          product_id?: string
          sku?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          product_type: Database["public"]["Enums"]["product_type"]
          track_expiration: boolean
          track_lots: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          product_type: Database["public"]["Enums"]["product_type"]
          track_expiration?: boolean
          track_lots?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          product_type?: Database["public"]["Enums"]["product_type"]
          track_expiration?: boolean
          track_lots?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_attachments: {
        Row: {
          bucket: string
          created_at: string
          file_name: string | null
          file_size: number | null
          id: string
          impersonated_by: string | null
          mime_type: string | null
          organization_id: string
          purchase_id: string
          storage_path: string
          type: Database["public"]["Enums"]["purchase_attachment_type"]
          uploaded_by: string | null
        }
        Insert: {
          bucket?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          impersonated_by?: string | null
          mime_type?: string | null
          organization_id: string
          purchase_id: string
          storage_path: string
          type?: Database["public"]["Enums"]["purchase_attachment_type"]
          uploaded_by?: string | null
        }
        Update: {
          bucket?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          impersonated_by?: string | null
          mime_type?: string | null
          organization_id?: string
          purchase_id?: string
          storage_path?: string
          type?: Database["public"]["Enums"]["purchase_attachment_type"]
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_attachments_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_attachments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          location_id: string
          lot_code: string | null
          notes: string | null
          organization_id: string
          product_variant_id: string
          purchase_id: string
          quantity: number
          subtotal: number | null
          unit_cost: number
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          location_id: string
          lot_code?: string | null
          notes?: string | null
          organization_id: string
          product_variant_id: string
          purchase_id: string
          quantity: number
          subtotal?: number | null
          unit_cost: number
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          location_id?: string
          lot_code?: string | null
          notes?: string | null
          organization_id?: string
          product_variant_id?: string
          purchase_id?: string
          quantity?: number
          subtotal?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          id: string
          impersonated_by: string | null
          invoice_number: string | null
          location_id: string
          notes: string | null
          organization_id: string
          purchase_date: string
          reference: string | null
          status: Database["public"]["Enums"]["purchase_status"]
          subtotal: number
          supplier_id: string | null
          tax_amount: number
          total_amount: number
          updated_at: string
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          impersonated_by?: string | null
          invoice_number?: string | null
          location_id: string
          notes?: string | null
          organization_id: string
          purchase_date?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          subtotal?: number
          supplier_id?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          impersonated_by?: string | null
          invoice_number?: string | null
          location_id?: string
          notes?: string | null
          organization_id?: string
          purchase_date?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          subtotal?: number
          supplier_id?: string | null
          tax_amount?: number
          total_amount?: number
          updated_at?: string
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          organization_id: string | null
          system_role: Database["public"]["Enums"]["system_role_code"] | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          organization_id?: string | null
          system_role?: Database["public"]["Enums"]["system_role_code"] | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          organization_id?: string | null
          system_role?: Database["public"]["Enums"]["system_role_code"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          organization_id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          starts_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          organization_id: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          organization_id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          starts_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean
          contact_name: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          contact_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          contact_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_attachments: {
        Row: {
          bucket: string
          created_at: string
          file_name: string | null
          file_size: number | null
          id: string
          impersonated_by: string | null
          mime_type: string | null
          organization_id: string
          storage_path: string
          transfer_id: string
          type: Database["public"]["Enums"]["transfer_attachment_type"]
          uploaded_by: string | null
        }
        Insert: {
          bucket?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          impersonated_by?: string | null
          mime_type?: string | null
          organization_id: string
          storage_path: string
          transfer_id: string
          type?: Database["public"]["Enums"]["transfer_attachment_type"]
          uploaded_by?: string | null
        }
        Update: {
          bucket?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          impersonated_by?: string | null
          mime_type?: string | null
          organization_id?: string
          storage_path?: string
          transfer_id?: string
          type?: Database["public"]["Enums"]["transfer_attachment_type"]
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_attachments_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_attachments_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_items: {
        Row: {
          created_at: string
          id: string
          lot_id: string | null
          notes: string | null
          organization_id: string
          product_variant_id: string
          quantity_sent: number
          transfer_id: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          lot_id?: string | null
          notes?: string | null
          organization_id: string
          product_variant_id: string
          quantity_sent: number
          transfer_id: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          lot_id?: string | null
          notes?: string | null
          organization_id?: string
          product_variant_id?: string
          quantity_sent?: number
          transfer_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "transfer_items_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_receipts: {
        Row: {
          difference_quantity: number
          difference_reason: string | null
          id: string
          impersonated_by: string | null
          organization_id: string
          quantity_received: number
          received_at: string
          received_by: string | null
          transfer_item_id: string
        }
        Insert: {
          difference_quantity?: number
          difference_reason?: string | null
          id?: string
          impersonated_by?: string | null
          organization_id: string
          quantity_received: number
          received_at?: string
          received_by?: string | null
          transfer_item_id: string
        }
        Update: {
          difference_quantity?: number
          difference_reason?: string | null
          id?: string
          impersonated_by?: string | null
          organization_id?: string
          quantity_received?: number
          received_at?: string
          received_by?: string | null
          transfer_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfer_receipts_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_receipts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_receipts_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_receipts_transfer_item_id_fkey"
            columns: ["transfer_item_id"]
            isOneToOne: true
            referencedRelation: "transfer_items"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string | null
          destination_location_id: string
          id: string
          impersonated_by: string | null
          notes: string | null
          organization_id: string
          origin_location_id: string
          received_at: string | null
          received_by: string | null
          reference: string | null
          sent_at: string | null
          sent_by: string | null
          status: Database["public"]["Enums"]["transfer_status"]
          updated_at: string
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          destination_location_id: string
          id?: string
          impersonated_by?: string | null
          notes?: string | null
          organization_id: string
          origin_location_id: string
          received_at?: string | null
          received_by?: string | null
          reference?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          updated_at?: string
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          destination_location_id?: string
          id?: string
          impersonated_by?: string | null
          notes?: string | null
          organization_id?: string
          origin_location_id?: string
          received_at?: string | null
          received_by?: string | null
          reference?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          updated_at?: string
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transfers_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_origin_location_id_fkey"
            columns: ["origin_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transformation_attachments: {
        Row: {
          bucket: string
          created_at: string
          file_name: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          organization_id: string
          storage_path: string
          transformation_id: string
          uploaded_by: string | null
        }
        Insert: {
          bucket?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organization_id: string
          storage_path: string
          transformation_id: string
          uploaded_by?: string | null
        }
        Update: {
          bucket?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organization_id?: string
          storage_path?: string
          transformation_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transformation_attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformation_attachments_transformation_id_fkey"
            columns: ["transformation_id"]
            isOneToOne: false
            referencedRelation: "transformations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformation_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transformation_items: {
        Row: {
          created_at: string
          direction: Database["public"]["Enums"]["transformation_direction"]
          id: string
          lot_id: string | null
          notes: string | null
          organization_id: string
          product_variant_id: string
          quantity: number
          transformation_id: string
          unit_cost: number
        }
        Insert: {
          created_at?: string
          direction: Database["public"]["Enums"]["transformation_direction"]
          id?: string
          lot_id?: string | null
          notes?: string | null
          organization_id: string
          product_variant_id: string
          quantity: number
          transformation_id: string
          unit_cost?: number
        }
        Update: {
          created_at?: string
          direction?: Database["public"]["Enums"]["transformation_direction"]
          id?: string
          lot_id?: string | null
          notes?: string | null
          organization_id?: string
          product_variant_id?: string
          quantity?: number
          transformation_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "transformation_items_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "inventory_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformation_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformation_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformation_items_transformation_id_fkey"
            columns: ["transformation_id"]
            isOneToOne: false
            referencedRelation: "transformations"
            referencedColumns: ["id"]
          },
        ]
      }
      transformations: {
        Row: {
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          id: string
          impersonated_by: string | null
          location_id: string
          notes: string | null
          organization_id: string
          reference: string | null
          status: Database["public"]["Enums"]["transformation_status"]
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          impersonated_by?: string | null
          location_id: string
          notes?: string | null
          organization_id: string
          reference?: string | null
          status?: Database["public"]["Enums"]["transformation_status"]
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          impersonated_by?: string | null
          location_id?: string
          notes?: string | null
          organization_id?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["transformation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transformations_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformations_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformations_impersonated_by_fkey"
            columns: ["impersonated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transformations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          organization_id: string | null
          symbol: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          organization_id?: string | null
          symbol: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          organization_id?: string | null
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_push_tokens: {
        Row: {
          active: boolean
          created_at: string
          device_name: string | null
          id: string
          platform: string | null
          provider: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          device_name?: string | null
          id?: string
          platform?: string | null
          provider?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          device_name?: string | null
          id?: string
          platform?: string | null
          provider?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { p_full_name: string; p_token_hash: string; p_user_id: string }
        Returns: {
          accepted_at: string
          invitation_id: string
          organization_id: string
          scope: Database["public"]["Enums"]["invitation_scope"]
          user_id: string
        }[]
      }
      bootstrap_platform_root: { Args: { p_user_id: string }; Returns: boolean }
      can_access_location: {
        Args: { target_location_id: string }
        Returns: boolean
      }
      can_invite_to_organization: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      can_invite_user: {
        Args: { p_organization_id: string; p_user_id: string }
        Returns: boolean
      }
      can_manage_roles: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      can_write_organization: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      cancel_invitation: { Args: { p_invitation_id: string }; Returns: boolean }
      create_custom_role: {
        Args: {
          p_actor_user_id: string
          p_description?: string
          p_name: string
          p_organization_id: string
          p_permission_codes?: string[]
        }
        Returns: {
          active: boolean
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          organization_id: string | null
          system_role: Database["public"]["Enums"]["system_role_code"] | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "roles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_invitation: {
        Args: {
          p_email: string
          p_expires_at: string
          p_location_ids?: string[]
          p_new_organization_name?: string
          p_new_organization_slug?: string
          p_organization_id?: string
          p_platform_role?: Database["public"]["Enums"]["platform_admin_role"]
          p_role_ids?: string[]
          p_scope: Database["public"]["Enums"]["invitation_scope"]
          p_token_hash: string
        }
        Returns: {
          accepted_at: string
          accepted_by_user_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_user_id: string
          location_ids: string[]
          metadata: Json
          organization_id: string
          organization_name: string
          organization_slug: string
          platform_role: Database["public"]["Enums"]["platform_admin_role"]
          role_ids: string[]
          scope: Database["public"]["Enums"]["invitation_scope"]
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }[]
      }
      current_user_id: { Args: never; Returns: string }
      debug_invitation_access: {
        Args: never
        Returns: {
          auth_user_id: string
          invitation_status_values: Database["public"]["Enums"]["invitation_status"][]
          invitations_count: number
          is_platform_admin: boolean
          pending_invitations_count: number
          platform_role: Database["public"]["Enums"]["platform_admin_role"]
        }[]
      }
      get_current_user_profile: {
        Args: never
        Returns: {
          avatar_url: string
          email: string
          is_platform_admin: boolean
          member_id: string
          member_status: Database["public"]["Enums"]["member_status"]
          name: string
          organization_id: string
          organization_name: string
          organization_slug: string
          organization_status: Database["public"]["Enums"]["organization_status"]
          phone: string
          platform_role: Database["public"]["Enums"]["platform_admin_role"]
          user_id: string
        }[]
      }
      get_member_id: {
        Args: { target_organization_id: string }
        Returns: string
      }
      has_permission: {
        Args: { permission_key: string; target_organization_id: string }
        Returns: boolean
      }
      has_user_permission: {
        Args: {
          p_organization_id: string
          p_permission_key: string
          p_user_id: string
        }
        Returns: boolean
      }
      invitation_summary: {
        Args: { p_invitation_id: string }
        Returns: {
          accepted_at: string
          accepted_by_user_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_user_id: string
          location_ids: string[]
          metadata: Json
          organization_id: string
          organization_name: string
          organization_slug: string
          platform_role: Database["public"]["Enums"]["platform_admin_role"]
          role_ids: string[]
          scope: Database["public"]["Enums"]["invitation_scope"]
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }[]
      }
      is_org_member: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      is_organization_active: {
        Args: { target_organization_id: string }
        Returns: boolean
      }
      is_platform_admin: { Args: never; Returns: boolean }
      is_platform_admin_user: { Args: { p_user_id: string }; Returns: boolean }
      is_root: { Args: never; Returns: boolean }
      is_root_user: { Args: { p_user_id: string }; Returns: boolean }
      list_organization_users: {
        Args: { target_organization_id: string }
        Returns: {
          avatar_url: string
          email: string
          joined_at: string
          location_id: string
          location_name: string
          member_id: string
          member_status: Database["public"]["Enums"]["member_status"]
          name: string
          phone: string
          role_id: string
          role_name: string
          user_id: string
        }[]
      }
      list_platform_users: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          is_platform_admin: boolean
          member_status: Database["public"]["Enums"]["member_status"]
          name: string
          organization_id: string
          organization_name: string
          phone: string
          platform_role: Database["public"]["Enums"]["platform_admin_role"]
          user_id: string
        }[]
      }
      resend_invitation: {
        Args: {
          p_expires_at: string
          p_invitation_id: string
          p_invited_by_user_id: string
          p_token_hash: string
        }
        Returns: {
          accepted_at: string
          accepted_by_user_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_user_id: string
          location_ids: string[]
          metadata: Json
          organization_id: string
          organization_name: string
          organization_slug: string
          platform_role: Database["public"]["Enums"]["platform_admin_role"]
          role_ids: string[]
          scope: Database["public"]["Enums"]["invitation_scope"]
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }[]
      }
      search_organization_invitations: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_organization_id: string
          p_search?: string
          p_status?: Database["public"]["Enums"]["invitation_status"]
        }
        Returns: {
          accepted_at: string
          accepted_by_email: string
          accepted_by_name: string
          accepted_by_user_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_email: string
          invited_by_name: string
          invited_by_user_id: string
          last_sent_at: string
          location_ids: string[]
          location_names: string[]
          role_ids: string[]
          role_names: string[]
          status: Database["public"]["Enums"]["invitation_status"]
          total_count: number
          updated_at: string
        }[]
      }
      search_platform_invitations: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_scope?: Database["public"]["Enums"]["invitation_scope"]
          p_search?: string
          p_status?: Database["public"]["Enums"]["invitation_status"]
        }
        Returns: {
          accepted_at: string
          accepted_by_email: string
          accepted_by_name: string
          accepted_by_user_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by_email: string
          invited_by_name: string
          invited_by_user_id: string
          last_sent_at: string
          location_ids: string[]
          location_names: string[]
          new_organization_name: string
          new_organization_slug: string
          organization_id: string
          organization_name: string
          organization_slug: string
          platform_role: Database["public"]["Enums"]["platform_admin_role"]
          role_ids: string[]
          role_names: string[]
          scope: Database["public"]["Enums"]["invitation_scope"]
          status: Database["public"]["Enums"]["invitation_status"]
          total_count: number
          updated_at: string
        }[]
      }
      seed_organization_defaults: {
        Args: { p_organization_id: string }
        Returns: string
      }
      storage_org_id_from_path: { Args: { path: string }; Returns: string }
      validate_invitation: {
        Args: { p_token_hash: string }
        Returns: {
          email: string
          expires_at: string
          organization_name: string
          scope: Database["public"]["Enums"]["invitation_scope"]
          valid: boolean
        }[]
      }
    }
    Enums: {
      audit_action:
        | "CREATE"
        | "UPDATE"
        | "DELETE"
        | "CANCEL"
        | "VOID"
        | "CONFIRM"
        | "SEND"
        | "RECEIVE"
        | "LOGIN"
        | "IMPERSONATE_START"
        | "IMPERSONATE_END"
      cash_expense_type:
        | "SUPPLIES"
        | "SERVICE"
        | "TRANSPORT"
        | "PAYROLL"
        | "OTHER"
      cash_session_status: "OPEN" | "CLOSED" | "CANCELLED"
      daily_closure_attachment_type:
        | "SALES_NOTEBOOK_PHOTO"
        | "CASH_PHOTO"
        | "EXPENSE_RECEIPT"
        | "AI_SOURCE_IMAGE"
        | "OTHER"
      daily_closure_status: "DRAFT" | "CONFIRMED" | "CANCELLED" | "VOIDED"
      inventory_count_status: "DRAFT" | "CONFIRMED" | "CANCELLED"
      inventory_movement_type:
        | "PURCHASE_IN"
        | "TRANSFER_OUT"
        | "TRANSFER_IN"
        | "SALE_OUT"
        | "LOSS_OUT"
        | "ADJUSTMENT_IN"
        | "ADJUSTMENT_OUT"
        | "TRANSFORMATION_IN"
        | "TRANSFORMATION_OUT"
        | "COUNT_ADJUSTMENT_IN"
        | "COUNT_ADJUSTMENT_OUT"
      invitation_scope: "PLATFORM" | "ORGANIZATION" | "NEW_ORGANIZATION"
      invitation_status: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED"
      location_type: "WAREHOUSE" | "BRANCH" | "PRODUCTION"
      member_status: "ACTIVE" | "INVITED" | "SUSPENDED" | "REMOVED"
      notification_channel: "IN_APP" | "PUSH" | "WHATSAPP"
      notification_status: "PENDING" | "SENT" | "READ" | "FAILED"
      organization_status: "ACTIVE" | "SUSPENDED" | "TRIAL" | "CANCELLED"
      platform_admin_role: "ROOT" | "SUPER_ADMIN" | "SUPPORT"
      price_status: "ACTIVE" | "INACTIVE"
      product_type: "RAW_MATERIAL" | "FINISHED_PRODUCT" | "SUPPLY" | "BUNDLE"
      purchase_attachment_type: "TICKET_PHOTO" | "INVOICE" | "RECEIPT" | "OTHER"
      purchase_status: "DRAFT" | "CONFIRMED" | "CANCELLED" | "VOIDED"
      subscription_plan: "FREE" | "BASIC" | "PRO" | "ENTERPRISE"
      subscription_status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "TRIALING"
      system_role_code:
        | "OWNER"
        | "MANAGER"
        | "WAREHOUSE"
        | "CASHIER"
        | "EMPLOYEE"
      transfer_attachment_type:
        | "DEPARTURE_PHOTO"
        | "RECEPTION_PHOTO"
        | "EVIDENCE"
        | "OTHER"
      transfer_status:
        | "DRAFT"
        | "SENT"
        | "PARTIALLY_RECEIVED"
        | "RECEIVED"
        | "RECEIVED_WITH_DIFFERENCE"
        | "CANCELLED"
        | "VOIDED"
      transformation_direction: "INPUT" | "OUTPUT"
      transformation_status: "DRAFT" | "CONFIRMED" | "CANCELLED"
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
  public: {
    Enums: {
      audit_action: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "CANCEL",
        "VOID",
        "CONFIRM",
        "SEND",
        "RECEIVE",
        "LOGIN",
        "IMPERSONATE_START",
        "IMPERSONATE_END",
      ],
      cash_expense_type: [
        "SUPPLIES",
        "SERVICE",
        "TRANSPORT",
        "PAYROLL",
        "OTHER",
      ],
      cash_session_status: ["OPEN", "CLOSED", "CANCELLED"],
      daily_closure_attachment_type: [
        "SALES_NOTEBOOK_PHOTO",
        "CASH_PHOTO",
        "EXPENSE_RECEIPT",
        "AI_SOURCE_IMAGE",
        "OTHER",
      ],
      daily_closure_status: ["DRAFT", "CONFIRMED", "CANCELLED", "VOIDED"],
      inventory_count_status: ["DRAFT", "CONFIRMED", "CANCELLED"],
      inventory_movement_type: [
        "PURCHASE_IN",
        "TRANSFER_OUT",
        "TRANSFER_IN",
        "SALE_OUT",
        "LOSS_OUT",
        "ADJUSTMENT_IN",
        "ADJUSTMENT_OUT",
        "TRANSFORMATION_IN",
        "TRANSFORMATION_OUT",
        "COUNT_ADJUSTMENT_IN",
        "COUNT_ADJUSTMENT_OUT",
      ],
      invitation_scope: ["PLATFORM", "ORGANIZATION", "NEW_ORGANIZATION"],
      invitation_status: ["PENDING", "ACCEPTED", "EXPIRED", "CANCELLED"],
      location_type: ["WAREHOUSE", "BRANCH", "PRODUCTION"],
      member_status: ["ACTIVE", "INVITED", "SUSPENDED", "REMOVED"],
      notification_channel: ["IN_APP", "PUSH", "WHATSAPP"],
      notification_status: ["PENDING", "SENT", "READ", "FAILED"],
      organization_status: ["ACTIVE", "SUSPENDED", "TRIAL", "CANCELLED"],
      platform_admin_role: ["ROOT", "SUPER_ADMIN", "SUPPORT"],
      price_status: ["ACTIVE", "INACTIVE"],
      product_type: ["RAW_MATERIAL", "FINISHED_PRODUCT", "SUPPLY", "BUNDLE"],
      purchase_attachment_type: ["TICKET_PHOTO", "INVOICE", "RECEIPT", "OTHER"],
      purchase_status: ["DRAFT", "CONFIRMED", "CANCELLED", "VOIDED"],
      subscription_plan: ["FREE", "BASIC", "PRO", "ENTERPRISE"],
      subscription_status: ["ACTIVE", "PAST_DUE", "CANCELLED", "TRIALING"],
      system_role_code: [
        "OWNER",
        "MANAGER",
        "WAREHOUSE",
        "CASHIER",
        "EMPLOYEE",
      ],
      transfer_attachment_type: [
        "DEPARTURE_PHOTO",
        "RECEPTION_PHOTO",
        "EVIDENCE",
        "OTHER",
      ],
      transfer_status: [
        "DRAFT",
        "SENT",
        "PARTIALLY_RECEIVED",
        "RECEIVED",
        "RECEIVED_WITH_DIFFERENCE",
        "CANCELLED",
        "VOIDED",
      ],
      transformation_direction: ["INPUT", "OUTPUT"],
      transformation_status: ["DRAFT", "CONFIRMED", "CANCELLED"],
    },
  },
} as const
