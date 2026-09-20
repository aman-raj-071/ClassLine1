import { describe, expect, it } from 'vitest';
import { websiteAssistantFallback } from '../src/utils/websiteAssistantFallback';

describe('website assistant fallback', () => {
  it('answers common fee questions when the hosted AI API is unavailable', () => {
    const answer = websiteAssistantFallback('How do I pay a fee and receive my receipt?');

    expect(answer).toContain('**My Fee Details**');
    expect(answer).toContain('**My Receipts**');
  });

  it('does not claim access to private account data', () => {
    const answer = websiteAssistantFallback('What is my child’s current fee balance?');

    expect(answer).not.toContain('current fee balance');
    expect(answer).toContain('**My Fee Details**');
  });
});
