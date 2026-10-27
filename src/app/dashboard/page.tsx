'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const CITIES = [
  'Madrid',
  'Barcelona', 
  'Valencia',
  'Sevilla',
  'Bilbao',
  'Málaga',
  'Zaragoza',
  'Murcia',
  'Palma de Mallorca',
  'Las Palmas'
]

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [userCity, setUserCity] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadUserCity = async () => {
      if (user && supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('city')
          .eq('id', user.id)
          .single()
        
        if (data && !error) {
          setUserCity(data.city)
          if (data.city) {
            setSelectedCity(data.city)
          }
        }
      }
    }
    loadUserCity()
  }, [user])

  const handleCitySelect = async (city: string) => {
    setSelectedCity(city)
    
    // Update user's city in profile
    if (user && supabase) {
      await supabase
        .from('profiles')
        .update({ city })
        .eq('id', user.id)
    }
    
    router.push(`/events?city=${encodeURIComponent(city)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">FIESTAHOY</h1>
              <p className="text-gray-600">Bienvenido, {user.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Cerrar sesión
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {userCity ? `Tu ciudad: ${userCity}` : 'Selecciona tu ciudad'}
            </h2>
            <p className="text-gray-600 mb-6">
              Encuentra los mejores eventos cerca de ti
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedCity === city
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="text-lg font-semibold">{city}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">¿Eres organizador?</h3>
          <p className="text-gray-600 mb-4">
            Crea tu perfil de negocio y empieza a promocionar tus eventos
          </p>
          <button
            onClick={() => router.push('/organizer')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition"
          >
            Convertirse en organizador
          </button>
        </div>
      </div>
    </div>
  )
}