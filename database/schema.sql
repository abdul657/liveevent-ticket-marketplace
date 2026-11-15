CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  artist TEXT,
  category TEXT NOT NULL CHECK (category IN ('Music', 'Sports', 'Theater', 'Comedy', 'Festival')),
  description TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  venue_name TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'United States',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  row_label TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
  seller_label TEXT NOT NULL DEFAULT 'Verified seller',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events (starts_at);
CREATE INDEX IF NOT EXISTS idx_events_city_category_date ON events (city, category, starts_at);
CREATE INDEX IF NOT EXISTS idx_events_title_lower ON events (LOWER(title));
CREATE INDEX IF NOT EXISTS idx_events_artist_lower ON events (LOWER(artist));
CREATE INDEX IF NOT EXISTS idx_ticket_listings_event_available
  ON ticket_listings (event_id, quantity_available) WHERE quantity_available > 0;
