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
		class="space-y-8"
	>
		<ErrorDisplay message={errorMessage} />

		<div>
			<h3 class="text-xl font-semibold text-white mb-2">Flavor Preferences</h3>
			<p class="text-sm text-white/70 mb-4">
				Select your preferred flavors in order of preference.
			</p>
			<div class="grid grid-cols-2 gap-4">
				{#each flavorPreference.enumValues as flavor}
					<label
						class="relative flex items-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer transition-all hover:bg-white/10 {favoriteFlavors.includes(
							flavor
						)
							? 'ring-2 ring-highlight bg-white/10'
							: ''}"
					>
						<input
							type="checkbox"
							name="favoriteFlavors"
							value={flavor}
							checked={favoriteFlavors.includes(flavor)}
							onchange={() => handleFlavorToggle(flavor)}
							class="h-4 w-4 text-highlight border-white/20 rounded bg-white/5"
						/>
						<span class="ml-3">
							<span class="block text-sm font-medium text-white">
								{flavor.replace('_', ' ')}
								{#if favoriteFlavors.includes(flavor)}
									<span class="text-highlight">
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
			<h3 class="text-xl font-semibold text-white mb-2">Drink Types</h3>
			<p class="text-sm text-white/70 mb-4">Select the types of drinks you enjoy.</p>
			<div class="grid grid-cols-2 gap-4">
				{#each drinkType.enumValues as type}
					<label
						class="relative flex items-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer transition-all hover:bg-white/10 {favoriteDrinkTypes.includes(
							type
						)
							? 'ring-2 ring-highlight bg-white/10'
							: ''}"
					>
						<input
							type="checkbox"
							name="favoriteDrinkTypes"
							value={type}
							bind:group={favoriteDrinkTypes}
							class="h-4 w-4 text-highlight border-white/20 rounded bg-white/5"
						/>
						<span class="ml-3">
							<span class="block text-sm font-medium text-white">
								{type.replace('_', ' ')}
							</span>
						</span>
					</label>
				{/each}
			</div>
		</div>

		{#if showBeerStyles}
			<div transition:slide>
				<h3 class="text-xl font-semibold text-white mb-2">Beer Styles</h3>
				<p class="text-sm text-white/70 mb-4">Select your preferred beer styles.</p>
				<div class="grid grid-cols-2 gap-4">
					{#each beerStyle.enumValues as style}
						<label
							class="relative flex items-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer transition-all hover:bg-white/10 {favoriteBeerStyles.includes(
								style
							)
								? 'ring-2 ring-highlight bg-white/10'
								: ''}"
						>
							<input
								type="checkbox"
								name="favoriteBeerStyles"
								value={style}
								bind:group={favoriteBeerStyles}
								class="h-4 w-4 text-highlight border-white/20 rounded bg-white/5"
							/>
							<span class="ml-3">
								<span class="block text-sm font-medium text-white">
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
				<h3 class="text-xl font-semibold text-white mb-2">Cocktail Styles</h3>
				<p class="text-sm text-white/70 mb-4">Select your preferred cocktail styles.</p>
				<div class="grid grid-cols-2 gap-4">
					{#each cocktailStyle.enumValues as style}
						<label
							class="relative flex items-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer transition-all hover:bg-white/10 {favoriteCocktailStyles.includes(
								style
							)
								? 'ring-2 ring-highlight bg-white/10'
								: ''}"
						>
							<input
								type="checkbox"
								name="favoriteCocktailStyles"
								value={style}
								bind:group={favoriteCocktailStyles}
								class="h-4 w-4 text-highlight border-white/20 rounded bg-white/5"
							/>
							<span class="ml-3">
								<span class="block text-sm font-medium text-white">
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
				<h3 class="text-xl font-semibold text-white mb-2">Wine Styles</h3>
				<p class="text-sm text-white/70 mb-4">Select your preferred wine styles.</p>
				<div class="grid grid-cols-2 gap-4">
					{#each wineStyle.enumValues as style}
						<label
							class="relative flex items-center p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer transition-all hover:bg-white/10 {favoriteWineStyles.includes(
								style
							)
								? 'ring-2 ring-highlight bg-white/10'
								: ''}"
						>
							<input
								type="checkbox"
								name="favoriteWineStyles"
								value={style}
								bind:group={favoriteWineStyles}
								class="h-4 w-4 text-highlight border-white/20 rounded bg-white/5"
							/>
							<span class="ml-3">
								<span class="block text-sm font-medium text-white">
									{style.replace('_', ' ')}
								</span>
							</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<div>
			<h3 class="text-xl font-semibold text-white mb-2">Additional Preferences</h3>
			<div class="space-y-6">
				<div>
					<label for="budget" class="block text-sm font-medium text-white mb-2">
						Average Drink Budget (per drink)
					</label>
					<input
						type="number"
						name="budget"
						id="budget"
						bind:value={budget}
						min="0"
						class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-highlight/50"
						placeholder="15"
					/>
				</div>

				<div>
					<label for="dietary" class="block text-sm font-medium text-white mb-2">
						Dietary Restrictions
					</label>
					<textarea
						id="dietary"
						name="dietaryRestrictions"
						bind:value={dietaryRestrictions}
						rows="3"
						class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-highlight/50"
						placeholder="e.g., gluten-free, vegan"
					></textarea>
				</div>
			</div>
		</div>

		<div class="pt-6">
			<div class="flex justify-end">
				<button
					type="submit"
					class="px-6 py-2 bg-highlight text-black font-medium rounded-xl hover:bg-highlight/90 focus:outline-none focus:ring-2 focus:ring-highlight/50 focus:ring-offset-2 focus:ring-offset-black/10 transition-all"
				>
					Save Preferences
				</button>
			</div>
		</div>
	</form>
</div>
