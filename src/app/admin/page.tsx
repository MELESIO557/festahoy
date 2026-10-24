'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AdminStats {
  totalUsers: number
  totalBusinesses: number
  totalEvents: number
  pendingEvents: number
  totalRevenue: number
  activePromotions: number
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'users' | 'businesses' | 'payments'>('dashboard')
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [user])

  useEffect(() => {
    if (isAdmin) {
      loadStats()
    }
  }, [isAdmin, activeTab])

  const checkAdminAccess = async () => {
    if (!loading && user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (data?.role === 'admin') {
        setIsAdmin(true)
      } else {
        router.push('/dashboard')
      }
    }
  }

  const loadStats = async () => {
    try {
      const [usersCount, businessesCount, eventsCount, pendingEventsCount, paymentsData, featuredCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payments').select('amount').eq('payment_status', 'completed'),
        supabase.from('featured_events').select('id', { count: 'exact', head: true }).gt('featured_until', new Date().toISOString())
      ])

      const totalRevenue = paymentsData.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

      setStats({
        totalUsers: usersCount.count || 0,
        totalBusinesses: businessesCount.count || 0,
        totalEvents: eventsCount.count || 0,
        pendingEvents: pendingEventsCount.count || 0,
        totalRevenue,
        activePromotions: featuredCount.count || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Acceso no autorizado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Panel Administrativo</h1>
            <p className="text-purple-100">Gestión de FIESTAHOY</p>
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
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'events'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Eventos
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'businesses'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Negocios
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'payments'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cobros
          </button>
        </div>

        {activeTab === 'dashboard' && <AdminDashboard stats={stats} />}
        {activeTab === 'events' && <EventsManagement />}
        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'businesses' && <BusinessesManagement />}
        {activeTab === 'payments' && <PaymentsManagement />}
      </div>
    </div>
  )
}

function AdminDashboard({ stats }: { stats: AdminStats | null }) {
  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600">Cargando estadísticas...</div>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <StatCard
        title="Usuarios Totales"
        value={stats.totalUsers}
        icon="👥"
        color="from-blue-500 to-blue-600"
      />
      <StatCard
        title="Negocios Registrados"
        value={stats.totalBusinesses}
        icon="🏢"
        color="from-green-500 to-green-600"
      />
      <StatCard
        title="Eventos Totales"
        value={stats.totalEvents}
        icon="🎉"
        color="from-purple-500 to-purple-600"
      />
      <StatCard
        title="Eventos Pendientes"
        value={stats.pendingEvents}
        icon="⏳"
        color="from-yellow-500 to-yellow-600"
      />
      <StatCard
        title="Ingresos Totales"
        value={`${stats.totalRevenue.toFixed(2)}€`}
        icon="💰"
        color="from-pink-500 to-pink-600"
      />
      <StatCard
        title="Promociones Activas"
        value={stats.activePromotions}
        icon="🚀"
        color="from-indigo-500 to-indigo-600"
      />
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-md p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-4xl">{icon}</span>
        <div className="text-3xl font-bold">{value}</div>
      </div>
      <div className="text-lg font-medium">{title}</div>
    </div>
  )
}

function EventsManagement() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  useEffect(() => {
    loadEvents()
  }, [filter])

  const loadEvents = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          category:categories(name, icon),
          business:businesses(name)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'approved' })
        .eq('id', eventId)

      if (error) throw error
      loadEvents()
    } catch (error) {
      console.error('Error approving event:', error)
    }
  }

  const handleReject = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'rejected' })
        .eq('id', eventId)

      if (error) throw error
      loadEvents()
    } catch (error) {
      console.error('Error rejecting event:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Eventos</h2>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendientes' : status === 'approved' ? 'Aprobados' : 'Rechazados'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Cargando eventos...</div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-gray-600">No hay eventos</div>
        </div>
      ) : (
        <div className="space-y-4">
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
                  <p className="text-gray-600 text-sm mb-2">{event.business?.name || 'Negocio desconocido'}</p>
                  <p className="text-gray-600 text-sm">{event.date} - {event.time}</p>
                </div>
                {event.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(event.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(event.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UsersManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      loadUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Cargando usuarios...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-gray-600">No hay usuarios</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.full_name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="user">Usuario</option>
                      <option value="organizer">Organizador</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.city || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button className="text-purple-600 hover:text-purple-700">Ver detalles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function BusinessesManagement() {
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          owner:profiles(email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBusinesses(data || [])
    } catch (error) {
      console.error('Error loading businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (businessId: string) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ verified: true })
        .eq('id', businessId)

      if (error) throw error
      loadBusinesses()
    } catch (error) {
      console.error('Error verifying business:', error)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Negocios</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Cargando negocios...</div>
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-gray-600">No hay negocios</div>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((business) => (
            <div key={business.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{business.name}</h3>
                    {business.verified ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">✓ Verificado</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">⏳ Pendiente</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">Propietario: {business.owner?.email || 'Desconocido'}</p>
                  <p className="text-gray-600 text-sm">{business.city}</p>
                  {business.address && <p className="text-gray-600 text-sm">{business.address}</p>}
                </div>
                {!business.verified && (
                  <button
                    onClick={() => handleVerify(business.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                  >
                    Verificar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PaymentsManagement() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          event:events(title),
          business:businesses(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Cobros</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-600">Cargando pagos...</div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-gray-600">No hay pagos registrados</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negocio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.event?.title || 'Desconocido'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.business?.name || 'Desconocido'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{payment.amount.toFixed(2)} {payment.currency}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.payment_status === 'completed' ? 'bg-green-100 text-green-700' :
                      payment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      payment.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payment.payment_status === 'completed' ? 'Completado' :
                       payment.payment_status === 'pending' ? 'Pendiente' :
                       payment.payment_status === 'failed' ? 'Fallido' : 'Reembolsado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('es-ES') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}