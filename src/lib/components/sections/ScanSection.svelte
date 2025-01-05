<script lang="ts">
	import Section from './Section.svelte';
	import MenuScanner from '$lib/components/menu/MenuScanner.svelte';
	import MenuRecommendations from '$lib/components/menu/MenuRecommendations.svelte';
	import type { AIMenuAnalysisResult } from '$lib/services/aiMenuAnalysis';

	let { onScan, onError, recommendations } = $props<{
		onScan: (result: AIMenuAnalysisResult) => void;
		onError: (message: string) => void;
		recommendations: NonNullable<AIMenuAnalysisResult['recommendations']> | null;
	}>();
</script>

<div class="space-y-8">
	<Section title="Scan Menu">
		<MenuScanner {onScan} {onError} />
	</Section>

	{#if recommendations}
		<Section title="Recommendations">
			<MenuRecommendations {recommendations} />
		</Section>
	{/if}
</div>
