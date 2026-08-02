import test from "node:test";
import assert from "node:assert/strict";

import { normalizeDictionaryResponse } from "../src/shared/dictionary.js";

test("normalizes the best result and prefers the form matching the query", () => {
  const payload = {
    data: [
      {
        japanese: [
          { word: "感じ", reading: "かんじ" },
          { word: "漢字", reading: "かんじ" },
        ],
        senses: [
          { english_definitions: ["Chinese characters", "kanji"] },
        ],
      },
    ],
  };

  assert.deepEqual(normalizeDictionaryResponse(payload, "漢字"), [
    {
      expression: "漢字",
      reading: "かんじ",
      meanings: ["Chinese characters", "kanji"],
    },
  ]);
});

test("falls back to the first form and uses its reading as the expression", () => {
  const payload = {
    data: [
      {
        japanese: [{ reading: "ありがとう" }],
        senses: [{ english_definitions: ["thank you"] }],
      },
    ],
  };

  assert.deepEqual(normalizeDictionaryResponse(payload, "有難う"), [
    {
      expression: "ありがとう",
      reading: "ありがとう",
      meanings: ["thank you"],
    },
  ]);
});

test("removes empty and duplicate meanings and limits each result to three", () => {
  const payload = {
    data: [
      {
        japanese: [{ word: "上げる", reading: "あげる" }],
        senses: [
          { english_definitions: ["to raise", "", "to raise"] },
          { english_definitions: ["to elevate", "to give", "to fry"] },
        ],
      },
    ],
  };

  assert.deepEqual(normalizeDictionaryResponse(payload, "上げる")[0].meanings, [
    "to raise",
    "to elevate",
    "to give",
  ]);
});

test("preserves provider result order", () => {
  const payload = {
    data: [
      {
        japanese: [{ word: "今日", reading: "きょう" }],
        senses: [{ english_definitions: ["today"] }],
      },
      {
        japanese: [{ word: "今日", reading: "こんにち" }],
        senses: [{ english_definitions: ["these days"] }],
      },
    ],
  };

  assert.deepEqual(
    normalizeDictionaryResponse(payload, "今日").map((item) => item.reading),
    ["きょう", "こんにち"],
  );
});

test("returns an empty list for empty or malformed provider data", () => {
  assert.deepEqual(normalizeDictionaryResponse({}, "漢字"), []);
  assert.deepEqual(normalizeDictionaryResponse({ data: null }, "漢字"), []);
  assert.deepEqual(normalizeDictionaryResponse({ data: [{}] }, "漢字"), []);
});
