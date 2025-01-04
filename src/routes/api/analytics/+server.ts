import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/db';
import { analyticsTable } from '$lib/db/schema';

export async function POST({ request, locals }: RequestEvent) {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const event = await request.json();

	// Validate event data
	if (!event.type || !event.category || !event.action) {
		return json({ error: 'Invalid event data' }, { status: 400 });
	}

	try {
		// Store the analytics event
		await db.insert(analyticsTable).values({
			userId: locals.user.id,
			type: event.type,
			category: event.category,
			action: event.action,
			label: event.label,
			metadata: event.metadata,
			timestamp: new Date()
		});

		return json({ success: true });
	} catch (error) {
		console.error('Failed to store analytics event:', error);
		return json({ error: 'Failed to store analytics event' }, { status: 500 });
	}
}