import { db } from '$lib/db';
import { profileTable, drinkType, flavorPreference, beerStyle, cocktailStyle, wineStyle } from '$lib/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

export const actions = {
	update: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const favoriteFlavors = formData.getAll('favoriteFlavors').map(v => v.toString());
		const favoriteDrinkTypes = formData.getAll('favoriteDrinkTypes').map(v => v.toString());
		const favoriteBeerStyles = formData.getAll('favoriteBeerStyles').map(v => v.toString());
		const favoriteCocktailStyles = formData.getAll('favoriteCocktailStyles').map(v => v.toString());
		const favoriteWineStyles = formData.getAll('favoriteWineStyles').map(v => v.toString());
		const budget = formData.get('budget') ? Number(formData.get('budget')) : null;
		const dietaryRestrictions = formData.get('dietaryRestrictions')?.toString();

		// Validate enum values
		if (favoriteFlavors.length > 0 && !favoriteFlavors.every(flavor =>
			flavorPreference.enumValues.includes(flavor as typeof flavorPreference.enumValues[number])
		)) {
			throw error(400, 'Invalid flavor preferences');
		}
		if (favoriteDrinkTypes.length > 0 && !favoriteDrinkTypes.every(type => drinkType.enumValues.includes(type as typeof drinkType.enumValues[number]))) {
			throw error(400, 'Invalid drink types');
		}

		// Validate style values
		if (favoriteBeerStyles.length > 0 && !favoriteBeerStyles.every(style => beerStyle.enumValues.includes(style as typeof beerStyle.enumValues[number]))) {
			throw error(400, 'Invalid beer style');
		}
		if (favoriteCocktailStyles.length > 0 && !favoriteCocktailStyles.every(style => cocktailStyle.enumValues.includes(style as typeof cocktailStyle.enumValues[number]))) {
			throw error(400, 'Invalid cocktail style');
		}
		if (favoriteWineStyles.length > 0 && !favoriteWineStyles.every(style => wineStyle.enumValues.includes(style as typeof wineStyle.enumValues[number]))) {
			throw error(400, 'Invalid wine style');
		}

		try {
			await db
				.update(profileTable)
				.set({
					favoriteFlavors: favoriteFlavors as typeof flavorPreference.enumValues[number][],
					favoriteDrinkTypes: favoriteDrinkTypes as typeof drinkType.enumValues[number][],
					favoriteBeerStyles: favoriteBeerStyles as typeof beerStyle.enumValues[number][],
					favoriteCocktailStyles: favoriteCocktailStyles as typeof cocktailStyle.enumValues[number][],
					favoriteWineStyles: favoriteWineStyles as typeof wineStyle.enumValues[number][],
					budget,
					dietaryRestrictions: dietaryRestrictions || null,
					updatedAt: new Date()
				})
				.where(eq(profileTable.id, locals.user.id));

			return { success: true };
		} catch (err) {
			console.error('Error updating preferences:', err);
			throw error(500, 'Failed to update preferences');
		}
	}
} satisfies Actions;