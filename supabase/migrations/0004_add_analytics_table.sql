CREATE TABLE IF NOT EXISTS "analytics" (
  "id" serial PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES auth.users(id),
  "type" text NOT NULL,
  "category" text NOT NULL,
  "action" text NOT NULL,
  "label" text,
  "metadata" jsonb,
  "timestamp" timestamp NOT NULL DEFAULT now()
);