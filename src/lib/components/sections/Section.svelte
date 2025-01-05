<script lang="ts">
	let { title } = $props<{
		title: string;
	}>();
</script>

<div class="bg-white/5 rounded-3xl">
	<div class="px-8 py-6">
		<h2 class="text-4xl font-semibold mb-8 text-white">{title}</h2>
		<slot />
	</div>
</div>
