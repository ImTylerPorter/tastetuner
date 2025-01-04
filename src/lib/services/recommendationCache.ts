import { db } from '$lib/db';
import { menuCache } from '$lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { AIMenuAnalysisResult } from './aiMenuAnalysis';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedAnalysis extends AIMenuAnalysisResult {
	timestamp: Date;
}

export async function getCachedAnalysis(
	menuText: string
): Promise<CachedAnalysis | null> {
	const cached = await db.query.menuCache.findFirst({
		where: eq(menuCache.menuText, menuText)
	});

	if (!cached) return null;

	// Check if cache is still valid
	const now = new Date();
	if (now > cached.expiresAt) {
		// Cache is expired, delete it
		await db.delete(menuCache).where(eq(menuCache.menuText, menuText));
		return null;
	}

	const analysis = cached.analysis as AIMenuAnalysisResult;
	return {
		...analysis,
		timestamp: cached.createdAt
	};
}

export async function cacheAnalysis(menuText: string, analysis: AIMenuAnalysisResult) {
	const expiresAt = new Date(Date.now() + CACHE_DURATION);

	await db.insert(menuCache).values({
		id: crypto.randomUUID(),
		menuText,
		analysis,
		expiresAt
	});
}

export async function clearExpiredCache() {
	const now = new Date();
	await db.delete(menuCache).where(sql`${menuCache.expiresAt} < ${now}`);
}

// Schedule cache cleanup
if (typeof window === 'undefined') {
	// Only run on server
	setInterval(clearExpiredCache, CACHE_DURATION);
}