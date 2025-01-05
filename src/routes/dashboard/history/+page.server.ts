import { db } from '$lib/db';
import { drinkHistory } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) return { history: [] };

	const history = await db.query.drinkHistory.findMany({
		where: eq(drinkHistory.userId, user.id),
		with: {
			drink: true
		}
	});

	return {
		history: history || []
	};
};