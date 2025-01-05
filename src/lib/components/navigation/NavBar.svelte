<script lang="ts">
	import { Camera, User, History, Settings } from 'lucide-svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
	import type { Profile } from '$lib/types';
	import { page } from '$app/stores';

	let { profile } = $props<{
		profile: Profile;
	}>();

	let currentPath = $derived($page.url.pathname);
</script>

<nav class="backdrop-blur-md bg-black/10 border-b border-white/10">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
		<div class="flex h-16 justify-between items-center">
			<div class="flex items-center">
				<a href="/" class="flex-shrink-0 w-32">
					<Logo />
				</a>
				<div class="hidden sm:ml-6 sm:flex sm:space-x-1">
					<a
						href="/dashboard"
						class={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							currentPath === '/dashboard'
								? 'text-white bg-white/20'
								: 'text-white/70 hover:text-white hover:bg-white/10'
						}`}
					>
						<Camera class="w-5 h-5 mr-2" />
						Scan Menu
					</a>
					<a
						href="/dashboard/history"
						class={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							currentPath === '/dashboard/history'
								? 'text-white bg-white/20'
								: 'text-white/70 hover:text-white hover:bg-white/10'
						}`}
					>
						<History class="w-5 h-5 mr-2" />
						History
					</a>
					<a
						href="/dashboard/profile"
						class={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							currentPath === '/dashboard/profile'
								? 'text-white bg-white/20'
								: 'text-white/70 hover:text-white hover:bg-white/10'
						}`}
					>
						<User class="w-5 h-5 mr-2" />
						Profile
					</a>
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
				<a
					href="/dashboard/settings"
					class={`rounded-lg p-2 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 ${
						currentPath === '/dashboard/settings' ? 'bg-white/20 text-white' : ''
					}`}
				>
					<Settings class="h-6 w-6" />
				</a>
			</div>
		</div>
	</div>
</nav>
