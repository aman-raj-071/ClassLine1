import React, { ChangeEvent, useState } from 'react';
import { ExternalLink, FileText, Link as LinkIcon, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GradeNote, getGradeNotes, saveGradeNotes } from '../utils/gradeNotes';

type Props = { assignedClass: string };

export const GradeNotesLibrary: React.FC<Props> = ({ assignedClass }) => {
  const { currentUser, showToast } = useAuth();
  const [notes, setNotes] = useState<GradeNote[]>(getGradeNotes);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<'public' | 'registered'>('public');
  const [isSaving, setIsSaving] = useState(false);

  const updateNotes = (next: GradeNote[]) => {
    setNotes(next);
    saveGradeNotes(next);
  };

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      showToast('Please upload a PDF file, or add a secure study link.', 'error');
      event.target.value = '';
      return;
    }
    if (file && file.size > 1_500_000) {
      showToast('Please use a PDF smaller than 1.5 MB for this demo library.', 'error');
      event.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !subject.trim() || (!selectedFile && !link.trim())) {
      showToast('Add a title, subject, and either a PDF or a study link.', 'error');
      return;
    }
    if (link.trim() && !/^https?:\/\//i.test(link.trim())) {
      showToast('Study links must start with https:// or http://.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const resourceUrl = selectedFile
        ? await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Could not read the PDF.'));
          reader.readAsDataURL(selectedFile);
        })
        : link.trim();
      const note: GradeNote = {
        id: `note-${Date.now()}`,
        title: title.trim(), grade: assignedClass, subject: subject.trim(), description: description.trim(),
        resourceUrl, resourceType: selectedFile ? 'pdf' : 'link', fileName: selectedFile?.name || 'Open study link', visibility,
        uploadedBy: currentUser?.name || 'Class teacher', uploadedAt: 'Just now',
      };
      updateNotes([note, ...notes]);
      setTitle(''); setSubject(''); setDescription(''); setLink(''); setSelectedFile(null);
      showToast(`Notes published for ${assignedClass}. Parents can now find them in Ask ClassLine.`, 'success');
    } catch {
      showToast('The PDF could not be saved. Please try again.', 'error');
    } finally { setIsSaving(false); }
  };

  const classNotes = notes.filter((note) => note.grade === assignedClass);
  return <section className="mx-auto max-w-4xl rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-5 shadow-sm sm:p-7">
    <div className="flex items-start gap-3 border-b border-[#e8e2d8] pb-5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4e8da] text-[#1e3828]"><FileText className="h-5 w-5" /></span><div><h2 className="font-serif text-2xl text-[#1a1410]">Grade Notes Library</h2><p className="mt-1 text-sm text-[#5a4f45]">Upload revision notes for {assignedClass}. Parents can ask ClassLine for their class notes and open a PDF or study link.</p></div></div>
    <form onSubmit={publish} className="mt-5 grid gap-4 rounded-xl border border-[#e8e2d8] bg-[#f7f3ed] p-4 sm:grid-cols-2">
      <label className="text-xs font-bold uppercase tracking-wide text-[#6b5a48]">Notes title<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Fractions revision notes" className="mt-1.5 w-full rounded-lg border border-[#d4cdc4] bg-white px-3 py-2 text-sm normal-case outline-none focus:border-[#2a4a35]" /></label>
      <label className="text-xs font-bold uppercase tracking-wide text-[#6b5a48]">Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={60} placeholder="Mathematics" className="mt-1.5 w-full rounded-lg border border-[#d4cdc4] bg-white px-3 py-2 text-sm normal-case outline-none focus:border-[#2a4a35]" /></label>
      <label className="sm:col-span-2 text-xs font-bold uppercase tracking-wide text-[#6b5a48]">Short description<input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={180} placeholder="Practice questions and worked examples." className="mt-1.5 w-full rounded-lg border border-[#d4cdc4] bg-white px-3 py-2 text-sm normal-case outline-none focus:border-[#2a4a35]" /></label>
      <label className="text-xs font-bold uppercase tracking-wide text-[#6b5a48]">Upload PDF<input type="file" accept="application/pdf" onChange={chooseFile} className="mt-1.5 block w-full text-xs normal-case text-[#5a4f45]" /></label>
      <label className="text-xs font-bold uppercase tracking-wide text-[#6b5a48]">Or add study link<input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="mt-1.5 w-full rounded-lg border border-[#d4cdc4] bg-white px-3 py-2 text-sm normal-case outline-none focus:border-[#2a4a35]" /></label>
      <label className="text-xs font-bold uppercase tracking-wide text-[#6b5a48]">Who can access<select value={visibility} onChange={(e) => setVisibility(e.target.value as 'public' | 'registered')} className="mt-1.5 w-full rounded-lg border border-[#d4cdc4] bg-white px-3 py-2 text-sm normal-case outline-none focus:border-[#2a4a35]"><option value="public">Everyone, including visitors</option><option value="registered">Registered parents and teachers</option></select></label>
      <div className="sm:col-span-2 flex items-center justify-between gap-3"><p className="text-xs text-[#6b5a48]">{selectedFile ? `PDF ready: ${selectedFile.name}` : 'Upload one PDF or provide one secure link.'}</p><button disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-[#2a4a35] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{selectedFile ? <Upload className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}{isSaving ? 'Publishing…' : 'Publish notes'}</button></div>
    </form>
    <div className="mt-6"><h3 className="font-serif text-lg text-[#1a1410]">Published for {assignedClass}</h3><div className="mt-3 space-y-2">{classNotes.length ? classNotes.map((note) => <div key={note.id} className="flex flex-col gap-3 rounded-xl border border-[#e8e2d8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-[#1a1410]">{note.title}</p><p className="mt-1 text-xs text-[#5a4f45]">{note.subject}{note.description ? ` • ${note.description}` : ''}</p></div><a href={note.resourceUrl} download={note.resourceType === 'pdf' ? note.fileName : undefined} target={note.resourceType === 'link' ? '_blank' : undefined} rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#b4d4be] px-3 py-2 text-xs font-bold text-[#1e3828]">{note.resourceType === 'pdf' ? <FileText className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}{note.resourceType === 'pdf' ? 'Download PDF' : 'Open link'}</a></div>) : <p className="rounded-xl border border-dashed border-[#d4cdc4] p-4 text-sm text-[#6b5a48]">No notes have been published for this class yet.</p>}</div></div>
  </section>;
};
