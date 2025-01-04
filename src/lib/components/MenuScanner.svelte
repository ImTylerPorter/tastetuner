<script lang="ts">
	import { createWorker } from 'tesseract.js';
	import { Upload, Loader2 } from 'lucide-svelte';
	import MobileMenuScanner from './MobileMenuScanner.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let { onScan, onError } = $props<{
		onScan: (text: string) => void;
		onError: (message: string) => void;
	}>();

	let fileInput = $state<HTMLInputElement>();
	let textInput = $state<HTMLTextAreaElement>();
	let dragActive = $state(false);
	let processing = $state(false);
	let error = $state<string | null>(null);
	let isMobile = $state(false);

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

		processing = true;
		error = null;

		try {
			const worker = await createWorker('eng');
			const result = await worker.recognize(file);
			await worker.terminate();

			if (result.data.text.trim()) {
				onScan(result.data.text);
				if (textInput) {
					textInput.value = result.data.text;
				}
			} else {
				error = 'No text was found in the image. Please try again or paste the menu text manually.';
				onError(error);
			}
		} catch (err) {
			error = 'Failed to process the image. Please try again or paste the menu text manually.';
			onError(error);
			console.error('OCR error:', err);
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

	function handleTextSubmit() {
		const text = textInput?.value.trim();
		if (text) {
			onScan(text);
		} else {
			error = 'Please enter some menu text';
			onError(error);
		}
	}

	function handleMobileScan(text: string) {
		if (textInput) {
			textInput.value = text;
		}
		onScan(text);
	}
</script>

{#if isMobile}
	<MobileMenuScanner
		onScan={(text) => handleMobileScan(text)}
		onError={(message) => (error = message)}
	/>
{:else}
	<div class="space-y-6">
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

		<div class="max-w-xl mx-auto">
			<label for="menu-text" class="block text-sm font-medium text-gray-700">
				Or paste menu text
			</label>
			<div class="mt-1">
				<textarea
					id="menu-text"
					bind:this={textInput}
					rows="4"
					class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
					placeholder="Paste the menu text here..."
				></textarea>
			</div>
			<div class="mt-2 flex justify-end">
				<button
					type="button"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					onclick={handleTextSubmit}
					disabled={processing}
				>
					{#if processing}
						<Loader2 class="w-4 h-4 mr-2 animate-spin" />
						Processing...
					{:else}
						Get Recommendations
					{/if}
				</button>
			</div>
		</div>
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
