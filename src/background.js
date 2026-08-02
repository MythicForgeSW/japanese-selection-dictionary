import { normalizeSelection } from "./shared/input.js";
import { lookupWord } from "./shared/lookup.js";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "LOOKUP_WORD") {
    return false;
  }

  const query = normalizeSelection(message.query);
  const requestId = Number.isInteger(message.requestId)
    ? message.requestId
    : -1;

  if (!query) {
    sendResponse({
      ok: false,
      requestId,
      error: "INVALID_QUERY",
    });
    return false;
  }

  lookupWord(query)
    .then((results) => {
      sendResponse({ ok: true, requestId, results });
    })
    .catch(() => {
      sendResponse({
        ok: false,
        requestId,
        error: "LOOKUP_FAILED",
      });
    });

  return true;
});
