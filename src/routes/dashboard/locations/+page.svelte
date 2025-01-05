<script lang="ts">
	import { MapPin, Menu, Calendar } from 'lucide-svelte';
	import type { Location, Profile } from '$lib/types';
	import Section from '$lib/components/sections/Section.svelte';
	import NavBar from '$lib/components/navigation/NavBar.svelte';

	let { data } = $props<{
		data: {
			locations: (Location & { activeMenu: any })[];
			profile: Profile;
		};
	}>();

	let { locations, profile } = $derived(data);

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
			<Section title="Recent Locations">
				{#if locations.length === 0}
					<div class="text-center py-12">
						<p class="text-gray-500">No locations found. Try scanning a menu to get started!</p>
					</div>
				{:else}
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each locations as location}
							<div
								class="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:bg-white/15"
							>
								<div class="p-4">
									<div class="flex items-center justify-between mb-2">
										<h3 class="text-lg font-medium text-white flex items-center">
											<MapPin class="w-5 h-5 mr-2 text-highlight" />
											{location.name}
										</h3>
									</div>
									<p class="text-sm text-white/70 mb-2">
										{location.type.replace('_', ' ')}
										{#if location.city}
											• {location.city}
										{/if}
										{#if location.state}
											, {location.state}
										{/if}
									</p>
									{#if location.activeMenu}
										<div class="mt-4 border-t border-white/10 pt-4">
											<div class="flex items-center text-sm text-white/70">
												<Menu class="w-4 h-4 mr-2" />
												<span>Active Menu</span>
												<span class="mx-2">•</span>
												<Calendar class="w-4 h-4 mr-2" />
												<span>{formatDate(location.activeMenu.createdAt)}</span>
											</div>
											<a
												href="/dashboard/locations/{location.id}"
												class="mt-4 w-full px-4 py-2 bg-highlight text-black font-medium rounded-lg hover:bg-highlight/90 focus:outline-none focus:ring-2 focus:ring-highlight/50 focus:ring-offset-2 focus:ring-offset-black/10 transition-all flex items-center justify-center"
											>
												View Menu
											</a>
										</div>
									{:else}
										<p class="mt-4 text-sm text-white/50 text-center">No active menu</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</Section>
		</div>
	</main>
</div>
