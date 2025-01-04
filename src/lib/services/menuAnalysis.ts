import type { Profile, Drink } from '$lib/types';
import { drinkType } from '$lib/db/schema';
import type { AIMenuAnalysisResult } from './aiMenuAnalysis';

interface MenuAnalysisResult {
	matches: Drink[];
	suggestions: Drink[];
}

interface ScoredDrink {
	drink: Drink;
	score: number;
}

export async function analyzeMenu(
	text: string,
	profile: Profile,
	aiAnalysis?: AIMenuAnalysisResult
): Promise<MenuAnalysisResult> {
	// Use AI-extracted drinks if available, otherwise fall back to basic extraction
	const drinks = aiAnalysis?.drinks || extractDrinks(text);

	// Score drinks based on user preferences
	const scoredDrinks: ScoredDrink[] = drinks.map((drink) => ({
		drink,
		score: calculateMatchScore(drink, profile, aiAnalysis)
	}));

	// Sort by score and split into matches and suggestions
	const sortedDrinks = scoredDrinks.sort((a, b) => b.score - a.score);
	const matches = sortedDrinks.filter((d) => d.score > 0.7).map((d) => d.drink);
	const suggestions = sortedDrinks
		.filter((d) => d.score <= 0.7 && d.score > 0.4)
		.map((d) => d.drink);

	return {
		matches,
		suggestions
	};
}

function extractDrinks(text: string): Drink[] {
	// Basic fallback implementation for when AI analysis is not available
	const drinks: Drink[] = [];
	const lines = text.split('\n');

	for (const line of lines) {
		const lowerLine = line.toLowerCase();

		// Check for drink type keywords
		for (const type of drinkType.enumValues) {
			if (lowerLine.includes(type.toLowerCase())) {
				// Extract drink details
				const name = line.trim();
				const brand = extractBrand(line);
				const alcoholContent = extractAlcoholContent(line);

				drinks.push({
					id: crypto.randomUUID(),
					name,
					type: type,
					brand: brand || null,
					alcoholContent: alcoholContent || null,
					description: null,
					isSeasonal: false,
					isExclusive: false
				});
			}
		}
	}

	return drinks;
}

function calculateMatchScore(
	drink: Drink,
	profile: Profile,
	aiAnalysis?: AIMenuAnalysisResult
): number {
	let score = 0;
	let factors = 0;

	// Check drink type preference
	if (profile.favoriteDrinkTypes?.includes(drink.type)) {
		score += 1;
		factors += 1;
	}

	// Check style preferences based on drink type
	if (drink.type === 'beer' && profile.favoriteBeerStyles?.length) {
		// TODO: Use AI to infer beer style from description
		factors += 1;
	} else if (drink.type === 'cocktail' && profile.favoriteCocktailStyles?.length) {
		// TODO: Use AI to infer cocktail style from description
		factors += 1;
	} else if (drink.type === 'wine' && profile.favoriteWineStyles?.length) {
		// TODO: Use AI to infer wine style from description
		factors += 1;
	}

	// Check budget preference if available
	if (profile.budget && aiAnalysis?.prices[drink.name]) {
		const price = aiAnalysis.prices[drink.name];
		const budgetDiff = Math.abs(profile.budget - price);
		const budgetScore = Math.max(0, 1 - budgetDiff / profile.budget);
		score += budgetScore;
		factors += 1;
	}

	// Consider dietary restrictions if available
	if (profile.dietaryRestrictions && aiAnalysis?.descriptions[drink.name]) {
		// TODO: Use AI to check if drink matches dietary restrictions
		factors += 1;
	}

	// TODO: Use AI to extract and match flavor preferences
	if (profile.favoriteFlavors?.length && aiAnalysis?.descriptions[drink.name]) {
		// TODO: Implement flavor matching
		factors += 1;
	}

	return factors > 0 ? score / factors : 0;
}

function extractBrand(text: string): string | null {
	const commonBrands = [
		'Heineken',
		'Guinness',
		'Stella Artois',
		'Corona',
		'Budweiser',
		'Jack Daniels',
		'Absolut',
		'Grey Goose',
		'Bacardi',
		'Bombay Sapphire'
	];

	for (const brand of commonBrands) {
		if (text.toLowerCase().includes(brand.toLowerCase())) {
			return brand;
		}
	}

	return null;
}

function extractAlcoholContent(text: string): number | null {
	// Look for alcohol percentage patterns (e.g., "5.2%", "5.2 %", "5.2 ABV")
	const match = text.match(/(\d+\.?\d*)(?:\s*%|\s*ABV)/i);
	return match ? parseFloat(match[1]) : null;
}