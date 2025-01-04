import { OPENAI_API_KEY } from '$env/static/private';
import type { Profile, Drink } from '$lib/types';
import { db } from '$lib/db';
import { drinkHistory } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export interface AIMenuAnalysisResult {
	drinks: Drink[];
	prices: Record<string, number>;
	descriptions: Record<string, string>;
	personalizedSuggestions?: Drink[];
}

interface AIAnalyzedDrink {
	name: string;
	type: 'beer' | 'wine' | 'cocktail' | 'spirit' | 'non-alcoholic';
	brand: string | null;
	price: number | null;
	alcoholContent: number | null;
	description: string | null;
	isSeasonal: boolean;
	isExclusive: boolean;
}

const SYSTEM_PROMPT = `You are a drink menu analysis expert. Your task is to:
1. Extract all drinks from the menu text
2. Identify their types (beer, wine, cocktail, spirit, non-alcoholic)
3. Extract prices
4. Extract or infer alcohol content
5. Identify brands
6. Extract or generate descriptions
7. Detect if drinks are seasonal or exclusive

Format your response as a JSON object with the following structure:
{
  "drinks": [
    {
      "name": "string",
      "type": "beer" | "wine" | "cocktail" | "spirit" | "non-alcoholic",
      "brand": "string" | null,
      "price": number | null,
      "alcoholContent": number | null,
      "description": "string" | null,
      "isSeasonal": boolean,
      "isExclusive": boolean
    }
  ]
}`;

const SUGGESTION_PROMPT = `Based on the user's drink history and preferences, suggest drinks from the menu that they might enjoy.
Consider:
1. Their favorite drink types and styles
2. Common flavors they enjoy
3. Price preferences
4. Previous ratings
5. Seasonal preferences

Format suggestions as part of the drinks array, but add a "matchReason" field explaining why each drink was suggested.`;

export async function analyzeMenuWithAI(
	text: string,
	userId?: string
): Promise<AIMenuAnalysisResult> {
	try {
		// First, get the basic menu analysis
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
						content: SYSTEM_PROMPT
					},
					{
						role: 'user',
						content: text
					}
				],
				temperature: 0.3,
				response_format: { type: 'json_object' }
			})
		});

		if (!response.ok) {
			throw new Error('Failed to analyze menu with AI');
		}

		const result = await response.json();
		const analysis = JSON.parse(result.choices[0].message.content) as {
			drinks: AIAnalyzedDrink[];
		};

		// Transform the AI response into our application's format
		const drinks: Drink[] = analysis.drinks.map((drink) => ({
			id: crypto.randomUUID(),
			name: drink.name,
			type: drink.type,
			brand: drink.brand,
			alcoholContent: drink.alcoholContent,
			description: drink.description,
			isSeasonal: drink.isSeasonal,
			isExclusive: drink.isExclusive
		}));

		// Extract prices and descriptions for reference
		const prices: Record<string, number> = {};
		const descriptions: Record<string, string> = {};
		analysis.drinks.forEach((drink) => {
			if (drink.price) prices[drink.name] = drink.price;
			if (drink.description) descriptions[drink.name] = drink.description;
		});

		// If we have a userId, get personalized suggestions
		let personalizedSuggestions: Drink[] | undefined;
		if (userId) {
			const userHistory = await db.query.drinkHistory.findMany({
				where: eq(drinkHistory.userId, userId),
				orderBy: (history, { desc }) => [desc(history.rating)],
				limit: 10
			});

			if (userHistory.length > 0) {
				// Get personalized suggestions using another AI call
				const suggestionsResponse = await fetch(
					'https://api.openai.com/v1/chat/completions',
					{
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
									content: SUGGESTION_PROMPT
								},
								{
									role: 'user',
									content: JSON.stringify({
										menu: text,
										userHistory: userHistory.map((h) => ({
											drinkName: drinks.find((d) => d.id === h.drinkId)?.name,
											rating: h.rating,
											type: drinks.find((d) => d.id === h.drinkId)?.type
										}))
									})
								}
							],
							temperature: 0.3,
							response_format: { type: 'json_object' }
						})
					}
				);

				if (suggestionsResponse.ok) {
					const suggestionsResult = await suggestionsResponse.json();
					const suggestions = JSON.parse(
						suggestionsResult.choices[0].message.content
					) as {
						suggestions: Array<{ drinkId: string; matchReason: string }>;
					};

					personalizedSuggestions = suggestions.suggestions
						.map((s) => drinks.find((d) => d.id === s.drinkId))
						.filter((d): d is Drink => d !== undefined);
				}
			}
		}

		return {
			drinks,
			prices,
			descriptions,
			personalizedSuggestions
		};
	} catch (error) {
		console.error('AI Menu Analysis Error:', error);
		throw error;
	}
}

export async function inferDrinkStyles(drink: Drink, description: string | null): Promise<string[]> {
	if (!description) return [];

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
					content: `Analyze the drink description and infer the drink style(s). For example:
- Beer: IPA, Stout, Lager, etc.
- Wine: Red, White, Rosé, Sparkling, etc.
- Cocktail: Classic, Tropical, Sour, etc.
Return the styles as a JSON array of strings.`
				},
				{
					role: 'user',
					content: JSON.stringify({
						drinkType: drink.type,
						description
					})
				}
			],
			temperature: 0.3,
			response_format: { type: 'json_object' }
		})
	});

	if (!response.ok) {
		return [];
	}

	const result = await response.json();
	const styles = JSON.parse(result.choices[0].message.content) as { styles: string[] };
	return styles.styles;
}

export async function extractFlavors(description: string | null): Promise<string[]> {
	if (!description) return [];

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
					content: `Extract flavor notes from the drink description.
Common flavor categories:
- Fruity (citrus, berry, tropical)
- Spicy (cinnamon, pepper, ginger)
- Sweet (honey, caramel, vanilla)
- Bitter (coffee, chocolate, hops)
- Herbal (mint, basil, rosemary)
Return the flavors as a JSON array of strings.`
				},
				{
					role: 'user',
					content: description
				}
			],
			temperature: 0.3,
			response_format: { type: 'json_object' }
		})
	});

	if (!response.ok) {
		return [];
	}

	const result = await response.json();
	const flavors = JSON.parse(result.choices[0].message.content) as { flavors: string[] };
	return flavors.flavors;
}

export async function generateDrinkSuggestion(
	profile: Profile,
	previousChoices: Drink[]
): Promise<Drink | null> {
	const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
					content: `Generate a personalized drink suggestion based on the user's profile and previous choices.
The suggestion should include:
1. Name
2. Type
3. Description
4. Estimated alcohol content
5. Explanation of why this drink would appeal to the user
Return the suggestion as a JSON object.`
				},
				{
					role: 'user',
					content: JSON.stringify({
						profile,
						previousChoices: previousChoices.map((d) => ({
							name: d.name,
							type: d.type,
							description: d.description
						}))
					})
				}
			],
			temperature: 0.7,
			response_format: { type: 'json_object' }
		})
	});

	if (!response.ok) {
		return null;
	}

	const result = await response.json();
	const suggestion = JSON.parse(result.choices[0].message.content) as {
		drink: AIAnalyzedDrink;
	};

	return {
		id: crypto.randomUUID(),
		name: suggestion.drink.name,
		type: suggestion.drink.type,
		brand: suggestion.drink.brand,
		alcoholContent: suggestion.drink.alcoholContent,
		description: suggestion.drink.description,
		isSeasonal: suggestion.drink.isSeasonal,
		isExclusive: suggestion.drink.isExclusive
	};
}