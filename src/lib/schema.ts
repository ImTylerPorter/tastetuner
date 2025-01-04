import { pgTable, serial, text, uuid, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { authUsers } from '$lib/db/schema';

// Analytics table
export const analyticsTable = pgTable('analytics', {
	id: serial('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => authUsers.id),
	type: text('type').notNull(),
	category: text('category').notNull(),
	action: text('action').notNull(),
	label: text('label'),
	metadata: jsonb('metadata'),
	timestamp: timestamp('timestamp').notNull().defaultNow()
});