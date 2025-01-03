import type { Session, SupabaseClient } from '@supabase/supabase-js'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
		}
		interface PageData {
			session: Session | null,
		}
		// interface PageState {}
		// interface Platform {}
		// Extend the Supabase `User` type to include firstName and lastName
		interface User extends SupabaseUser {
			id: string;
			email?: string;
			firstName?: string;
			lastName?: string;
		}
	}
}

export { }