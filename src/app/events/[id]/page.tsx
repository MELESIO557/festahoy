'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'

interface EventDetail {
  id: string
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
  category: {
    name: string
    icon: string | null
  } | null
  business: {
    name: string
    address: string | null
    phone: string | null
  }
  artists: Array<{
    name: string
    description: string | null
    genre: string | null
    image_url: string | null
  }>
  promotions: Array<{
    title: string
    description: string | null
    discount_percentage: number | null
    discount_amount: number | null
    promo_code: string | null
    valid_until: string | null
  }>
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    loadEvent()
  }, [params.id])

  const loadEvent = async () => {
    setLoading(true)
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          category:categories(name, icon),
          business:businesses(name, address, phone)
        `)
        .eq('id', params.id)
        .single()

      if (eventError) throw eventError

      // Load artists
      const { data: artistsData } = await supabase
        .from('event_artists')
        .select(`
          artist:artists(name, description, genre, image_url)
        `)
        .eq('event_id', params.id)

      // Load promotions
      const { data: promotionsData } = await supabase
        .from('promotions')
        .select('*')
        .eq('event_id', params.id)
        .eq('active', true)

      // Increment view count
      await supabase
        .from('events')
        .update({ views: (eventData?.views || 0) + 1 })
        .eq('id', params.id)

      setEvent({
        ...eventData,
        artists: artistsData?.map(a => a.artist).filter(Boolean) || [],
        promotions: promotionsData || []
      })
    } catch (error) {
      console.error('Error loading event:', error)
      router.push('/events')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description || undefined,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Enlace copiado al portapapeles')
    }
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

  const allImages = event?.cover_image_url 
    ? [event.cover_image_url, ...(event.images || [])]
    : event?.images || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Cargando evento...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Evento no encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image gallery */}
      {allImages.length > 0 && (
        <div className="relative">
          <img
            src={allImages[currentImageIndex]}
            alt={event.title}
            className="w-full h-96 object-cover"
          />
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 bg-white/80 hover:bg-white px-4 py-2 rounded-lg transition"
          >
            ← Volver
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {event.category?.icon && (
                  <span className="text-3xl">{event.category.icon}</span>
                )}
                <span className="text-purple-600 font-medium">
                  {event.category?.name || 'General'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {event.title}
              </h1>
            </div>
            <button
              onClick={handleShare}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Compartir
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            {event.description || 'Sin descripción'}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <div>
                <div className="text-gray-500">Fecha</div>
                <div className="font-semibold">{formatDate(event.date)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕐</span>
              <div>
                <div className="text-gray-500">Hora</div>
                <div className="font-semibold">
                  {event.time}
                  {event.end_time && ` - ${event.end_time}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <div>
                <div className="text-gray-500">Precio</div>
                <div className="font-semibold text-green-600">
                  {formatPrice(event.price, event.currency)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <div>
                <div className="text-gray-500">Ubicación</div>
                <div className="font-semibold">{event.city}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        {(event.address || event.business.address) && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📍 Ubicación</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <strong>{event.business.name}</strong>
              </p>
              {event.address && (
                <p className="text-gray-600">{event.address}</p>
              )}
              {event.business.address && !event.address && (
                <p className="text-gray-600">{event.business.address}</p>
              )}
              {event.business.phone && (
                <p className="text-gray-600">📞 {event.business.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Artists */}
        {event.artists.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🎤 Artistas</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {event.artists.map((artist, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {artist.image_url ? (
                    <img
                      src={artist.image_url}
                      alt={artist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center">
                      <span className="text-2xl">🎤</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-800">{artist.name}</h3>
                    {artist.genre && (
                      <p className="text-sm text-purple-600">{artist.genre}</p>
                    )}
                    {artist.description && (
                      <p className="text-sm text-gray-600">{artist.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promotions */}
        {event.promotions.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🎁 Promociones</h2>
            <div className="space-y-4">
              {event.promotions.map((promo, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-gray-800 mb-2">{promo.title}</h3>
                  {promo.description && (
                    <p className="text-gray-600 mb-2">{promo.description}</p>
                  )}
                  <div className="flex gap-4 text-sm">
                    {promo.discount_percentage && (
                      <span className="text-green-600 font-semibold">
                        -{promo.discount_percentage}% descuento
                      </span>
                    )}
                    {promo.discount_amount && (
                      <span className="text-green-600 font-semibold">
                        -{formatPrice(promo.discount_amount, event.currency)}
                      </span>
                    )}
                    {promo.promo_code && (
                      <span className="text-purple-600 font-semibold">
                        Código: {promo.promo_code}
                      </span>
                    )}
                  </div>
                  {promo.valid_until && (
                    <p className="text-xs text-gray-500 mt-2">
                      Válido hasta: {new Date(promo.valid_until).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional images */}
        {event.images && event.images.length > 1 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📸 Galería</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {event.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${event.title} - Foto ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                  onClick={() => setCurrentImageIndex(index + 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}