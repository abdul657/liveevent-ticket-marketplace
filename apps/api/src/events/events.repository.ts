import { pool } from "../db.js";
import { buildEventListQuery, type EventFilters } from "./event-query.js";

export interface EventSummary {
  id: string;
  slug: string;
  title: string;
  artist: string | null;
  category: string;
  description: string;
  startsAt: string;
  venueName: string;
  city: string;
  region: string;
  country: string;
  imageUrl: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  availableTickets: number;
}

interface EventRow {
  id: string;
  slug: string;
  title: string;
  artist: string | null;
  category: string;
  description: string;
  starts_at: Date | string;
  venue_name: string;
  city: string;
  region: string;
  country: string;
  image_url: string | null;
  min_price: string | null;
  max_price: string | null;
  available_tickets: number;
  total_count?: number;
}

function mapEvent(row: EventRow): EventSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    artist: row.artist,
    category: row.category,
    description: row.description,
    startsAt: new Date(row.starts_at).toISOString(),
    venueName: row.venue_name,
    city: row.city,
    region: row.region,
    country: row.country,
    imageUrl: row.image_url,
    minPrice: row.min_price === null ? null : Number(row.min_price),
    maxPrice: row.max_price === null ? null : Number(row.max_price),
    availableTickets: Number(row.available_tickets),
  };
}

export async function listEvents(filters: EventFilters) {
  const query = buildEventListQuery(filters);
  const result = await pool.query<EventRow>(query.text, query.values);
  const total = result.rows[0]?.total_count ?? 0;
  return {
    data: result.rows.map(mapEvent),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export interface TicketListing {
  id: string;
  section: string;
  rowLabel: string | null;
  price: number;
  quantityAvailable: number;
  sellerLabel: string;
}

export async function getEventBySlug(slug: string) {
  const eventResult = await pool.query<EventRow>(
    `SELECT e.id, e.slug, e.title, e.artist, e.category, e.description,
      e.starts_at, e.venue_name, e.city, e.region, e.country, e.image_url,
      MIN(tl.price)::TEXT AS min_price, MAX(tl.price)::TEXT AS max_price,
      COALESCE(SUM(tl.quantity_available), 0)::INTEGER AS available_tickets
     FROM events e
     LEFT JOIN ticket_listings tl ON tl.event_id = e.id AND tl.quantity_available > 0
     WHERE e.slug = $1
     GROUP BY e.id`,
    [slug],
  );
  const row = eventResult.rows[0];
  if (!row) return null;

  const offers = await pool.query<{
    id: string; section: string; row_label: string | null; price: string;
    quantity_available: number; seller_label: string;
  }>(
    `SELECT id, section, row_label, price::TEXT, quantity_available, seller_label
     FROM ticket_listings
     WHERE event_id = $1 AND quantity_available > 0
     ORDER BY price ASC`,
    [row.id],
  );

  const listings: TicketListing[] = offers.rows.map((offer) => ({
    id: offer.id,
    section: offer.section,
    rowLabel: offer.row_label,
    price: Number(offer.price),
    quantityAvailable: offer.quantity_available,
    sellerLabel: offer.seller_label,
  }));
  return { event: mapEvent(row), listings };
}
