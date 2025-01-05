<script lang="ts">
	import NavBar from '$lib/components/navigation/NavBar.svelte';
	import ProfileSection from '$lib/components/sections/ProfileSection.svelte';
	import type { Profile } from '$lib/types';

	let { data } = $props<{
		data: {
			profile: Profile | null;
		};
	}>();

	let { profile } = $derived(data);
</script>

<div class="min-h-screen backdrop-blur-xl bg-black/10">
	<NavBar {profile} />

	<main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
		<div class="transition-all duration-300 ease-in-out space-y-8">
			<ProfileSection {profile} />
		</div>
	</main>
</div>
