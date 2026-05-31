// ─── Supabase Database Types ──────────────────────────────────────────────────
// Matches the existing Supabase schema for Riazify

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          plan_name: string
          account_status: string
          usage_score: number
          role: 'admin' | 'user'
          created_at: string
          avatar_url: string | null
          gender: string | null
          last_login_ip: string | null
          device_platform: string | null
          browser_agent: string | null
          display_id: string | null
          verified_city: string | null
          is_location_verified: boolean | null
          ebay_marketplace: string | null
          currency_code: string | null
          currency_symbol: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          plan_name?: string
          account_status?: string
          usage_score?: number
          role?: 'admin' | 'user'
          created_at?: string
          avatar_url?: string | null
          gender?: string | null
          last_login_ip?: string | null
          device_platform?: string | null
          browser_agent?: string | null
          display_id?: string | null
          verified_city?: string | null
          is_location_verified?: boolean | null
          ebay_marketplace?: string | null
          currency_code?: string | null
          currency_symbol?: string | null
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }

      protected_orders: {
        Row: {
          id: string
          user_id: string
          ebay_order_id: string
          item_title: string | null
          item_price: number | null
          buyer_username: string | null
          risk_level: 'HIGH' | 'MEDIUM' | 'LOW'
          order_status: string | null
          checklist_completed: boolean
          tracking_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ebay_order_id: string
          item_title?: string | null
          item_price?: number | null
          buyer_username?: string | null
          risk_level: 'HIGH' | 'MEDIUM' | 'LOW'
          order_status?: string | null
          checklist_completed?: boolean
          tracking_number?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['protected_orders']['Insert']>
      }

      admin_notifications: {
        Row: {
          id: string
          type: 'new_user' | 'payment_failed' | 'api_limit' | 'new_ticket' | 'high_risk_order' | 'kill_switch' | 'tool_spike' | 'new_bug'
          title: string
          message: string
          is_read: boolean
          action_url: string | null
          meta: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: Database['public']['Tables']['admin_notifications']['Row']['type']
          title: string
          message: string
          is_read?: boolean
          action_url?: string | null
          meta?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['admin_notifications']['Insert']>
      }

      login_history: {
        Row: {
          id: string
          user_id: string
          ip_address: string | null
          device_info: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ip_address?: string | null
          device_info?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['login_history']['Insert']>
      }

      sent_messages: {
        Row: {
          id: string
          user_id: string
          recipient: string | null
          template_name: string | null
          sent_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipient?: string | null
          template_name?: string | null
          sent_at?: string
        }
        Update: Partial<Database['public']['Tables']['sent_messages']['Insert']>
      }
    }
  }
}

// ─── Convenience Types ────────────────────────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Order = Database['public']['Tables']['protected_orders']['Row']
export type AdminNotification = Database['public']['Tables']['admin_notifications']['Row']
export type LoginHistory = Database['public']['Tables']['login_history']['Row']

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW'
export type UserRole = 'admin' | 'user'
export type NotificationType = AdminNotification['type']
