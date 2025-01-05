<script lang="ts">
	import type { AIMenuAnalysisResult } from '$lib/services/aiMenuAnalysis';
	import { ThumbsUp } from 'lucide-svelte';

	let { recommendations, firstName = 'you' } = $props<{
		recommendations: AIMenuAnalysisResult['recommendations'];
		firstName?: string;
	}>();

	function getMatchLabel(score: number): string {
		if (score >= 0.9) return 'Perfect Match';
		if (score >= 0.8) return 'Great Match';
		if (score >= 0.7) return 'Good Match';
		return 'Decent Match';
	}

	function getMatchColor(score: number): string {
		if (score >= 0.9) return 'text-green-600';
		if (score >= 0.8) return 'text-green-500';
		if (score >= 0.7) return 'text-blue-500';
		return 'text-blue-400';
	}
</script>

{#if recommendations && recommendations.length > 0}
	<div class="space-y-4">
		<h2 class="text-xl font-semibold text-gray-900">Recommended for {firstName}</h2>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each recommendations as recommendation}
				<div class="relative bg-white rounded-lg shadow-md overflow-hidden">
					<div class="p-4">
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-lg font-medium text-gray-900">{recommendation.drinkName}</h3>
							<div class="flex items-center">
								<ThumbsUp class="w-5 h-5 {getMatchColor(recommendation.matchScore)}" />
								<span class="ml-2 text-sm font-medium {getMatchColor(recommendation.matchScore)}">
									{getMatchLabel(recommendation.matchScore)}
								</span>
							</div>
						</div>
						<p class="text-sm text-gray-600">
							{recommendation.reasoning.replace(/user's/g, `${firstName}'s`)}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
