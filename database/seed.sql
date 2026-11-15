INSERT INTO events
  (slug, title, artist, category, description, starts_at, venue_name, city, region, image_url)
VALUES
  ('the-midnight-live-nyc', 'The Midnight — Live in NYC', 'The Midnight', 'Music',
   'A synthwave live show with cinematic visuals and fan-favorite tracks.',
   '2027-02-12T20:00:00-05:00', 'Brooklyn Steel', 'Brooklyn', 'NY',
   'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=85'),
  ('ny-knicks-vs-boston', 'New York Knicks vs. Boston Celtics', 'New York Knicks', 'Sports',
   'A classic Eastern Conference rivalry at Madison Square Garden.',
   '2027-01-24T19:30:00-05:00', 'Madison Square Garden', 'New York', 'NY',
   'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=1200&q=85'),
  ('hadestown-broadway', 'Hadestown', 'Hadestown Company', 'Theater',
   'A celebrated musical retelling of the myths of Orpheus and Eurydice.',
   '2027-01-17T19:00:00-05:00', 'Walter Kerr Theatre', 'New York', 'NY',
   'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=85'),
  ('ali-wong-comedy', 'Ali Wong — Live', 'Ali Wong', 'Comedy',
   'An evening of stand-up comedy in an intimate theater setting.',
   '2027-03-05T20:00:00-05:00', 'Beacon Theatre', 'New York', 'NY',
   'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=85'),
  ('jazz-at-blue-note', 'Blue Note Jazz Night', 'Blue Note All-Stars', 'Music',
   'A late-night jazz performance featuring an all-star ensemble.',
   '2027-01-09T21:00:00-05:00', 'Blue Note', 'New York', 'NY',
   'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&q=85'),
  ('brooklyn-indie-fest', 'Brooklyn Indie Festival', 'Multiple Artists', 'Festival',
   'A multi-stage celebration of independent music and emerging artists.',
   '2027-05-22T13:00:00-04:00', 'Prospect Park', 'Brooklyn', 'NY',
   'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=85'),
  ('nets-vs-bulls', 'Brooklyn Nets vs. Chicago Bulls', 'Brooklyn Nets', 'Sports',
   'A night of professional basketball at Barclays Center.',
   '2027-02-03T19:30:00-05:00', 'Barclays Center', 'Brooklyn', 'NY',
   'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=85'),
  ('hamilton-broadway', 'Hamilton', 'Hamilton Company', 'Theater',
   'The story of a founding father told through a groundbreaking score.',
   '2027-02-18T19:00:00-05:00', 'Richard Rodgers Theatre', 'New York', 'NY',
   'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=85'),
  ('comedy-cellar-show', 'Comedy Cellar Showcase', 'Rotating Lineup', 'Comedy',
   'A rotating lineup of stand-up performers at a legendary comedy club.',
   '2027-01-30T19:30:00-05:00', 'Comedy Cellar', 'New York', 'NY',
   'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=1200&q=85'),
  ('summer-sounds-festival', 'Summer Sounds Festival', 'Multiple Artists', 'Festival',
   'An outdoor day of live music, food, and community.',
   '2027-06-19T12:00:00-04:00', 'Randall''s Island Park', 'New York', 'NY',
   'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=85')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO ticket_listings (event_id, section, row_label, price, quantity_available, seller_label)
SELECT e.id, v.section, v.row_label, v.price, v.quantity_available, 'Verified seller'
FROM (VALUES
  ('the-midnight-live-nyc', 'Floor', 'GA', 89.00, 24),
  ('the-midnight-live-nyc', 'Mezzanine', 'B', 64.00, 12),
  ('ny-knicks-vs-boston', 'Section 108', '12', 245.00, 4),
  ('ny-knicks-vs-boston', 'Section 221', '8', 132.00, 10),
  ('hadestown-broadway', 'Orchestra', 'F', 159.00, 6),
  ('hadestown-broadway', 'Mezzanine', 'C', 92.00, 9),
  ('ali-wong-comedy', 'Orchestra', 'J', 118.00, 5),
  ('ali-wong-comedy', 'Balcony', 'A', 76.00, 14),
  ('jazz-at-blue-note', 'Table', 'Main', 55.00, 8),
  ('jazz-at-blue-note', 'Bar', 'Standing', 38.00, 12),
  ('brooklyn-indie-fest', 'General Admission', 'GA', 110.00, 50),
  ('brooklyn-indie-fest', 'VIP', 'VIP', 225.00, 10),
  ('nets-vs-bulls', 'Section 12', '17', 184.00, 6),
  ('nets-vs-bulls', 'Section 206', '4', 98.00, 16),
  ('hamilton-broadway', 'Orchestra', 'K', 209.00, 3),
  ('hamilton-broadway', 'Mezzanine', 'D', 125.00, 8),
  ('comedy-cellar-show', 'General Admission', 'GA', 49.00, 20),
  ('summer-sounds-festival', 'General Admission', 'GA', 95.00, 100)
) AS v(slug, section, row_label, price, quantity_available)
JOIN events e ON e.slug = v.slug
WHERE NOT EXISTS (
  SELECT 1 FROM ticket_listings existing
  WHERE existing.event_id = e.id AND existing.section = v.section
    AND existing.row_label = v.row_label
);
