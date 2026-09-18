import React, { useState } from 'react';
import { Bot, Copy, Languages, LoaderCircle, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AssistantTask = 'parent_message' | 'translate';

function createOfflineDraft(task: AssistantTask, topic: string, notes: string, audience: 'whole_class' | 'individual') {
  if (task === 'translate') return notes;
  const greeting = audience === 'whole_class' ? 'Dear Parents,' : 'Dear Parent/Guardian,';
  return `${greeting}\n\n${topic.trim() || 'Class update'}\n\n${notes.trim()}\n\nThank you,\nClass Teacher`;
}

export const TeacherAiAssistant: React.FC = () => {
  const { showToast } = useAuth();
  const [task, setTask] = useState<AssistantTask>('parent_message');
  const [topic, setTopic] = useState('Class update');
  const [notes, setNotes] = useState('');
  const [audience, setAudience] = useState<'whole_class' | 'individual'>('whole_class');
  const [language, setLanguage] = useState<'Hindi' | 'English'>('Hindi');
  const [draft, setDraft] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [usedProvider, setUsedProvider] = useState<'bedrock' | 'gemini' | 'local' | null>(null);

  const generate = async () => {
    if (!notes.trim()) {
      showToast(task === 'translate' ? 'Enter the text to translate.' : 'Add the key details for the family message.', 'error');
      return;
    }
    setIsWorking(true);
    try {
      const payload = task === 'parent_message'
        ? { task, topic: topic.trim() || 'Class update', notes: notes.trim(), audience }
        : { task, text: notes.trim(), language };
      const response = await fetch('/api/ai/teacher-assistant', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null) as { draft?: string; provider?: 'bedrock' | 'gemini' | 'local'; error?: string } | null;
      if (!response.ok || !data?.draft) throw new Error(data?.error || 'AI assistant is unavailable.');
      setDraft(data.draft);
      setUsedProvider(data.provider || null);
      showToast(data.provider === 'local' ? 'A local draft is ready. Connect an AI provider to translate or improve the wording.' : 'AI draft is ready for your review.', 'success');
    } catch (error) {
      // Messaging must remain usable even when the local API process or AWS
      // service is offline. The draft is deliberately plain and editable.
      setDraft(createOfflineDraft(task, topic, notes, audience));
      setUsedProvider('local');
      showToast('The AI connection is offline, so an editable local draft was prepared.', 'info');
    } finally {
      setIsWorking(false);
    }
  };

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      showToast('Draft copied. Review it, then paste it into a notice or message.', 'success');
    } catch {
      showToast('Select and copy the draft manually.', 'info');
    }
  };

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 border-b border-[#e8e2d8] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d4e8da] text-[#1e3828]"><Bot className="h-5 w-5" /></span>
          <div>
            <h2 className="font-serif text-2xl text-[#1a1410]">ClassLine Assist</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#5a4f45]">Create a first draft for families, then review and send it yourself. The assistant never sends messages, changes marks, or replies to parents automatically.</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#edf7ef] px-2.5 py-1 text-[11px] font-bold text-[#1e3828]"><Sparkles className="h-3.5 w-3.5" /> Teacher review required</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Assistant task">
        <button type="button" onClick={() => setTask('parent_message')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${task === 'parent_message' ? 'bg-[#1a1410] text-white' : 'bg-[#f0ebe3] text-[#5a4f45]'}`}><Send className="mr-1.5 inline h-4 w-4" />Draft family message</button>
        <button type="button" onClick={() => setTask('translate')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${task === 'translate' ? 'bg-[#1a1410] text-white' : 'bg-[#f0ebe3] text-[#5a4f45]'}`}><Languages className="mr-1.5 inline h-4 w-4" />Translate</button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          {task === 'parent_message' ? <>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#6b5a48]">Message topic<input value={topic} onChange={(event) => setTopic(event.target.value)} maxLength={160} className="mt-1.5 w-full rounded-lg border border-[#d4cdc4] bg-white px-3 py-2 text-sm text-[#1a1410] outline-none focus:border-[#2a4a35]" /></label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#6b5a48]">Audience<select value={audience} onChange={(event) => setAudience(event.target.value as 'whole_class' | 'individual')} className="mt-1.5 w-full rounded-lg border border-[#d4cdc4] bg-white px-3 py-2 text-sm text-[#1a1410] outline-none focus:border-[#2a4a35]"><option value="whole_class">Whole class</option><option value="individual">One family</option></select></label>
          </> : <label className="block text-xs font-bold uppercase tracking-wide text-[#6b5a48]">Translate into<select value={language} onChange={(event) => setLanguage(event.target.value as 'Hindi' | 'English')} className="mt-1.5 w-full rounded-lg border border-[#d4cdc4] bg-white px-3 py-2 text-sm text-[#1a1410] outline-none focus:border-[#2a4a35]"><option value="Hindi">Hindi</option><option value="English">English</option></select></label>}
          <label className="block text-xs font-bold uppercase tracking-wide text-[#6b5a48]">{task === 'parent_message' ? 'Key details' : 'Text to translate'}<textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={task === 'parent_message' ? 2000 : 3000} rows={task === 'parent_message' ? 7 : 10} placeholder={task === 'parent_message' ? 'Include the confirmed date, time, action, and any amount due.' : 'Paste the approved school message here.'} className="mt-1.5 w-full resize-y rounded-lg border border-[#d4cdc4] bg-white px-3 py-2 text-sm leading-relaxed text-[#1a1410] outline-none focus:border-[#2a4a35]" /></label>
          <button type="button" disabled={isWorking} onClick={generate} className="inline-flex items-center gap-2 rounded-lg bg-[#2a4a35] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60">{isWorking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{isWorking ? 'Preparing draft…' : 'Generate draft'}</button>
        </div>

        <div className="rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] p-4">
          <div className="flex items-center justify-between gap-3"><h3 className="font-serif text-lg text-[#1a1410]">Draft for review</h3>{usedProvider && <span className="rounded-full bg-[#d4e8da] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1e3828]">{usedProvider === 'local' ? 'Local template' : 'AI generated'}</span>}</div>
          {draft ? <><textarea value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-3 min-h-48 w-full resize-y rounded-lg border border-[#d4cdc4] bg-white p-3 text-sm leading-relaxed text-[#1a1410] outline-none focus:border-[#2a4a35]" /><button type="button" onClick={copyDraft} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#c6b9aa] bg-white px-3 py-2 text-sm font-bold text-[#3e342b]"><Copy className="h-4 w-4" />Copy draft</button></> : <p className="mt-4 text-sm leading-relaxed text-[#6b5a48]">Your editable draft will appear here. Check every name, date, amount, and instruction before sharing it with a family.</p>}
        </div>
      </div>
    </section>
  );
};
