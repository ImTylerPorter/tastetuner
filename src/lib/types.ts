import type { InferSelectModel } from 'drizzle-orm';
import type { profileTable } from '$lib/db/schema';

export type Profile = InferSelectModel<typeof profileTable>;