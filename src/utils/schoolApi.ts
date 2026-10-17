import { Dispatch, TimelineEntry } from '../types';

export const usesSchoolApi = !import.meta.env.DEV || Boolean(import.meta.env.VITE_API_URL);

export async function schoolApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem('classline_cognito_id_token');
  if (!token) throw new Error('Please sign in again to connect to the school server.');
  const response = await fetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to connect to the school server.');
  return data as T;
}

export function serverTimeline(entry: TimelineEntry & { seen?: boolean }): TimelineEntry {
  const day = new Date(entry.date); const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const dateGroup = day.toDateString() === today.toDateString() ? 'today' : day.toDateString() === yesterday.toDateString() ? 'yesterday' : 'last-week';
  return { ...entry, dateGroup, date: dateGroup === 'today' ? 'Today' : dateGroup === 'yesterday' ? 'Yesterday' : day.toLocaleDateString(), markedSeen: entry.seen ?? entry.markedSeen };
}

export function serverDispatch(entry: Omit<Dispatch, 'status' | 'targetScope'> & { status: string; targetScope: string }): Dispatch {
  return { ...entry, status: entry.delivered >= entry.recipients ? 'delivered' : 'partial', targetScope: entry.targetScope === 'whole_class' ? 'class' : entry.targetScope as Dispatch['targetScope'] };
}
