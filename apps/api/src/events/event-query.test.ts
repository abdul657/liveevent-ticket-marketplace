import { describe, expect, it } from "vitest";
import { buildEventListQuery } from "./event-query.js";

describe("buildEventListQuery", () => {
  it("parameterizes search, category, city, and pagination", () => {
    const query = buildEventListQuery({
      q: "jazz' OR 1=1 --",
      category: "Music",
      city: "New York",
      sort: "date",
      page: 2,
      limit: 12,
    });
    expect(query.text).toContain("e.title ILIKE $1");
    expect(query.text).toContain("e.category = $2");
    expect(query.text).toContain("e.city = $3");
    expect(query.text).toContain("ORDER BY e.starts_at ASC");
    expect(query.text).toContain("LIMIT $4");
    expect(query.text).toContain("OFFSET $5");
    expect(query.values).toEqual(["%jazz' OR 1=1 --%", "Music", "New York", 12, 12]);
  });

  it("uses an allow-listed ascending price sort", () => {
    const query = buildEventListQuery({ sort: "price_low", page: 1, limit: 10 });
    expect(query.text).toContain("ORDER BY MIN(tl.price) ASC NULLS LAST");
    expect(query.values).toEqual([10, 0]);
  });

  it("uses an allow-listed descending price sort", () => {
    const query = buildEventListQuery({ sort: "price_high", page: 3, limit: 8 });
    expect(query.text).toContain("ORDER BY MIN(tl.price) DESC NULLS LAST");
    expect(query.values).toEqual([8, 16]);
  });
});
