<script lang="ts">
	import Section from './Section.svelte';
	import ProfileManager from '$lib/components/profile/ProfileManager.svelte';
	import type { Profile } from '$lib/types';

	let { profile } = $props<{
		profile: Profile | null;
	}>();
</script>

<Section title="Profile & Preferences">
	{#if profile}
		<ProfileManager {profile} />
	{:else}
		<p class="text-white/70">Loading profile...</p>
	{/if}
</Section>
