import test from "node:test";
import assert from "node:assert/strict";

import { DictionaryLookupError, lookupWord } from "../src/shared/lookup.js";

const validPayload = {
  data: [
    {
      japanese: [{ word: "漢字", reading: "かんじ" }],
      senses: [{ english_definitions: ["Chinese characters"] }],
    },
  ],
};

test("encodes the query and returns normalized results", async () => {
  let requestedUrl = "";
  const fetchImpl = async (url) => {
    requestedUrl = url;
    return { ok: true, json: async () => validPayload };
  };

  const results = await lookupWord("漢字 & kana", { fetchImpl });

  assert.equal(
    requestedUrl,
    "https://jisho.org/api/v1/search/words?keyword=%E6%BC%A2%E5%AD%97%20%26%20kana",
  );
  assert.equal(results[0].reading, "かんじ");
});

test("classifies non-success HTTP responses", async () => {
  const fetchImpl = async () => ({ ok: false, status: 503 });

  await assert.rejects(
    lookupWord("漢字", { fetchImpl }),
    (error) => error instanceof DictionaryLookupError && error.code === "HTTP",
  );
});

test("classifies network failures", async () => {
  const fetchImpl = async () => {
    throw new TypeError("Failed to fetch");
  };

  await assert.rejects(
    lookupWord("漢字", { fetchImpl }),
    (error) => error instanceof DictionaryLookupError && error.code === "NETWORK",
  );
});

test("classifies malformed JSON responses", async () => {
  const fetchImpl = async () => ({
    ok: true,
    json: async () => {
      throw new SyntaxError("Unexpected token");
    },
  });

  await assert.rejects(
    lookupWord("漢字", { fetchImpl }),
    (error) =>
      error instanceof DictionaryLookupError && error.code === "INVALID_RESPONSE",
  );
});

test("classifies a timed-out response body as a network failure", { timeout: 300 }, async () => {
  const fetchImpl = async (_url, { signal }) => ({
    ok: true,
    json: () =>
      new Promise((_, reject) => {
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("The operation was aborted", "AbortError")),
          { once: true },
        );
      }),
  });

  await assert.rejects(
    lookupWord("漢字", { fetchImpl, timeoutMs: 10 }),
    (error) => error instanceof DictionaryLookupError && error.code === "NETWORK",
  );
});
