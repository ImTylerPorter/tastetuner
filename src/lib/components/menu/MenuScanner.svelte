<script lang="ts">
	import { Upload, MapPin, Loader2 } from 'lucide-svelte';
	import MobileMenuScanner from './MobileMenuScanner.svelte';
	import DrinkRecommendations from '$lib/components/drink/DrinkRecommendations.svelte';
	import LocationSearch from './LocationSearch.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { analyzeMenuWithAI } from '$lib/services/aiMenuAnalysis';
	import type { AIMenuAnalysisResult, LocationInfo } from '$lib/services/aiMenuAnalysis';
	import { page } from '$app/stores';

	let { onScan, onError } = $props<{
		onScan: (result: AIMenuAnalysisResult) => void;
		onError: (message: string) => void;
	}>();

	let fileInput = $state<HTMLInputElement>();
	let dragActive = $state<boolean>(false);
	let processing = $state<boolean>(false);
	let error = $state<string | null>(null);
	let isMobile = $state<boolean>(false);
	let analysisResult = $state<AIMenuAnalysisResult | null>(null);
	let firstName = $derived($page.data?.profile?.firstName || 'you');
	let selectedLocation = $state<LocationInfo | null>(null);
	let uploadProgress = $state<string>('');

	$effect(() => {
		if (browser) {
			isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		}
	});

	async function handleFile(file: File) {
		console.log('Handling file:', { name: file.name, type: file.type, size: file.size });

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

		if (file.size > 10 * 1024 * 1024) {
			// 10MB limit
			error = 'File size must be less than 10MB';
			onError(error);
			return;
		}

		processing = true;
		error = null;

		try {
			console.log('Starting menu analysis with location:', selectedLocation);
			uploadProgress = 'Processing image...';
			analysisResult = await analyzeMenuWithAI(file, selectedLocation);
			uploadProgress = 'Analyzing menu...';
			console.log('Analysis result:', analysisResult);

			if (analysisResult) {
				onScan(analysisResult);
			}
		} catch (err) {
			console.error('Menu analysis error details:', err);
			error = err instanceof Error ? err.message : 'Failed to analyze menu';
			onError(error);
		} finally {
			processing = false;
			uploadProgress = '';
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;

		const file = e.dataTransfer?.files[0];
		if (file) {
			console.log('File dropped:', { name: file.name, type: file.type, size: file.size });
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
	<div class="space-y-8">
		<div class="w-full max-w-2xl mx-auto">
			<div class="flex items-center space-x-2 mb-3">
				<MapPin class="w-5 h-5 text-white/70" />
				<h3 class="text-lg font-medium text-white">Location</h3>
			</div>
			<LocationSearch onSelect={handleLocationSelect} />
		</div>

		{#if selectedLocation}
			<div
				class="w-full max-w-2xl mx-auto"
				role="region"
				aria-label="File upload area"
				ondrop={handleDrop}
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
			>
				<label
					for="file-upload"
					class="relative block p-12 text-center border-2 rounded-xl cursor-pointer transition-all duration-200 {dragActive
						? 'border-highlight bg-white/5'
						: 'border-white/20 hover:border-highlight hover:bg-white/5'}"
				>
					<input
						id="file-upload"
						bind:this={fileInput}
						type="file"
						accept="image/*"
						class="sr-only"
						onchange={handleFileSelect}
						disabled={processing}
					/>
					{#if processing}
						<div class="flex flex-col items-center justify-center space-y-3">
							<Loader2 class="w-12 h-12 text-highlight animate-spin" />
							<p class="text-sm font-medium text-white">{uploadProgress}</p>
						</div>
					{:else}
						<div class="space-y-3">
							<Upload
								class="mx-auto h-12 w-12 text-white/70 {dragActive ? 'text-highlight' : ''}"
							/>
							<div class="text-sm">
								<span class="font-medium text-white">Upload a menu photo</span>
								<span class="text-white/70"> or drag and drop</span>
							</div>
							<p class="text-xs text-white/50">PNG, JPG, GIF up to 10MB</p>
						</div>
					{/if}
				</label>
			</div>
		{/if}

		{#if analysisResult?.recommendations}
			<div class="w-full max-w-2xl mx-auto">
				<DrinkRecommendations recommendations={analysisResult.recommendations} {firstName} />
			</div>
		{/if}
	</div>
{/if}

{#if error}
	<div
		class="mt-6 bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg"
		role="alert"
	>
		<span class="block sm:inline">{error}</span>
	</div>
{/if}

<style>
	:global(.location-search-container) {
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.1),
			0 1px 2px rgba(0, 0, 0, 0.06);
		overflow: hidden;
	}
</style>
