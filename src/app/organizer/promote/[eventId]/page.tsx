'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'

interface Event {
  id: string
  title: string
  status: string
  current_promotion: {
    id: string
    featured_from: string
    featured_until: string
  } | null
}

const PROMOTION_PACKAGES = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Destacado por 3 días',
    price: 29.99,
    duration: 3,
    features: ['Aparición en destacados', 'Mayor visibilidad', 'Soporte básico']
  },
  {
    id: 'standard',
    name: 'Estándar',
    description: 'Destacado por 7 días',
    price: 49.99,
    duration: 7,
    features: ['Aparición en destacados', 'Mayor visibilidad', 'Soporte prioritario', 'Estadísticas básicas']
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Destacado por 14 días',
    price: 79.99,
    duration: 14,
    features: ['Aparición en destacados', 'Máxima visibilidad', 'Soporte 24/7', 'Estadísticas detalladas', 'Badge premium']
  }
]

export default function PromoteEventPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEvent()
  }, [params.eventId])

  const loadEvent = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          current_promotion:featured_events(id, featured_from, featured_until)
        `)
        .eq('id', params.eventId)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error) {
      console.error('Error loading event:', error)
      router.push('/organizer')
    } finally {
      setLoading(false)
    }
  }

  const handlePromote = async () => {
    if (!selectedPackage || !event) return

    setProcessingPayment(true)
    setError('')

    try {
      const pkg = PROMOTION_PACKAGES.find(p => p.id === selectedPackage)
      if (!pkg) throw new Error('Paquete no encontrado')

      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + pkg.duration)

      // Create payment record
      const { error: paymentError } = await supabase.from('payments').insert({
        event_id: event.id,
        business_id: (await supabase.from('events').select('business_id').eq('id', event.id).single()).data?.business_id,
        amount: pkg.price,
        currency: 'EUR',
        payment_status: 'completed',
        payment_date: new Date().toISOString(),
        transaction_id: `promo_${event.id}_${Date.now()}`
      })

      if (paymentError) throw paymentError

      // Create featured event
      const { error: featuredError } = await supabase.from('featured_events').insert({
        event_id: event.id,
        featured_from: startDate.toISOString(),
        featured_until: endDate.toISOString(),
        position: 0
      })

      if (featuredError) throw featuredError

      // Update event status to approved if it was pending
      if (event.status === 'pending') {
        await supabase.from('events').update({ status: 'approved' }).eq('id', event.id)
      }

      alert('¡Evento promocionado exitosamente!')
      router.push('/organizer')
    } catch (err: any) {
      setError(err.message || 'Error al procesar la promoción')
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Cargando...</div>
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
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/organizer')}
            className="mb-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition inline-block"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold mb-2">Promocionar Evento</h1>
          <p className="text-purple-100">{event.title}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {event.current_promotion && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            ⚠️ Este evento ya tiene una promoción activa hasta el{' '}
            {new Date(event.current_promotion.featured_until).toLocaleDateString('es-ES')}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Selecciona un paquete de promoción</h2>
          <p className="text-gray-600">Aumenta la visibilidad de tu evento y llega a más usuarios</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {PROMOTION_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all ${
                selectedPackage === pkg.id
                  ? 'ring-2 ring-purple-500 transform scale-105'
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{pkg.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                <div className="text-3xl font-bold text-purple-600">
                  {pkg.price.toFixed(2)}€
                </div>
                <p className="text-sm text-gray-500">{pkg.duration} días</p>
              </div>

              <ul className="space-y-2 mb-4">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  selectedPackage === pkg.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {selectedPackage === pkg.id ? 'Seleccionado' : 'Seleccionar'}
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push('/organizer')}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handlePromote}
            disabled={!selectedPackage || processingPayment || !!event.current_promotion}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processingPayment ? 'Procesando...' : 'Pagar y promocionar'}
          </button>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
          <p className="text-sm">
            ℹ️ <strong>Nota:</strong> Esta es una versión de demostración. En producción, se integrará con un sistema de pagos real como Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}