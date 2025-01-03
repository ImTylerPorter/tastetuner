import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutLoad } from './$types';
import type { Profile } from '$lib/types'

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
  depends('supabase:auth');

  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      global: { fetch }
    })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      global: { fetch },
      cookies: {
        getAll() {
          return data.cookies ?? [];
        },
      },
    });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Assuming 'profile' is part of 'data' from somewhere else or it's null by default
  let profile: Profile | null = null;
  if (data.profile) {
    profile = data.profile as Profile;
  }


  return { session, supabase, user, profile };
};