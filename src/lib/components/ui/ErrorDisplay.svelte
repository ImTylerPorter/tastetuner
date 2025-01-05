<script lang="ts">
	import { XCircle } from 'lucide-svelte';

	export let message: string | null = null;
</script>

{#if message}
	<div class="rounded-md bg-red-50 p-4 mb-4">
		<div class="flex">
			<div class="flex-shrink-0">
				<XCircle class="h-5 w-5 text-red-400" />
			</div>
			<div class="ml-3">
				<p class="text-sm font-medium text-red-800">{message}</p>
			</div>
		</div>
	</div>
{/if}
