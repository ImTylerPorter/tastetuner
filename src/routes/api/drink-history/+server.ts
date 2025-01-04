import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/db';
import { drinkHistory } from '$lib/db/schema';

export const POST = async ({ request, locals }: RequestEvent) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const formData = await request.formData();
		const drinkId = formData.get('drinkId')?.toString();
		const rating = formData.get('rating') ? Number(formData.get('rating')) : null;

		if (!drinkId) {
			return json({ error: 'Drink ID is required' }, { status: 400 });
		}

		if (rating !== null && (rating < 1 || rating > 5)) {
			return json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
		}

		// Add to drink history
		await db.insert(drinkHistory).values({
			id: crypto.randomUUID(),
			userId: locals.user.id,
			drinkId,
			rating,
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