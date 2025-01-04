import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import { profileTable, drinkHistory } from '$lib/db/schema';

export const load = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.user) {
		throw redirect(303, '/');
	}

	// Get user profile
	const profile = await db.query.profileTable.findFirst({
		where: eq(profileTable.id, locals.user.id)
	});

	if (!profile) {
		throw error(404, 'Profile not found');
	}

	// Get drink history with drink details
	const history = await db.query.drinkHistory.findMany({
		where: eq(drinkHistory.userId, locals.user.id),
		with: {
			drink: true
		},
		orderBy: (history, { desc }) => [desc(history.consumedAt)]
	});

	return {
		profile,
		history
	};
};