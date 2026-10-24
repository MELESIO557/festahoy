'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Business {
  id: string
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
}

export default function OrganizerPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [showCreateBusiness, setShowCreateBusiness] = useState(false)
  const [activeTab, setActiveTab] = useState<'business' | 'events'>('business')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    loadBusiness()
  }, [user])

  const loadBusiness = async () => {
    if (user) {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (data && !error) {
        setBusiness(data)
      } else {
        setShowCreateBusiness(true)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!user) return null

  if (showCreateBusiness) {
    return <CreateBusinessForm onSuccess={() => { setShowCreateBusiness(false); loadBusiness() }} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel de Organizador</h1>
            <p className="text-purple-100">Gestiona tu negocio y eventos</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('business')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'business'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Mi Negocio
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'events'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Mis Eventos
          </button>
        </div>

        {activeTab === 'business' && (
          <BusinessProfile business={business} onUpdate={loadBusiness} />
        )}

        {activeTab === 'events' && (
          <EventsManager businessId={business.id} />
        )}
      </div>
    </div>
  )
}

function CreateBusinessForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: 'Madrid',
    phone: '',
    email: '',
    website: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.from('businesses').insert({
        owner_id: user!.id,
        ...formData
      })

      if (error) throw error
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al crear negocio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Crear tu Negocio</h1>
          <p className="text-gray-600 mb-6">Registra tu bar, local o negocio para empezar a crear eventos</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del negocio *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              >
                <option value="Madrid">Madrid</option>
                <option value="Barcelona">Barcelona</option>
                <option value="Valencia">Valencia</option>
                <option value="Sevilla">Sevilla</option>
                <option value="Bilbao">Bilbao</option>
                <option value="Málaga">Málaga</option>
                <option value="Zaragoza">Zaragoza</option>
                <option value="Murcia">Murcia</option>
                <option value="Palma de Mallorca">Palma de Mallorca</option>
                <option value="Las Palmas">Las Palmas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sitio web</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando negocio...' : 'Crear negocio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function BusinessProfile({ business, onUpdate }: { business: Business; onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    name: business.name,
    description: business.description || '',
    address: business.address || '',
    city: business.city,
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('businesses')
        .update(formData)
        .eq('id', business.id)

      if (error) throw error
      onUpdate()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar negocio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Perfil del Negocio</h2>
      
      {business.verified && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg mb-4">
          ✅ Negocio verificado
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            required
          >
            <option value="Madrid">Madrid</option>
            <option value="Barcelona">Barcelona</option>
            <option value="Valencia">Valencia</option>
            <option value="Sevilla">Sevilla</option>
            <option value="Bilbao">Bilbao</option>
            <option value="Málaga">Málaga</option>
            <option value="Zaragoza">Zaragoza</option>
            <option value="Murcia">Murcia</option>
            <option value="Palma de Mallorca">Palma de Mallorca</option>
            <option value="Las Palmas">Las Palmas</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sitio web</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Actualizando...' : 'Actualizar perfil'}
        </button>
      </form>
    </div>
  )
}

function EventsManager({ businessId }: { businessId: string }) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadEvents()
  }, [businessId])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          category:categories(name, icon)
        `)
        .eq('business_id', businessId)
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (showCreateEvent) {
    return <CreateEventForm businessId={businessId} onSuccess={() => { setShowCreateEvent(false); loadEvents() }} onCancel={() => setShowCreateEvent(false)} />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mis Eventos</h2>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
        >
          + Crear Evento
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Cargando eventos...</div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-gray-600 text-lg mb-4">No tienes eventos creados</div>
          <p className="text-gray-500 mb-4">Crea tu primer evento para empezar a promocionarlo</p>
          <button
            onClick={() => setShowCreateEvent(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
          >
            Crear primer evento
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {event.category?.icon && (
                      <span className="text-2xl">{event.category.icon}</span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'approved' ? 'bg-green-100 text-green-700' :
                      event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      event.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.status === 'approved' ? 'Aprobado' :
                       event.status === 'pending' ? 'Pendiente' :
                       event.status === 'rejected' ? 'Rechazado' : 'Cancelado'}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{event.date} - {event.time}</p>
                  <p className="text-gray-600 text-sm">{event.price === 0 ? 'Gratis' : `${event.price} ${event.currency}`}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm text-gray-500">{event.views} vistas</p>
                  <button
                    onClick={() => router.push(`/organizer/promote/${event.id}`)}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-sm hover:bg-purple-200 transition"
                  >
                    🚀 Promocionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateEventForm({ businessId, onSuccess, onCancel }: { businessId: string; onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    end_time: '',
    price: 0,
    currency: 'EUR',
    address: '',
    city: 'Madrid',
    category_id: ''
  })
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon: string | null }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    if (data) setCategories(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.from('events').insert({
        business_id: businessId,
        ...formData,
        status: 'pending'
      })

      if (error) throw error
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Error al crear evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Crear Nuevo Evento</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hora *</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hora de fin</label>
          <input
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
          <select
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            required
          >
            <option value="Madrid">Madrid</option>
            <option value="Barcelona">Barcelona</option>
            <option value="Valencia">Valencia</option>
            <option value="Sevilla">Sevilla</option>
            <option value="Bilbao">Bilbao</option>
            <option value="Málaga">Málaga</option>
            <option value="Zaragoza">Zaragoza</option>
            <option value="Murcia">Murcia</option>
            <option value="Palma de Mallorca">Palma de Mallorca</option>
            <option value="Las Palmas">Las Palmas</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear evento'}
          </button>
        </div>
      </form>
    </div>
  )
}