export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          city: string | null
          role: 'user' | 'organizer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          city?: string | null
          role?: 'user' | 'organizer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          city?: string | null
          role?: 'user' | 'organizer' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          address: string | null
          city: string
          phone: string | null
          email: string | null
          website: string | null
          logo_url: string | null
          cover_image_url: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          address?: string | null
          city: string
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          address?: string | null
          city?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          logo_url?: string | null
          cover_image_url?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          business_id: string
          category_id: string | null
          title: string
          description: string | null
          date: string
          time: string
          end_time: string | null
          price: number
          currency: string
          address: string | null
          city: string
          latitude: number | null
          longitude: number | null
          cover_image_url: string | null
          images: string[] | null
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          featured: boolean
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          category_id?: string | null
          title: string
          description?: string | null
          date: string
          time: string
          end_time?: string | null
          price?: number
          currency?: string
          address?: string | null
          city: string
          latitude?: number | null
          longitude?: number | null
          cover_image_url?: string | null
          images?: string[] | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          featured?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          category_id?: string | null
          title?: string
          description?: string | null
          date?: string
          time?: string
          end_time?: string | null
          price?: number
          currency?: string
          address?: string | null
          city?: string
          latitude?: number | null
          longitude?: number | null
          cover_image_url?: string | null
          images?: string[] | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          featured?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          name: string
          description: string | null
          genre: string | null
          image_url: string | null
          social_media: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          genre?: string | null
          image_url?: string | null
          social_media?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          genre?: string | null
          image_url?: string | null
          social_media?: string | null
          created_at?: string
        }
      }
      event_artists: {
        Row: {
          id: string
          event_id: string
          artist_id: string
          performance_order: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          artist_id: string
          performance_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          artist_id?: string
          performance_order?: number
          created_at?: string
        }
      }
      promotions: {
        Row: {
          id: string
          event_id: string
          title: string
          description: string | null
          discount_percentage: number | null
          discount_amount: number | null
          promo_code: string | null
          valid_from: string | null
          valid_until: string | null
          terms: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          description?: string | null
          discount_percentage?: number | null
          discount_amount?: number | null
          promo_code?: string | null
          valid_from?: string | null
          valid_until?: string | null
          terms?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          description?: string | null
          discount_percentage?: number | null
          discount_amount?: number | null
          promo_code?: string | null
          valid_from?: string | null
          valid_until?: string | null
          terms?: string | null
          active?: boolean
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          event_id: string
          business_id: string
          amount: number
          currency: string
          payment_method: string | null
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_date: string | null
          transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          business_id: string
          amount: number
          currency?: string
          payment_method?: string | null
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_date?: string | null
          transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          business_id?: string
          amount?: number
          currency?: string
          payment_method?: string | null
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_date?: string | null
          transaction_id?: string | null
          created_at?: string
        }
      }
      featured_events: {
        Row: {
          id: string
          event_id: string
          featured_from: string
          featured_until: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          featured_from: string
          featured_until: string
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          featured_from?: string
          featured_until?: string
          position?: number
          created_at?: string
        }
      }
    }
  }
}