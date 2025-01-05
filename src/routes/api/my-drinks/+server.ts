import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/db';
import { drinkHistory } from '$lib/db/schema';

export const POST = async ({ request, locals }: RequestEvent) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const { drinkId, locationId } = await request.json();

		if (!drinkId) {
			return json({ error: 'Drink ID is required' }, { status: 400 });
		}

		// Add to drink history
		await db.insert(drinkHistory).values({
			id: crypto.randomUUID(),
			userId: locals.user.id,
			drinkId,
			locationId,
			consumedAt: new Date()
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error adding to drink history:', error);
		return json(
			{ error: 'An error occurred while adding to drink history' },
			{ status: 500 }
		);
	}
};