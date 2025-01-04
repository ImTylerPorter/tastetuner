ALTER TABLE "analytics" DROP CONSTRAINT "analytics_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "drink_history" DROP CONSTRAINT "drink_history_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "restaurant_connections" DROP CONSTRAINT "restaurant_connections_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_connections" DROP CONSTRAINT "user_connections_follower_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_connections" DROP CONSTRAINT "user_connections_followed_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "drink_history" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "recommendations" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurant_connections" ALTER COLUMN "user_id" SET NOT NULL;