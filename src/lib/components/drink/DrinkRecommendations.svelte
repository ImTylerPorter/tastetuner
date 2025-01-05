<script lang="ts">
	import type { AIMenuAnalysisResult } from '$lib/services/aiMenuAnalysis';
	import { ThumbsUp, Star, Plus } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	let { recommendations, firstName = 'you' } = $props<{
		recommendations: AIMenuAnalysisResult['recommendations'];
		firstName?: string;
	}>();

	let savingDrink = $state<string | null>(null);
	let error = $state<string | null>(null);

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

	async function handleSaveDrink(drinkName: string) {
		try {
			savingDrink = drinkName;
			// Find the drink details from the menu analysis
			const drinkDetails = recommendations?.find(
				(r: {
					drinkName: string;
					type?: string;
					style?: string;
					description?: string;
					alcoholContent?: number;
					brand?: string;
					isSeasonal?: boolean;
					isExclusive?: boolean;
				}) => r.drinkName === drinkName
			);
			if (!drinkDetails) {
				throw new Error('Drink details not found');
			}

			const response = await fetch('/api/drinks/save', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					drinkName: drinkDetails.drinkName,
					type: drinkDetails.type || 'beer',
					style: drinkDetails.style,
					description: drinkDetails.description,
					alcoholContent: drinkDetails.alcoholContent,
					brand: drinkDetails.brand,
					isSeasonal: drinkDetails.isSeasonal,
					isExclusive: drinkDetails.isExclusive
				})
			});

			if (!response.ok) {
				throw new Error('Failed to save drink');
			}

			// Show success state
			const button = document.querySelector(`[data-drink="${drinkName}"]`);
			if (button) {
				button.textContent = 'Saved!';
				setTimeout(() => {
					button.textContent = 'Save & Rate';
				}, 2000);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save drink';
		} finally {
			savingDrink = null;
		}
	}
</script>

{#if recommendations && recommendations.length > 0}
	<div class="space-y-4">
		<h2 class="text-xl font-semibold text-white">Recommended for {firstName}</h2>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each recommendations as recommendation}
				<div
					class="relative bg-white/10 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:bg-white/15"
				>
					<div class="p-4">
						<div class="flex items-center justify-between mb-2">
							<h3 class="text-lg font-medium text-white">{recommendation.drinkName}</h3>
							<div class="flex items-center">
								<ThumbsUp class="w-5 h-5 text-highlight" />
								<span class="ml-2 text-sm font-medium text-highlight">
									{getMatchLabel(recommendation.matchScore)}
								</span>
							</div>
						</div>
						<p class="text-sm text-white/70 mb-4">
							{recommendation.reasoning.replace(/user's/g, `${firstName}'s`)}
						</p>
						<button
							type="button"
							class="w-full px-4 py-2 bg-highlight text-black font-medium rounded-lg hover:bg-highlight/90 focus:outline-none focus:ring-2 focus:ring-highlight/50 focus:ring-offset-2 focus:ring-offset-black/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
							onclick={() => handleSaveDrink(recommendation.drinkName)}
							disabled={savingDrink === recommendation.drinkName}
							data-drink={recommendation.drinkName}
						>
							{#if savingDrink === recommendation.drinkName}
								<div
									class="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"
								></div>
								<span>Saving...</span>
							{:else}
								<Plus class="w-5 h-5" />
								<span>Save & Rate</span>
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if error}
	<div
		class="mt-4 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg"
		role="alert"
	>
		<span class="block sm:inline">{error}</span>
	</div>
{/if}
