<script lang="ts">
	import { Camera, X, RotateCcw, Check } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';
	import { analyzeMenuWithAI } from '$lib/services/aiMenuAnalysis';
	import type { LocationInfo } from '$lib/services/aiMenuAnalysis';

	let { onScan, onError, locationInfo } = $props<{
		onScan: (text: string) => void;
		onError: (message: string) => void;
		locationInfo?: LocationInfo | null;
	}>();

	let stream = $state<MediaStream | null>(null);
	let video = $state<HTMLVideoElement>();
	let canvas = $state<HTMLCanvasElement>();
	let processing = $state(false);
	let error = $state<string | null>(null);
	let cameraActive = $state(false);
	let previewImage = $state<string | null>(null);

	onMount(() => {
		canvas = document.createElement('canvas');
	});

	onDestroy(() => {
		stopCamera();
	});

	async function startCamera() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			if (video) {
				video.srcObject = stream;
				await video.play();
			}
			cameraActive = true;
			error = null;
		} catch (err) {
			error = 'Unable to access camera. Please ensure you have granted camera permissions.';
			onError(error);
			console.error('Camera access error:', err);
		}
	}

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
		cameraActive = false;
	}

	async function captureImage() {
		if (!video || !canvas) return;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.drawImage(video, 0, 0);
		previewImage = canvas.toDataURL('image/jpeg');
		stopCamera();
	}

	async function processImage() {
		if (!previewImage) return;
		if (!locationInfo) {
			error = 'Please select a location first';
			onError(error);
			return;
		}

		processing = true;
		error = null;

		try {
			// Convert base64 to blob
			const response = await fetch(previewImage);
			const blob = await response.blob();
			const file = new File([blob], 'menu.jpg', { type: 'image/jpeg' });

			// Analyze the menu using GPT-4 Vision
			const result = await analyzeMenuWithAI(file, locationInfo);
			const menuText = result.drinks
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
			error = err instanceof Error ? err.message : 'Failed to analyze the menu';
			onError(error);
			console.error('Menu analysis error:', err);
		} finally {
			processing = false;
		}
	}

	function retake() {
		previewImage = null;
		startCamera();
	}
</script>

<div class="relative w-full max-w-lg mx-auto">
	{#if error}
		<div
			class="absolute top-0 left-0 right-0 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
			transition:slide
		>
			<span class="block sm:inline">{error}</span>
			<button class="absolute top-0 bottom-0 right-0 px-4" onclick={() => (error = null)}>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/if}

	<div class="mt-4 bg-gray-900 rounded-lg overflow-hidden">
		{#if !cameraActive && !previewImage}
			<div
				class="aspect-[4/3] flex items-center justify-center bg-gray-800 text-white"
				transition:fade
			>
				<button
					class="flex flex-col items-center space-y-2 p-6 hover:bg-gray-700 rounded-lg transition-colors"
					onclick={startCamera}
				>
					<Camera class="w-12 h-12" />
					<span>Tap to start camera</span>
				</button>
			</div>
		{:else if cameraActive}
			<div class="relative aspect-[4/3]" transition:fade>
				<video bind:this={video} autoplay playsinline class="w-full h-full object-cover">
					<track kind="captions" label="Live camera feed" />
				</video>
				<button
					class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg"
					onclick={captureImage}
					disabled={processing}
					aria-label="Capture image"
				>
					<div class="w-12 h-12 rounded-full border-4 border-indigo-500"></div>
				</button>
			</div>
		{:else if previewImage}
			<div class="relative aspect-[4/3]" transition:fade>
				<img src={previewImage} alt="Captured menu" class="w-full h-full object-cover" />
				<div
					class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4"
				>
					<button
						class="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100"
						onclick={retake}
						disabled={processing}
					>
						<RotateCcw class="w-6 h-6 text-gray-700" />
					</button>
					<button
						class="bg-indigo-500 rounded-full p-3 shadow-lg hover:bg-indigo-600"
						onclick={processImage}
						disabled={processing}
					>
						<Check class="w-6 h-6 text-white" />
					</button>
				</div>
			</div>
		{/if}
	</div>

	{#if processing}
		<div class="mt-4 text-center" transition:fade>
			<div
				class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500"
			>
				<svg
					class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				Processing image...
			</div>
		</div>
	{/if}
</div>
