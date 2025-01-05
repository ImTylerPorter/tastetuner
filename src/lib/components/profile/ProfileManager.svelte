<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { Profile } from '$lib/types';
	import { drinkType, flavorPreference, beerStyle, cocktailStyle, wineStyle } from '$lib/db/schema';
	import ErrorDisplay from '$lib/components/ui/ErrorDisplay.svelte';
	import { slide } from 'svelte/transition';

	let { profile } = $props<{ profile: Profile }>();

	let favoriteFlavors = $state<string[]>(profile.favoriteFlavors || []);
	let favoriteDrinkTypes = $state<string[]>(profile.favoriteDrinkTypes || []);
	let favoriteBeerStyles = $state<string[]>(profile.favoriteBeerStyles || []);
	let favoriteCocktailStyles = $state<string[]>(profile.favoriteCocktailStyles || []);
	let favoriteWineStyles = $state<string[]>(profile.favoriteWineStyles || []);
	let budget = $state<number | null>(profile.budget);
	let dietaryRestrictions = $state<string>(profile.dietaryRestrictions || '');
	let errorMessage = $state<string | null>(null);

	let showBeerStyles = $derived(favoriteDrinkTypes.includes('beer'));
	let showCocktailStyles = $derived(favoriteDrinkTypes.includes('cocktail'));
	let showWineStyles = $derived(favoriteDrinkTypes.includes('wine'));

	function handleFlavorToggle(flavor: string) {
		const index = favoriteFlavors.indexOf(flavor);
		if (index === -1) {
			favoriteFlavors = [...favoriteFlavors, flavor];
		} else {
			favoriteFlavors = favoriteFlavors.filter((f) => f !== flavor);
		}
	}
</script>

<div class="max-w-2xl mx-auto">
	<form
		action="/preferences?/update"
		method="POST"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					goto('/dashboard');
				} else if (result.type === 'error') {
					errorMessage = result.error.message;
				}
			};
		}}
		class="space-y-6"
	>
		<ErrorDisplay message={errorMessage} />

		<div>
			<h3 class="text-lg font-medium text-gray-900">Flavor Preferences</h3>
			<p class="mt-1 text-sm text-gray-500">
				Select your preferred flavors in order of preference.
			</p>
			<div class="mt-4 grid grid-cols-2 gap-4">
				{#each flavorPreference.enumValues as flavor}
					<label
						class="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
						class:ring-2={favoriteFlavors.includes(flavor)}
						class:ring-indigo-500={favoriteFlavors.includes(flavor)}
					>
						<input
							type="checkbox"
							name="favoriteFlavors"
							value={flavor}
							checked={favoriteFlavors.includes(flavor)}
							onchange={() => handleFlavorToggle(flavor)}
							class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
						/>
						<span class="ml-3">
							<span class="block text-sm font-medium text-gray-900">
								{flavor.replace('_', ' ')}
								{#if favoriteFlavors.includes(flavor)}
									<span class="text-indigo-600">
										(#{favoriteFlavors.indexOf(flavor) + 1})
									</span>
								{/if}
							</span>
						</span>
					</label>
				{/each}
			</div>
		</div>

		<div>
			<h3 class="text-lg font-medium text-gray-900">Drink Types</h3>
			<p class="mt-1 text-sm text-gray-500">Select the types of drinks you enjoy.</p>
			<div class="mt-4 grid grid-cols-2 gap-4">
				{#each drinkType.enumValues as type}
					<label
						class="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
					>
						<input
							type="checkbox"
							name="favoriteDrinkTypes"
							value={type}
							bind:group={favoriteDrinkTypes}
							class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
						/>
						<span class="ml-3">
							<span class="block text-sm font-medium text-gray-900">
								{type.replace('_', ' ')}
							</span>
						</span>
					</label>
				{/each}
			</div>
		</div>

		{#if showBeerStyles}
			<div transition:slide>
				<h3 class="text-lg font-medium text-gray-900">Beer Styles</h3>
				<p class="mt-1 text-sm text-gray-500">Select your preferred beer styles.</p>
				<div class="mt-4 grid grid-cols-2 gap-4">
					{#each beerStyle.enumValues as style}
						<label
							class="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
						>
							<input
								type="checkbox"
								name="favoriteBeerStyles"
								value={style}
								bind:group={favoriteBeerStyles}
								class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
							/>
							<span class="ml-3">
								<span class="block text-sm font-medium text-gray-900">
									{style.replace('_', ' ')}
								</span>
							</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		{#if showCocktailStyles}
			<div transition:slide>
				<h3 class="text-lg font-medium text-gray-900">Cocktail Styles</h3>
				<p class="mt-1 text-sm text-gray-500">Select your preferred cocktail styles.</p>
				<div class="mt-4 grid grid-cols-2 gap-4">
					{#each cocktailStyle.enumValues as style}
						<label
							class="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
						>
							<input
								type="checkbox"
								name="favoriteCocktailStyles"
								value={style}
								bind:group={favoriteCocktailStyles}
								class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
							/>
							<span class="ml-3">
								<span class="block text-sm font-medium text-gray-900">
									{style.replace('_', ' ')}
								</span>
							</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		{#if showWineStyles}
			<div transition:slide>
				<h3 class="text-lg font-medium text-gray-900">Wine Styles</h3>
				<p class="mt-1 text-sm text-gray-500">Select your preferred wine styles.</p>
				<div class="mt-4 grid grid-cols-2 gap-4">
					{#each wineStyle.enumValues as style}
						<label
							class="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
						>
							<input
								type="checkbox"
								name="favoriteWineStyles"
								value={style}
								bind:group={favoriteWineStyles}
								class="h-4 w-4 text-indigo-600 border-gray-300 rounded"
							/>
							<span class="ml-3">
								<span class="block text-sm font-medium text-gray-900">
									{style.replace('_', ' ')}
								</span>
							</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<div>
			<h3 class="text-lg font-medium text-gray-900">Additional Preferences</h3>
			<div class="mt-4 space-y-4">
				<div>
					<label for="budget" class="block text-sm font-medium text-gray-700">
						Average Drink Budget (per drink)
					</label>
					<div class="mt-1">
						<input
							type="number"
							name="budget"
							id="budget"
							bind:value={budget}
							min="0"
							class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
							placeholder="15"
						/>
					</div>
				</div>

				<div>
					<label for="dietary" class="block text-sm font-medium text-gray-700">
						Dietary Restrictions
					</label>
					<div class="mt-1">
						<textarea
							id="dietary"
							name="dietaryRestrictions"
							bind:value={dietaryRestrictions}
							rows="3"
							class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
							placeholder="e.g., gluten-free, vegan"
						></textarea>
					</div>
				</div>
			</div>
		</div>

		<div class="pt-5">
			<div class="flex justify-end">
				<button
					type="submit"
					class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					Save Preferences
				</button>
			</div>
		</div>
	</form>
</div>
