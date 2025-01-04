ALTER TABLE "public"."auth_users" SET SCHEMA "auth";
--> statement-breakpoint
ALTER TABLE "auth"."auth_users" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "analytics" DROP CONSTRAINT "analytics_user_id_auth_users_id_fk";
--> statement-breakpoint
ALTER TABLE "drink_history" DROP CONSTRAINT "drink_history_user_id_auth_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_auth_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_auth_users_id_fk";
--> statement-breakpoint
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_user_id_auth_users_id_fk";
--> statement-breakpoint
ALTER TABLE "restaurant_connections" DROP CONSTRAINT "restaurant_connections_user_id_auth_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_connections" DROP CONSTRAINT "user_connections_follower_id_auth_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_connections" DROP CONSTRAINT "user_connections_followed_id_auth_users_id_fk";
--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drink_history" ADD CONSTRAINT "drink_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_connections" ADD CONSTRAINT "restaurant_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_followed_id_users_id_fk" FOREIGN KEY ("followed_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."users" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "auth"."users" DROP COLUMN "created_at";