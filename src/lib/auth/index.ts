import { profileTable } from './../db/schema';
import { db } from "$lib/db";
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit'; // Import the type for event

export const getOrCreateUserProfile = async (locals: App.Locals) => {
  if (!locals.user) {
    return null;
  }

  const currentProfile = await db.query.profileTable.findFirst({
    where: eq(profileTable.id, locals.user.id)
  })


  if (currentProfile) {
    return currentProfile
  }

  await db.insert(profileTable).values({
    id: locals.user.id,
    userId: locals.user.id,
    firstName: locals.user.firstName ? locals.user.firstName : '',
    lastName: locals.user.lastName ? locals.user.lastName : ''
  })

  const newProfile = await db.query.profileTable.findFirst({
    where: eq(profileTable.id, locals.user.id)
  });

  if (!newProfile) {
    error(500, "Could not create profile")
  }

  return newProfile;
}

export async function handleLogin(
  data: FormData,
  locals: RequestEvent['locals']
) {
  const email = data.get('email')?.toString();
  const password = data.get('password')?.toString();
  const isLogin = data.get('isLogin') === 'true';
  const firstName = data.get('firstName')?.toString();
  const lastName = data.get('lastName')?.toString();

  if (!email || !password) {
    throw error(400, 'Email and password are required.');
  }

  try {
    if (isLogin) {
      const { error: authError } = await locals.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        throw error(400, authError.message);
      }
    } else {
      // For signup, validate first and last name
      if (!firstName || !lastName) {
        throw error(400, 'First name and last name are required for signup.');
      }

      const { data: authData, error: authError } = await locals.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName
          }
        }
      });

      if (authError) {
        throw error(400, authError.message);
      }

      // Create profile if signup successful
      if (authData.user) {
        await db.insert(profileTable).values({
          id: authData.user.id,
          userId: authData.user.id,
          firstName,
          lastName
        });
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Error in handleLogin:', err);
    if (err instanceof Error) {
      throw error(500, err.message);
    }
    throw error(500, 'Internal Server Error.');
  }
}

