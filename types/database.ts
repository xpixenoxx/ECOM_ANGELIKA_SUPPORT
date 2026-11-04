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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          expires_at: string
          id: string
          items: Json
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          expires_at?: string
          id?: string
          items?: Json
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          expires_at?: string
          id?: string
          items?: Json
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          description_hi: string | null
          id: string
          image_url: string | null
          is_active: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          name_hi: string | null
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_hi?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          name_hi?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_hi?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          name_hi?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      colors: {
        Row: {
          hex: string
          id: string
          image_url: string | null
          name: string
          name_hi: string | null
          sort_order: number
        }
        Insert: {
          hex: string
          id?: string
          image_url?: string | null
          name: string
          name_hi?: string | null
          sort_order?: number
        }
        Update: {
          hex?: string
          id?: string
          image_url?: string | null
          name?: string
          name_hi?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          key: string
          published_at: string | null
          settings: Json
          title: string | null
          type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key: string
          published_at?: string | null
          settings?: Json
          title?: string | null
          type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key?: string
          published_at?: string | null
          settings?: Json
          title?: string | null
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_blocks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_categories: string[] | null
          applicable_products: string[] | null
          code: string
          created_at: string
          first_order_only: boolean
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_order_amount: number
          name: string | null
          type: string
          usage_count: number
          usage_limit: number | null
          user_limit: number
          valid_from: string
          valid_until: string | null
          value: number
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          code: string
          created_at?: string
          first_order_only?: boolean
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number
          name?: string | null
          type: string
          usage_count?: number
          usage_limit?: number | null
          user_limit?: number
          valid_from?: string
          valid_until?: string | null
          value?: number
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          code?: string
          created_at?: string
          first_order_only?: boolean
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number
          name?: string | null
          type?: string
          usage_count?: number
          usage_limit?: number | null
          user_limit?: number
          valid_from?: string
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
      design_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          tokens: Json
          version: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          tokens?: Json
          version: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          tokens?: Json
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      look_hotspots: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          look_id: string | null
          product_id: string | null
          x_percent: number
          y_percent: number
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          look_id?: string | null
          product_id?: string | null
          x_percent: number
          y_percent: number
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          look_id?: string | null
          product_id?: string | null
          x_percent?: number
          y_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "look_hotspots_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "look_hotspots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      looks: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          lifestyle_image_alt: string | null
          lifestyle_image_url: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          lifestyle_image_alt?: string | null
          lifestyle_image_url: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          lifestyle_image_alt?: string | null
          lifestyle_image_url?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          order_id: string | null
          points: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          gst_rate: number
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          variant_details: Json
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          gst_rate?: number
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total_price: number
          unit_price: number
          variant_details?: Json
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          gst_rate?: number
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_details?: Json
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          cancel_reason: string | null
          cancelled_at: string | null
          courier_partner: string | null
          created_at: string
          currency: string
          delivered_at: string | null
          discount_amount: number
          email: string
          gift_message: string | null
          gift_wrap: boolean
          id: string
          metadata: Json
          notes: string | null
          order_number: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string
          phone: string | null
          shipped_at: string | null
          shipping_address: Json
          shipping_cost: number
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
          vidyas_note: string | null
          whatsapp_opt_in: boolean
        }
        Insert: {
          billing_address?: Json | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          courier_partner?: string | null
          created_at?: string
          currency?: string
          delivered_at?: string | null
          discount_amount?: number
          email: string
          gift_message?: string | null
          gift_wrap?: boolean
          id?: string
          metadata?: Json
          notes?: string | null
          order_number: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
          phone?: string | null
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
          vidyas_note?: string | null
          whatsapp_opt_in?: boolean
        }
        Update: {
          billing_address?: Json | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          courier_partner?: string | null
          created_at?: string
          currency?: string
          delivered_at?: string | null
          discount_amount?: number
          email?: string
          gift_message?: string | null
          gift_wrap?: boolean
          id?: string
          metadata?: Json
          notes?: string | null
          order_number?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string
          phone?: string | null
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cost?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
          vidyas_note?: string | null
          whatsapp_opt_in?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          type: string
          url: string
          variant_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          type?: string
          url: string
          variant_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          type?: string
          url?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          color_id: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string
          id: string
          inventory_quantity: number
          is_active: boolean
          low_stock_threshold: number
          price: number
          product_id: string
          size: string
          sort_order: number
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          barcode?: string | null
          color_id?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          id?: string
          inventory_quantity?: number
          is_active?: boolean
          low_stock_threshold?: number
          price: number
          product_id: string
          size: string
          sort_order?: number
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          barcode?: string | null
          color_id?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          id?: string
          inventory_quantity?: number
          is_active?: boolean
          low_stock_threshold?: number
          price?: number
          product_id?: string
          size?: string
          sort_order?: number
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          description_hi: string | null
          embedding: string | null
          fabric: Json | null
          gst_slab: number
          hsn_code: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          is_vidyas_pick: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          name_hi: string | null
          occasion: string[] | null
          search_vector: unknown
          short_description: string | null
          sku: string
          slug: string
          subcategory_id: string | null
          tags: string[] | null
          updated_at: string
          vidyas_note: string | null
          vidyas_note_hi: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_hi?: string | null
          embedding?: string | null
          fabric?: Json | null
          gst_slab?: number
          hsn_code?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_vidyas_pick?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          name_hi?: string | null
          occasion?: string[] | null
          search_vector?: unknown
          short_description?: string | null
          sku: string
          slug: string
          subcategory_id?: string | null
          tags?: string[] | null
          updated_at?: string
          vidyas_note?: string | null
          vidyas_note_hi?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_hi?: string | null
          embedding?: string | null
          fabric?: Json | null
          gst_slab?: number
          hsn_code?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_vidyas_pick?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          name_hi?: string | null
          occasion?: string[] | null
          search_vector?: unknown
          short_description?: string | null
          sku?: string
          slug?: string
          subcategory_id?: string | null
          tags?: string[] | null
          updated_at?: string
          vidyas_note?: string | null
          vidyas_note_hi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          loyalty_points: number
          loyalty_tier: string
          measurements: Json | null
          phone: string | null
          preferences: Json
          referral_code: string | null
          referred_by: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          loyalty_points?: number
          loyalty_tier?: string
          measurements?: Json | null
          phone?: string | null
          preferences?: Json
          referral_code?: string | null
          referred_by?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          loyalty_points?: number
          loyalty_tier?: string
          measurements?: Json | null
          phone?: string | null
          preferences?: Json
          referral_code?: string | null
          referred_by?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      returns: {
        Row: {
          admin_notes: string | null
          courier_partner: string | null
          created_at: string
          exchange_color_id: string | null
          exchange_size: string | null
          exchange_variant_id: string | null
          id: string
          images: string[] | null
          order_id: string
          order_item_id: string
          pickup_address: Json | null
          pickup_otp: string | null
          pickup_scheduled_at: string | null
          reason: string
          reason_detail: string | null
          refund_amount: number | null
          status: string
          tracking_number: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          courier_partner?: string | null
          created_at?: string
          exchange_color_id?: string | null
          exchange_size?: string | null
          exchange_variant_id?: string | null
          id?: string
          images?: string[] | null
          order_id: string
          order_item_id: string
          pickup_address?: Json | null
          pickup_otp?: string | null
          pickup_scheduled_at?: string | null
          reason: string
          reason_detail?: string | null
          refund_amount?: number | null
          status?: string
          tracking_number?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          courier_partner?: string | null
          created_at?: string
          exchange_color_id?: string | null
          exchange_size?: string | null
          exchange_variant_id?: string | null
          id?: string
          images?: string[] | null
          order_id?: string
          order_item_id?: string
          pickup_address?: Json | null
          pickup_otp?: string | null
          pickup_scheduled_at?: string | null
          reason?: string
          reason_detail?: string | null
          refund_amount?: number | null
          status?: string
          tracking_number?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_exchange_color_id_fkey"
            columns: ["exchange_color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_exchange_variant_id_fkey"
            columns: ["exchange_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          body_hi: string | null
          created_at: string
          fit_rating: number | null
          helpful_count: number
          id: string
          is_published: boolean
          is_verified_purchase: boolean
          order_item_id: string | null
          photos: string[] | null
          product_id: string
          quality_rating: number | null
          rating: number
          title: string | null
          updated_at: string
          user_id: string | null
          user_measurements: Json | null
          vendor_responded_at: string | null
          vendor_response: string | null
        }
        Insert: {
          body?: string | null
          body_hi?: string | null
          created_at?: string
          fit_rating?: number | null
          helpful_count?: number
          id?: string
          is_published?: boolean
          is_verified_purchase?: boolean
          order_item_id?: string | null
          photos?: string[] | null
          product_id: string
          quality_rating?: number | null
          rating: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
          user_measurements?: Json | null
          vendor_responded_at?: string | null
          vendor_response?: string | null
        }
        Update: {
          body?: string | null
          body_hi?: string | null
          created_at?: string
          fit_rating?: number | null
          helpful_count?: number
          id?: string
          is_published?: boolean
          is_verified_purchase?: boolean
          order_item_id?: string | null
          photos?: string[] | null
          product_id?: string
          quality_rating?: number | null
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
          user_measurements?: Json | null
          vendor_responded_at?: string | null
          vendor_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      size_charts: {
        Row: {
          category_id: string | null
          created_at: string
          fit_notes: string | null
          id: string
          measurements: Json
          model_measurements: Json | null
          size: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          fit_notes?: string | null
          id?: string
          measurements?: Json
          model_measurements?: Json | null
          size: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          fit_notes?: string | null
          id?: string
          measurements?: Json
          model_measurements?: Json | null
          size?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "size_charts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_conversations: {
        Row: {
          ai_handled: boolean
          assigned_to: string | null
          created_at: string
          flow_response: Json | null
          flow_token: string | null
          human_handoff: boolean
          id: string
          metadata: Json
          phone: string
          status: string
          template_name: string | null
          template_params: Json | null
          type: string
          user_id: string | null
          wa_message_id: string
        }
        Insert: {
          ai_handled?: boolean
          assigned_to?: string | null
          created_at?: string
          flow_response?: Json | null
          flow_token?: string | null
          human_handoff?: boolean
          id?: string
          metadata?: Json
          phone: string
          status: string
          template_name?: string | null
          template_params?: Json | null
          type: string
          user_id?: string | null
          wa_message_id: string
        }
        Update: {
          ai_handled?: boolean
          assigned_to?: string | null
          created_at?: string
          flow_response?: Json | null
          flow_token?: string | null
          human_handoff?: boolean
          id?: string
          metadata?: Json
          phone?: string
          status?: string
          template_name?: string | null
          template_params?: Json | null
          type?: string
          user_id?: string | null
          wa_message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          notify_on_restock: boolean
          notify_on_sale: boolean
          product_id: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notify_on_restock?: boolean
          notify_on_sale?: boolean
          product_id: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notify_on_restock?: boolean
          notify_on_sale?: boolean
          product_id?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const