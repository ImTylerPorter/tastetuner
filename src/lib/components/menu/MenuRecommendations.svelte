<script lang="ts">
	import { Star, ThumbsUp, Award } from 'lucide-svelte';
	import type { Drink } from '$lib/types';
	import DrinkRating from '$lib/components/drink/DrinkRating.svelte';
	import type { AIMenuAnalysisResult } from '$lib/services/aiMenuAnalysis';

	let { recommendations } = $props<{
		recommendations: NonNullable<AIMenuAnalysisResult['recommendations']> | null;
	}>();

	function formatDrinkType(type: string): string {
		return type.replace('_', ' ');
	}
</script>

<div class="space-y-8">
	{#if recommendations && recommendations.length > 0}
		<div>
			<h3 class="text-lg font-medium text-gray-900 flex items-center">
				<ThumbsUp class="w-5 h-5 mr-2 text-green-500" />
				Recommended Drinks
			</h3>
			<p class="mt-1 text-sm text-gray-500">These drinks match your preferences!</p>
			<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
				{#each recommendations as recommendation}
					<div
						class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-indigo-500"
					>
						<div class="flex items-center justify-between">
							<div>
								<h4 class="text-sm font-medium text-indigo-600">{recommendation.drinkName}</h4>
								<p class="mt-1 text-sm text-gray-500">
									Match Score: {(recommendation.matchScore * 100).toFixed(0)}%
								</p>
							</div>
							<Award class="w-6 h-6 text-yellow-400" />
						</div>
						{#if recommendation.reasoning}
							<p class="mt-2 text-sm text-gray-500">{recommendation.reasoning}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if !recommendations || recommendations.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-500">No drink recommendations found based on the menu text.</p>
			<p class="mt-2 text-sm text-gray-500">
				Try scanning a different section of the menu or adjusting your preferences.
			</p>
		</div>
	{/if}
</div>
