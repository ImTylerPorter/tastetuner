<script lang="ts">
	import { Camera, User, History, Settings } from 'lucide-svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
	import type { Profile } from '$lib/types';

	let { activeSection, profile } = $props<{
		activeSection: string;
		profile: Profile;
	}>();

	function handleSectionChange(section: string) {
		activeSection = section;
	}
</script>

<nav class="bg-transparent">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 justify-between items-center">
			<div class="flex items-center">
				<div class="flex-shrink-0 w-32">
					<Logo />
				</div>
				<div class="hidden sm:ml-6 sm:flex sm:space-x-6">
					<button
						class={`inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${
							activeSection === 'scan' ? 'text-white' : 'text-white/80 hover:text-white'
						}`}
						onclick={() => handleSectionChange('scan')}
					>
						<Camera class="w-5 h-5 mr-2" />
						Scan Menu
					</button>
					<button
						class={`inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${
							activeSection === 'history' ? 'text-white' : 'text-white/80 hover:text-white'
						}`}
						onclick={() => handleSectionChange('history')}
					>
						<History class="w-5 h-5 mr-2" />
						History
					</button>
					<button
						class={`inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${
							activeSection === 'profile' ? 'text-white' : 'text-white/80 hover:text-white'
						}`}
						onclick={() => handleSectionChange('profile')}
					>
						<User class="w-5 h-5 mr-2" />
						Profile
					</button>
				</div>
			</div>

			<div class="flex items-center space-x-3">
				<div class="flex items-center space-x-2">
					<img
						src={profile.profilePhoto ?? 'https://api.dicebear.com/9.x/thumbs/svg?seed=Amaya'}
						alt={profile.firstName || 'User avatar'}
						class="w-8 h-8 rounded-full"
					/>
					<span class="text-sm font-medium text-white">{profile.firstName}</span>
				</div>
				<button
					type="button"
					class="rounded-full p-2 text-white/80 hover:text-white transition-all duration-200"
				>
					<Settings class="h-6 w-6" />
				</button>
			</div>
		</div>
	</div>
</nav>
