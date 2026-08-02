const BUBBLE_GAP = 8;
const VIEWPORT_MARGIN = 12;

const STYLES = `
  :host { all: initial; }
  .bubble {
    position: fixed;
    z-index: 2147483647;
    box-sizing: border-box;
    width: min(340px, calc(100vw - 24px));
    max-height: min(420px, calc(100vh - 24px));
    overflow: auto;
    padding: 14px;
    border: 1px solid #d8dee8;
    border-radius: 10px;
    background: #ffffff;
    color: #182230;
    box-shadow: 0 10px 30px rgba(20, 30, 50, 0.2);
    font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .status { color: #536173; }
  .entry + .entry { margin-top: 14px; padding-top: 14px; border-top: 1px solid #e7ebf0; }
  .expression { font-size: 20px; font-weight: 700; }
  .reading { margin-left: 8px; color: #536173; font-size: 15px; }
  ol { margin: 8px 0 0; padding-left: 22px; }
  li + li { margin-top: 3px; }
  button {
    display: block;
    margin: 12px 0 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: #1a5fb4;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
  button:focus-visible { outline: 2px solid #1a5fb4; outline-offset: 3px; }
  [hidden] { display: none !important; }
`;

export class DefinitionBubble {
  constructor() {
    this.host = document.createElement("div");
    this.host.dataset.japaneseDictionaryBubble = "";
    this.shadow = this.host.attachShadow({ mode: "closed" });
    this.anchorRect = null;
    document.documentElement.append(this.host);
  }

  showLoading(anchorRect) {
    this.anchorRect = anchorRect;
    this.renderStatus("Looking up…");
  }

  showResults(results) {
    this.shadow.replaceChildren(this.createStyle());
    const bubble = this.createBubble();
    const primary = this.createEntry(results[0]);
    bubble.append(primary);

    if (results.length > 1) {
      const extraResults = document.createElement("div");
      extraResults.hidden = true;
      results.slice(1).forEach((result) => {
        extraResults.append(this.createEntry(result));
      });

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.textContent = "More results";
      toggle.addEventListener("click", () => {
        extraResults.hidden = !extraResults.hidden;
        toggle.textContent = extraResults.hidden ? "More results" : "Fewer results";
        this.position();
      });

      bubble.append(extraResults, toggle);
    }

    this.shadow.append(bubble);
    this.position();
  }

  showNoResults() {
    this.renderStatus("No definition found.");
  }

  showError() {
    this.renderStatus("Couldn't reach the dictionary. Check your connection and try again.");
  }

  destroy() {
    this.host.remove();
  }

  renderStatus(message) {
    this.shadow.replaceChildren(this.createStyle());
    const bubble = this.createBubble();
    const status = document.createElement("div");
    status.className = "status";
    status.textContent = message;
    bubble.append(status);
    this.shadow.append(bubble);
    this.position();
  }

  createStyle() {
    const style = document.createElement("style");
    style.textContent = STYLES;
    return style;
  }

  createBubble() {
    const bubble = document.createElement("section");
    bubble.className = "bubble";
    bubble.setAttribute("role", "status");
    bubble.setAttribute("aria-live", "polite");
    return bubble;
  }

  createEntry(result) {
    const entry = document.createElement("article");
    entry.className = "entry";

    const expression = document.createElement("span");
    expression.className = "expression";
    expression.textContent = result.expression;

    const reading = document.createElement("span");
    reading.className = "reading";
    reading.textContent = result.reading;

    const meanings = document.createElement("ol");
    result.meanings.forEach((meaning) => {
      const item = document.createElement("li");
      item.textContent = meaning;
      meanings.append(item);
    });

    entry.append(expression, reading, meanings);
    return entry;
  }

  position() {
    const bubble = this.shadow.querySelector(".bubble");
    if (!bubble || !this.anchorRect) {
      return;
    }

    bubble.style.visibility = "hidden";
    bubble.style.left = "0px";
    bubble.style.top = "0px";

    const bubbleRect = bubble.getBoundingClientRect();
    const maxLeft = window.innerWidth - bubbleRect.width - VIEWPORT_MARGIN;
    const left = Math.min(
      Math.max(this.anchorRect.left, VIEWPORT_MARGIN),
      Math.max(VIEWPORT_MARGIN, maxLeft),
    );

    const roomBelow = window.innerHeight - this.anchorRect.bottom;
    const preferredTop = roomBelow >= bubbleRect.height + BUBBLE_GAP
      ? this.anchorRect.bottom + BUBBLE_GAP
      : this.anchorRect.top - bubbleRect.height - BUBBLE_GAP;
    const maxTop = window.innerHeight - bubbleRect.height - VIEWPORT_MARGIN;
    const top = Math.min(
      Math.max(preferredTop, VIEWPORT_MARGIN),
      Math.max(VIEWPORT_MARGIN, maxTop),
    );

    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
    bubble.style.visibility = "visible";
  }
}
