<script lang="ts">
	import { page } from '$app/stores';
	import NavBar from '$lib/components/navigation/NavBar.svelte';
	import ScanSection from '$lib/components/sections/ScanSection.svelte';
	import HistorySection from '$lib/components/sections/HistorySection.svelte';
	import ProfileSection from '$lib/components/sections/ProfileSection.svelte';
	import ErrorDisplay from '$lib/components/ui/ErrorDisplay.svelte';
	import type { Profile, DrinkHistory as DrinkHistoryType } from '$lib/types';

	let { data } = $props<{
		data: {
			profile: Profile | null;
			history: DrinkHistoryType[];
		};
	}>();

	let { profile, history } = $derived(data);

	let activeSection = $state('scan');
	let errorMessage = $state<string | null>(null);
	let recommendations = $state<{ matches: any[]; suggestions: any[] } | null>(null);

	async function handleScan(text: string) {
		try {
			recommendations = null;
			const response = await fetch('/api/analyze-menu', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			});

			if (!response.ok) throw new Error('Failed to analyze menu');
			const data = await response.json();
			recommendations = data.recommendations;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'An error occurred';
		}
	}

	function handleError(message: string) {
		errorMessage = message;
		recommendations = null;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-500 via-purple-400 to-blue-500">
	<NavBar {activeSection} {profile} />

	<main class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
		<ErrorDisplay message={errorMessage} />

		{#if activeSection === 'scan'}
			<ScanSection {recommendations} onScan={handleScan} onError={handleError} />
		{:else if activeSection === 'history'}
			<HistorySection {history} />
		{:else if activeSection === 'profile'}
			<ProfileSection {profile} />
		{/if}
	</main>
</div>
