import { db } from '$lib/db';
import { locations, menus, profileTable } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const [location, profile] = await Promise.all([
		db.query.locations.findFirst({
			where: eq(locations.id, params.id),
			with: {
				menus: {
					where: eq(menus.isActive, true),
					limit: 1
				}
			}
		}),
		db.query.profileTable.findFirst({
			where: eq(profileTable.id, locals.user.id)
		})
	]);

	if (!location) {
		throw error(404, 'Location not found');
	}

	if (!profile) {
		throw error(404, 'Profile not found');
	}

	return {
		location: {
			...location,
			activeMenu: location.menus[0] || null
		},
		profile
	};
}