<script lang="ts">
	import { Camera, User, History, Settings, MapPin } from 'lucide-svelte';
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
								? 'text-black bg-highlight'
								: 'text-white/70 hover:text-white hover:bg-highlight/20'
						}`}
					>
						<Camera class="w-5 h-5 mr-2" />
						Scan Menu
					</a>
					<a
						href="/dashboard/locations"
						class={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							currentPath.startsWith('/dashboard/locations')
								? 'text-black bg-highlight'
								: 'text-white/70 hover:text-white hover:bg-highlight/20'
						}`}
					>
						<MapPin class="w-5 h-5 mr-2" />
						Locations
					</a>
					<a
						href="/dashboard/my-drinks"
						class={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							currentPath === '/dashboard/my-drinks'
								? 'text-black bg-highlight'
								: 'text-white/70 hover:text-white hover:bg-highlight/20'
						}`}
					>
						<History class="w-5 h-5 mr-2" />
						My Drinks
					</a>
					<a
						href="/dashboard/profile"
						class={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
							currentPath === '/dashboard/profile'
								? 'text-black bg-highlight'
								: 'text-white/70 hover:text-white hover:bg-highlight/20'
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
						class="w-8 h-8 rounded-full ring-2 ring-highlight"
					/>
					<span class="text-sm font-medium text-white">{profile.firstName}</span>
				</div>
				<a
					href="/dashboard/settings"
					class={`rounded-lg p-2 text-white/70 hover:text-white hover:bg-highlight/20 transition-all duration-200 ${
						currentPath === '/dashboard/settings' ? 'bg-highlight text-black' : ''
					}`}
				>
					<Settings class="h-6 w-6" />
				</a>
			</div>
		</div>
	</div>
</nav>
