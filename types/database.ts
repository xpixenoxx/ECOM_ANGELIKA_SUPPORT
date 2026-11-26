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
          sort_order: number
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
          sort_order?: number
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
          sort_order?: number
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
          idempotency_key: string | null
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
          tracking_url: string | null
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
          idempotency_key?: string | null
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
          tracking_url?: string | null
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
          idempotency_key?: string | null
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
          tracking_url?: string | null
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
          blur_data_url: string | null
          created_at: string
          height: number | null
          id: string
          is_primary: boolean
          metadata: Json
          product_id: string
          sort_order: number
          type: string
          url: string
          variant_id: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          blur_data_url?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          product_id: string
          sort_order?: number
          type?: string
          url: string
          variant_id?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          blur_data_url?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_primary?: boolean
          metadata?: Json
          product_id?: string
          sort_order?: number
          type?: string
          url?: string
          variant_id?: string | null
          width?: number | null
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
          inspected_at: string | null
          inspection_notes: string | null
          inspection_passed: boolean | null
          order_id: string
          order_item_id: string
          pickup_address: Json | null
          pickup_otp: string | null
          pickup_scheduled_at: string | null
          reason: string
          reason_detail: string | null
          refund_amount: number | null
          refund_reference: string | null
          replacement_order_id: string | null
          status: string
          stock_restored: boolean
          tracking_number: string | null
          type: string
          updated_at: string
          user_id: string | null
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
          inspected_at?: string | null
          inspection_notes?: string | null
          inspection_passed?: boolean | null
          order_id: string
          order_item_id: string
          pickup_address?: Json | null
          pickup_otp?: string | null
          pickup_scheduled_at?: string | null
          reason: string
          reason_detail?: string | null
          refund_amount?: number | null
          refund_reference?: string | null
          replacement_order_id?: string | null
          status?: string
          stock_restored?: boolean
          tracking_number?: string | null
          type: string
          updated_at?: string
          user_id?: string | null
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
          inspected_at?: string | null
          inspection_notes?: string | null
          inspection_passed?: boolean | null
          order_id?: string
          order_item_id?: string
          pickup_address?: Json | null
          pickup_otp?: string | null
          pickup_scheduled_at?: string | null
          reason?: string
          reason_detail?: string | null
          refund_amount?: number | null
          refund_reference?: string | null
          replacement_order_id?: string | null
          status?: string
          stock_restored?: boolean
          tracking_number?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
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
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          product_id: string | null
          properties: Json
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          product_id?: string | null
          properties?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          product_id?: string | null
          properties?: Json
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          confirmed_at: string | null
          coupon_id: string
          created_at: string
          discount_amount: number
          email: string | null
          expires_at: string
          id: string
          order_id: string
          released_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          confirmed_at?: string | null
          coupon_id: string
          created_at?: string
          discount_amount?: number
          email?: string | null
          expires_at?: string
          id?: string
          order_id: string
          released_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          confirmed_at?: string | null
          coupon_id?: string
          created_at?: string
          discount_amount?: number
          email?: string | null
          expires_at?: string
          id?: string
          order_id?: string
          released_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inventory_reservations: {
        Row: {
          confirmed_at: string | null
          created_at: string
          expires_at: string
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          released_at: string | null
          status: string
          variant_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          released_at?: string | null
          status?: string
          variant_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          released_at?: string | null
          status?: string
          variant_id?: string
        }
        Relationships: []
      }
      loyalty_rewards: {
        Row: {
          applicable_tiers: string[] | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          min_order_amount: number | null
          name: string
          points_required: number
          reward_type: string
          reward_value: number
          updated_at: string
        }
        Insert: {
          applicable_tiers?: string[] | null
          created_at?: string
          description?: string | null
          id: string
          is_active?: boolean
          min_order_amount?: number | null
          name: string
          points_required: number
          reward_type: string
          reward_value?: number
          updated_at?: string
        }
        Update: {
          applicable_tiers?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          min_order_amount?: number | null
          name?: string
          points_required?: number
          reward_type?: string
          reward_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      navbar_items: {
        Row: {
          badge_color: string
          badge_text: string | null
          created_at: string
          href: string
          id: string
          is_active: boolean
          label: string
          parent_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          badge_color?: string
          badge_text?: string | null
          created_at?: string
          href: string
          id?: string
          is_active?: boolean
          label: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          badge_color?: string
          badge_text?: string | null
          created_at?: string
          href?: string
          id?: string
          is_active?: boolean
          label?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          name: string | null
          source: string
          status: string
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          email: string
          id?: string
          name?: string | null
          source?: string
          status?: string
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          id?: string
          name?: string | null
          source?: string
          status?: string
          subscribed_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          channel: string
          content: string | null
          created_at: string
          dedup_key: string | null
          error_message: string | null
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          metadata: Json
          role_target: string
          sent_at: string | null
          status: string
          subject: string | null
          title: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          channel?: string
          content?: string | null
          created_at?: string
          dedup_key?: string | null
          error_message?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          metadata?: Json
          role_target?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          title?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          content?: string | null
          created_at?: string
          dedup_key?: string | null
          error_message?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          metadata?: Json
          role_target?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          title?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_refunds: {
        Row: {
          amount: number
          amount_paise: number
          created_at: string
          currency: string
          error_message: string | null
          gateway: string
          gateway_payment_id: string | null
          gateway_refund_id: string | null
          id: string
          idempotency_key: string | null
          initiated_by: string | null
          inventory_restored: boolean
          metadata: Json
          order_id: string
          processed_at: string | null
          reason: string | null
          restore_inventory: boolean
          speed: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          amount_paise: number
          created_at?: string
          currency?: string
          error_message?: string | null
          gateway?: string
          gateway_payment_id?: string | null
          gateway_refund_id?: string | null
          id?: string
          idempotency_key?: string | null
          initiated_by?: string | null
          inventory_restored?: boolean
          metadata?: Json
          order_id: string
          processed_at?: string | null
          reason?: string | null
          restore_inventory?: boolean
          speed?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_paise?: number
          created_at?: string
          currency?: string
          error_message?: string | null
          gateway?: string
          gateway_payment_id?: string | null
          gateway_refund_id?: string | null
          id?: string
          idempotency_key?: string | null
          initiated_by?: string | null
          inventory_restored?: boolean
          metadata?: Json
          order_id?: string
          processed_at?: string | null
          reason?: string | null
          restore_inventory?: boolean
          speed?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      shipments: {
        Row: {
          awb_code: string | null
          breadth_cm: number | null
          cancelled_at: string | null
          courier_company_id: number | null
          courier_name: string | null
          created_at: string
          etd: string | null
          height_cm: number | null
          id: string
          label_url: string | null
          last_event_at: string | null
          length_cm: number | null
          manifest_url: string | null
          metadata: Json
          order_id: string
          pickup_scheduled_date: string | null
          pickup_status: string
          pickup_token_number: string | null
          provider: string
          raw_status_code: number | null
          raw_status_label: string | null
          scans: Json
          shipment_status: string
          shiprocket_order_id: string | null
          shiprocket_shipment_id: string | null
          tracking_url: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          awb_code?: string | null
          breadth_cm?: number | null
          cancelled_at?: string | null
          courier_company_id?: number | null
          courier_name?: string | null
          created_at?: string
          etd?: string | null
          height_cm?: number | null
          id?: string
          label_url?: string | null
          last_event_at?: string | null
          length_cm?: number | null
          manifest_url?: string | null
          metadata?: Json
          order_id: string
          pickup_scheduled_date?: string | null
          pickup_status?: string
          pickup_token_number?: string | null
          provider?: string
          raw_status_code?: number | null
          raw_status_label?: string | null
          scans?: Json
          shipment_status?: string
          shiprocket_order_id?: string | null
          shiprocket_shipment_id?: string | null
          tracking_url?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          awb_code?: string | null
          breadth_cm?: number | null
          cancelled_at?: string | null
          courier_company_id?: number | null
          courier_name?: string | null
          created_at?: string
          etd?: string | null
          height_cm?: number | null
          id?: string
          label_url?: string | null
          last_event_at?: string | null
          length_cm?: number | null
          manifest_url?: string | null
          metadata?: Json
          order_id?: string
          pickup_scheduled_date?: string | null
          pickup_status?: string
          pickup_token_number?: string | null
          provider?: string
          raw_status_code?: number | null
          raw_status_label?: string | null
          scans?: Json
          shipment_status?: string
          shiprocket_order_id?: string | null
          shiprocket_shipment_id?: string | null
          tracking_url?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      review_helpful_votes: {
        Row: {
          created_at: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          review_id?: string
          user_id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          address: string
          announcement_bar_bg_color: string
          announcement_bar_enabled: boolean
          announcement_bar_link: string
          announcement_bar_text: string
          announcement_bar_text_color: string
          cod_max_amount: number
          contact_email: string
          contact_phone: string
          contact_whatsapp: string
          currency: string
          currency_symbol: string
          extended_settings: Json
          favicon_url: string | null
          free_shipping_threshold: number
          id: string
          logo_url: string | null
          meta_description: string
          meta_title: string
          return_policy_days: number
          site_name: string
          site_tagline: string
          social_facebook: string
          social_instagram: string
          social_whatsapp: string
          social_youtube: string
          updated_at: string
        }
        Insert: {
          address?: string
          announcement_bar_bg_color?: string
          announcement_bar_enabled?: boolean
          announcement_bar_link?: string
          announcement_bar_text?: string
          announcement_bar_text_color?: string
          cod_max_amount?: number
          contact_email?: string
          contact_phone?: string
          contact_whatsapp?: string
          currency?: string
          currency_symbol?: string
          extended_settings?: Json
          favicon_url?: string | null
          free_shipping_threshold?: number
          id?: string
          logo_url?: string | null
          meta_description?: string
          meta_title?: string
          return_policy_days?: number
          site_name?: string
          site_tagline?: string
          social_facebook?: string
          social_instagram?: string
          social_whatsapp?: string
          social_youtube?: string
          updated_at?: string
        }
        Update: {
          address?: string
          announcement_bar_bg_color?: string
          announcement_bar_enabled?: boolean
          announcement_bar_link?: string
          announcement_bar_text?: string
          announcement_bar_text_color?: string
          cod_max_amount?: number
          contact_email?: string
          contact_phone?: string
          contact_whatsapp?: string
          currency?: string
          currency_symbol?: string
          extended_settings?: Json
          favicon_url?: string | null
          free_shipping_threshold?: number
          id?: string
          logo_url?: string | null
          meta_description?: string
          meta_title?: string
          return_policy_days?: number
          site_name?: string
          site_tagline?: string
          social_facebook?: string
          social_instagram?: string
          social_whatsapp?: string
          social_youtube?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          attempts: number
          error_message: string | null
          event_id: string
          event_type: string
          order_id: string | null
          payload: Json
          processed_at: string
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          error_message?: string | null
          event_id: string
          event_type: string
          order_id?: string | null
          payload?: Json
          processed_at?: string
          provider: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          error_message?: string | null
          event_id?: string
          event_type?: string
          order_id?: string | null
          payload?: Json
          processed_at?: string
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_order_inventory: { Args: { p_order_id: string }; Returns: Json }
      complete_return_inspection: {
        Args: { p_return_id: string; p_passed: boolean; p_notes?: string | null }
        Returns: boolean
      }
      get_search_suggestions: {
        Args: { prefix_text: string; limit_count?: number }
        Returns: { suggestion: string; type: string; count: number }[]
      }
      has_admin_access: { Args: Record<string, never>; Returns: boolean }
      has_role: { Args: { allowed_roles: string[] }; Returns: boolean }
      increase_inventory: { Args: { variant_id: string; quantity: number }; Returns: undefined }
      increment_review_helpful: { Args: { review_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      release_expired_inventory_reservations: { Args: Record<string, never>; Returns: number }
      release_order_inventory: { Args: { p_order_id: string }; Returns: number }
      reserve_coupon_for_order: {
        Args: {
          p_code: string
          p_order_id: string
          p_subtotal: number
          p_user_id?: string | null
          p_email?: string | null
          p_ttl_minutes?: number
        }
        Returns: Json
      }
      reserve_order_inventory: {
        Args: { p_order_id: string; p_items: Json; p_ttl_minutes?: number }
        Returns: boolean
      }
      search_products_fulltext: {
        Args: {
          query_text: string
          category_filter?: string | null
          subcategory_filter?: string | null
          min_price?: number | null
          max_price?: number | null
          in_stock_only?: boolean
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_at_price: number | null
          images: Json
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          rank: number
        }[]
      }
      search_products_hybrid: {
        Args: {
          query_text: string
          query_embedding: string
          category_filter?: string | null
          subcategory_filter?: string | null
          min_price?: number | null
          max_price?: number | null
          in_stock_only?: boolean
          fulltext_weight?: number
          semantic_weight?: number
          similarity_threshold?: number
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_at_price: number | null
          images: Json
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          combined_score: number
        }[]
      }
      search_products_semantic: {
        Args: {
          query_embedding: string
          category_filter?: string | null
          subcategory_filter?: string | null
          min_price?: number | null
          max_price?: number | null
          in_stock_only?: boolean
          similarity_threshold?: number
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          compare_at_price: number | null
          images: Json
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          similarity: number
        }[]
      }
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