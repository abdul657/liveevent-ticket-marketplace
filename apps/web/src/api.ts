import type { EventDetailResponse, EventListResponse, EventSort } from "./types";

export interface EventSearch {
  q?: string;
  category?: string;
  city?: string;
  sort: EventSort;
  page: number;
  limit: number;
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function searchEvents(filters: EventSearch, signal?: AbortSignal): Promise<EventListResponse> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.city) params.set("city", filters.city);
  params.set("sort", filters.sort);
  params.set("page", String(filters.page));
  params.set("limit", String(filters.limit));
  return readJson<EventListResponse>(await fetch(`/api/events?${params.toString()}`, { signal }));
}

export async function getEvent(slug: string, signal?: AbortSignal): Promise<EventDetailResponse> {
  return readJson<EventDetailResponse>(
    await fetch(`/api/events/${encodeURIComponent(slug)}`, { signal }),
  );
}
