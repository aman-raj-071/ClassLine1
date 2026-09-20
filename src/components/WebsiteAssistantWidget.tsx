import React, { FormEvent, useState } from 'react';
import { Bot, FileText, LoaderCircle, Mail, MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GradeNote, getGradeNotes } from '../utils/gradeNotes';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  notes?: GradeNote[];
};

const emphasize = (text: string) => text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
  part.startsWith('**') && part.endsWith('**')
    ? <strong key={index} className="font-bold text-[#1e3828]">{part.slice(2, -2)}</strong>
    : <React.Fragment key={index}>{part}</React.Fragment>
);

const AssistantResponse: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  return <div className="space-y-2.5">
    {lines.map((line, index) => {
      const step = line.match(/^(\d+)\.\s+(.+)$/);
      if (step) return <div key={`${line}-${index}`} className="flex items-start gap-2.5 rounded-xl border border-[#e8e2d8] bg-[#f7f3ed] px-2.5 py-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d4e8da] text-[10px] font-bold text-[#1e3828]">{step[1]}</span><p className="pt-0.5">{emphasize(step[2])}</p></div>;
      return <p key={`${line}-${index}`} className={index === 0 ? 'font-medium text-[#1a1410]' : ''}>{emphasize(line)}</p>;
    })}
  </div>;
};

// Always use the built-in ClassLine API. A separate environment URL could
// accidentally point this widget at an outdated assistant with incomplete
// website knowledge.
const CHAT_API_URL = '/api/ai/website-assistant';

const HELP_TOPICS = {
  parent: [
    'How do I pay a fee and get a receipt?',
    'Where can I see today’s timetable?',
    'How do I message my child’s teacher?',
    'Where can I view the report card?',
  ],
  teacher: [
    'How do I send a notice to my whole class?',
    'How do I send a message to one family?',
    'How do I review pending sign-offs?',
    'How do I find a grade card by verification code?',
  ],
  guest: [
    'What can parents do on ClassLine?',
    'What can teachers do on ClassLine?',
    'How do I sign in or reset my password?',
    'How do school fees and receipts work?',
    'Show available study notes',
  ],
};

/** Website-help chatbot. It is separate from private parent/teacher messages. */
export const WebsiteAssistantWidget: React.FC = () => {
  const { currentUser, childrenList } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const role = currentUser?.role || 'guest';
  const suggestions = HELP_TOPICS[role];

  const notesForCurrentUser = (message: string) => {
    if (!/\b(notes?|pdf|worksheet|study material|revision)\b/i.test(message)) return [];
    const allNotes = getGradeNotes();
    const allowedGrades = currentUser?.role === 'teacher'
      ? [currentUser.class || '']
      : childrenList.filter((child) => currentUser?.children?.includes(child.id)).flatMap((child) => [child.year, `${child.year} ${child.class}`]);
    const allowed = role === 'guest'
      ? allNotes.filter((note) => note.visibility === 'public')
      : allNotes.filter((note) => allowedGrades.some((grade) => grade && note.grade.toLowerCase().includes(grade.toLowerCase())));
    const requestedClass = message.match(/(?:class|grade)\s*([ivxlcdm]+|\d+)/i)?.[1]?.toLowerCase();
    const gradeMatches = requestedClass ? allowed.filter((note) => note.grade.toLowerCase().includes(requestedClass)) : allowed;
    const query = message.toLowerCase();
    const subjectMatches = gradeMatches.filter((note) =>
      query.includes(note.subject.toLowerCase()) || query.includes(note.title.toLowerCase())
    );
    return subjectMatches.length ? subjectMatches : gradeMatches;
  };

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || isSending) return;

    const isNotesRequest = /\b(notes?|pdf|worksheet|study material|revision)\b/i.test(message);
    const matchingNotes = notesForCurrentUser(message);
    if (matchingNotes.length) {
      setMessages((previous) => [...previous,
        { id: `user-${Date.now()}`, role: 'user', text: message },
        { id: `notes-${Date.now()}`, role: 'assistant', text: `I found ${matchingNotes.length} note${matchingNotes.length === 1 ? '' : 's'} for your class. Open or download the resource below.`, notes: matchingNotes },
      ]);
      setInput('');
      return;
    }
    if (isNotesRequest) {
      const classLabel = currentUser?.role === 'teacher' ? currentUser.class : 'your child’s class';
      const responseText = role === 'guest'
        ? 'No public notes match your request yet. Try “show available study notes”, or ask the school to publish the notes for visitors.'
        : `No matching notes have been published for ${classLabel || 'this class'} yet. Ask the class teacher to upload them in **Grade Notes**, then try again.`;
      setMessages((previous) => [...previous,
        { id: `user-${Date.now()}`, role: 'user', text: message },
        { id: `notes-empty-${Date.now()}`, role: 'assistant', text: responseText },
      ]);
      setInput('');
      return;
    }

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: message };
    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, role: currentUser?.role }),
      });
      const data = await response.json().catch(() => null) as { response?: string; error?: string } | null;
      if (!response.ok || !data?.response) throw new Error(data?.error || 'The assistant is unavailable.');
      setMessages((previous) => [...previous, { id: `assistant-${Date.now()}`, role: 'assistant', text: data.response! }]);
    } catch {
      setMessages((previous) => [...previous, {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        text: 'The website assistant is not running right now. Please try again later or contact the school office.',
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <aside className="fixed bottom-5 right-4 z-[120] sm:bottom-6 sm:right-6" aria-label="ClassLine website assistant">
      {isOpen && <section id="website-assistant-panel" className="mb-3 flex h-[min(560px,72vh)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#e8e2d8] bg-[#2a4a35] p-4 text-white">
          <div className="flex gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Bot className="h-5 w-5" /></span><div><h2 className="font-serif text-lg">Ask ClassLine</h2><p className="text-[11px] text-[#d4e8da]">Answers from this website only</p></div></div>
          <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 hover:bg-white/15" aria-label="Close website assistant"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-[#f7f3ed] p-4">
          {messages.length === 0 ? <div className="space-y-3"><div className="rounded-xl border border-[#d4cdc4] bg-white p-3 text-sm leading-relaxed text-[#5a4f45]"><p className="font-bold text-[#1a1410]">Quick help</p><p className="mt-1">Choose a topic or type your question.</p></div><div className="grid gap-2">{suggestions.map((topic) => <button key={topic} type="button" disabled={isSending} onClick={() => void sendMessage(topic)} className="rounded-xl border border-[#d4cdc4] bg-white px-3 py-2.5 text-left text-xs font-semibold leading-relaxed text-[#3e342b] transition-colors hover:border-[#2a4a35] hover:bg-[#edf7ef] disabled:opacity-60">{topic}</button>)}</div>{role !== 'guest' && <a href="mailto:office@saraswativm.edu.in" className="flex items-center justify-center gap-1.5 pt-1 text-xs font-bold text-[#2a4a35] hover:underline"><Mail className="h-3.5 w-3.5" />Contact school office</a>}</div> : messages.map((message) => <div key={message.id} className={`max-w-[88%] rounded-2xl p-3 text-sm leading-relaxed ${message.role === 'user' ? 'ml-auto rounded-tr-sm bg-[#d4e8da] text-[#1a1410]' : 'rounded-tl-sm bg-white text-[#1a1410] shadow-sm'}`}><>{message.role === 'assistant' ? <AssistantResponse text={message.text} /> : message.text}{message.notes && <div className="mt-3 space-y-2">{message.notes.map((note) => <a key={note.id} href={note.resourceUrl} download={note.resourceType === 'pdf' ? note.fileName : undefined} target={note.resourceType === 'link' ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-2 rounded-xl border border-[#b4d4be] bg-[#edf7ef] p-2.5 text-xs font-bold text-[#1e3828]"><FileText className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1 truncate">{note.title} - {note.subject}</span><span>{note.resourceType === 'pdf' ? 'PDF' : 'Open'}</span></a>)}</div>}</></div>)}
          {isSending && <div className="flex w-fit items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs text-[#6b5a48]"><LoaderCircle className="h-4 w-4 animate-spin" />Looking on the website…</div>}
        </div>
        <form onSubmit={submit} className="flex gap-2 border-t border-[#e8e2d8] p-3">
          <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={2000} disabled={isSending} placeholder="Ask about ClassLine…" className="min-w-0 flex-1 rounded-xl border border-[#d4cdc4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2a4a35] disabled:opacity-60" />
          <button type="submit" disabled={!input.trim() || isSending} className="rounded-xl bg-[#1a1410] px-3 text-white disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send question"><Send className="h-4 w-4" /></button>
        </form>
      </section>}
      <button type="button" onClick={() => setIsOpen((open) => !open)} className="flex items-center gap-2 rounded-full bg-[#1a1410] px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]" aria-expanded={isOpen} aria-controls="website-assistant-panel"><MessageCircle className="h-5 w-5 text-[#d4e8da]" />{isOpen ? 'Close help' : 'Ask ClassLine'}</button>
    </aside>
  );
};
