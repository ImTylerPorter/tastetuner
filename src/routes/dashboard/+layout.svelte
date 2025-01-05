<script lang="ts">
	let { children } = $props<{
		children: any;
	}>();
</script>

<div class="min-h-screen bg-gradient-to-br from-purple-500 via-highlight/30 to-blue-500">
	{@render children()}
</div>

<style>
	:global(body) {
		overflow-x: hidden;
		background: linear-gradient(to bottom right, #7e5bef, rgba(255, 255, 255, 0.3), #3b82f6);
	}
</style>
