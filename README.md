# Japanese Selection Dictionary

A Manifest V3 Chrome extension that shows the reading and up to three English meanings for selected Japanese text in a bubble beside the selection. Lookups use the public [Jisho](https://jisho.org/) word-search API.

## Install (unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this repository root (the folder that contains `manifest.json`)
5. Open any `http://` or `https://` page, select Japanese text, and wait for the bubble

After pulling updates, click **Reload** on the extension card, then refresh the page you are testing.

## Develop

Requirements: a current Node.js release (for tests) and desktop Google Chrome.

```bash
npm test
```

Or:

```bash
node --test
```

### Manual fixture page

From the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/test/manual-fixture.html` and exercise selections such as `漢字`, `ありがとう`, and `今日`.

## Privacy

Privacy policy (GitHub Pages):
https://mythicforgesw.github.io/japanese-selection-dictionary/privacy.html

## Chrome Web Store package

Build a store upload zip (excludes tests and git metadata):

```bash
npm run package
```

Upload `dist/japanese-selection-dictionary.zip` in the
[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
Use the privacy policy URL above in the store listing questionnaire.

## License

MIT — see [LICENSE](LICENSE).
