import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { drinks, drinkHistory } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request, locals }) {
	try {
		if (!locals.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const data = await request.json();
		const { drinkName } = data;

		if (!drinkName) {
			return json({ error: 'Drink name is required' }, { status: 400 });
		}

		// Find or create the drink
		let drink = await db.query.drinks.findFirst({
			where: eq(drinks.name, drinkName)
		});

		if (!drink) {
			const [newDrink] = await db.insert(drinks)
				.values({
					name: drinkName,
					type: 'beer', // Default type, should be updated later when rating
				})
				.returning();
			drink = newDrink;
		}

		// Add to user's drink history
		const [history] = await db.insert(drinkHistory)
			.values({
				userId: locals.user.id,
				drinkId: drink.id,
				consumedAt: new Date(),
				rating: null // Will be updated when user rates
			})
			.returning();

		return json({
			success: true,
			drinkId: drink.id,
			historyId: history.id
		});
	} catch (error) {
		console.error('Failed to save drink:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to save drink' },
			{ status: 500 }
		);
	}
}