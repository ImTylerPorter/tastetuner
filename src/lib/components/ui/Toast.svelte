<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Check, X, AlertCircle } from 'lucide-svelte';

	let {
		message,
		type = 'success',
		duration = 3000
	} = $props<{
		message: string;
		type?: 'success' | 'error' | 'info';
		duration?: number;
	}>();

	let visible = $state(true);

	let Icon = $derived(getIcon());

	function getIcon() {
		switch (type) {
			case 'success':
				return Check;
			case 'error':
				return AlertCircle;
			default:
				return AlertCircle;
		}
	}

	function getColors() {
		switch (type) {
			case 'success':
				return 'bg-highlight text-black';
			case 'error':
				return 'bg-red-500 text-white';
			default:
				return 'bg-blue-500 text-white';
		}
	}

	$effect(() => {
		if (duration) {
			const timer = setTimeout(() => {
				visible = false;
			}, duration);
			return () => clearTimeout(timer);
		}
	});
</script>

{#if visible}
	<div class="fixed bottom-4 right-4 z-50" transition:fly={{ y: 50, duration: 200 }} role="alert">
		<div
			class="flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg {getColors()} min-w-[200px]"
		>
			<Icon class="w-5 h-5" />
			<span class="font-medium">{message}</span>
			<button
				type="button"
				class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-black/10 transition-colors"
				aria-label="Close"
				onclick={() => (visible = false)}
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	</div>
{/if}
