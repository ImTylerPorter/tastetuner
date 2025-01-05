<script lang="ts">
	let { title } = $props<{
		title: string;
	}>();
</script>

<div
	class="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 transition-all duration-300 hover:border-highlight/30"
>
	<div class="px-8 py-8">
		<div class="max-w-3xl mx-auto">
			<h2
				class="text-3xl font-semibold mb-6 bg-gradient-to-r from-highlight to-highlight/70 bg-clip-text text-transparent"
			>
				{title}
			</h2>
			<div class="space-y-8">
				<slot />
			</div>
		</div>
	</div>
</div>
