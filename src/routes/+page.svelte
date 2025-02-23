<script lang="ts">
	import { page } from '$app/stores';
	import type { Page } from '@sveltejs/kit';
	import AuthForm from '$lib/components/auth/AuthForm.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Logo from '$lib/components/ui/Logo.svelte';
	import ProfilePreferences from '$lib/components/profile/ProfilePreferences.svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Profile } from '$lib/types';
	import { userProfile } from '$lib/stores/userProfile';

	let { data } = $props<{
		data: {
			supabase: SupabaseClient;
			profile: Profile | null;
		};
		children: any;
	}>();

	let { supabase, profile } = $derived(data);

	let showPreferences = $state(false);

	$effect(() => {
		if (profile) {
			userProfile.set(profile);
		} else {
			userProfile.set(null);
		}
	});

	async function handleAuth(formData: FormData) {
		try {
			const response = await fetch($page.url.pathname, {
				method: 'POST',
				body: formData
			});
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || 'Authentication failed');
			}

			if (result.status === 200) {
				const {
					data: { user: updatedUser }
				} = await supabase.auth.getUser();

				if (updatedUser?.id) {
					const { data: updatedProfile } = await supabase
						.from('profiles')
						.select('*')
						.eq('id', updatedUser.id)
						.single();

					userProfile.set(updatedProfile);
					if (formData.get('isLogin') === 'false') {
						showPreferences = true;
					} else {
						goto('/');
					}
				}
			}
		} catch (err) {
			if (err instanceof Error) {
				throw err;
			}
			throw new Error('An error occurred while processing your request');
		}
	}
</script>

<div
	class="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col md:flex-row items-center justify-center p-4 md:p-8"
>
	<div class="bg-white rounded-lg shadow-xl flex flex-col md:flex-row w-full max-w-4xl">
		{#if showPreferences}
			<ProfilePreferences />
		{:else}
			<AuthForm onHandleSubmit={handleAuth} />
			<!-- Right side: Logo, Tagline, and Description -->
			<div
				class="w-full md:w-1/2 bg-indigo-600 text-white p-8 rounded-b-lg md:rounded-r-lg md:rounded-bl-none"
			>
				<div class="h-full flex flex-col justify-between">
					<div>
						<div class="mb-6 w-2/3">
							<Logo />
						</div>
						<p class="text-xl font-semibold mb-4">Your Taste, Perfectly Tuned!</p>
						<p class="mb-6">
							TasteTuner is your personal AI-powered drink recommendation assistant, designed to
							fine-tune your drink choices to perfection. Whether you're at a bar, restaurant, or
							browsing a drink menu online, TasteTuner helps you discover the ideal beer or cocktail
							tailored to your unique preferences.
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
