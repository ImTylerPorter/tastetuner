CREATE TABLE "user_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"followed_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_followed_id_users_id_fk" FOREIGN KEY ("followed_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;