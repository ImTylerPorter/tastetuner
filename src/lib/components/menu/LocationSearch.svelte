<script lang="ts">
	import { MapPin, Loader2, Search } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { LocationInfo } from '$lib/services/aiMenuAnalysis';

	let { onSelect } = $props<{
		onSelect: (location: LocationInfo) => void;
	}>();

	let searchInput = $state<string>('');
	let searching = $state<boolean>(false);
	let gettingLocation = $state<boolean>(false);
	let error = $state<string | null>(null);
	let selectedPlace = $state<NominatimPlace | null>(null);
	let nearbyLocations = $state<NominatimPlace[]>([]);

	interface NominatimPlace {
		place_id: number;
		type: string;
		class?: string;
		category?: string;
		name?: string;
		display_name: string;
		distance?: number;
		tags?: {
			name?: string;
			'addr:street'?: string;
			'addr:city'?: string;
			'addr:state'?: string;
			amenity?: string;
		};
		address?: {
			city?: string;
			town?: string;
			village?: string;
			state?: string;
			road?: string;
		};
	}

	interface OverpassElement {
		type: string;
		id: number;
		lat?: number;
		lon?: number;
		tags?: {
			amenity: string;
			name?: string;
			'addr:street'?: string;
			'addr:city'?: string;
			'addr:state'?: string;
		};
	}

	async function getCurrentLocation() {
		if (!navigator.geolocation) {
			error = 'Geolocation is not supported by your browser';
			return;
		}

		gettingLocation = true;
		error = null;

		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject);
			});

			const { latitude, longitude } = position.coords;

			// THIS IS WORKING
			console.log(latitude, longitude);
			searchNearbyLocations(latitude, longitude);
		} catch (err) {
			error = 'Unable to get your location. Please try searching manually.';
			console.error('Geolocation error:', err);
		} finally {
			gettingLocation = false;
		}
	}

	async function searchNearbyLocations(latitude: number, longitude: number) {
		searching = true;
		error = null;

		try {
			// Use Overpass API to find nearby venues
			const radius = 10000; // 2km in meters
			const query = `
				[out:json][timeout:25];
				(
					nwr["amenity"~"restaurant|bar|pub"](around:${radius},${latitude},${longitude});
				);
				out body center;`;

			const response = await fetch('https://overpass-api.de/api/interpreter', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: `data=${encodeURIComponent(query)}`
			});

			const data = await response.json();
			console.log('Raw Overpass results:', data);

			if (data.elements && data.elements.length > 0) {
				// Convert Overpass results to NominatimPlace format and calculate distances
				nearbyLocations = data.elements
					.filter((elem: OverpassElement) => elem.tags?.amenity)
					.map((elem: OverpassElement) => {
						const tags = elem.tags!;
						const displayName = [
							tags.name,
							tags['addr:street'],
							tags['addr:city'],
							tags['addr:state']
						]
							.filter(Boolean)
							.join(', ');

						// Calculate distance from user
						const distance = Math.sqrt(
							Math.pow(((elem.lat || 0) - latitude) * 111, 2) +
								Math.pow(
									((elem.lon || 0) - longitude) * 111 * Math.cos((latitude * Math.PI) / 180),
									2
								)
						);

						return {
							place_id: elem.id,
							type: tags.amenity,
							name: tags.name,
							display_name: displayName || 'Unnamed venue',
							tags: tags,
							address: {
								city: tags['addr:city'],
								state: tags['addr:state'],
								road: tags['addr:street']
							},
							distance
						};
					})
					.sort((a: NominatimPlace, b: NominatimPlace) => (a.distance || 0) - (b.distance || 0));
				console.log('Converted locations:', nearbyLocations);

				if (nearbyLocations.length === 0) {
					error = 'No venues found nearby. Try searching by name instead.';
				}
			} else {
				error = 'No venues found nearby. Try searching by name instead.';
			}
		} catch (err) {
			error = 'Unable to find nearby locations';
			console.error('Location search error:', err);
		} finally {
			searching = false;
		}
	}

	function handlePlaceSelect(place: NominatimPlace) {
		selectedPlace = place;
		const locationType = getLocationType(place.type || place.category || []);
		const tags = place.tags || {};
		console.log(place);

		onSelect({
			locationName: tags.name || place.name || place.display_name.split(',')[0] || '',
			locationType,
			address: tags['addr:street'] || place.address?.road || '',
			city:
				tags['addr:city'] ||
				place.address?.city ||
				place.address?.town ||
				place.address?.village ||
				'',
			state: tags['addr:state'] || place.address?.state || ''
		});
	}

	function handleChange() {
		selectedPlace = null;
		searchInput = '';
		nearbyLocations = [];
		error = null;
	}

	function getLocationType(types: string[] | string): LocationInfo['locationType'] {
		const typeStr = typeof types === 'string' ? types : types[0] || '';
		const type = typeStr.toLowerCase();
		if (type.includes('brewery')) return 'brewery';
		if (type.includes('bar')) return 'bar';
		if (type.includes('restaurant')) return 'restaurant';
		return 'other';
	}

	async function handleSearch() {
		if (!searchInput.trim()) return;

		searching = true;
		error = null;

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?` +
					`q=${encodeURIComponent(searchInput)}&` +
					`format=json&` +
					`addressdetails=1&` +
					`limit=50&` +
					`featuretype=amenity`
			);
			const results: NominatimPlace[] = await response.json();
			console.log('Search results:', results);

			if (results && results.length > 0) {
				nearbyLocations = results.filter((place: NominatimPlace) => {
					return (
						place.type === 'restaurant' ||
						place.type === 'bar' ||
						place.type === 'pub' ||
						place.category === 'restaurant' ||
						place.category === 'bar' ||
						place.category === 'pub'
					);
				});
				console.log('Filtered search results:', nearbyLocations);

				if (nearbyLocations.length === 0) {
					error = 'No restaurants or bars found. Try a different search.';
				}
			} else {
				error = 'No locations found';
			}
		} catch (err) {
			error = 'Error searching for locations';
			console.error('Search error:', err);
		} finally {
			searching = false;
		}
	}
</script>

<div class="location-search-container">
	{#if selectedPlace}
		<div class="p-4 bg-white/5">
			<div class="flex justify-between items-center">
				<div class="flex items-start space-x-3">
					<MapPin class="h-5 w-5 text-white/70 mt-0.5 flex-shrink-0" />
					<div>
						<p class="text-white font-medium">
							{selectedPlace.name || selectedPlace.display_name.split(',')[0]}
						</p>
						<p class="text-sm text-white/70">{selectedPlace.display_name}</p>
					</div>
				</div>
				<button
					onclick={handleChange}
					class="text-white/70 hover:text-white text-sm underline transition-colors"
				>
					Change
				</button>
			</div>
		</div>
	{:else}
		<div class="p-4 space-y-4">
			<div class="flex space-x-2">
				<div class="flex-1 relative">
					<div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
						<Search class="h-5 w-5 text-white/50" />
					</div>
					<input
						type="text"
						placeholder="Search for a restaurant or bar..."
						bind:value={searchInput}
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						class="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
					/>
				</div>
				<button
					onclick={handleSearch}
					disabled={searching || !searchInput.trim()}
					class="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 text-white rounded-lg transition-all flex items-center space-x-2"
				>
					{#if searching}
						<Loader2 class="h-5 w-5 animate-spin" />
						<span>Searching...</span>
					{:else}
						<span>Search</span>
					{/if}
				</button>
			</div>

			<div class="flex items-center">
				<div class="flex-1 border-t border-white/10"></div>
				<span class="px-3 text-white/50 text-sm">or</span>
				<div class="flex-1 border-t border-white/10"></div>
			</div>

			<button
				onclick={getCurrentLocation}
				disabled={gettingLocation}
				class="w-full px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 text-white rounded-lg transition-all flex items-center justify-center space-x-2"
			>
				{#if gettingLocation}
					<Loader2 class="h-5 w-5 animate-spin" />
					<span>Getting location...</span>
				{:else}
					<MapPin class="h-5 w-5" />
					<span>Use my location</span>
				{/if}
			</button>

			{#if error}
				<p class="text-red-300 text-sm">{error}</p>
			{/if}
		</div>

		{#if nearbyLocations.length > 0}
			<div class="border-t border-white/10">
				<div class="max-h-60 overflow-y-auto">
					{#each nearbyLocations as place}
						<button
							onclick={() => handlePlaceSelect(place)}
							class="w-full p-4 text-left hover:bg-white/5 transition-colors flex items-start space-x-3"
						>
							<MapPin class="h-5 w-5 text-white/70 mt-0.5 flex-shrink-0" />
							<div>
								<p class="text-white font-medium">
									{place.name || place.display_name.split(',')[0]}
								</p>
								<p class="text-sm text-white/70">{place.display_name}</p>
								{#if place.distance !== undefined}
									<p class="text-sm text-white/50 mt-1">
										{place.distance.toFixed(1)} km away
									</p>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* Custom scrollbar for Webkit browsers */
	:global(.location-search-container .max-h-60) {
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
	}

	:global(.location-search-container .max-h-60::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.location-search-container .max-h-60::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.location-search-container .max-h-60::-webkit-scrollbar-thumb) {
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}
</style>
