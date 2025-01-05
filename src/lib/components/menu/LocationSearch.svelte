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

	let nearbyLocations = $state<NominatimPlace[]>([]);

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

<div class="space-y-4">
	{#if selectedPlace}
		<div class="bg-white shadow rounded-md p-4">
			<div class="flex justify-between items-center">
				<div class="flex items-start">
					<MapPin class="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
					<div class="ml-3">
						<p class="text-sm font-medium text-gray-900">
							{selectedPlace.display_name.split(',')[0]}
						</p>
						<p class="text-sm text-gray-500">
							{selectedPlace.tags?.['addr:street'] || ''}{#if selectedPlace.tags?.['addr:city']}, {selectedPlace
									.tags['addr:city']}{/if}{#if selectedPlace.tags?.['addr:state']}, {selectedPlace
									.tags['addr:state']}{/if}
						</p>
					</div>
				</div>
				<button
					type="button"
					class="text-sm text-indigo-600 hover:text-indigo-500"
					onclick={handleChange}
				>
					Change
				</button>
			</div>
		</div>
	{:else}
		<div class="flex gap-4">
			<div class="flex-1">
				<div class="relative">
					<input
						type="text"
						placeholder="Search for a location..."
						bind:value={searchInput}
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
					/>
					<Search class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
				</div>
			</div>
			<button
				type="button"
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				onclick={getCurrentLocation}
				disabled={gettingLocation}
			>
				{#if gettingLocation}
					<Loader2 class="w-4 h-4 mr-2 animate-spin" />
					Getting Location...
				{:else}
					<MapPin class="w-4 h-4 mr-2" />
					Use My Location
				{/if}
			</button>
		</div>

		{#if error}
			<div class="text-sm text-red-600">{error}</div>
		{/if}

		{#if searching}
			<div class="text-center py-4">
				<Loader2 class="w-6 h-6 animate-spin mx-auto text-indigo-600" />
				<p class="mt-2 text-sm text-gray-600">Searching for locations...</p>
			</div>
		{:else if nearbyLocations.length > 0}
			<div class="bg-white shadow rounded-md">
				<ul class="divide-y divide-gray-200">
					{#each nearbyLocations as place}
						<li>
							<button
								class="w-full px-4 py-3 flex items-start hover:bg-gray-50 transition-colors text-left"
								onclick={() => handlePlaceSelect(place)}
							>
								<MapPin class="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
								<div class="ml-3">
									<p class="text-sm font-medium text-gray-900">
										{place.display_name.split(',')[0]}
									</p>
									<p class="text-sm text-gray-500">{place.display_name}</p>
								</div>
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	{/if}
</div>
