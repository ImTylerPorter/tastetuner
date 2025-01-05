import type { InferSelectModel } from 'drizzle-orm';
import type { profileTable, drinks, drinkHistory } from '$lib/db/schema';

export type Profile = InferSelectModel<typeof profileTable>;
export type Drink = InferSelectModel<typeof drinks>;
export type DrinkHistory = InferSelectModel<typeof drinkHistory> & {
	drink: Drink;
};

export type Location = {
	id: string;
	name: string;
	type: 'restaurant' | 'brewery' | 'taproom' | 'bar' | 'other';
	address?: string | null;
	city?: string | null;
	state?: string | null;
	createdAt: Date;
};