export const DEEP_MODE_STORAGE_PREFIX = "kaisensei:deep:";

export function createDeepStorageKey(name) {
  return `${DEEP_MODE_STORAGE_PREFIX}${name}`;
}
