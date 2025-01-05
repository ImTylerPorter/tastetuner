<script lang="ts">
	import Section from './Section.svelte';
	import DrinkHistory from '$lib/components/drink/DrinkHistory.svelte';
	import type { DrinkHistory as DrinkHistoryType } from '$lib/types';

	let { history } = $props<{
		history: DrinkHistoryType[];
	}>();
</script>

<Section title="My Drinks">
	<DrinkHistory {history} />
</Section>
