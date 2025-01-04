import { db } from '$lib/db';
import { notifications } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Profile } from '$lib/types';

export interface Notification {
	id: string;
	userId: string;
	type: 'follow' | 'share' | 'recommendation' | 'rating';
	message: string;
	read: boolean;
	createdAt: Date;
}

export async function createNotification(
	userId: string,
	type: Notification['type'],
	message: string
) {
	await db.insert(notifications).values({
		userId,
		type,
		message,
		read: false
	});
}

export async function markAsRead(notificationId: string) {
	await db
		.update(notifications)
		.set({ read: true })
		.where(eq(notifications.id, notificationId));
}

export async function getUnreadNotifications(userId: string) {
	return db.query.notifications.findMany({
		where: and(eq(notifications.userId, userId), eq(notifications.read, false)),
		orderBy: (notifications, { desc }) => [desc(notifications.createdAt)]
	});
}

export async function getAllNotifications(userId: string) {
	return db.query.notifications.findMany({
		where: eq(notifications.userId, userId),
		orderBy: (notifications, { desc }) => [desc(notifications.createdAt)]
	});
}

// Helper functions for common notification types
export async function notifyNewFollower(followedUser: Profile, follower: Profile) {
	await createNotification(
		followedUser.id,
		'follow',
		`${follower.firstName} ${follower.lastName} started following you`
	);
}

export async function notifySharedDrink(toUser: Profile, fromUser: Profile, drinkName: string) {
	await createNotification(
		toUser.id,
		'share',
		`${fromUser.firstName} ${fromUser.lastName} recommended "${drinkName}" to you`
	);
}

export async function notifyNewRating(
	toUser: Profile,
	fromUser: Profile,
	drinkName: string,
	rating: number
) {
	await createNotification(
		toUser.id,
		'rating',
		`${fromUser.firstName} ${fromUser.lastName} rated "${drinkName}" ${rating} stars`
	);
}