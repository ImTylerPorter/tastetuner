<script lang="ts">
	import { Upload, Loader2, MapPin } from 'lucide-svelte';
	import MobileMenuScanner from './MobileMenuScanner.svelte';
	import DrinkRecommendations from './DrinkRecommendations.svelte';
	import LocationSearch from './LocationSearch.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { analyzeMenuWithAI } from '$lib/services/aiMenuAnalysis';
	import type { AIMenuAnalysisResult, LocationInfo } from '$lib/services/aiMenuAnalysis';
	import { page } from '$app/stores';

	let { onScan, onError } = $props<{
		onScan: (text: string) => void;
		onError: (message: string) => void;
	}>();

	let fileInput = $state<HTMLInputElement>();
	let dragActive = $state<boolean>(false);
	let processing = $state<boolean>(false);
	let error = $state<string | null>(null);
	let isMobile = $state<boolean>(false);
	let analysisResult = $state<AIMenuAnalysisResult | null>(null);
	let firstName = $page.data.profile?.firstName || 'you';
	let selectedLocation = $state<LocationInfo | null>(null);

	onMount(() => {
		if (browser) {
			isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		}
	});

	async function handleFile(file: File) {
		if (!file.type.startsWith('image/')) {
			error = 'Please upload an image file';
			onError(error);
			return;
		}

		if (!selectedLocation) {
			error = 'Please select a location first';
			onError(error);
			return;
		}

		processing = true;
		error = null;

		try {
			analysisResult = await analyzeMenuWithAI(file, selectedLocation);
			const menuText = analysisResult.drinks
				.map(
					(drink) =>
						`${drink.name} - ${drink.type}${
							(drink as any).style ? ` - ${(drink as any).style}` : ''
						}${drink.alcoholContent ? ` (${drink.alcoholContent}% ABV)` : ''}${
							(drink as any).ibu ? ` IBU: ${(drink as any).ibu}` : ''
						}`
				)
				.join('\n');

			onScan(menuText);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to analyze menu';
			onError(error);
			console.error('Menu analysis error:', err);
		} finally {
			processing = false;
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;

		const file = e.dataTransfer?.files[0];
		if (file) {
			handleFile(file);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragActive = true;
	}

	function handleDragLeave() {
		dragActive = false;
	}

	function handleFileSelect() {
		const file = fileInput?.files?.[0];
		if (file) {
			handleFile(file);
		}
	}

	function handleLocationSelect(location: LocationInfo) {
		selectedLocation = location;
		error = null;
	}
</script>

{#if isMobile}
	<MobileMenuScanner
		{onScan}
		onError={(message) => (error = message)}
		locationInfo={selectedLocation}
	/>
{:else}
	<div class="space-y-6">
		<div class="max-w-xl mx-auto">
			<h2 class="text-lg font-medium text-gray-900 mb-4">Location</h2>
			<LocationSearch onSelect={handleLocationSelect} />
		</div>

		{#if selectedLocation}
			<div
				class="max-w-xl mx-auto"
				role="region"
				aria-label="File upload area"
				ondrop={handleDrop}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
			>
				<label
					for="file-upload"
					class="relative block p-12 text-center border-2 rounded-lg cursor-pointer {dragActive
						? 'border-indigo-500 bg-indigo-50'
						: 'border-gray-300 hover:border-indigo-500'}"
				>
					<input
						id="file-upload"
						bind:this={fileInput}
						type="file"
						accept="image/*"
						class="sr-only"
						onchange={handleFileSelect}
					/>
					<div class="space-y-2">
						<Upload class="mx-auto h-12 w-12 text-gray-400 {dragActive ? 'text-indigo-500' : ''}" />
						<div class="text-sm">
							<span class="font-medium text-indigo-600">Upload a menu photo</span>
							<span class="text-gray-500"> or drag and drop</span>
						</div>
						<p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
					</div>
				</label>
			</div>
		{/if}

		{#if analysisResult?.recommendations}
			<DrinkRecommendations recommendations={analysisResult.recommendations} {firstName} />
		{/if}
	</div>
{/if}

{#if error}
	<div
		class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
		role="alert"
	>
		<span class="block sm:inline">{error}</span>
	</div>
{/if}
