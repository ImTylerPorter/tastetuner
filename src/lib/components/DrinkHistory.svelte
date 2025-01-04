<script lang="ts">
	import { Star, Filter } from 'lucide-svelte';
	import type { DrinkHistory } from '$lib/types';
	import { drinkType } from '$lib/db/schema';

	let { history } = $props<{ history: DrinkHistory[] }>();

	let selectedType = $state<string>('all');
	let selectedRating = $state<number | null>(null);
	let sortBy = $state<'date' | 'rating'>('date');

	let filteredHistory = $derived(
		history
			.filter((item: DrinkHistory) => {
				if (selectedType !== 'all' && item.drink.type !== selectedType) return false;
				if (selectedRating !== null && item.rating !== selectedRating) return false;
				return true;
			})
			.sort((a: DrinkHistory, b: DrinkHistory) => {
				if (sortBy === 'date') {
					return new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime();
				}
				return (b.rating || 0) - (a.rating || 0);
			})
	);

	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	}

	function getRatingStars(rating: number | null) {
		return Array.from({ length: 5 }, (_, i) => ({
			filled: i < (rating || 0)
		}));
	}
</script>

<div class="space-y-6">
	<!-- Filters -->
	<div class="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-lg">
		<div>
			<label for="type-filter" class="block text-sm font-medium text-gray-700">Drink Type</label>
			<select
				id="type-filter"
				bind:value={selectedType}
				class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
			>
				<option value="all">All Types</option>
				{#each drinkType.enumValues as type}
					<option value={type}>{type.replace('_', ' ')}</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="rating-filter" class="block text-sm font-medium text-gray-700">Rating</label>
			<select
				id="rating-filter"
				bind:value={selectedRating}
				class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
			>
				<option value={null}>All Ratings</option>
				{#each Array.from({ length: 5 }, (_, i) => i + 1) as rating}
					<option value={rating}>{rating} Stars</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="sort-by" class="block text-sm font-medium text-gray-700">Sort By</label>
			<select
				id="sort-by"
				bind:value={sortBy}
				class="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
			>
				<option value="date">Date</option>
				<option value="rating">Rating</option>
			</select>
		</div>
	</div>

	<!-- History List -->
	{#if filteredHistory.length === 0}
		<div class="text-center py-12">
			<p class="text-gray-500">No drink history found with the selected filters.</p>
		</div>
	{:else}
		<div class="bg-white shadow overflow-hidden sm:rounded-md">
			<ul class="divide-y divide-gray-200">
				{#each filteredHistory as item}
					<li>
						<div class="px-4 py-4 sm:px-6">
							<div class="flex items-center justify-between">
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-indigo-600 truncate">{item.drink.name}</p>
									<p class="mt-1 flex items-center text-sm text-gray-500">
										<span class="truncate">{item.drink.brand || 'Unknown Brand'}</span>
										<span class="mx-2">•</span>
										<span>{item.drink.type.replace('_', ' ')}</span>
									</p>
								</div>
								<div class="ml-4 flex-shrink-0">
									<div class="flex items-center">
										{#each getRatingStars(item.rating) as star}
											<Star
												class="w-4 h-4 {star.filled
													? 'text-yellow-400 fill-yellow-400'
													: 'text-gray-300'}"
											/>
										{/each}
									</div>
									<p class="mt-1 text-sm text-gray-500 text-right">
										{formatDate(item.consumedAt)}
									</p>
								</div>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
