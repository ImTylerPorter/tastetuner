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
} from 'drizzle-orm/pg-core';

// Define enums for drink types and preferences
export const drinkType = pgEnum('drink_type', ['beer', 'cocktail', 'spirit', 'wine', 'non-alcoholic']);
export const flavorPreference = pgEnum('flavor_preference', ['sweet', 'bitter', 'sour', 'spicy', 'umami', 'salty']);

// Reference to Supabase's built-in `auth.users` table
const auth = pgSchema('auth');
export const authUsers = auth.table('users', {
  id: uuid('id').primaryKey(),
});

// Profile table
export const profileTable = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }), // Cascade delete profile if user is deleted
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  profilePhoto: varchar('profile_photo'), // URL to the profile photo
  favoriteFlavor: flavorPreference('favorite_flavor'),
  favoriteDrinkType: drinkType('favorite_drink_type'),
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
  description: text('description'),
  alcoholContent: integer('alcohol_content'),
  brand: varchar('brand', { length: 100 }),
  isSeasonal: boolean('is_seasonal').default(false),
  isExclusive: boolean('is_exclusive').default(false)
});

// Recommendations table
export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => authUsers.id),
  drinkId: uuid('drink_id').references(() => drinks.id),
  reason: text('reason'),
  recommendedAt: timestamp('recommended_at', { withTimezone: true }).defaultNow().notNull(),
  source: varchar('source', { length: 255 }) // Could be 'photo', 'link', 'api'
});

// Drink history table with rating
export const drinkHistory = pgTable('drink_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => authUsers.id),
  drinkId: uuid('drink_id').references(() => drinks.id),
  consumedAt: timestamp('consumed_at', { withTimezone: true }).defaultNow().notNull(),
  rating: integer('rating')
}, () => ({
  checks: [
    { name: 'rating_check', expr: 'rating >= 1 AND rating <= 5' }
  ]
}));

// For premium features like API connections
export const restaurantConnections = pgTable('restaurant_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => authUsers.id),
  restaurantId: varchar('restaurant_id', { length: 100 }),
  apiKey: varchar('api_key', { length: 255 }).notNull(),
  connectionStatus: boolean('connection_status').default(false)
});