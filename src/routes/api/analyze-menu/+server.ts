import { json } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/static/private';
import type { AIMenuAnalysisResult, LocationInfo } from '$lib/services/aiMenuAnalysis';
import { db } from '$lib/db';
import { profileTable, locations, menus } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

const SYSTEM_PROMPT = `You are a drink menu analysis expert. Your task is to analyze a draft beverage menu that includes details like ABV, IBU, and serving size.

For each drink entry, extract:
1. Name (including any collaborations or special editions)
2. Type (beer, wine, cocktail, spirit, non-alcoholic)
3. Style (e.g., IPA, Stout, Lager, etc.)
4. Brand/Brewery
5. ABV (alcohol content)
6. IBU (if provided)
7. Description
8. Special characteristics (e.g., seasonal, exclusive)

IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.
The response must be a valid JSON object with this exact structure:
{
  "drinks": [
    {
      "name": "string",
      "type": "beer" | "wine" | "cocktail" | "spirit" | "non-alcoholic",
      "style": "string",
      "brand": "string",
      "alcoholContent": number | null,
      "ibu": number | null,
      "description": "string",
      "isSeasonal": boolean,
      "isExclusive": boolean
    }
  ]
}`;

const RECOMMENDATION_PROMPT = `Based on the user's preferences and the available drinks, recommend the best matches.
Consider:
1. User's favorite drink types
2. Preferred styles for each type
3. Flavor preferences
4. Dietary restrictions
5. Budget considerations

For each recommended drink, explain why it's a good match for this user.

IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text.
The response must be a valid JSON object with this exact structure:
{
  "recommendations": [
    {
      "drinkName": "string",
      "matchScore": number,
      "reasoning": "string"
    }
  ]
}`;

function cleanJsonResponse(response: string): string {
	// Remove any markdown code block indicators and surrounding whitespace
	return response.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
}

async function findOrCreateLocation(locationInfo: LocationInfo) {
	// Try to find existing location
	const existingLocation = await db.query.locations.findFirst({
		where: and(
			eq(locations.name, locationInfo.locationName),
			eq(locations.type, locationInfo.locationType)
		)
	});

	if (existingLocation) {
		return existingLocation;
	}

	// Create new location
	const [newLocation] = await db.insert(locations).values({
		name: locationInfo.locationName,
		type: locationInfo.locationType,
		address: locationInfo.address || null,
		city: locationInfo.city || null,
		state: locationInfo.state || null
	}).returning();

	return newLocation;
}

async function findActiveMenu(locationId: string) {
	return await db.query.menus.findFirst({
		where: and(
			eq(menus.locationId, locationId),
			eq(menus.isActive, true)
		)
	});
}

export async function POST({ request, locals }) {
	try {
		console.log('Received analyze-menu request');
		const contentType = request.headers.get('Content-Type');
		console.log('Request Content-Type:', contentType);

		const data = await request.json();
		console.log('Request data keys:', Object.keys(data));
		console.log('Request data types:', Object.keys(data).map(key => `${key}: ${typeof data[key]}`));

		if (!data.image) {
			console.error('No image data in request');
			console.log('Full request data:', JSON.stringify(data, null, 2));
			throw new Error('No image data provided');
		}

		if (typeof data.image !== 'string') {
			console.error('Image data is not a string:', typeof data.image);
			throw new Error('Invalid image data type');
		}

		if (!data.image.startsWith('data:image/')) {
			console.error('Invalid image format, data starts with:', data.image.substring(0, 50));
			throw new Error('Invalid image format');
		}

		const imageData = data.image.split(',')[1]; // Remove data URL prefix
		if (!imageData) {
			console.error('No image data after splitting');
			throw new Error('Invalid image data format');
		}
		console.log('Image data length:', imageData.length);

		const locationInfo = data.location as LocationInfo;
		if (!locationInfo) {
			console.error('No location info in request');
			throw new Error('No location information provided');
		}
		console.log('Location info:', locationInfo);

		// Get user preferences if user is logged in
		let userPreferences = null;
		if (locals.user) {
			const profile = await db.query.profileTable.findFirst({
				where: eq(profileTable.userId, locals.user.id)
			});
			if (profile) {
				userPreferences = {
					favoriteDrinkTypes: profile.favoriteDrinkTypes,
					favoriteBeerStyles: profile.favoriteBeerStyles,
					favoriteCocktailStyles: profile.favoriteCocktailStyles,
					favoriteWineStyles: profile.favoriteWineStyles,
					favoriteFlavors: profile.favoriteFlavors,
					dietaryRestrictions: profile.dietaryRestrictions,
					budget: profile.budget,
					firstName: profile.firstName
				};
			}
		}

		// Find or create location
		const location = await findOrCreateLocation(locationInfo);

		// Check for existing active menu
		const existingMenu = await findActiveMenu(location.id);
		if (existingMenu) {
			const menuData = existingMenu.menuData as AIMenuAnalysisResult;

			// If we have user preferences, generate fresh recommendations
			if (userPreferences) {
				const recommendationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${OPENAI_API_KEY}`
					},
					body: JSON.stringify({
						model: 'gpt-4',
						messages: [
							{
								role: 'system',
								content: RECOMMENDATION_PROMPT
							},
							{
								role: 'user',
								content: JSON.stringify({
									drinks: menuData.drinks,
									userPreferences
								})
							}
						],
						temperature: 0.3
					})
				});

				if (recommendationResponse.ok) {
					const recommendationResult = await recommendationResponse.json();
					const cleanedRecommendations = cleanJsonResponse(recommendationResult.choices[0].message.content);
					const recommendations = JSON.parse(cleanedRecommendations);
					return json({
						...menuData,
						recommendations: recommendations.recommendations,
						location: locationInfo
					});
				}
			}

			return json({
				...menuData,
				location: locationInfo
			});
		}

		// If no existing menu, analyze the new one
		const menuResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${OPENAI_API_KEY}`
			},
			body: JSON.stringify({
				model: 'gpt-4-vision-preview',
				messages: [
					{
						role: 'system',
						content: SYSTEM_PROMPT
					},
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: 'Analyze this menu and return ONLY a JSON object with the extracted information. Do not include any markdown formatting or additional text.'
							},
							{
								type: 'image_url',
								image_url: {
									url: `data:image/jpeg;base64,${imageData}`
								}
							}
						]
					}
				],
				max_tokens: 4096,
				temperature: 0.3
			})
		});

		if (!menuResponse.ok) {
			const errorData = await menuResponse.json().catch(() => null);
			throw new Error(
				`OpenAI API error (${menuResponse.status}): ${
					errorData?.error?.message || menuResponse.statusText
				}`
			);
		}

		const menuResult = await menuResponse.json();
		const cleanedResponse = cleanJsonResponse(menuResult.choices[0].message.content);
		const menuAnalysis = JSON.parse(cleanedResponse);

		// Save the menu
		await db.insert(menus).values({
			locationId: location.id,
			menuData: menuAnalysis,
			isActive: true
		});

		// If we have user preferences, get personalized recommendations
		let recommendations = null;
		if (userPreferences) {
			const recommendationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${OPENAI_API_KEY}`
				},
				body: JSON.stringify({
					model: 'gpt-4',
					messages: [
						{
							role: 'system',
							content: RECOMMENDATION_PROMPT
						},
						{
							role: 'user',
							content: JSON.stringify({
								drinks: menuAnalysis.drinks,
								userPreferences
							})
						}
					],
					temperature: 0.3
				})
			});

			if (recommendationResponse.ok) {
				const recommendationResult = await recommendationResponse.json();
				const cleanedRecommendations = cleanJsonResponse(recommendationResult.choices[0].message.content);
				recommendations = JSON.parse(cleanedRecommendations);
			}
		}

		return json({
			...menuAnalysis,
			recommendations: recommendations?.recommendations || null,
			location: locationInfo
		} as AIMenuAnalysisResult);
	} catch (error) {
		console.error('Menu analysis error:', error);
		if (error instanceof SyntaxError) {
			return json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 });
		}
		return json({ error: 'Failed to analyze menu' }, { status: 500 });
	}
}