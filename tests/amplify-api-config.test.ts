import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('production AI configuration', () => {
  it('uses the Groq secret configured for the deployed API Lambda', () => {
    const resource = readFileSync(resolve(process.cwd(), 'amplify/function/api/resource.ts'), 'utf8');

    expect(resource).toContain("AI_PROVIDER: 'groq'");
    expect(resource).toContain("GROQ_API_KEY: secret('GROQ_API_KEY')");
    expect(resource).not.toContain("GEMINI_API_KEY: secret('GEMINI_API_KEY')");
  });
});
