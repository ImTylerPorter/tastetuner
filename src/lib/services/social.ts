import { db } from '$lib/db';
import { userConnections, drinkHistory, recommendations } from '$lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { Profile } from '$lib/types';

export async function followUser(followerId: string, followedId: string) {
	await db.insert(userConnections).values({
		id: crypto.randomUUID(),
		followerId,
		followedId
	});
}

export async function unfollowUser(followerId: string, followedId: string) {
	await db
		.delete(userConnections)
		.where(
			and(
				eq(userConnections.followerId, followerId),
				eq(userConnections.followedId, followedId)
			)
		);
}

export async function getFollowers(userId: string): Promise<Profile[]> {
	const connections = await db.query.userConnections.findMany({
		where: eq(userConnections.followedId, userId),
		with: {
			followerProfile: true
		}
	});
	return connections.map(c => c.followerProfile as Profile);
}

export async function getFollowing(userId: string): Promise<Profile[]> {
	const connections = await db.query.userConnections.findMany({
		where: eq(userConnections.followerId, userId),
		with: {
			followedProfile: true
		}
	});
	return connections.map(c => c.followedProfile as Profile);
}

export async function getFriendsDrinkHistory(userId: string) {
	const following = await getFollowing(userId);
	const followingIds = following.map((f) => f.userId);

	return db.query.drinkHistory.findMany({
		where: inArray(drinkHistory.userId, followingIds),
		with: {
			profile: true,
			drink: true
		},
		orderBy: (history, { desc }) => [desc(history.consumedAt)]
	});
}

export async function shareDrinkRecommendation(
	fromUserId: string,
	toUserId: string,
	drinkId: string,
	message?: string
) {
	await db.insert(recommendations).values({
		id: crypto.randomUUID(),
		userId: toUserId,
		drinkId,
		reason: `Recommended by ${fromUserId}${message ? `: ${message}` : ''}`,
		source: 'social'
	});
}