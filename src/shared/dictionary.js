const MAX_MEANINGS = 3;

function chooseJapaneseForm(forms, query) {
  if (!Array.isArray(forms)) {
    return null;
  }

  return forms.find((form) => form?.word === query) ?? forms[0] ?? null;
}

function collectMeanings(senses) {
  if (!Array.isArray(senses)) {
    return [];
  }

  const meanings = senses.flatMap((sense) =>
    Array.isArray(sense?.english_definitions) ? sense.english_definitions : [],
  );

  return [...new Set(meanings.filter((meaning) =>
    typeof meaning === "string" && meaning.trim().length > 0,
  ))].slice(0, MAX_MEANINGS);
}

export function normalizeDictionaryResponse(payload, query) {
  if (!payload || !Array.isArray(payload.data)) {
    return [];
  }

  return payload.data.flatMap((entry) => {
    const form = chooseJapaneseForm(entry?.japanese, query);
    const meanings = collectMeanings(entry?.senses);

    if (!form || meanings.length === 0) {
      return [];
    }

    const expression = form.word || form.reading;
    const reading = form.reading || form.word;

    if (typeof expression !== "string" || typeof reading !== "string") {
      return [];
    }

    return [{ expression, reading, meanings }];
  });
}
