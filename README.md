# FIESTAHOY

Plataforma para descubrir y promocionar eventos, fiestas y conciertos.

## Características del MVP

### Para usuarios:
- Crear cuenta
- Elegir ciudad
- Ver eventos de hoy
- Ver eventos de próximos días
- Buscar por categoría
- Ver fotos, precio, ubicación
- Ver quién se presenta (artistas)
- Ver promociones
- Compartir evento

### Para organizadores/bares:
- Crear perfil de negocio
- Subir fotografías
- Crear eventos
- Poner fecha y hora
- Poner precio
- Publicar promociones
- Indicar artistas
- Pagar para promocionar evento

### Para administradores:
- Panel administrativo
- Aprobar eventos
- Administrar usuarios
- Administrar negocios
- Cobros
- Eventos destacados
- Estadísticas

## Tecnologías

- **Next.js 16** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Supabase** - Base de datos y autenticación
- **Vercel** - Despliegue

## Configuración

### 1. Configurar la base de datos

1. Ve a tu proyecto Supabase: https://pjmugumdtxkedwxazhmn.supabase.co
2. Navega a SQL Editor
3. Crea una "New Query"
4. Copia el contenido del archivo `supabase/schema.sql`
5. Ejecuta el script

### 2. Variables de entorno

El archivo `.env.local` ya está configurado con las credenciales de Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://pjmugumdtxkedwxazhmn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_WE481q6vNfghWOT-8Yk0TQ_6IR_mXyD
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue en Vercel

### 1. Preparar el repositorio

```bash
# Inicializar git (si no está inicializado)
git init
git add .
git commit -m "Initial commit - FIESTAHOY MVP"
```

### 2. Crear usuario administrador inicial

Después de configurar la base de datos, necesitas crear un usuario administrador:

1. Regístrate en la aplicación
2. Ve a tu proyecto Supabase → SQL Editor
3. Ejecuta:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'tu_email@ejemplo.com';
```

### 3. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Crea un nuevo proyecto
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Despliega

### 4. Configurar dominio personal (opcional)

En Vercel puedes configurar un dominio personal para tu aplicación.

## Estructura del proyecto

```
src/
├── app/
│   ├── admin/              # Panel administrativo
│   ├── auth/               # Autenticación (login, registro)
│   ├── dashboard/          # Dashboard principal
│   ├── events/             # Lista y detalle de eventos
│   ├── organizer/          # Panel de organizador
│   └── layout.tsx          # Layout principal
├── components/
│   └── auth/               # Componentes de autenticación
├── lib/
│   └── supabase.ts         # Cliente de Supabase
└── types/
    └── database.ts         # Tipos de TypeScript
```

## Próximos pasos

Para futuras versiones considera:

- Integración real con pasarela de pagos (Stripe)
- Sistema de notificaciones
- Chat entre usuarios
- Valoraciones y reseñas
- Integración con mapas
- App móvil (React Native)
- Sistema de tickets/reservas