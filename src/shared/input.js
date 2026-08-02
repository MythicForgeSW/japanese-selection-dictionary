export const MAX_SELECTION_CODE_POINTS = 40;

const JAPANESE_CHARACTER_PATTERN =
  /[\u3040-\u30ff\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u{20000}-\u{2a6df}]/u;

export function hasJapaneseCharacters(value) {
  return typeof value === "string" && JAPANESE_CHARACTER_PATTERN.test(value);
}

export function normalizeSelection(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  const codePointLength = [...normalized].length;

  if (
    codePointLength === 0 ||
    codePointLength > MAX_SELECTION_CODE_POINTS ||
    !hasJapaneseCharacters(normalized)
  ) {
    return null;
  }

  return normalized;
}
