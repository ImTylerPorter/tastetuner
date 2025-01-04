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

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex">
					<div class="flex flex-shrink-0 items-center w-32">
						<Logo />
					</div>
					<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
						<button
							class="inline-flex items-center px-1 pt-1 text-sm font-medium {activeSection ===
							'scan'
								? 'border-indigo-500 text-gray-900 border-b-2'
								: 'text-gray-500 hover:border-gray-300 hover:text-gray-700 border-b-2 border-transparent'}"
							onclick={() => (activeSection = 'scan')}
						>
							<Camera class="w-5 h-5 mr-1" />
							Scan Menu
						</button>
						<button
							class="inline-flex items-center px-1 pt-1 text-sm font-medium {activeSection ===
							'history'
								? 'border-indigo-500 text-gray-900 border-b-2'
								: 'text-gray-500 hover:border-gray-300 hover:text-gray-700 border-b-2 border-transparent'}"
							onclick={() => (activeSection = 'history')}
						>
							<History class="w-5 h-5 mr-1" />
							History
						</button>
						<button
							class="inline-flex items-center px-1 pt-1 text-sm font-medium {activeSection ===
							'profile'
								? 'border-indigo-500 text-gray-900 border-b-2'
								: 'text-gray-500 hover:border-gray-300 hover:text-gray-700 border-b-2 border-transparent'}"
							onclick={() => (activeSection = 'profile')}
						>
							<User class="w-5 h-5 mr-1" />
							Profile
						</button>
					</div>
				</div>
				<div class="flex items-center">
					<button
						type="button"
						class="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
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
				<div class="bg-white shadow sm:rounded-lg">
					<div class="px-4 py-5 sm:p-6">
						<h2 class="text-xl font-semibold mb-4">Scan Menu</h2>
						<MenuScanner onScan={handleScan} onError={handleError} />
					</div>
				</div>

				{#if recommendations}
					<div class="bg-white shadow sm:rounded-lg">
						<div class="px-4 py-5 sm:p-6">
							<h2 class="text-xl font-semibold mb-4">Recommendations</h2>
							<MenuRecommendations
								matches={recommendations.matches}
								suggestions={recommendations.suggestions}
							/>
						</div>
					</div>
				{/if}
			</div>
		{:else if activeSection === 'history'}
			<div class="bg-white shadow sm:rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<h2 class="text-xl font-semibold mb-4">Drink History</h2>
					<DrinkHistory {history} />
				</div>
			</div>
		{:else if activeSection === 'profile'}
			<div class="bg-white shadow sm:rounded-lg">
				<div class="px-4 py-5 sm:p-6">
					<h2 class="text-xl font-semibold mb-4">Profile & Preferences</h2>
					{#if profile}
						<ProfileManager {profile} />
					{:else}
						<p class="text-gray-500">Loading profile...</p>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>
