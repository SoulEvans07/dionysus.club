// Well-known ids seeded once (see db/migrations) and referenced by app code -
// never generated at runtime, must stay stable across environments.
export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';
export const SYSTEM_BAR_ID = '00000000-0000-0000-0000-000000000002';

// Sentinel namespace for tags that aren't grouped under a namespace, e.g. "_:vegan".
export const TOP_LEVEL_TAG_NAMESPACE = '_';
