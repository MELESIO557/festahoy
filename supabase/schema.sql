-- Habilitar extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuarios (extiende auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    city TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'organizer', 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de categorías de eventos
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de negocios/bares/organizadores
CREATE TABLE businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    city TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de eventos
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES businesses(id) NOT NULL,
    category_id UUID REFERENCES categories(id),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    end_time TIME,
    price DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    address TEXT,
    city TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    cover_image_url TEXT,
    images TEXT[], -- array de URLs de imágenes
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    featured BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de artistas
CREATE TABLE artists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    image_url TEXT,
    social_media TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de relación entre eventos y artistas
CREATE TABLE event_artists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
    performance_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(event_id, artist_id)
);

-- Tabla de promociones
CREATE TABLE promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    discount_percentage INTEGER,
    discount_amount DECIMAL(10,2),
    promo_code TEXT UNIQUE,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    terms TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de pagos para promoción de eventos
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) NOT NULL,
    business_id UUID REFERENCES businesses(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_date TIMESTAMP WITH TIME ZONE,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de eventos destacados (para administración)
CREATE TABLE featured_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    featured_from TIMESTAMP WITH TIME ZONE NOT NULL,
    featured_until TIMESTAMP WITH TIME ZONE NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_business ON events(business_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_promotions_event ON promotions(event_id);
CREATE INDEX idx_payments_business ON payments(business_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Crear datos iniciales de categorías
INSERT INTO categories (name, description, icon) VALUES
('Música en vivo', 'Conciertos y presentaciones musicales', '🎵'),
('Electrónica', 'Música electrónica y DJ sets', '🎧'),
('Rock', 'Conciertos de rock y metal', '🎸'),
('Jazz', 'Música jazz y blues', '🎷'),
('Pop', 'Música pop y mainstream', '🎤'),
('Latina', 'Música latina y reguetón', '💃'),
('Hip Hop', 'Hip hop y rap', '🎤'),
('Clásica', 'Música clásica y ópera', '🎻'),
('Fiesta', 'Fiestas y eventos sociales', '🎉'),
('Comedia', 'Shows de comedia y stand-up', '😂');

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Política de seguridad básica (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para businesses
CREATE POLICY "Users can view all businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Business owners can update their business" ON businesses FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Business owners can insert their business" ON businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Políticas para events
CREATE POLICY "Users can view approved events" ON events FOR SELECT USING (status = 'approved' OR auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
CREATE POLICY "Business owners can manage their events" ON events FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id));
CREATE POLICY "Admins can manage all events" ON events FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para promotions
CREATE POLICY "Users can view active promotions" ON promotions FOR SELECT USING (active = true);
CREATE POLICY "Business owners can manage their promotions" ON promotions FOR ALL USING (auth.uid() IN (SELECT owner_id FROM businesses WHERE id = (SELECT business_id FROM events WHERE id = event_id)));

-- Políticas para payments
CREATE POLICY "Business owners can view their payments" ON payments FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "System can insert payments" ON payments FOR INSERT WITH CHECK (true);