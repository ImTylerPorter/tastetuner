<script lang="ts">
	import { Camera, User, History, Menu, Settings, Upload } from 'lucide-svelte';
	import { page } from '$app/stores';
	import Logo from '$lib/components/Logo.svelte';
	import MenuScanner from '$lib/components/MenuScanner.svelte';
	import DrinkHistory from '$lib/components/DrinkHistory.svelte';
	import ProfileManager from '$lib/components/ProfileManager.svelte';
	import MenuRecommendations from '$lib/components/MenuRecommendations.svelte';
	import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
	import type { Profile, DrinkHistory as DrinkHistoryType } from '$lib/types';

	let { data } = $props<{
		data: {
			profile: Profile | null;
			history: DrinkHistoryType[];
		};
	}>();

	let { profile, history } = $derived(data);

	// Active section handling
	let activeSection = $state('scan');
	let errorMessage = $state<string | null>(null);
	let recommendations = $state<{ matches: any[]; suggestions: any[] } | null>(null);

	// Handle menu scan results
	async function handleScan(text: string) {
		try {
			recommendations = null;
			const response = await fetch('/api/analyze-menu', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ text })
			});

			if (!response.ok) {
				throw new Error('Failed to analyze menu');
			}

			const data = await response.json();
			recommendations = data.recommendations;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'An error occurred';
		}
	}

	// Handle scan errors
	function handleError(message: string) {
		errorMessage = message;
		recommendations = null;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-500 via-purple-400 to-blue-500">
	<!-- Navigation -->
	<nav class="bg-transparent">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between items-center">
				<div class="flex items-center">
					<div class="flex-shrink-0 w-32">
						<Logo />
					</div>
					<div class="hidden sm:ml-6 sm:flex sm:space-x-6">
						<button
							class={`inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${
								activeSection === 'scan' ? 'text-white' : 'text-white/80 hover:text-white'
							}`}
							onclick={() => (activeSection = 'scan')}
						>
							<Camera class="w-5 h-5 mr-2" />
							Scan Menu
						</button>
						<button
							class={`inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${
								activeSection === 'history' ? 'text-white' : 'text-white/80 hover:text-white'
							}`}
							onclick={() => (activeSection = 'history')}
						>
							<History class="w-5 h-5 mr-2" />
							History
						</button>
						<button
							class={`inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${
								activeSection === 'profile' ? 'text-white' : 'text-white/80 hover:text-white'
							}`}
							onclick={() => (activeSection = 'profile')}
						>
							<User class="w-5 h-5 mr-2" />
							Profile
						</button>
					</div>
				</div>

				<div class="flex items-center space-x-3">
					<div class="flex items-center space-x-2">
						<img
							src={profile.profilePhoto ?? 'https://api.dicebear.com/9.x/thumbs/svg?seed=Amaya'}
							alt={profile.firstName || 'User avatar'}
							class="w-8 h-8 rounded-full"
						/>
						<span class="text-sm font-medium text-white">{profile.firstName}</span>
					</div>
					<button
						type="button"
						class="rounded-full p-2 text-white/80 hover:text-white transition-all duration-200"
					>
						<Settings class="h-6 w-6" />
					</button>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
		<ErrorDisplay message={errorMessage} />

		{#if activeSection === 'scan'}
			<div class="space-y-8">
				<div class="bg-white/5 rounded-3xl">
					<div class="px-8 py-6">
						<h2 class="text-4xl font-semibold mb-8 text-white">Scan Menu</h2>
						<MenuScanner onScan={handleScan} onError={handleError} />
					</div>
				</div>

				{#if recommendations}
					<div class="bg-white/5 rounded-3xl">
						<div class="px-8 py-6">
							<h2 class="text-4xl font-semibold mb-8 text-white">Recommendations</h2>
							<MenuRecommendations
								matches={recommendations.matches}
								suggestions={recommendations.suggestions}
							/>
						</div>
					</div>
				{/if}
			</div>
		{:else if activeSection === 'history'}
			<div class="bg-white/5 rounded-3xl">
				<div class="px-8 py-6">
					<h2 class="text-4xl font-semibold mb-8 text-white">Drink History</h2>
					<DrinkHistory {history} />
				</div>
			</div>
		{:else if activeSection === 'profile'}
			<div class="bg-white/5 rounded-3xl">
				<div class="px-8 py-6">
					<h2 class="text-4xl font-semibold mb-8 text-white">Profile & Preferences</h2>
					{#if profile}
						<ProfileManager {profile} />
					{:else}
						<p class="text-white/70">Loading profile...</p>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>
