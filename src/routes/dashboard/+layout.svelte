<script lang="ts">
	let { children } = $props<{
		children: any;
	}>();
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-500 via-purple-400 to-blue-500">
	{@render children()}
</div>

<style>
	:global(body) {
		@apply overflow-x-hidden bg-gradient-to-br from-purple-500 via-purple-400 to-blue-500;
	}
</style>
