import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/db';
import { profileTable } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { analyzeMenu } from '$lib/services/menuAnalysis';
import { analyzeMenuWithAI } from '$lib/services/aiMenuAnalysis';

export const POST = async ({ request, locals }: RequestEvent) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { text } = await request.json();

	if (!text) {
		return json({ error: 'No menu text provided' }, { status: 400 });
	}

	try {
		// Get user preferences
		const userProfile = await db.query.profileTable.findFirst({
			where: eq(profileTable.id, locals.user.id)
		});

		if (!userProfile) {
			return json({ error: 'User profile not found' }, { status: 404 });
		}

		// First, analyze the menu with AI to extract structured data
		const aiAnalysis = await analyzeMenuWithAI(text);

		// Then, use our matching algorithm to score and recommend drinks
		const recommendations = await analyzeMenu(text, userProfile, aiAnalysis);

		return json({
			recommendations,
			userPreferences: {
				favoriteFlavors: userProfile.favoriteFlavors,
				favoriteDrinkTypes: userProfile.favoriteDrinkTypes,
				dietaryRestrictions: userProfile.dietaryRestrictions
			},
			prices: aiAnalysis.prices,
			descriptions: aiAnalysis.descriptions
		});
	} catch (error) {
		console.error('Error analyzing menu:', error);
		return json(
			{ error: 'An error occurred while analyzing the menu' },
			{ status: 500 }
		);
	}
};