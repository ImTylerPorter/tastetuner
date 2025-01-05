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

<nav class="backdrop-blur-md bg-black/10 border-b border-white/10">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
		<div class="flex h-16 justify-between items-center">
			<div class="flex items-center">
				<div class="flex-shrink-0 w-32">
					<Logo />
				</div>
				<div class="hidden sm:ml-6 sm:flex sm:space-x-1">
					<button
						class={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							activeSection === 'scan'
								? 'text-white bg-white/20'
								: 'text-white/70 hover:text-white hover:bg-white/10'
						}`}
						onclick={() => handleSectionChange('scan')}
					>
						<Camera class="w-5 h-5 mr-2" />
						Scan Menu
					</button>
					<button
						class={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							activeSection === 'history'
								? 'text-white bg-white/20'
								: 'text-white/70 hover:text-white hover:bg-white/10'
						}`}
						onclick={() => handleSectionChange('history')}
					>
						<History class="w-5 h-5 mr-2" />
						History
					</button>
					<button
						class={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							activeSection === 'profile'
								? 'text-white bg-white/20'
								: 'text-white/70 hover:text-white hover:bg-white/10'
						}`}
						onclick={() => handleSectionChange('profile')}
					>
						<User class="w-5 h-5 mr-2" />
						Profile
					</button>
				</div>
			</div>

			<div class="flex items-center space-x-4">
				<div class="flex items-center space-x-3 bg-white/10 rounded-lg px-3 py-1.5">
					<img
						src={profile.profilePhoto ?? 'https://api.dicebear.com/9.x/thumbs/svg?seed=Amaya'}
						alt={profile.firstName || 'User avatar'}
						class="w-8 h-8 rounded-full ring-2 ring-white/20"
					/>
					<span class="text-sm font-medium text-white">{profile.firstName}</span>
				</div>
				<button
					type="button"
					class="rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
				>
					<Settings class="h-6 w-6" />
				</button>
			</div>
		</div>
	</div>
</nav>
