<script lang="ts">
	import { Star, ThumbsUp, Award } from 'lucide-svelte';
	import type { Drink } from '$lib/types';
	import DrinkRating from '$lib/components/drink/DrinkRating.svelte';

	let { matches, suggestions } = $props<{
		matches: Drink[];
		suggestions: Drink[];
	}>();

	function formatDrinkType(type: string): string {
		return type.replace('_', ' ');
	}
</script>

<div class="space-y-8">
	{#if matches.length > 0}
		<div>
			<h3 class="text-lg font-medium text-gray-900 flex items-center">
				<ThumbsUp class="w-5 h-5 mr-2 text-green-500" />
				Best Matches
			</h3>
			<p class="mt-1 text-sm text-gray-500">These drinks match your preferences perfectly!</p>
			<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
				{#each matches as drink}
					<div
						class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-indigo-500"
					>
						<div class="flex items-center justify-between">
							<div>
								<h4 class="text-sm font-medium text-indigo-600">{drink.name}</h4>
								<p class="mt-1 text-sm text-gray-500">
									{drink.brand ? `${drink.brand} • ` : ''}{formatDrinkType(drink.type)}
								</p>
								{#if drink.alcoholContent}
									<p class="mt-1 text-xs text-gray-500">{drink.alcoholContent}% ABV</p>
								{/if}
							</div>
							<Award class="w-6 h-6 text-yellow-400" />
						</div>
						{#if drink.description}
							<p class="mt-2 text-sm text-gray-500">{drink.description}</p>
						{/if}
						<div class="mt-4">
							<DrinkRating {drink} />
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if suggestions.length > 0}
		<div>
			<h3 class="text-lg font-medium text-gray-900 flex items-center">
				<Star class="w-5 h-5 mr-2 text-yellow-400" />
				Other Suggestions
			</h3>
			<p class="mt-1 text-sm text-gray-500">
				You might also enjoy these drinks based on your preferences.
			</p>
			<div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
				{#each suggestions as drink}
					<div
						class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-indigo-500"
					>
						<div>
							<h4 class="text-sm font-medium text-indigo-600">{drink.name}</h4>
							<p class="mt-1 text-sm text-gray-500">
								{drink.brand ? `${drink.brand} • ` : ''}{formatDrinkType(drink.type)}
							</p>
							{#if drink.alcoholContent}
								<p class="mt-1 text-xs text-gray-500">{drink.alcoholContent}% ABV</p>
							{/if}
						</div>
						{#if drink.description}
							<p class="mt-2 text-sm text-gray-500">{drink.description}</p>
						{/if}
						<div class="mt-4">
							<DrinkRating {drink} />
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if matches.length === 0 && suggestions.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-500">No drink recommendations found based on the menu text.</p>
			<p class="mt-2 text-sm text-gray-500">
				Try scanning a different section of the menu or adjusting your preferences.
			</p>
		</div>
	{/if}
</div>
