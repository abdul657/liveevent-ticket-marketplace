import { useEffect, useState, type FormEvent } from "react";
import { getEvent, searchEvents } from "./api";
import type { EventDetailResponse, EventSort, EventSummary } from "./types";

const categories = ["All events", "Music", "Sports", "Theater", "Comedy", "Festival"];
const cities = ["All cities", "New York", "Brooklyn"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
}

function formatPrice(value: number | null) {
  if (value === null) return "Price unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(value);
}

function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="LiveEvent home">
        <span className="brand-mark">L</span>liveevent<span className="brand-period">.</span>
      </a>
      <nav aria-label="Main navigation"><a href="#events">Discover</a><a href="#about">About</a></nav>
      <span className="header-note">FIND YOUR NEXT LIVE MOMENT</span>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer" id="about">
      <a className="brand" href="/"><span className="brand-mark">L</span>liveevent<span className="brand-period">.</span></a>
      <p>Built for the moments that matter.<span>Demo marketplace · No real tickets sold.</span></p>
      <a href="https://github.com/abdul657/liveevent-ticket-marketplace" target="_blank" rel="noreferrer">View source ↗</a>
    </footer>
  );
}

function EventCard({ event, onSelect }: { event: EventSummary; onSelect: (slug: string) => void }) {
  return (
    <article className="event-card">
      <button className="event-image-button" onClick={() => onSelect(event.slug)} aria-label={`View ${event.title}`}>
        {event.imageUrl ? <img className="event-image" src={event.imageUrl} alt="" loading="lazy" /> : <div className="image-placeholder" />}
        <span className="category-tag">{event.category}</span>
      </button>
      <div className="event-card-body">
        <p className="event-date">{formatDate(event.startsAt)}</p>
        <button className="event-title-button" onClick={() => onSelect(event.slug)}>{event.title}</button>
        <p className="event-venue">{event.venueName} · {event.city}</p>
        <div className="event-card-footer">
          <span><small>From</small><strong>{formatPrice(event.minPrice)}</strong></span>
          <span className="availability">{event.availableTickets} tickets</span>
        </div>
      </div>
    </article>
  );
}

function EventDetail({ detail, onBack }: { detail: EventDetailResponse; onBack: () => void }) {
  const { event, listings } = detail;
  return (
    <main className="detail-page">
      <button className="back-button" onClick={onBack}>← Back to events</button>
      <div className="detail-hero">
        {event.imageUrl && <img src={event.imageUrl} alt="" />}
        <div className="detail-overlay" />
        <div className="detail-heading">
          <span className="eyebrow">{event.category} · {formatDate(event.startsAt)}</span>
          <h1>{event.title}</h1>
          <p>{event.venueName} · {event.city}, {event.region}</p>
        </div>
      </div>
      <div className="detail-content">
        <section className="about-event">
          <p className="eyebrow">THE EXPERIENCE</p>
          <h2>Make a night of it.</h2>
          <p>{event.description}</p>
          <div className="event-facts">
            <span>📍 {event.venueName}</span>
            <span>🗓 {formatDate(event.startsAt)}</span>
            <span>🎟 {event.availableTickets} tickets listed</span>
          </div>
        </section>
        <section className="ticket-section">
          <div className="section-heading">
            <div><p className="eyebrow">FIND YOUR SPOT</p><h2>Available tickets</h2></div>
            <span className="muted">{listings.length} offers</span>
          </div>
          {listings.length === 0 ? <p className="empty-state">No ticket offers are listed for this event yet.</p> : (
            <div className="ticket-list">
              {listings.map((listing) => (
                <div className="ticket-row" key={listing.id}>
                  <div><strong>{listing.section}</strong><span>Row {listing.rowLabel ?? "—"} · {listing.sellerLabel}</span></div>
                  <div className="ticket-price"><strong>{formatPrice(listing.price)}</strong><span>{listing.quantityAvailable} available</span></div>
                  <button className="button button-outline" disabled title="Booking is planned for a future milestone">Coming soon</button>
                </div>
              ))}
            </div>
          )}
          <p className="disclaimer">Demo listings only. No tickets are sold and no payment is collected.</p>
        </section>
      </div>
    </main>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [category, setCategory] = useState("All events");
  const [city, setCity] = useState("All cities");
  const [sort, setSort] = useState<EventSort>("date");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<EventDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    searchEvents({
      q: submittedQuery,
      category: category === "All events" ? undefined : category,
      city: city === "All cities" ? undefined : city,
      sort,
      page: 1,
      limit: 12,
    }, controller.signal)
      .then((result) => {
        setEvents(result.data);
        setTotal(result.pagination.total);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [submittedQuery, category, city, sort]);

  useEffect(() => {
    if (!selectedSlug) {
      setDetail(null);
      setDetailError("");
      return;
    }
    const controller = new AbortController();
    setDetail(null);
    setDetailLoading(true);
    setDetailError("");
    getEvent(selectedSlug, controller.signal)
      .then(setDetail)
      .catch((requestError: unknown) => {
        if (requestError instanceof Error && requestError.name !== "AbortError") setDetailError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [selectedSlug]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  }

  function clearFilters() {
    setQuery("");
    setSubmittedQuery("");
    setCategory("All events");
    setCity("All cities");
    setSort("date");
  }

  if (selectedSlug) {
    return (
      <div className="app-shell">
        <SiteHeader />
        {detail ? <EventDetail detail={detail} onBack={() => setSelectedSlug(null)} /> :
          <main className="center-state">
            {detailLoading ? "Loading event details…" : <div className="error-state"><strong>Couldn't load this event.</strong><span>{detailError}</span><button className="button button-outline" onClick={() => setSelectedSlug(null)}>Back to events</button></div>}
          </main>}
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-glow" />
          <div className="hero-content">
            <p className="eyebrow">THE MOMENTS THAT MOVE YOU</p>
            <h1>Go where the<br /><em>energy is.</em></h1>
            <p className="hero-copy">Find the live experiences worth leaving home for.</p>
            <form className="search-panel" onSubmit={submitSearch}>
              <label className="search-input-wrap">
                <span className="field-label">WHAT ARE YOU INTO?</span>
                <span className="search-control"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Artist, team, venue, or event" /></span>
              </label>
              <label className="search-city">
                <span className="field-label">WHERE?</span>
                <select value={city} onChange={(event) => setCity(event.target.value)}>
                  {cities.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <button className="button button-primary search-submit" type="submit">Find events <span>→</span></button>
            </form>
          </div>
          <div className="hero-note"><span className="live-dot" /> YOUR CITY. YOUR SCENE. YOUR NEXT STORY.</div>
        </section>

        <section className="events-section" id="events">
          <div className="section-heading events-heading">
            <div><p className="eyebrow">CURATED FOR YOUR NEXT NIGHT OUT</p><h2>Explore events</h2><p className="section-subtitle">{loading ? "Finding experiences…" : `${total} upcoming experiences to explore`}</p></div>
            <label className="sort-control"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as EventSort)}><option value="date">Soonest</option><option value="price_low">Price: low to high</option><option value="price_high">Price: high to low</option></select></label>
          </div>
          <div className="category-tabs" role="group" aria-label="Filter by event category">
            {categories.map((item) => <button key={item} className={category === item ? "category-tab active" : "category-tab"} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          {(category !== "All events" || city !== "All cities" || submittedQuery) &&
            <div className="filter-summary"><span>Showing filtered results</span><button onClick={clearFilters}>Clear filters ×</button></div>}
          {error && <div className="error-state" role="alert"><strong>We couldn't load events.</strong><span>{error}</span><button className="button button-outline" onClick={clearFilters}>Reset search</button></div>}
          {loading ? <div className="loading-grid">{[1, 2, 3, 4].map((item) => <div className="skeleton-card" key={item} />)}</div> :
            events.length > 0 ? <div className="event-grid">{events.map((event) => <EventCard key={event.id} event={event} onSelect={setSelectedSlug} />)}</div> :
            !error && <div className="empty-state"><span className="empty-icon">✳</span><h3>No events found</h3><p>Try a different search or clear your filters.</p><button className="button button-outline" onClick={clearFilters}>See all events</button></div>}
        </section>
        <section className="bottom-cta"><p className="eyebrow">YOUR NEXT GREAT NIGHT STARTS HERE</p><h2>Less scrolling.<br /><em>More living.</em></h2><p>Discover something unforgettable.</p></section>
      </main>
      <SiteFooter />
    </div>
  );
}
