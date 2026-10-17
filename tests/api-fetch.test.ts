import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from '../src/lib/api';

afterEach(() => vi.unstubAllGlobals());

describe('authenticated AI requests', () => {
  it('includes the signed-in token and preserves JSON headers and body', async () => {
    vi.stubGlobal('sessionStorage', { getItem: () => 'school-teacher-token' });
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal('fetch', fetch);
    await apiFetch('/api/ai/teacher-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"task":"translate"}' });
    const options = fetch.mock.calls[0][1];
    expect(options.headers.get('Authorization')).toBe('Bearer school-teacher-token');
    expect(options.headers.get('Content-Type')).toBe('application/json');
    expect(options.body).toBe('{"task":"translate"}');
  });
  it('keeps an explicitly supplied authorization header', async () => {
    vi.stubGlobal('sessionStorage', { getItem: () => 'session-token' });
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal('fetch', fetch);
    await apiFetch('/api/ai/teacher-assistant', { headers: { Authorization: 'Bearer explicit-token' } });
    expect(fetch.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer explicit-token');
  });
  it('allows public website assistance without a session', async () => {
    vi.stubGlobal('sessionStorage', { getItem: () => null });
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal('fetch', fetch);
    await apiFetch('/api/ai/website-assistant');
    expect(fetch.mock.calls[0][1].headers.has('Authorization')).toBe(false);
  });
});
