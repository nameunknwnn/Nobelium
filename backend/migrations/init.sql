CREATE TABLE IF NOT EXISTS "USER"(
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    google_access_token TEXT,
    google_refresh_token TEXT
);

ALTER TABLE "USER" ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE "USER" ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
