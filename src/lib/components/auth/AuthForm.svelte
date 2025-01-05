<script lang="ts">
	import { User, Lock, Mail } from 'lucide-svelte';
	import ErrorDisplay from '$lib/components/ui/ErrorDisplay.svelte';

	let { onHandleSubmit } = $props<{ onHandleSubmit: (formData: FormData) => Promise<void> }>();

	let isLogin = $state<boolean>(true);
	let email = $state<string>('');
	let password = $state<string>('');
	let confirmPassword = $state<string>('');
	let firstName = $state<string>('');
	let lastName = $state<string>('');
	let errorMessage = $state<string | null>(null);

	function toggleForm() {
		isLogin = !isLogin;
		errorMessage = null; // Clear any errors when switching forms
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();
		errorMessage = null;

		if (!isLogin && password !== confirmPassword) {
			errorMessage = 'Passwords do not match';
			return;
		}

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		formData.append('isLogin', String(isLogin));

		try {
			await onHandleSubmit(formData);
		} catch (error) {
			if (error instanceof Error) {
				errorMessage = error.message;
			} else if (typeof error === 'string') {
				errorMessage = error;
			} else {
				errorMessage = 'An error occurred during authentication';
			}
			console.error('Auth error:', error);
		}
	}
</script>

<div class="w-full md:w-1/2 p-8">
	<h2 class="text-3xl font-bold mb-6 text-gray-800">
		{isLogin ? 'Welcome Back' : 'Join TasteTuner'}
	</h2>

	<ErrorDisplay message={errorMessage} />

	<form onsubmit={handleSubmit} class="space-y-4">
		{#if !isLogin}
			<div class="flex space-x-4">
				<div class="flex-1">
					<label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
					<div class="mt-1 relative rounded-md shadow-sm">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<User class="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							id="firstName"
							name="firstName"
							bind:value={firstName}
							required
							class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
							placeholder="John"
						/>
					</div>
				</div>
				<div class="flex-1">
					<label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
					<div class="mt-1 relative rounded-md shadow-sm">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<User class="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							id="lastName"
							name="lastName"
							bind:value={lastName}
							required
							class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
							placeholder="Doe"
						/>
					</div>
				</div>
			</div>
		{/if}
		<div>
			<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
			<div class="mt-1 relative rounded-md shadow-sm">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Mail class="h-5 w-5 text-gray-400" />
				</div>
				<input
					type="email"
					id="email"
					name="email"
					bind:value={email}
					required
					class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
					placeholder="you@example.com"
				/>
			</div>
		</div>
		<div>
			<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
			<div class="mt-1 relative rounded-md shadow-sm">
				<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<Lock class="h-5 w-5 text-gray-400" />
				</div>
				<input
					type="password"
					id="password"
					name="password"
					bind:value={password}
					required
					class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
					placeholder="********"
				/>
			</div>
		</div>
		{#if !isLogin}
			<div>
				<label for="confirmPassword" class="block text-sm font-medium text-gray-700"
					>Confirm Password</label
				>
				<div class="mt-1 relative rounded-md shadow-sm">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Lock class="h-5 w-5 text-gray-400" />
					</div>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						bind:value={confirmPassword}
						required
						class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
						placeholder="********"
					/>
				</div>
			</div>
		{/if}
		<button
			type="submit"
			class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
		>
			{isLogin ? 'Sign In' : 'Sign Up'}
		</button>
	</form>
	<p class="mt-4 text-center text-sm text-gray-600">
		{isLogin ? "Don't have an account?" : 'Already have an account?'}
		<button onclick={toggleForm} class="font-medium text-indigo-600 hover:text-indigo-500">
			{isLogin ? 'Sign up' : 'Log in'}
		</button>
	</p>
</div>
