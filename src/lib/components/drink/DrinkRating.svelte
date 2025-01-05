<script lang="ts">
	import { Star, Plus, Check } from 'lucide-svelte';
	import type { Drink } from '$lib/types';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';

	let { drink } = $props<{ drink: Drink }>();

	let rating = $state<number | null>(null);
	let notes = $state('');
	let showForm = $state(false);
	let success = $state(false);
	let errorMessage = $state<string | null>(null);

	function handleStarClick(value: number) {
		rating = value === rating ? null : value;
	}

	function handleSubmit() {
		showForm = false;
		success = true;
		setTimeout(() => {
			success = false;
		}, 2000);
	}
</script>

<div class="relative">
	{#if success}
		<div
			class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg"
			transition:fade
		>
			<div class="text-green-500 flex items-center">
				<Check class="w-5 h-5 mr-2" />
				<span>Added to history!</span>
			</div>
		</div>
	{/if}

	{#if !showForm}
		<button
			type="button"
			class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			onclick={() => (showForm = true)}
		>
			<Plus class="w-4 h-4 mr-1" />
			Add to History
		</button>
	{:else}
		<form
			action="/api/drink-history"
			method="POST"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						handleSubmit();
					} else if (result.type === 'error') {
						errorMessage = result.error.message;
					}
				};
			}}
			class="space-y-4 p-4 border rounded-lg bg-white shadow-sm"
		>
			<input type="hidden" name="drinkId" value={drink.id} />

			<div>
				<div class="mt-1 flex items-center">
					{#each Array.from({ length: 5 }, (_, i) => i + 1) as value}
						<button
							type="button"
							class="p-1"
							onclick={() => handleStarClick(value)}
							aria-label={`Rate ${value} stars`}
						>
							<Star
								class="w-6 h-6 {value <= (rating || 0)
									? 'text-yellow-400 fill-yellow-400'
									: 'text-gray-300'}"
							/>
						</button>
					{/each}
					<input type="hidden" name="rating" value={rating} />
				</div>
			</div>

			<div>
				<label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
				<div class="mt-1">
					<textarea
						id="notes"
						name="notes"
						bind:value={notes}
						rows="3"
						class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
						placeholder="What did you think?"
					></textarea>
				</div>
			</div>

			<div class="flex justify-end space-x-3">
				<button
					type="button"
					class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					onclick={() => (showForm = false)}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					disabled={rating === null}
				>
					Save
				</button>
			</div>
		</form>
	{/if}
</div>
