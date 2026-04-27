// types/database.ts
// Supabase database type definitions — shaped to match the output of
// `supabase gen types typescript` for @supabase/supabase-js v2.
//
// CRITICAL: Every table MUST include a `Relationships` array.
// @supabase/postgrest-js (bundled in supabase-js v2.49+) constrains tables
// against `GenericTable` which requires `Relationships: GenericRelationship[]`.
// Without it, `from("table")` resolves the row type to `never`, causing
// TypeScript errors on every .select(), .insert(), .update(), and .upsert() call.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ── profiles ───────────────────────────────────────────────────────────
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: "customer" | "admin" | "vendor";
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          postal_code: string | null;
          bio: string | null;
          is_verified: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "customer" | "admin" | "vendor";
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          postal_code?: string | null;
          bio?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };

      // ── gadgets ────────────────────────────────────────────────────────────
      gadgets: {
        Row: {
          id: string;
          name: string;
          brand: string;
          type: "phone" | "laptop" | "game" | "tablet" | "accessory";
          price: number;
          image_url: string;
          description: string;
          condition: string;
          specs: Json;
          stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          type: "phone" | "laptop" | "game" | "tablet" | "accessory";
          price: number;
          image_url: string;
          description: string;
          condition: string;
          specs?: Json;
          stock?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gadgets"]["Insert"]>;
        Relationships: [];
      };

      // ── jerseys ────────────────────────────────────────────────────────────
      jerseys: {
        Row: {
          id: string;
          name: string;
          team: string;
          type: "club" | "country" | "nfl" | "basketball" | "retro";
          category: "current" | "retro" | "special";
          price: number;
          image_url: string;
          description: string;
          sizes: string[];
          season: string;
          stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          team: string;
          type: "club" | "country" | "nfl" | "basketball" | "retro";
          category: "current" | "retro" | "special";
          price: number;
          image_url: string;
          description: string;
          sizes?: string[];
          season: string;
          stock?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["jerseys"]["Insert"]>;
        Relationships: [];
      };

      // ── cars ───────────────────────────────────────────────────────────────
      cars: {
        Row: {
          id: string;
          name: string;
          brand: string;
          model: string;
          year: number;
          price: number;
          image_url: string;
          description: string;
          mileage: string;
          condition: "Brand New" | "Used - Like New" | "Used - Excellent" | "Used - Good";
          fuel_type: string;
          transmission: string;
          is_available: boolean;
          seller_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          model: string;
          year: number;
          price: number;
          image_url: string;
          description: string;
          mileage: string;
          condition: "Brand New" | "Used - Like New" | "Used - Excellent" | "Used - Good";
          fuel_type: string;
          transmission: string;
          is_available?: boolean;
          seller_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cars"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "cars_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── real_estates ───────────────────────────────────────────────────────
      real_estates: {
        Row: {
          id: string;
          name: string;
          type: "house" | "land" | "apartment" | "commercial";
          location: string;
          price: number;
          image_url: string;
          description: string;
          size: string;
          bedrooms: number | null;
          bathrooms: number | null;
          features: string[];
          is_available: boolean;
          seller_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "house" | "land" | "apartment" | "commercial";
          location: string;
          price: number;
          image_url: string;
          description: string;
          size: string;
          bedrooms?: number | null;
          bathrooms?: number | null;
          features?: string[];
          is_available?: boolean;
          seller_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["real_estates"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "real_estates_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── orders ─────────────────────────────────────────────────────────────
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: "pending" | "awaiting_payment" | "payment_submitted" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
          total_amount: number;
          subtotal_amount: number;
          discount_amount: number;
          delivery_fee: number;
          grand_total: number;
          currency: string;
          payment_reference: string | null;
          payment_method: string | null;
          notes: string | null;
          manual_payment_note: string | null;
          manual_payment_proof_url: string | null;
          manual_payment_submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: "pending" | "awaiting_payment" | "payment_submitted" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
          total_amount: number;
          subtotal_amount?: number;
          discount_amount?: number;
          delivery_fee?: number;
          grand_total?: number;
          currency?: string;
          payment_reference?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          manual_payment_note?: string | null;
          manual_payment_proof_url?: string | null;
          manual_payment_submitted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── order_items ────────────────────────────────────────────────────────
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_category: "gadget" | "jersey" | "car" | "realestate";
          product_name: string;
          product_image: string;
          unit_price: number;
          quantity: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          product_category: "gadget" | "jersey" | "car" | "realestate";
          product_name: string;
          product_image: string;
          unit_price: number;
          quantity: number;
          subtotal: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── cart_items ─────────────────────────────────────────────────────────
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          product_category: "gadget" | "jersey" | "car" | "realestate";
          product_name: string;
          product_image: string;
          unit_price: number;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          product_category: "gadget" | "jersey" | "car" | "realestate";
          product_name: string;
          product_image: string;
          unit_price: number;
          quantity: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cart_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── receipts ───────────────────────────────────────────────────────────
      receipts: {
        Row: {
          id: string;
          order_id: string | null;
          user_id: string;
          receipt_number: string;
          payment_reference: string;
          customer_name: string;
          customer_email: string | null;
          amount_paid: number;
          currency: string;
          payment_channel: string;
          payment_date: string;
          items_snapshot: Json;
          status: "paid" | "refunded" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          user_id: string;
          receipt_number: string;
          payment_reference: string;
          customer_name?: string;
          customer_email?: string | null;
          amount_paid: number;
          currency?: string;
          payment_channel?: string;
          payment_date?: string;
          items_snapshot?: Json;
          status?: "paid" | "refunded" | "failed";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["receipts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "receipts_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "receipts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── notifications ──────────────────────────────────────────────────────
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          type: "order" | "offer" | "system" | "abandoned_cart";
          title: string;
          message: string;
          read: boolean;
          data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type: "order" | "offer" | "system" | "abandoned_cart";
          title: string;
          message: string;
          read?: boolean;
          data?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── discount_codes ─────────────────────────────────────────────────────
      discount_codes: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          type: "percentage" | "fixed";
          value: number;
          minimum_order: number | null;
          max_discount: number | null;
          max_uses: number | null;
          times_used: number;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          type?: "percentage" | "fixed";
          value: number;
          minimum_order?: number | null;
          max_discount?: number | null;
          max_uses?: number | null;
          times_used?: number;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["discount_codes"]["Insert"]>;
        Relationships: [];
      };

      // ── swap_requests ──────────────────────────────────────────────────────
      swap_requests: {
        Row: {
          id: string;
          user_id: string;
          target_gadget_id: string;
          target_gadget_name: string;
          memory: string;
          battery_health: string;
          has_face_id: boolean;
          repair_history: string;
          image_urls: string[];
          video_url: string | null;
          status: "pending" | "under_review" | "approved" | "rejected" | "completed";
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_gadget_id: string;
          target_gadget_name: string;
          memory: string;
          battery_health: string;
          has_face_id?: boolean;
          repair_history?: string;
          image_urls?: string[];
          video_url?: string | null;
          status?: "pending" | "under_review" | "approved" | "rejected" | "completed";
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["swap_requests"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "swap_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── wishlists ──────────────────────────────────────────────────────────
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          product_category: "gadget" | "jersey" | "car" | "realestate";
          product_name: string | null;
          product_image: string | null;
          product_price: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          product_category: "gadget" | "jersey" | "car" | "realestate";
          product_name?: string | null;
          product_image?: string | null;
          product_price?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wishlists"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── contact_enquiries ──────────────────────────────────────────────────
      contact_enquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          product: string;
          message: string;
          is_resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          product?: string;
          message: string;
          is_resolved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_enquiries"]["Insert"]>;
        Relationships: [];
      };

      // ── auth_logs ──────────────────────────────────────────────────────────
      auth_logs: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          provider: string | null;
          ip_address: string | null;
          user_agent: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          provider?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["auth_logs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "auth_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      admin_audit_log: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          old_value: Json | null;
          new_value: Json | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          old_value?: Json | null;
          new_value?: Json | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_audit_log"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── analytics_events ───────────────────────────────────────────────────
      analytics_events: {
        Row: {
          id: string;
          event_type: string;
          product_id: string | null;
          product_category: "gadget" | "jersey" | "car" | "realestate" | null;
          user_id: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          product_id?: string | null;
          product_category?: "gadget" | "jersey" | "car" | "realestate" | null;
          user_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
        Relationships: [];
      };
    };

    Views: {
      order_summary: {
        Row: {
          id: string;
          user_id: string;
          status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
          total_amount: number;
          item_count: number;
          created_at: string;
        };
        Relationships: [];
      };
    };

    Functions: {
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_orders: number;
          total_revenue: number;
          total_users: number;
          pending_swaps: number;
          orders_this_month: number;
          revenue_this_month: number;
        };
      };
      create_order_with_items: {
        Args: {
          p_user_id: string;
          p_status: Database["public"]["Enums"]["order_status"];
          p_payment_method: string;
          p_payment_reference: string | null;
          p_notes: string | null;
          p_subtotal_amount: number;
          p_discount_amount: number;
          p_delivery_fee: number;
          p_grand_total: number;
          p_currency: string;
          p_items: Json;
        };
        Returns: Database["public"]["Tables"]["orders"]["Row"];
      };
      process_payment: {
        Args: {
          p_order_id: string;
          p_payment_reference: string;
          p_amount_paid: number;
          p_currency: string;
          p_channel: string;
          p_paid_at: string;
          p_customer_name: string;
          p_customer_email: string | null;
          p_items_snapshot: Json;
        };
        Returns: {
          status: string;
          receipt_id?: string | null;
          receipt_number?: string | null;
        };
      };
      sync_cart_items: {
        Args: {
          p_user_id: string;
          p_items: Json;
        };
        Returns: undefined;
      };
    };

    // Required by @supabase/postgrest-js GenericSchema constraint
    Enums: {
      user_role:           "customer" | "admin" | "vendor";
      gadget_type:         "phone" | "laptop" | "game" | "tablet" | "accessory";
      jersey_type:         "club" | "country" | "nfl" | "basketball" | "retro";
      jersey_category:     "current" | "retro" | "special";
      car_condition:       "Brand New" | "Used - Like New" | "Used - Excellent" | "Used - Good";
      real_estate_type:    "house" | "land" | "apartment" | "commercial";
      order_status:        "pending" | "awaiting_payment" | "payment_submitted" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
      swap_status:         "pending" | "under_review" | "approved" | "rejected" | "completed";
      product_category:    "gadget" | "jersey" | "car" | "realestate";
      receipt_status:      "paid" | "refunded" | "failed";
      notification_type:   "order" | "offer" | "system" | "abandoned_cart";
      discount_type:       "percentage" | "fixed";
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ── Convenience re-exports ────────────────────────────────────────────────────
// These replace the old standalone type aliases and are derived from the Database
// type so they stay in sync automatically.

export type UserRole        = Database["public"]["Enums"]["user_role"];
export type GadgetType      = Database["public"]["Enums"]["gadget_type"];
export type JerseyType      = Database["public"]["Enums"]["jersey_type"];
export type JerseyCategory  = Database["public"]["Enums"]["jersey_category"];
export type CarCondition     = Database["public"]["Enums"]["car_condition"];
export type RealEstateType  = Database["public"]["Enums"]["real_estate_type"];
export type OrderStatus     = Database["public"]["Enums"]["order_status"];
export type SwapStatus      = Database["public"]["Enums"]["swap_status"];
export type ProductCategory = Database["public"]["Enums"]["product_category"];
