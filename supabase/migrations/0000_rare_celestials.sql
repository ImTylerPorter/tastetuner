CREATE TYPE "public"."beer_style" AS ENUM('ipa', 'pilsner', 'stout', 'porter', 'lager', 'wheat', 'sour', 'pale_ale');--> statement-breakpoint
CREATE TYPE "public"."cocktail_style" AS ENUM('martini', 'margarita', 'old_fashioned', 'mojito', 'negroni', 'sour', 'tiki', 'spritz');--> statement-breakpoint
CREATE TYPE "public"."drink_type" AS ENUM('beer', 'cocktail', 'spirit', 'wine', 'non-alcoholic');--> statement-breakpoint
CREATE TYPE "public"."flavor_preference" AS ENUM('sweet', 'bitter', 'sour', 'spicy', 'umami', 'salty');--> statement-breakpoint
CREATE TYPE "public"."wine_style" AS ENUM('red', 'white', 'rose', 'sparkling', 'dessert', 'fortified');--> statement-breakpoint
CREATE TABLE "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"action" text NOT NULL,
	"label" text,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drink_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"drink_id" uuid,
	"consumed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"rating" integer
);
--> statement-breakpoint
CREATE TABLE "drinks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "drink_type" NOT NULL,
	"description" text,
	"alcohol_content" integer,
	"brand" varchar(100),
	"is_seasonal" boolean DEFAULT false,
	"is_exclusive" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"profile_photo" varchar,
	"favorite_flavors" "flavor_preference"[],
	"favorite_drink_types" "drink_type"[],
	"favorite_beer_styles" "beer_style"[],
	"favorite_cocktail_styles" "cocktail_style"[],
	"favorite_wine_styles" "wine_style"[],
	"dietary_restrictions" text,
	"budget" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"drink_id" uuid,
	"reason" text,
	"recommended_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "restaurant_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"restaurant_id" varchar(100),
	"api_key" varchar(255) NOT NULL,
	"connection_status" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_history" ADD CONSTRAINT "drink_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_history" ADD CONSTRAINT "drink_history_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_drink_id_drinks_id_fk" FOREIGN KEY ("drink_id") REFERENCES "public"."drinks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_connections" ADD CONSTRAINT "restaurant_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;