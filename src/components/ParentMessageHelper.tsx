import React, { useState } from 'react';
import { Bot, Languages, LoaderCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type HelperTask = 'message' | 'translate';
type TranslationLanguage = 'Hindi' | 'English' | 'Kannada' | 'Tamil' | 'Marathi' | 'Bengali';

type ParentMessageHelperProps = {
  onUseDraft: (draft: string) => void;
};

function createOfflineDraft(task: HelperTask, text: string) {
  if (task === 'translate') return text;
  return `Dear Class Teacher,\n\n${text.trim()}\n\nThank you.`;
}

/** A private, draft-only writing aid. It never submits a chat message itself. */
export const ParentMessageHelper: React.FC<ParentMessageHelperProps> = ({ onUseDraft }) => {
  const { showToast } = useAuth();
  const [task, setTask] = useState<HelperTask>('message');
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<TranslationLanguage>('Hindi');
  const [draft, setDraft] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  const generate = async () => {
    if (!text.trim()) {
      showToast(task === 'message' ? 'Write what you would like to ask the teacher.' : 'Enter the message you want to translate.', 'error');
      return;
    }
    setIsWorking(true);
    try {
      const response = await fetch('/api/ai/parent-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, text: text.trim(), language }),
      });
      const data = await response.json().catch(() => null) as { draft?: string; error?: string } | null;
      if (!response.ok || !data?.draft) throw new Error(data?.error || 'Writing help is unavailable.');
      setDraft(data.draft);
    } catch (error) {
      setDraft(createOfflineDraft(task, text));
      showToast('The AI connection is offline, so an editable local draft was prepared.', 'info');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="border-t border-[#e8e2d8] bg-[#edf7ef] p-3">
      <div className="flex items-start gap-2"><span className="mt-0.5 rounded-lg bg-[#d4e8da] p-1.5 text-[#1e3828]"><Bot className="h-4 w-4" /></span><div><p className="text-xs font-bold text-[#1a1410]">Family writing helper</p><p className="mt-0.5 text-[11px] leading-relaxed text-[#5a4f45]">Create a draft or translate it. Nothing is sent until you choose Send.</p></div></div>
      <div className="mt-3 flex gap-2"><button type="button" onClick={() => setTask('message')} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${task === 'message' ? 'bg-[#2a5038] text-white' : 'bg-white text-[#5a4f45]'}`}><Sparkles className="mr-1 inline h-3.5 w-3.5" />Help me write</button><button type="button" onClick={() => setTask('translate')} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${task === 'translate' ? 'bg-[#2a5038] text-white' : 'bg-white text-[#5a4f45]'}`}><Languages className="mr-1 inline h-3.5 w-3.5" />Translate</button>{task === 'translate' && <select value={language} onChange={(event) => setLanguage(event.target.value as TranslationLanguage)} className="ml-auto rounded-lg border border-[#b4d4be] bg-white px-2 text-[11px] text-[#1a1410]"><option value="Hindi">Hindi</option><option value="English">English</option><option value="Kannada">Kannada</option><option value="Tamil">Tamil</option><option value="Marathi">Marathi</option><option value="Bengali">Bengali</option></select>}</div>
      <textarea value={text} onChange={(event) => setText(event.target.value)} rows={3} maxLength={2000} placeholder={task === 'message' ? 'Example: Please let me know if my child should bring anything for Friday’s activity.' : 'Paste a school message to translate.'} className="mt-3 w-full resize-none rounded-lg border border-[#b4d4be] bg-white p-2 text-xs text-[#1a1410] outline-none focus:border-[#2a5038]" />
      <button type="button" onClick={generate} disabled={isWorking} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#2a5038] bg-white px-3 py-1.5 text-xs font-bold text-[#1e3828] disabled:opacity-60">{isWorking ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}{isWorking ? 'Preparing…' : 'Create draft'}</button>
      {draft && <div className="mt-3 rounded-lg border border-[#b4d4be] bg-white p-2.5"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} className="w-full resize-none text-xs leading-relaxed text-[#1a1410] outline-none" /><button type="button" onClick={() => onUseDraft(draft)} className="mt-2 rounded-lg bg-[#1a1410] px-3 py-1.5 text-xs font-bold text-white">Use this draft in chat</button></div>}
    </div>
  );
};
