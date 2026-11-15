import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { z } from "zod";
import { config } from "./config.js";
import { getEventBySlug, listEvents } from "./events/events.repository.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "100kb" }));

const eventSearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.enum(["Music", "Sports", "Theater", "Comedy", "Festival"]).optional(),
  city: z.string().trim().max(80).optional(),
  sort: z.enum(["date", "price_low", "price_high"]).default("date"),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "liveevent-api" });
});

app.get("/api/categories", (_req, res) => {
  res.json({ data: ["Music", "Sports", "Theater", "Comedy", "Festival"] });
});

app.get("/api/events", async (req: Request, res: Response, next: NextFunction) => {
  const parsed = eventSearchSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid search parameters",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }
  try {
    res.json(await listEvents(parsed.data));
  } catch (error) {
    next(error);
  }
});

app.get("/api/events/:slug", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getEventBySlug(req.params.slug);
    if (!result) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Request failed", error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

export default app;
