<script lang="ts">
	import '../app.css';
	import type {
		Session,
		User,
		SupabaseClient,
		AuthSession,
		AuthChangeEvent
	} from '@supabase/supabase-js';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	let { data, children } = $props<{
		data: {
			session: Session | null;
			supabase: SupabaseClient;
			user: User | null;
		};
		children: any;
	}>();

	let { session, supabase } = $derived(data);

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange(
			(event: AuthChangeEvent, newSession: AuthSession | null) => {
				if (newSession?.expires_at !== session?.expires_at) {
					invalidate('supabase:auth');
				}
			}
		);

		return () => data.subscription.unsubscribe();
	});
</script>

{@render children()}
