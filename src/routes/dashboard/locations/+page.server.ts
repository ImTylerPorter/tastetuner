import { db } from '$lib/db';
import { locations, menus, profileTable } from '$lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const [locationList, profile] = await Promise.all([
		db.query.locations.findMany({
			with: {
				menus: {
					where: eq(menus.isActive, true),
					limit: 1,
					orderBy: [desc(menus.createdAt)]
				}
			},
			orderBy: [desc(locations.createdAt)]
		}),
		db.query.profileTable.findFirst({
			where: eq(profileTable.id, locals.user.id)
		})
	]);

	if (!profile) {
		throw error(404, 'Profile not found');
	}

	return {
		locations: locationList.map(location => ({
			...location,
			activeMenu: location.menus[0] || null
		})),
		profile
	};
}