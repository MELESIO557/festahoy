'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  time: string
  price: number
  currency: string
  address: string | null
  city: string
  cover_image_url: string | null
  featured: boolean
  category: {
    name: string
    icon: string | null
  } | null
  business: {
    name: string
  }
}

function EventsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const city = searchParams.get('city') || 'Madrid'
  const [events, setEvents] = useState<Event[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'today' | 'upcoming'>('today')
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon: string | null }>>([])

  useEffect(() => {
    loadCategories()
    loadEvents()
    loadFeaturedEvents()
  }, [city, selectedCategory, viewMode])

  const loadCategories = async () => {
    if (!supabase) return
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const loadFeaturedEvents = async () => {
    if (!supabase) return
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('featured_events')
        .select(`
          event:events(
            *,
            category:categories(name, icon),
            business:businesses(name)
          )
        `)
        .lte('featured_from', now)
        .gte('featured_until', now)
        .order('position', { ascending: true })

      if (error) throw error
      
      const events = data?.map((f: any) => ({
        ...f.event,
        featured: true
      })).filter((e: any) => e.city === city && e.status === 'approved') || []
      
      setFeaturedEvents(events)
    } catch (error) {
      console.error('Error loading featured events:', error)
    }
  }

  const loadEvents = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      let query = supabase
        .from('events')
        .select(`
          *,
          category:categories(name, icon),
          business:businesses(name)
        `)
        .eq('city', city)
        .eq('status', 'approved')

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory)
      }

      if (viewMode === 'today') {
        query = query.eq('date', today)
      } else {
        query = query.gte('date', today)
      }

      const { data, error } = await query.order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Gratis'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Eventos en {city}</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              Cambiar ciudad
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode('today')}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'today'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setViewMode('upcoming')}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'upcoming'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Próximos días
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                !selectedCategory
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedCategory === category.id
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-3xl">⭐</span> Eventos Destacados
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow border-2 border-purple-200"
                >
                  {event.cover_image_url ? (
                    <img
                      src={event.cover_image_url}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white text-4xl">🎉</span>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                        ⭐ DESTACADO
                      </span>
                      {event.category?.icon && (
                        <span className="text-2xl">{event.category.icon}</span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {event.description || 'Sin descripción'}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.business.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span className="font-semibold text-green-600">
                          {formatPrice(event.price, event.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Events */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {viewMode === 'today' ? 'Eventos de Hoy' : 'Próximos Eventos'}
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Cargando eventos...</div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg mb-4">
              {viewMode === 'today' ? 'No hay eventos hoy' : 'No hay eventos próximos'}
            </div>
            <p className="text-gray-500">
              {selectedCategory ? 'Intenta con otra categoría' : 'Vuelve más tarde'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                {event.cover_image_url ? (
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <span className="text-white text-4xl">🎉</span>
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {event.category?.icon && (
                      <span className="text-2xl">{event.category.icon}</span>
                    )}
                    <span className="text-sm text-purple-600 font-medium">
                      {event.category?.name || 'General'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {event.description || 'Sin descripción'}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🕐</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.business.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span className="font-semibold text-green-600">
                        {formatPrice(event.price, event.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-600">Cargando...</div></div>}>
      <EventsContent />
    </Suspense>
  )
}