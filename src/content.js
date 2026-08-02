(async () => {
  const [{ normalizeSelection }, { DefinitionBubble }] = await Promise.all([
    import(chrome.runtime.getURL("src/shared/input.js")),
    import(chrome.runtime.getURL("src/bubble.js")),
  ]);

  let bubble = null;
  let currentRequestId = 0;

  function eventCameFromBubble(event) {
    return event.composedPath().some((node) =>
      node instanceof Element &&
      node.hasAttribute("data-japanese-dictionary-bubble"),
    );
  }

  function dismissBubble() {
    currentRequestId += 1;
    bubble?.destroy();
    bubble = null;
  }

  function getSelectionDetails() {
    const selection = window.getSelection();
    const query = normalizeSelection(selection?.toString());

    if (!selection || !query || selection.rangeCount === 0 || selection.isCollapsed) {
      return null;
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return null;
    }

    return {
      query,
      anchorRect: {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
      },
    };
  }

  async function handleSelection() {
    const details = getSelectionDetails();
    dismissBubble();

    if (!details) {
      return;
    }

    const requestId = currentRequestId;
    bubble = new DefinitionBubble();
    bubble.showLoading(details.anchorRect);

    let response;
    try {
      response = await chrome.runtime.sendMessage({
        type: "LOOKUP_WORD",
        query: details.query,
        requestId,
      });
    } catch {
      if (requestId === currentRequestId) {
        bubble?.showError();
      }
      return;
    }

    if (requestId !== currentRequestId) {
      return;
    }

    if (!response || response.requestId !== requestId) {
      bubble?.showError();
      return;
    }

    if (!response.ok) {
      bubble?.showError();
    } else if (response.results.length === 0) {
      bubble?.showNoResults();
    } else {
      bubble?.showResults(response.results);
    }
  }

  document.addEventListener("mouseup", (event) => {
    if (eventCameFromBubble(event)) {
      return;
    }
    setTimeout(handleSelection, 0);
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
      dismissBubble();
      return;
    }

    if (event.shiftKey || event.key.startsWith("Arrow")) {
      setTimeout(handleSelection, 0);
    }
  });

  document.addEventListener("mousedown", (event) => {
    if (!bubble || eventCameFromBubble(event)) {
      return;
    }
    dismissBubble();
  }, true);

  document.addEventListener("scroll", dismissBubble, { capture: true, passive: true });
  window.addEventListener("resize", dismissBubble);
})();
