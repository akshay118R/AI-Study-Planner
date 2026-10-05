/**
 * AI Study & Task Planner - Resilient JSON Repair Utility
 * Recovers truncated, malformed, or unescaped JSON produced by local LLMs.
 * Handles mid-token cutoffs, unclosed strings, trailing commas, and unbalanced brackets.
 */

export function repairAndParseJson(raw) {
  if (!raw) {
    throw new Error('Empty or null input provided to JSON parser.');
  }
  if (typeof raw === 'object') {
    return raw;
  }

  let text = String(raw).trim();

  // Strip markdown code fences if present
  text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  // Strip leading thought tags e.g. <think>...</think>
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Find opening brace
  const firstBrace = text.indexOf('{');
  if (firstBrace === -1) {
    throw new Error('No JSON object found in response.');
  }
  text = text.slice(firstBrace);

  // 1. Direct parse attempt
  try {
    return JSON.parse(text);
  } catch (initialErr) {
    // Proceed to repair
  }

  // 2. Character-by-character scan to escape unescaped control chars & track bracket stack
  let inString = false;
  let escape = false;
  const stack = [];
  const cleanChars = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) {
        escape = false;
        cleanChars.push(ch);
      } else if (ch === '\\') {
        escape = true;
        cleanChars.push(ch);
      } else if (ch === '"') {
        inString = false;
        cleanChars.push(ch);
      } else if (ch === '\n') {
        cleanChars.push('\\n');
      } else if (ch === '\r') {
        cleanChars.push('\\r');
      } else if (ch === '\t') {
        cleanChars.push('\\t');
      } else {
        cleanChars.push(ch);
      }
    } else {
      if (ch === '"') {
        inString = true;
        cleanChars.push(ch);
      } else if (ch === '{') {
        stack.push('}');
        cleanChars.push(ch);
      } else if (ch === '[') {
        stack.push(']');
        cleanChars.push(ch);
      } else if (ch === '}' || ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
          stack.pop();
        }
        cleanChars.push(ch);
      } else {
        cleanChars.push(ch);
      }
    }
  }

  let repaired = cleanChars.join('');

  // If ended mid-string, terminate it
  if (inString) {
    repaired += '"';
  }

  // Remove trailing incomplete key-value like , "key": "" or , "key": 
  repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*"?$/i, '');
  // Remove dangling commas at the end
  repaired = repaired.replace(/,\s*$/i, '');

  // Close unclosed brackets in reverse order
  let closeStr = '';
  for (let k = stack.length - 1; k >= 0; k--) {
    closeStr += stack[k];
  }
  repaired += closeStr;

  // Remove any trailing commas before closing braces/brackets e.g. [1, 2, ] -> [1, 2]
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  try {
    return JSON.parse(repaired);
  } catch (err2) {
    // If it failed because the last object or element was cut in half,
    // iteratively cut back from the last comma and close open brackets
    let temp = repaired;
    for (let attempts = 0; attempts < 10; attempts++) {
      const lastComma = temp.lastIndexOf(',');
      if (lastComma <= 0) break;
      let cut = temp.slice(0, lastComma);
      
      const subStack = [];
      let subInStr = false;
      let subEsc = false;
      for (let j = 0; j < cut.length; j++) {
        const c = cut[j];
        if (subInStr) {
          if (subEsc) subEsc = false;
          else if (c === '\\') subEsc = true;
          else if (c === '"') subInStr = false;
        } else {
          if (c === '"') subInStr = true;
          else if (c === '{') subStack.push('}');
          else if (c === '[') subStack.push(']');
          else if ((c === '}' || c === ']') && subStack.length > 0 && subStack[subStack.length - 1] === c) {
            subStack.pop();
          }
        }
      }
      if (subInStr) cut += '"';
      let subClose = '';
      for (let m = subStack.length - 1; m >= 0; m--) {
        subClose += subStack[m];
      }
      cut += subClose;
      cut = cut.replace(/,\s*([}\]])/g, '$1');
      try {
        return JSON.parse(cut);
      } catch (e3) {
        temp = cut;
      }
    }
    throw err2;
  }
}
