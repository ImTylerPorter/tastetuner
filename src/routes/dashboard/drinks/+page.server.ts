import { db } from '$lib/db';
import { drinkHistory } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function load({ locals }) {
	if (!locals.user) {
		return {
			status: 401,
			error: new Error('Unauthorized')
		};
	}

	const history = await db.query.drinkHistory.findMany({
		where: eq(drinkHistory.userId, locals.user.id),
		with: {
			drink: true
		},
		orderBy: [desc(drinkHistory.consumedAt)]
	});

	// Group drinks by rating status
	const rated = history.filter((h) => h.rating !== null);
	const unrated = history.filter((h) => h.rating === null);

	// Sort rated drinks by rating
	rated.sort((a, b) => {
		if (a.rating === null || b.rating === null) return 0;
		return b.rating - a.rating;
	});

	return {
		drinks: {
			rated,
			unrated
		}
	};
}