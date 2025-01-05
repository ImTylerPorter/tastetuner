<script lang="ts">
	import Section from './Section.svelte';
	import MenuScanner from '$lib/components/menu/MenuScanner.svelte';
	import MenuRecommendations from '$lib/components/menu/MenuRecommendations.svelte';

	let { onScan, onError, recommendations } = $props<{
		onScan: (text: string) => void;
		onError: (message: string) => void;
		recommendations: { matches: any[]; suggestions: any[] } | null;
	}>();
</script>

<div class="space-y-8">
	<Section title="Scan Menu">
		<MenuScanner {onScan} {onError} />
	</Section>

	{#if recommendations}
		<Section title="Recommendations">
			<MenuRecommendations
				matches={recommendations.matches}
				suggestions={recommendations.suggestions}
			/>
		</Section>
	{/if}
</div>
