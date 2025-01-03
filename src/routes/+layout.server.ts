import type { LayoutServerLoad } from './$types'
import { getOrCreateUserProfile } from '$lib/auth'

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  const { session } = await locals.safeGetSession()

  // If there's a user, get or create their profile
  const profile = await getOrCreateUserProfile(locals)

  return {
    session,
    cookies: cookies.getAll(),
    profile
  }
}