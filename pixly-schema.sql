CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  style TEXT NOT NULL DEFAULT 'normal',
  image_url TEXT NOT NULL,
  image_location TEXT,
  camera TEXT
);
