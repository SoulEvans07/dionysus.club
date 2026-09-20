import { TOP_LEVEL_TAG_NAMESPACE } from '@repo/dtos';

export type TagNSKey = { namespace: string; key: string };

export function splitToTagParts(tag: string): TagNSKey {
  const [first, second] = tag.split(':');

  if (second) return { namespace: first, key: second };
  return { namespace: TOP_LEVEL_TAG_NAMESPACE, key: first };
}
