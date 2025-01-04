<script lang="ts">
	import { User, Coffee, DollarSign } from 'lucide-svelte';
	import type { Profile } from '$lib/types';
	import { drinkType, flavorPreference, beerStyle, cocktailStyle, wineStyle } from '$lib/db/schema';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	import Logo from '$lib/components/Logo.svelte';

	type DrinkType = (typeof drinkType.enumValues)[number];
	type FlavorPreference = (typeof flavorPreference.enumValues)[number];
	type BeerStyle = (typeof beerStyle.enumValues)[number];
	type CocktailStyle = (typeof cocktailStyle.enumValues)[number];
	type WineStyle = (typeof wineStyle.enumValues)[number];

	let favoriteFlavors = $state<FlavorPreference[]>([]);
	let favoriteDrinkTypes = $state<DrinkType[]>([]);
	let favoriteBeerStyles = $state<BeerStyle[]>([]);
	let favoriteCocktailStyles = $state<CocktailStyle[]>([]);
	let favoriteWineStyles = $state<WineStyle[]>([]);
	let budget = $state<number | null>(null);
	let dietaryRestrictions = $state('');
	let errorMessage = $state<string | null>(null);

	const showBeerStyles = $derived(favoriteDrinkTypes.includes('beer'));
	const showCocktailStyles = $derived(favoriteDrinkTypes.includes('cocktail'));
	const showWineStyles = $derived(favoriteDrinkTypes.includes('wine'));

	function handleFlavorToggle(flavor: FlavorPreference) {
		if (favoriteFlavors.includes(flavor)) {
			favoriteFlavors = favoriteFlavors.filter((f) => f !== flavor);
		} else {
			favoriteFlavors = [...favoriteFlavors, flavor];
		}
	}

	function getOrdinal(n: number) {
		const s = ['th', 'st', 'nd', 'rd'];
		const v = n % 100;
		return n + (s[(v - 20) % 10] || s[v] || s[0]);
	}
</script>

<div class="w-full md:w-1/2 p-8">
	<h2 class="text-3xl font-bold mb-6 text-gray-800">Customize Your Experience</h2>
	<p class="text-gray-600 mb-6">Help us personalize your drink recommendations!</p>

	<form
		action="/preferences?/update"
		method="POST"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					goto('/');
				} else if (result.type === 'error') {
					errorMessage = result.error.message;
				}
			};
		}}
		class="space-y-6"
	>
		<div>
			<label for="favoriteFlavors" class="block text-sm font-medium text-gray-700">
				Flavor Preferences (In Order of Preference)
			</label>
			<div class="mt-2 grid grid-cols-2 gap-2">
				{#each flavorPreference.enumValues as flavor}
					<label
						class="inline-flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50"
						class:ring-2={favoriteFlavors.includes(flavor)}
						class:ring-indigo-500={favoriteFlavors.includes(flavor)}
						for="favoriteFlavors-{flavor}"
					>
						<input
							type="checkbox"
							id="favoriteFlavors-{flavor}"
							name="favoriteFlavors"
							value={flavor as (typeof flavorPreference.enumValues)[number]}
							checked={favoriteFlavors.includes(flavor)}
							onchange={() => handleFlavorToggle(flavor)}
							class="h-4 w-4 text-indigo-600"
						/>
						<span class="ml-3 capitalize">
							{flavor.replace('_', ' ')}
							{#if favoriteFlavors.includes(flavor)}
								<span class="text-sm text-indigo-600">
									({getOrdinal(favoriteFlavors.indexOf(flavor) + 1)} choice)
								</span>
							{/if}
						</span>
					</label>
				{/each}
			</div>
		</div>

		<div>
			<label for="favoriteDrinkTypes" class="block text-sm font-medium text-gray-700"
				>Preferred Drink Types</label
			>
			<div class="mt-2 grid grid-cols-2 gap-2">
				{#each drinkType.enumValues as type}
					<label
						class="inline-flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50"
						for="favoriteDrinkTypes-{type}"
					>
						<input
							type="checkbox"
							id="favoriteDrinkTypes-{type}"
							name="favoriteDrinkTypes"
							value={type as (typeof drinkType.enumValues)[number]}
							bind:group={favoriteDrinkTypes}
							class="h-4 w-4 text-indigo-600"
						/>
						<span class="ml-3 capitalize">{type.replace('_', ' ')}</span>
					</label>
				{/each}
			</div>
		</div>

		{#if showBeerStyles}
			<div transition:slide>
				<label for="favoriteBeerStyles" class="block text-sm font-medium text-gray-700"
					>Favorite Beer Styles</label
				>
				<div class="mt-2 grid grid-cols-2 gap-2">
					{#each beerStyle.enumValues as style}
						<label
							class="inline-flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50"
							for="favoriteBeerStyles-{style}"
						>
							<input
								type="checkbox"
								id="favoriteBeerStyles-{style}"
								name="favoriteBeerStyles"
								value={style as (typeof beerStyle.enumValues)[number]}
								bind:group={favoriteBeerStyles}
								class="h-4 w-4 text-indigo-600"
							/>
							<span class="ml-3 capitalize">{style.replace('_', ' ')}</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		{#if showWineStyles}
			<div transition:slide>
				<label for="favoriteWineStyles" class="block text-sm font-medium text-gray-700"
					>Favorite Wine Styles</label
				>
				<div class="mt-2 grid grid-cols-2 gap-2">
					{#each wineStyle.enumValues as style}
						<label
							class="inline-flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50"
							for="favoriteWineStyles-{style}"
						>
							<input
								type="checkbox"
								id="favoriteWineStyles-{style}"
								name="favoriteWineStyles"
								value={style as (typeof wineStyle.enumValues)[number]}
								bind:group={favoriteWineStyles}
								class="h-4 w-4 text-indigo-600"
							/>
							<span class="ml-3 capitalize">{style.replace('_', ' ')}</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		{#if showCocktailStyles}
			<div transition:slide>
				<label for="favoriteCocktailStyles" class="block text-sm font-medium text-gray-700"
					>Favorite Cocktail Styles</label
				>
				<div class="mt-2 grid grid-cols-2 gap-2">
					{#each cocktailStyle.enumValues as style}
						<label
							class="inline-flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50"
							for="favoriteCocktailStyles-{style}"
						>
							<input
								type="checkbox"
								id="favoriteCocktailStyles-{style}"
								name="favoriteCocktailStyles"
								value={style as (typeof cocktailStyle.enumValues)[number]}
								bind:group={favoriteCocktailStyles}
								class="h-4 w-4 text-indigo-600"
							/>
							<span class="ml-3 capitalize">{style.replace('_', ' ')}</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<div>
			<label for="budget" class="block text-sm font-medium text-gray-700"
				>Average Drink Budget</label
			>
			<div class="mt-1 relative rounded-md shadow-sm">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<DollarSign class="h-5 w-5 text-gray-400" />
				</div>
				<input
					type="number"
					id="budget"
					bind:value={budget}
					min="0"
					max="1000"
					class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
					placeholder="15"
					name="budget"
				/>
			</div>
		</div>

		<div>
			<label for="dietary" class="block text-sm font-medium text-gray-700"
				>Dietary Restrictions</label
			>
			<div class="mt-1">
				<textarea
					id="dietary"
					bind:value={dietaryRestrictions}
					rows="3"
					class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
					placeholder="e.g., gluten-free, vegan"
					name="dietary"
				></textarea>
			</div>
		</div>

		<button
			type="submit"
			class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
		>
			Save Preferences
		</button>
	</form>
</div>

<div
	class="w-full md:w-1/2 bg-indigo-600 text-white p-8 rounded-b-lg md:rounded-r-lg md:rounded-bl-none"
>
	<div class="h-full flex flex-col justify-between">
		<div>
			<div class="mb-6 w-2/3">
				<Logo />
			</div>
			<h3 class="text-2xl font-bold mb-4">Flavor Profile Guide</h3>
			<p class="mb-6">
				Order your flavor preferences to help us understand your taste hierarchy. Your first choice
				carries the most weight in our recommendations.
			</p>
			<div class="space-y-4">
				<div>
					<h4 class="font-semibold mb-2">Sweet</h4>
					<p class="text-sm opacity-90">
						Perfect for dessert wines, fruit-forward cocktails, and cream liqueurs
					</p>
				</div>
				<div>
					<h4 class="font-semibold mb-2">Bitter</h4>
					<p class="text-sm opacity-90">Ideal for IPAs, negronis, and amaro-based drinks</p>
				</div>
				<div>
					<h4 class="font-semibold mb-2">Sour</h4>
					<p class="text-sm opacity-90">
						Great for sour beers, margaritas, and citrus-based cocktails
					</p>
				</div>
				<div>
					<h4 class="font-semibold mb-2">Spicy</h4>
					<p class="text-sm opacity-90">
						Matches well with spiced rums, bloody marys, and ginger beer cocktails
					</p>
				</div>
				<div>
					<h4 class="font-semibold mb-2">Umami</h4>
					<p class="text-sm opacity-90">
						Perfect for savory cocktails and complex spirit-forward drinks
					</p>
				</div>
				<div>
					<h4 class="font-semibold mb-2">Salty</h4>
					<p class="text-sm opacity-90">Great for margaritas with salt rims and savory cocktails</p>
				</div>
			</div>
		</div>
	</div>
</div>
