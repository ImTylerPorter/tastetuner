import {
  pgTable,
  pgSchema,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  pgEnum,
  jsonb,
  serial
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define enums for drink types and preferences
export const drinkType = pgEnum('drink_type', ['beer', 'cocktail', 'spirit', 'wine', 'non-alcoholic']);
export const flavorPreference = pgEnum('flavor_preference', ['sweet', 'bitter', 'sour', 'spicy', 'umami', 'salty']);

// Add location type enum
export const locationType = pgEnum('location_type', ['restaurant', 'brewery', 'taproom', 'bar', 'other']);

// Add new enum for drink styles
export const beerStyle = pgEnum('beer_style', [
  'ipa', 'pilsner', 'stout', 'porter', 'lager', 'wheat', 'sour', 'pale_ale'
]);

export const cocktailStyle = pgEnum('cocktail_style', [
  'martini', 'margarita', 'old_fashioned', 'mojito', 'negroni', 'sour', 'tiki', 'spritz'
]);

export const wineStyle = pgEnum('wine_style', [
  'red', 'white', 'rose', 'sparkling', 'dessert', 'fortified'
]);

// Reference to Supabase's built-in `auth.users` table
const auth = pgSchema('auth');
export const authUsers = auth.table('users', {
  id: uuid('id').primaryKey()
});

// Profile table
export const profileTable = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  profilePhoto: varchar('profile_photo'),
  favoriteFlavors: flavorPreference('favorite_flavors').array(),
  favoriteDrinkTypes: drinkType('favorite_drink_types').array(),
  favoriteBeerStyles: beerStyle('favorite_beer_styles').array(),
  favoriteCocktailStyles: cocktailStyle('favorite_cocktail_styles').array(),
  favoriteWineStyles: wineStyle('favorite_wine_styles').array(),
  dietaryRestrictions: text('dietary_restrictions'),
  budget: integer('budget'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Drinks table
export const drinks = pgTable('drinks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: drinkType('type').notNull(),
  style: varchar('style', { length: 100 }),
  description: text('description'),
  alcoholContent: integer('alcohol_content'),
  ibu: integer('ibu'),
  brand: varchar('brand', { length: 100 }),
  isSeasonal: boolean('is_seasonal').default(false),
  isExclusive: boolean('is_exclusive').default(false)
});

// Drink history table with rating
export const drinkHistory = pgTable('drink_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  drinkId: uuid('drink_id').references(() => drinks.id),
  consumedAt: timestamp('consumed_at', { withTimezone: true }).defaultNow().notNull(),
  rating: integer('rating')
}, () => ({
  checks: [
    { name: 'rating_check', expr: 'rating >= 1 AND rating <= 5' }
  ]
}));

// Recommendations table
export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  drinkId: uuid('drink_id').references(() => drinks.id),
  reason: text('reason'),
  recommendedAt: timestamp('recommended_at', { withTimezone: true }).defaultNow().notNull(),
  source: varchar('source', { length: 255 }) // Could be 'photo', 'link', 'api'
});

// User connections table for social features
export const userConnections = pgTable('user_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').notNull(),
  followedId: uuid('followed_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// For premium features like API connections
export const restaurantConnections = pgTable('restaurant_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),  // Reference to auth.users
  restaurantId: varchar('restaurant_id', { length: 100 }),
  apiKey: varchar('api_key', { length: 255 }).notNull(),
  connectionStatus: boolean('connection_status').default(false)
});

// Analytics table
export const analyticsTable = pgTable('analytics', {
	id: serial('id').primaryKey(),
	userId: uuid('user_id').notNull(),  // Reference to auth.users
	type: text('type').notNull(),
	category: text('category').notNull(),
	action: text('action').notNull(),
	label: text('label'),
	metadata: jsonb('metadata'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});

// Notifications table
export const notifications = pgTable('notifications', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id').notNull(),  // Reference to auth.users
	type: varchar('type', { length: 50 }).notNull(),
	message: text('message').notNull(),
	read: boolean('read').default(false),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Menu cache table
export const menuCache = pgTable('menu_cache', {
	id: uuid('id').primaryKey().defaultRandom(),
	menuText: text('menu_text').notNull(),
	analysis: jsonb('analysis').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	expiresAt: timestamp('expires_at').notNull()
});

// Menu and location tables
export const locations = pgTable('locations', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 255 }).notNull(),
	type: locationType('type').notNull(),
	address: text('address'),
	city: varchar('city', { length: 100 }),
	state: varchar('state', { length: 50 }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const menus = pgTable('menus', {
	id: uuid('id').primaryKey().defaultRandom(),
	locationId: uuid('location_id').references(() => locations.id).notNull(),
	menuData: jsonb('menu_data').notNull(),
	isActive: boolean('is_active').default(true),
	validFrom: timestamp('valid_from', { withTimezone: true }).defaultNow().notNull(),
	validTo: timestamp('valid_to', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Relations
export const profileRelations = relations(profileTable, ({ many }) => ({
  drinkHistory: many(drinkHistory),
  recommendations: many(recommendations),
  connections: many(userConnections, { relationName: 'followerConnections' })
}));

export const drinkHistoryRelations = relations(drinkHistory, ({ one }) => ({
  profile: one(profileTable, {
    fields: [drinkHistory.userId],
    references: [profileTable.userId]
  }),
  drink: one(drinks, {
    fields: [drinkHistory.drinkId],
    references: [drinks.id]
  })
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  profile: one(profileTable, {
    fields: [recommendations.userId],
    references: [profileTable.userId]
  }),
  drink: one(drinks, {
    fields: [recommendations.drinkId],
    references: [drinks.id]
  })
}));

export const userConnectionsRelations = relations(userConnections, ({ one }) => ({
  followerProfile: one(profileTable, {
    fields: [userConnections.followerId],
    references: [profileTable.userId]
  }),
  followedProfile: one(profileTable, {
    fields: [userConnections.followedId],
    references: [profileTable.userId]
  })
}));

export const locationRelations = relations(locations, ({ many }) => ({
	menus: many(menus)
}));

export const menuRelations = relations(menus, ({ one }) => ({
	location: one(locations, {
		fields: [menus.locationId],
		references: [locations.id]
	})
}));