import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_SELECTION_CODE_POINTS,
  hasJapaneseCharacters,
  normalizeSelection,
} from "../src/shared/input.js";

test("recognizes common Japanese scripts", () => {
  assert.equal(hasJapaneseCharacters("漢字"), true);
  assert.equal(hasJapaneseCharacters("ありがとう"), true);
  assert.equal(hasJapaneseCharacters("カタカナ"), true);
  assert.equal(hasJapaneseCharacters("ﾀﾍﾞﾙ"), true);
});

test("accepts supplementary-plane kanji selections", () => {
  assert.equal(hasJapaneseCharacters("𠮷"), true);
  assert.equal(normalizeSelection("𠮷"), "𠮷");
});

test("rejects text without Japanese characters", () => {
  assert.equal(hasJapaneseCharacters("dictionary"), false);
  assert.equal(hasJapaneseCharacters("123!?"), false);
  assert.equal(hasJapaneseCharacters(""), false);
});

test("accepts mixed text when it contains Japanese", () => {
  assert.equal(normalizeSelection(" JLPT日本語 "), "JLPT日本語");
});

test("trims selections and accepts kana-only words", () => {
  assert.equal(normalizeSelection("  ありがとう\n"), "ありがとう");
});

test("rejects empty, non-string, Latin-only, and overly long selections", () => {
  assert.equal(normalizeSelection("   "), null);
  assert.equal(normalizeSelection(undefined), null);
  assert.equal(normalizeSelection("dictionary"), null);
  assert.equal(normalizeSelection("日".repeat(MAX_SELECTION_CODE_POINTS + 1)), null);
});

test("counts Unicode code points rather than UTF-16 units", () => {
  assert.equal(
    normalizeSelection(`日${"𠮷".repeat(MAX_SELECTION_CODE_POINTS - 1)}`),
    `日${"𠮷".repeat(MAX_SELECTION_CODE_POINTS - 1)}`,
  );
});
