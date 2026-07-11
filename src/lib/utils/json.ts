/**
 * Safely extracts, cleans and parses JSON from AI/LLM responses.
 * Handles markdown code blocks, conversational prefixes/suffixes, and minor formatting errors.
 */
export function cleanAndParseJSON<T>(text: string): T {
  let cleaned = text.trim();

  // 1. Remove markdown code blocks — handle both ``` and ```json variants
  if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/m, '');
    cleaned = cleaned.replace(/\s*```\s*$/m, '');
    cleaned = cleaned.trim();
  }

  // 2. Extract first JSON object/array if there is conversational noise before/after
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // 3. Sanitize string values using a character-by-character state machine.
  //    This safely escapes control characters (newlines, tabs, etc.) ONLY inside
  //    JSON string values, avoiding the greedy-regex pitfall that corrupts JSON
  //    when LLM outputs long reasoning blocks with embedded newlines.
  cleaned = sanitizeJsonStrings(cleaned);

  // 4. First parse attempt
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // 5. Fix trailing commas before } or ] then retry
    try {
      const fixedCommaJson = cleaned
        .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]+/g, ' '); // strip non-printable except \t \n \r
      return JSON.parse(fixedCommaJson) as T;
    } catch (err) {
      // 6. Last resort: attempt to use JSON5-style repair (single quotes → double quotes,
      //    unquoted keys → quoted keys)
      try {
        const repaired = repairJSON(cleaned);
        return JSON.parse(repaired) as T;
      } catch {
        // Re-throw the original parse error with position info preserved
        throw err;
      }
    }
  }
}

/**
 * Walk through the JSON string character by character.
 * When inside a JSON string value, escape any raw control characters
 * (particularly \n and \r that LLMs commonly emit literally).
 * Correctly handles escaped sequences like \" so they don't confuse the
 * string-boundary detection.
 */
function sanitizeJsonStrings(json: string): string {
  const out: string[] = [];
  let inString = false;
  let i = 0;

  while (i < json.length) {
    const ch = json[i];

    if (inString) {
      if (ch === '\\') {
        // Escaped character — pass both chars through unchanged
        out.push(ch);
        i++;
        if (i < json.length) {
          out.push(json[i]);
          i++;
        }
        continue;
      }
      if (ch === '"') {
        // End of string
        inString = false;
        out.push(ch);
        i++;
        continue;
      }
      // Inside string: escape raw control characters that are illegal in JSON strings
      if (ch === '\n') {
        out.push('\\n');
      } else if (ch === '\r') {
        out.push('\\r');
      } else if (ch === '\t') {
        out.push('\\t');
      } else if (ch.charCodeAt(0) < 0x20) {
        // Other ASCII control characters — drop them
        i++;
        continue;
      } else {
        out.push(ch);
      }
      i++;
    } else {
      if (ch === '"') {
        inString = true;
      }
      out.push(ch);
      i++;
    }
  }

  return out.join('');
}

/**
 * Minimal JSON repair for common LLM output quirks:
 * - Single-quoted strings → double-quoted
 * - Unquoted object keys → quoted
 * - Trailing commas (belt-and-suspenders after sanitizeJsonStrings)
 */
function repairJSON(json: string): string {
  return json
    // Replace single-quoted string values/keys with double quotes
    .replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')
    // Quote unquoted object keys: { key: → { "key":
    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
    // Remove trailing commas
    .replace(/,\s*([}\]])/g, '$1');
}
