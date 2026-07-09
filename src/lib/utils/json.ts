/**
 * Safely extracts, cleans and parses JSON from AI/LLM responses.
 * Handles markdown code blocks, conversational prefixes/suffixes, and minor formatting errors.
 */
export function cleanAndParseJSON<T>(text: string): T {
  let cleaned = text.trim();

  // 1. Remove markdown code blocks (e.g. ```json ... ``` or ``` ...)
  if (cleaned.includes('```')) {
    // Remove opening code fences
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, '');
    // Remove closing code fences
    cleaned = cleaned.replace(/\s*```$/, '');
    cleaned = cleaned.trim();
  }

  // 2. Extract first JSON object/array if there is conversational noise
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // 3. Normalize common JSON formatting anomalies (e.g. unescaped control characters inside strings)
  // Replace unescaped newlines within JSON string values with "\n"
  // This is a common failure point for LLMs.
  cleaned = cleaned.replace(/:\s*"([^"]*)"/g, (match, p1) => {
    // Replace actual newlines inside the captured double-quoted string with literal \n
    const sanitized = p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    return `: "${sanitized}"`;
  });

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Attempt parsing after removing typical trailing commas before closing braces/brackets
    try {
      const fixedCommaJson = cleaned
        .replace(/,\s*([}\]])/g, '$1') // remove trailing commas before } or ]
        .replace(/[\u0000-\u0019]+/g, ' '); // remove non-printable control characters
      return JSON.parse(fixedCommaJson) as T;
    } catch {
      // Re-throw original error to preserve position details
      throw err;
    }
  }
}
