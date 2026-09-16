import { TOP_LEVEL_TAG_NAMESPACE } from '@repo/dtos';

type TagLike = { namespace: string; key: string };

export function tagFullKey(tag: TagLike) {
  return `${tag.namespace}:${tag.key}`;
}

export function tagFullKeyUI(tag: TagLike) {
  if (tag.namespace === TOP_LEVEL_TAG_NAMESPACE) return tag.key;
  return `${tag.namespace}:${tag.key}`;
}

export function sortTagByFullKey(a: TagLike, b: TagLike) {
  if (a.namespace === TOP_LEVEL_TAG_NAMESPACE) return 1;
  if (b.namespace === TOP_LEVEL_TAG_NAMESPACE) return -1;
  return tagFullKey(a).localeCompare(tagFullKey(b));
}
