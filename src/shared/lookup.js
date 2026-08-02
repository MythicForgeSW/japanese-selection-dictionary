import { normalizeDictionaryResponse } from "./dictionary.js";

const DICTIONARY_ENDPOINT = "https://jisho.org/api/v1/search/words";

export class DictionaryLookupError extends Error {
  constructor(code, message, options = {}) {
    super(message, options);
    this.name = "DictionaryLookupError";
    this.code = code;
  }
}

export async function lookupWord(
  query,
  { fetchImpl = fetch, timeoutMs = 8000 } = {},
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${DICTIONARY_ENDPOINT}?keyword=${encodeURIComponent(query)}`;

  try {
    let response;
    try {
      response = await fetchImpl(url, { signal: controller.signal });
    } catch (error) {
      throw new DictionaryLookupError("NETWORK", "Dictionary request failed", {
        cause: error,
      });
    }

    if (!response.ok) {
      throw new DictionaryLookupError(
        "HTTP",
        `Dictionary returned HTTP ${response.status}`,
      );
    }

    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      throw new DictionaryLookupError(
        controller.signal.aborted ? "NETWORK" : "INVALID_RESPONSE",
        controller.signal.aborted
          ? "Dictionary request failed"
          : "Dictionary returned invalid JSON",
        { cause: error },
      );
    }

    return normalizeDictionaryResponse(payload, query);
  } finally {
    clearTimeout(timeoutId);
  }
}
