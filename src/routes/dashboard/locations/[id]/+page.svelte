<script lang="ts">
	import { MapPin, Menu as MenuIcon, Calendar, Plus } from 'lucide-svelte';
	import type { Location, Profile } from '$lib/types';
	import Section from '$lib/components/sections/Section.svelte';
	import DrinkRating from '$lib/components/drink/DrinkRating.svelte';
	import NavBar from '$lib/components/navigation/NavBar.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props<{
		data: {
			location: Location & { activeMenu: any };
			profile: Profile;
		};
	}>();

	let { location, profile } = $derived(data);
	let menuData = $derived(location.activeMenu?.menuData || { drinks: [] });
	let saving = $state<string | null>(null);

	async function handleSaveDrink(drink: any) {
		try {
			saving = drink.id;
			const response = await fetch('/api/drinks/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					drinkName: drink.name,
					type: drink.type,
					style: drink.style,
					description: drink.description,
					alcoholContent: drink.alcoholContent,
					brand: drink.brand,
					isSeasonal: drink.isSeasonal,
					isExclusive: drink.isExclusive
				})
			});

			if (!response.ok) throw new Error('Failed to save drink');
			goto('/dashboard/my-drinks');
		} catch (error) {
			console.error('Error saving drink:', error);
		} finally {
			saving = null;
		}
	}

	function formatDate(date: string | Date) {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(date));
	}
</script>

<div class="min-h-screen backdrop-blur-xl bg-black/10">
	<NavBar {profile} />

	<main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
		<div class="transition-all duration-300 ease-in-out space-y-8">
			<Section title="Location Details">
				<div class="mb-8">
					<div class="flex items-center justify-between">
						<h1 class="text-2xl font-bold text-white flex items-center">
							<MapPin class="w-6 h-6 mr-2 text-highlight" />
							{location.name}
						</h1>
						{#if location.activeMenu}
							<div class="flex items-center text-sm text-white/70">
								<MenuIcon class="w-4 h-4 mr-2" />
								<span>Active Menu</span>
								<span class="mx-2">•</span>
								<Calendar class="w-4 h-4 mr-2" />
								<span>{formatDate(location.activeMenu.createdAt)}</span>
							</div>
						{/if}
					</div>
					<p class="text-white/70 mt-2">
						{location.type.replace('_', ' ')}
						{#if location.city}
							• {location.city}
						{/if}
						{#if location.state}
							, {location.state}
						{/if}
					</p>
				</div>

				{#if !location.activeMenu}
					<div class="text-center py-12">
						<p class="text-gray-500">No active menu found for this location.</p>
					</div>
				{:else if menuData.drinks.length === 0}
					<div class="text-center py-12">
						<p class="text-gray-500">No drinks found in the menu.</p>
					</div>
				{:else}
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each menuData.drinks as drink}
							<div
								class="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:bg-white/15"
							>
								<div class="p-6 flex flex-col h-full">
									<div class="flex-1">
										<h3 class="text-lg font-semibold text-white mb-2">{drink.name}</h3>
										<div class="space-y-2">
											<p class="text-sm text-white/70">
												{#if drink.brand}
													<span class="font-medium">{drink.brand}</span>
													<span class="mx-2">•</span>
												{/if}
												<span>{drink.type.replace('_', ' ')}</span>
												{#if drink.style}
													<span class="mx-2">•</span>
													<span>{drink.style}</span>
												{/if}
											</p>
											{#if drink.alcoholContent}
												<p class="text-sm text-white/50">{drink.alcoholContent}% ABV</p>
											{/if}
											{#if drink.description}
												<p class="text-sm text-white/70 mt-3">{drink.description}</p>
											{/if}
										</div>
									</div>
									<div class="mt-6">
										<div class="flex gap-3">
											<button
												type="button"
												class="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black/10 transition-all flex items-center justify-center disabled:opacity-50"
												onclick={() => handleSaveDrink(drink)}
												disabled={saving === drink.id}
											>
												{#if saving === drink.id}
													<div
														class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
													></div>
													Adding...
												{:else}
													<Plus class="w-4 h-4 mr-2" />
													Add
												{/if}
											</button>
											<a
												href="/dashboard/my-drinks/rate/{drink.id}"
												class="flex-1 px-4 py-2.5 bg-highlight text-black font-medium rounded-lg hover:bg-highlight/90 focus:outline-none focus:ring-2 focus:ring-highlight/50 focus:ring-offset-2 focus:ring-offset-black/10 transition-all flex items-center justify-center"
											>
												Rate
											</a>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Section>
		</div>
	</main>
</div>
