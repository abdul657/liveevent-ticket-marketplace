export type EventSort = "date" | "price_low" | "price_high";

export interface EventFilters {
  q?: string;
  category?: string;
  city?: string;
  sort: EventSort;
  page: number;
  limit: number;
}

export interface BuiltQuery {
  text: string;
  values: Array<string | number>;
}

export function buildEventListQuery(filters: EventFilters): BuiltQuery {
  const values: Array<string | number> = [];
  const conditions = ["e.starts_at >= NOW()"];
  const addValue = (value: string | number): string => {
    values.push(value);
    return `$${values.length}`;
  };

  if (filters.q?.trim()) {
    const placeholder = addValue(`%${filters.q.trim()}%`);
    conditions.push(
      `(e.title ILIKE ${placeholder} OR COALESCE(e.artist, '') ILIKE ${placeholder} OR e.venue_name ILIKE ${placeholder} OR e.city ILIKE ${placeholder})`,
    );
  }
  if (filters.category) conditions.push(`e.category = ${addValue(filters.category)}`);
  if (filters.city) conditions.push(`e.city = ${addValue(filters.city)}`);

  const orderBy: Record<EventSort, string> = {
    date: "e.starts_at ASC",
    price_low: "MIN(tl.price) ASC NULLS LAST, e.starts_at ASC",
    price_high: "MIN(tl.price) DESC NULLS LAST, e.starts_at ASC",
  };
  const limit = addValue(filters.limit);
  const offset = addValue((filters.page - 1) * filters.limit);

  return {
    text: `
      SELECT e.id, e.slug, e.title, e.artist, e.category, e.description,
        e.starts_at, e.venue_name, e.city, e.region, e.country, e.image_url,
        MIN(tl.price)::TEXT AS min_price,
        MAX(tl.price)::TEXT AS max_price,
        COALESCE(SUM(tl.quantity_available), 0)::INTEGER AS available_tickets,
        COUNT(*) OVER()::INTEGER AS total_count
      FROM events e
      LEFT JOIN ticket_listings tl
        ON tl.event_id = e.id AND tl.quantity_available > 0
      WHERE ${conditions.join(" AND ")}
      GROUP BY e.id
      ORDER BY ${orderBy[filters.sort]}
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    values,
  };
}
