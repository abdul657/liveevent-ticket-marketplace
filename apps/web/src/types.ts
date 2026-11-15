export type EventCategory = "Music" | "Sports" | "Theater" | "Comedy" | "Festival";
export type EventSort = "date" | "price_low" | "price_high";

export interface EventSummary {
  id: string;
  slug: string;
  title: string;
  artist: string | null;
  category: EventCategory;
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

export interface EventListResponse {
  data: EventSummary[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface TicketListing {
  id: string;
  section: string;
  rowLabel: string | null;
  price: number;
  quantityAvailable: number;
  sellerLabel: string;
}

export interface EventDetailResponse {
  event: EventSummary;
  listings: TicketListing[];
}
