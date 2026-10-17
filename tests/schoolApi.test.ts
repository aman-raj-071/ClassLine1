import { afterEach, describe, expect, it, vi } from 'vitest';
import { schoolApi, serverTimeline } from '../src/utils/schoolApi';

afterEach(() => vi.unstubAllGlobals());

describe('shared school API', () => {
  it('sends the signed-in token when publishing an announcement', async () => {
    vi.stubGlobal('sessionStorage', { getItem: () => 'teacher-token' });
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    vi.stubGlobal('fetch', fetch);
    await schoolApi('/teacher/entries', { method: 'POST', body: '{"title":"School closed"}' });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/teacher/entries'), expect.objectContaining({
      method: 'POST', headers: expect.objectContaining({ Authorization: 'Bearer teacher-token' }),
      body: '{"title":"School closed"}',
    }));
  });

  it('rejects server failures instead of reporting delivery', async () => {
    vi.stubGlobal('sessionStorage', { getItem: () => 'teacher-token' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'No class assigned' }) }));
    await expect(schoolApi('/teacher/entries', { method: 'POST' })).rejects.toThrow('No class assigned');
  });

  it('does not request private records without a session', async () => {
    vi.stubGlobal('sessionStorage', { getItem: () => null });
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await expect(schoolApi('/parent/timeline')).rejects.toThrow('sign in again');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('adapts server timestamps and seen state for the parent dashboard', () => {
    const entry = serverTimeline({ id: 'announcement', childId: 'pupil', type: 'general', title: 'Important', body: 'School update', date: new Date().toISOString(), accentColor: '#000', dateGroup: 'last-week', seen: true });
    expect(entry.dateGroup).toBe('today');
    expect(entry.markedSeen).toBe(true);
    expect(entry.childId).toBe('pupil');
  });
});
