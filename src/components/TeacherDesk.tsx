import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { EntryType, Pupil } from '../types';
import { getPupilDetailsForClass, getPupilsForClass, PUPIL_CHILD_IDS } from '../data/mockData';
import {
  Send,
  Lock,
  Search,
  X,
  History,
  CheckCircle2,
  Users,
  BarChart3,
  AlertTriangle,
  FileText,
  Paperclip,
  Link as LinkIcon,
  Eye,
  CreditCard,
  Calendar,
  FileEdit,
  Radio,
  Clock,
  ShieldCheck,
  CheckCheck,
  BookOpen,
  FileCheck,
  Award,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  UserPlus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { GradeCardEditor } from './GradeCardEditor';
import { ParentAccountManager } from './ParentAccountManager';
import { PupilProfileModal } from './PupilProfileModal';
import { createDefaultGradeCardForPupil } from '../utils/gradeCalculations';
import { ClassSchedulePanel } from './ClassSchedulePanel';
import { TeacherAccountManager } from './TeacherAccountManager';
import { SchoolDirectory } from './SchoolDirectory';
import { TeacherAiAssistant } from './TeacherAiAssistant';
import { GradeNotesLibrary } from './GradeNotesLibrary';

export const TeacherDesk: React.FC = () => {
  const {
    currentUser,
    dispatches,
    signOffItems,
    signOffItem,
    signOffAllItems,
    rejectSignOffItem,
    addDispatch,
    recallDispatch,
    archiveDispatch,
    resendDispatch,
    showToast,
    gradeCards,
    timelineEntries,
    replyToParentMessage,
  } = useAuth();

  const [teacherActiveTab, setTeacherActiveTab] = useState<'dispatch' | 'gradebook' | 'assistant' | 'notes' | 'accounts' | 'staff' | 'directory' | 'about'>('dispatch');
  const [category, setCategory] = useState<EntryType>('note');
  const [recipientScope, setRecipientScope] = useState<'class' | 'individual' | 'group'>('class');
  const [selectedPupilNames, setSelectedPupilNames] = useState<string[]>([]);
  const [pupilSearchQuery, setPupilSearchQuery] = useState<string>('');
  const [entryTitle, setEntryTitle] = useState<string>('');
  const [entryBody, setEntryBody] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [showDispatchRegistry, setShowDispatchRegistry] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [lastAutosave, setLastAutosave] = useState<string>('Just now');
  const [profilePupil, setProfilePupil] = useState<Pupil | null>(null);
  const [parentReplyDrafts, setParentReplyDrafts] = useState<Record<string, string>>({});

  // Sign-off ledger state
  const [showSignOffQueue, setShowSignOffQueue] = useState<boolean>(true);
  const [signOffFilter, setSignOffFilter] = useState<'all_pending' | 'reading' | 'consents' | 'signed'>('all_pending');
  const [activeRemarkId, setActiveRemarkId] = useState<string | null>(null);
  const [activeRemarkText, setActiveRemarkText] = useState<string>('');

  const pendingSignOffs = signOffItems.filter((i) => i.status === 'pending');
  const signedSignOffs = signOffItems.filter((i) => i.status === 'signed');
  const assignedClass = currentUser?.class || 'Class III A';
  const isAuthorized = Boolean(currentUser?.isAuthorized);
  const classPupils = getPupilsForClass(assignedClass);
  const classChildIds = new Set(classPupils.map((pupil) => PUPIL_CHILD_IDS[pupil.id] || pupil.id));
  const parentMessages = timelineEntries.filter((entry) => classChildIds.has(entry.childId)).flatMap((entry) => (entry.parentMessages || []).map((message) => ({ entry, message }))).slice(0, 8);
  const selectedPupilGradeCard = profilePupil
    ? gradeCards.find((card) => card.pupilId === PUPIL_CHILD_IDS[profilePupil.id] || card.pupilId === profilePupil.id)
      ?? createDefaultGradeCardForPupil(PUPIL_CHILD_IDS[profilePupil.id] || profilePupil.id, profilePupil.name, 'Section A (Oak)', 'Class III (Year 3)', currentUser?.name || 'Aman Raj')
    : undefined;

  const displayedSignOffs = signOffItems.filter((item) => {
    if (signOffFilter === 'all_pending') return item.status === 'pending';
    if (signOffFilter === 'reading') return item.type === 'reading_log';
    if (signOffFilter === 'consents') return item.type === 'consent_form' || item.type === 'trip_permission';
    if (signOffFilter === 'signed') return item.status === 'signed';
    return true;
  });

  const MAX_CHARS = 600;

  // Autosave simulation
  useEffect(() => {
    const timer = setInterval(() => {
      if (entryBody.trim()) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastAutosave(`Autosaved at ${time}`);
      }
    }, 20000);
    return () => clearInterval(timer);
  }, [entryBody]);

  const togglePupilSelection = (name: string) => {
    setSelectedPupilNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryBody.trim()) {
      showToast('Please compose entry text before posting.', 'error');
      return;
    }

    if (recipientScope !== 'class' && selectedPupilNames.length === 0) {
      showToast('Please select at least one recipient pupil.', 'error');
      return;
    }

    setIsPosting(true);

    setTimeout(() => {
      const wasDelivered = addDispatch({
        category,
        title: entryTitle.trim() || (category === 'note' ? 'Individual Progress Note' : 'Class Notice'),
        body: entryBody.trim(),
        targetScope: recipientScope,
        selectedPupils: selectedPupilNames,
        recipients: recipientScope === 'class' ? classPupils.length : selectedPupilNames.length,
      });

      setIsPosting(false);
      if (!wasDelivered) return;

      setEntryTitle('');
      setEntryBody('');
      setShowPreview(false);
      setSelectedPupilNames([]);
      setRecipientScope('class');
      setCategory('note');
      setIsComposerOpen(false);
    }, 750);
  };

  const filteredSearchPupils = pupilSearchQuery.trim()
    ? classPupils.filter(
        (p) =>
          p.name.toLowerCase().includes(pupilSearchQuery.toLowerCase()) &&
          !selectedPupilNames.includes(p.name)
      ).slice(0, 6)
    : [];
  // Connection status determines the roster order automatically: connected
  // families first, followed by pupils whose parent invitation is pending.
  const classifiedPupils = [...classPupils].sort((a, b) => {
    if (a.status === b.status) return a.name.localeCompare(b.name);
    return a.status === 'connected' ? -1 : 1;
  });
  const connectedPupilCount = classPupils.filter((pupil) => pupil.status === 'connected').length;
  const pendingPupilCount = classPupils.length - connectedPupilCount;

  const prepareAttentionReminder = (reminderCategory: EntryType, title: string, body: string, recipientCount: number) => {
    setTeacherActiveTab('dispatch');
    setIsComposerOpen(true);
    setCategory(reminderCategory);
    setEntryTitle(title);
    setEntryBody(body);
    setRecipientScope('group');
    setSelectedPupilNames(classPupils.slice(0, recipientCount).map((pupil) => pupil.name));
    showToast('Reminder prepared. Review it and select Post to send it.', 'info');
    window.setTimeout(() => document.getElementById('composerInput')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Registry Header Block */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6b5a48]">
          <span className="w-2 h-2 rounded-full bg-[#2a4a35]" />
          <span>Teacher Workspace &bull; Assigned {assignedClass} &bull; Saraswati Vidya Mandir</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1a1410] tracking-tight">
              {currentUser?.name || 'Aman Raj'}
            </h1>
            <p className="text-sm text-[#5a4f45] mt-1">
              <span>Role: Class Teacher</span>
              <span className="mx-2 text-[#d4cdc4]">&bull;</span>
              <span>Assigned class: {assignedClass} &bull; {classPupils.length} Pupils Enrolled</span>
            </p>
          </div>
        </div>

        {/* Primary tools stay at the top of the workspace for faster access. */}
        <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d4cdc4] bg-[#f0ebe3] p-2" aria-label="Teacher workspace tools">
          <div className="grid w-full grid-cols-2 gap-1 rounded-xl bg-[#e8e2d8] p-1 shadow-inner sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            <button type="button" onClick={() => setTeacherActiveTab('dispatch')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${teacherActiveTab === 'dispatch' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}><Send className="w-4 h-4 text-[#8a6f5a]" />Daily Dispatch &amp; Log</button>
            <button type="button" onClick={() => setTeacherActiveTab('gradebook')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${teacherActiveTab === 'gradebook' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}><GraduationCap className="w-4 h-4 text-[#2a4a35]" />Gradebook <span className="rounded-full bg-[#d4e8da] px-1.5 py-0.5 text-[9px] text-[#1e3828]">Marks</span></button>
            <button type="button" onClick={() => setTeacherActiveTab('assistant')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${teacherActiveTab === 'assistant' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}><Sparkles className="w-4 h-4 text-[#7a4e10]" />AI Assist</button>
            <button type="button" onClick={() => setTeacherActiveTab('notes')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${teacherActiveTab === 'notes' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}><FileText className="w-4 h-4 text-[#2a4a35]" />Grade Notes</button>
            <button type="button" onClick={() => { setTeacherActiveTab('dispatch'); setShowSignOffQueue(true); window.setTimeout(() => document.getElementById('awaiting-signoff-ledger')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#6b5a48]"><Clock className="w-4 h-4 text-[#7a4e10]" />Sign-offs ({pendingSignOffs.length})</button>
            {isAuthorized && <button type="button" onClick={() => setTeacherActiveTab('accounts')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${teacherActiveTab === 'accounts' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}><UserPlus className="w-4 h-4 text-[#2a4a35]" />Parent Accounts</button>}
            {isAuthorized && <button type="button" onClick={() => setTeacherActiveTab('staff')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${teacherActiveTab === 'staff' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}><GraduationCap className="w-4 h-4 text-[#7a4e10]" />Teacher Accounts</button>}
            {isAuthorized && <button type="button" onClick={() => setTeacherActiveTab('directory')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${teacherActiveTab === 'directory' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}><Users className="w-4 h-4 text-[#2a4a35]" />All Students</button>}
            <button type="button" onClick={() => setTeacherActiveTab('about')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${teacherActiveTab === 'about' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}><BookOpen className="w-4 h-4 text-[#8a6f5a]" />About Class</button>
          </div>
          <span className="px-2 text-xs text-[#6b5a48]">Class Teacher: <strong className="text-[#1a1410]">{assignedClass}</strong></span>
        </nav>

        {/* 4 Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-[#fdfaf6] p-4 rounded-2xl border border-[#d4cdc4] shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#ede4d9] text-[#6b5a48] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-2xl text-[#1a1410] leading-none">{connectedPupilCount} / {classPupils.length}</p>
              <p className="text-xs text-[#6b5a48] font-semibold mt-1">Parents Connected</p>
            </div>
          </div>

          <div className="bg-[#fdfaf6] p-4 rounded-2xl border border-[#d4cdc4] shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#d4e8da] text-[#1e3828] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-2xl text-[#2a4a35] leading-none">100%</p>
              <p className="text-xs text-[#6b5a48] font-semibold mt-1">Delivered This Week</p>
            </div>
          </div>

          <button
            type="button"
            id="awaiting-signoff-card-btn"
            onClick={() => {
              setTeacherActiveTab('dispatch');
              setShowSignOffQueue(true);
              const el = document.getElementById('awaiting-signoff-ledger');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className={`text-left p-4 rounded-2xl border transition-all shadow-sm flex items-center gap-4 group cursor-pointer ${
              pendingSignOffs.length > 0
                ? 'bg-[#fdfaf6] border-[#7a4e10]/40 hover:border-[#7a4e10] ring-1 ring-[#7a4e10]/20'
                : 'bg-[#fdfaf6] border-[#d4cdc4] hover:border-[#8a6f5a]'
            }`}
            title="Click to view and sign off pending items in the ledger"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f5e6c8] text-[#7a4e10] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-serif text-2xl text-[#7a4e10] leading-none">
                  {pendingSignOffs.length}
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    pendingSignOffs.length > 0
                      ? 'bg-[#f5e6c8] text-[#7a4e10]'
                      : 'bg-[#d4e8da] text-[#1e3828]'
                  }`}
                >
                  {pendingSignOffs.length > 0 ? `${pendingSignOffs.length} Pending` : 'All Clear'}
                </span>
              </div>
              <p className="text-xs text-[#6b5a48] font-semibold mt-1 flex items-center justify-between">
                <span>Awaiting Sign-off</span>
                <span className="text-[11px] text-[#7a4e10] font-normal group-hover:underline">
                  Review queue →
                </span>
              </p>
            </div>
          </button>

          {/* Metric 4: Pupil Gradebook Card */}
          <button
            type="button"
            id="teacher-gradebook-card-btn"
            onClick={() => setTeacherActiveTab('gradebook')}
            className={`text-left p-4 rounded-2xl border transition-all shadow-sm flex items-center gap-4 group cursor-pointer ${
              teacherActiveTab === 'gradebook'
                ? 'bg-[#fdfaf6] border-[#2a4a35] ring-2 ring-[#2a4a35]/20'
                : 'bg-[#fdfaf6] border-[#d4cdc4] hover:border-[#2a4a35]'
            }`}
            title="Click to assess pupil marks and update grade card format"
          >
            <div className="w-10 h-10 rounded-xl bg-[#d4e8da] text-[#1e3828] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-serif text-xl font-bold text-[#1a1410] leading-none">
                  Autumn
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#d4e8da] text-[#1e3828]">
                  Ready
                </span>
              </div>
              <p className="text-xs text-[#6b5a48] font-semibold mt-1 flex items-center justify-between">
                <span>Grade Card Assessor</span>
                <span className="text-[11px] text-[#2a4a35] font-bold group-hover:underline">
                  {teacherActiveTab === 'gradebook' ? 'Active' : 'Input marks →'}
                </span>
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Teacher Workspace Navigation Bar */}
      <div className="hidden flex-wrap items-center justify-between gap-4 p-2 bg-[#f0ebe3] rounded-2xl border border-[#d4cdc4]">
        <div className="flex p-1 bg-[#e8e2d8] rounded-xl shadow-inner gap-1">
          <button
            type="button"
            id="tab-teacher-dispatch"
            onClick={() => setTeacherActiveTab('dispatch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              teacherActiveTab === 'dispatch'
                ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm'
                : 'text-[#6b5a48] hover:text-[#1a1410]'
            }`}
          >
            <Send className="w-4 h-4 text-[#8a6f5a]" />
            <span>Daily Dispatch &amp; Log</span>
          </button>

          <button
            type="button"
            id="tab-teacher-gradebook"
            onClick={() => setTeacherActiveTab('gradebook')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              teacherActiveTab === 'gradebook'
                ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm'
                : 'text-[#6b5a48] hover:text-[#1a1410]'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-[#2a4a35]" />
            <span>Pupil Gradebook &amp; Marks Studio</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#d4e8da] text-[#1e3828] border border-[#b4d4be]">
              Grade Card Format
            </span>
          </button>

          <button
            type="button"
            id="tab-teacher-signoffs"
            onClick={() => {
              setTeacherActiveTab('dispatch');
              setShowSignOffQueue(true);
              const el = document.getElementById('awaiting-signoff-ledger');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all text-[#6b5a48] hover:text-[#1a1410]`}
          >
            <Clock className="w-4 h-4 text-[#7a4e10]" />
            <span>Sign-offs ({pendingSignOffs.length})</span>
          </button>

          <button
            type="button"
            id="tab-teacher-accounts"
            onClick={() => setTeacherActiveTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${teacherActiveTab === 'accounts' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48] hover:text-[#1a1410]'}`}
          >
            <UserPlus className="w-4 h-4 text-[#2a4a35]" />
            <span>Parent Accounts</span>
          </button>
        </div>

        <div className="text-xs text-[#6b5a48] px-2 hidden sm:block">
          Role: <strong className="text-[#1a1410]">Class Teacher</strong> &bull; Assigned class: <strong className="text-[#1a1410]">{assignedClass}</strong>
        </div>
      </div>

      {teacherActiveTab === 'about' ? (
        <section className="rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-6 shadow-sm"><div className="border-b border-[#e8e2d8] pb-4"><h2 className="font-serif text-2xl text-[#1a1410]">About {assignedClass}</h2><p className="mt-1 text-sm text-[#5a4f45]">Key classroom information for the current academic session.</p></div><dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-xl bg-[#f7f3ed] p-4"><dt className="text-xs font-bold uppercase text-[#6b5a48]">Enrolment</dt><dd className="mt-1 font-serif text-2xl text-[#1a1410]">{classPupils.length} pupils</dd></div><div className="rounded-xl bg-[#edf7ef] p-4"><dt className="text-xs font-bold uppercase text-[#2a4a35]">Parent accounts</dt><dd className="mt-1 font-serif text-2xl text-[#1e3828]">{connectedPupilCount} connected</dd></div><div className="rounded-xl bg-[#f7f3ed] p-4"><dt className="text-xs font-bold uppercase text-[#6b5a48]">Class teacher</dt><dd className="mt-1 text-lg font-semibold text-[#1a1410]">{currentUser?.name || 'Aman Raj'}</dd></div></dl><div className="mt-5 rounded-xl border border-[#e8e2d8] p-4 text-sm leading-relaxed text-[#5a4f45]">Use this workspace to send family notices, review submissions, manage parent accounts, and maintain pupils’ grade cards.</div></section>
      ) : teacherActiveTab === 'accounts' ? (
        isAuthorized ? <ParentAccountManager /> : <AccessRestricted />
      ) : teacherActiveTab === 'staff' ? (
        isAuthorized ? <TeacherAccountManager /> : <AccessRestricted />
      ) : teacherActiveTab === 'directory' ? (
        isAuthorized ? <SchoolDirectory /> : <AccessRestricted />
      ) : teacherActiveTab === 'gradebook' ? (
        /* PUPIL GRADEBOOK ASSESSOR & MARKS STUDIO */
        <GradeCardEditor />
      ) : teacherActiveTab === 'assistant' ? (
        <TeacherAiAssistant pupils={classPupils} onSendDraft={(draft, topic, audience, pupilName) => {
          addDispatch({
            category: 'note',
            title: topic,
            body: draft,
            targetScope: audience === 'whole_class' ? 'class' : 'individual',
            selectedPupils: audience === 'whole_class' ? [] : [pupilName || ''],
            recipients: audience === 'whole_class' ? classPupils.length : 1,
          });
        }} />
      ) : teacherActiveTab === 'notes' ? (
        <GradeNotesLibrary assignedClass={assignedClass} />
      ) : (
        /* MAIN DISPATCH & LEDGER DESK */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Composer & Sent Registry */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* AWAITING SIGN-OFF VERIFICATION DESK */}
          <section
            id="awaiting-signoff-ledger"
            aria-label="Awaiting Sign-off Ledger"
            className="order-2 bg-[#fdfaf6] rounded-2xl p-6 border border-[#d4cdc4] shadow-sm relative overflow-hidden space-y-5 scroll-mt-6"
          >
            {/* Top gold/amber ruled bar */}
            <div className="h-1 bg-gradient-to-r from-[#7a4e10] via-[#c99738] to-[#8a6f5a] -mx-6 -mt-6 mb-5" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e2d8]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f5e6c8] text-[#7a4e10] flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg font-medium text-[#1a1410]">
                      Awaiting Sign-off Ledger
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#f5e6c8] text-[11px] font-bold text-[#7a4e10]">
                      {pendingSignOffs.length} pending
                    </span>
                  </div>
                  <p className="text-xs text-[#6b5a48] mt-0.5">
                    Review and verify pupil reading logs, excursion consent slips &amp; confirmations for {assignedClass}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                {pendingSignOffs.length > 0 && (
                  <button
                    type="button"
                    id="signoff-all-btn"
                    onClick={signOffAllItems}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2a4a35] hover:bg-[#1e3828] text-white text-xs font-semibold shadow-xs transition-colors"
                    title="Verify and countersign all pending items at once"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Sign Off All ({pendingSignOffs.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowSignOffQueue(!showSignOffQueue)}
                  className="p-1.5 rounded-lg hover:bg-[#ede4d9] text-[#6b5a48] transition-colors"
                  title={showSignOffQueue ? 'Collapse sign-off desk' : 'Expand sign-off desk'}
                  aria-label={showSignOffQueue ? 'Collapse sign-off desk' : 'Expand sign-off desk'}
                >
                  {showSignOffQueue ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {showSignOffQueue && (
              <>
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Sign-off Categories">
                    {[
                      { id: 'all_pending', label: `Pending (${pendingSignOffs.length})` },
                      { id: 'reading', label: 'Reading Logs' },
                      { id: 'consents', label: 'Trip & Consents' },
                      { id: 'signed', label: `Signed Archive (${signedSignOffs.length})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSignOffFilter(tab.id as any)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          signOffFilter === tab.id
                            ? 'bg-[#1a1410] text-[#fdfaf6] shadow-xs'
                            : 'bg-[#ede4d9] text-[#5a4f45] hover:bg-[#e0d5c5]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] text-[#6b5a48] font-medium hidden sm:inline">
                    Countersigned entries are archived to the class record
                  </span>
                </div>

                {/* List of items */}
                {displayedSignOffs.length === 0 ? (
                  <div className="py-8 text-center rounded-xl bg-[#f7f3ed] border border-dashed border-[#d4cdc4] space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-[#2a4a35] mx-auto opacity-80" />
                    <p className="font-serif text-sm font-semibold text-[#1a1410]">
                      {signOffFilter === 'signed'
                        ? 'No signed items yet in archive'
                        : 'No items currently awaiting sign-off'}
                    </p>
                    <p className="text-xs text-[#6b5a48] max-w-sm mx-auto">
                      {signOffFilter === 'signed'
                        ? 'Items you verify will be permanently archived and catalogued here.'
                        : 'All pupil reading records and trip consents have been reviewed and verified.'}
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3" aria-label="Sign-off queue items">
                    {displayedSignOffs.map((item) => (
                      <li
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          item.status === 'signed'
                            ? 'bg-[#f4f7f4] border-[#c0d6c4]'
                            : 'bg-[#fcfaf7] border-[#d4cdc4] hover:border-[#7a4e10]/60 shadow-2xs'
                        }`}
                      >
                        {/* Header line of item */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {/* Type badge */}
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                item.type === 'reading_log'
                                  ? 'bg-[#d4e8da] text-[#1e3828]'
                                  : item.type === 'trip_permission'
                                    ? 'bg-[#f5e6c8] text-[#7a4e10]'
                                    : 'bg-[#ede4d9] text-[#5a4f45]'
                              }`}
                            >
                              {item.type === 'reading_log' ? (
                                <>
                                  <BookOpen className="w-3 h-3" />
                                  <span>Reading Log</span>
                                </>
                              ) : item.type === 'trip_permission' ? (
                                <>
                                  <FileCheck className="w-3 h-3" />
                                  <span>Trip Consent</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Activity Consent</span>
                                </>
                              )}
                            </span>

                            {/* Pupil name & Parent */}
                            <span className="font-semibold text-xs text-[#1a1410]">
                              {item.pupilName}
                            </span>
                            <span className="text-[11px] text-[#6b5a48] hidden sm:inline">
                              &bull; Signed by {item.parentName}
                            </span>
                          </div>

                          {/* Status and timestamp */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#6b5a48]">
                              {item.submittedAt}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === 'signed'
                                  ? 'bg-[#d4e8da] text-[#1e3828]'
                                  : 'bg-[#fdf2df] text-[#7a4e10] border border-[#f0dfbe]'
                              }`}
                            >
                              {item.status === 'signed' ? 'Verified ✓' : 'Awaiting Teacher Sign-off'}
                            </span>
                          </div>
                        </div>

                        {/* Item content */}
                        <div className="space-y-1">
                          <h3 className="font-serif text-sm font-semibold text-[#1a1410]">
                            {item.title}
                          </h3>
                          <p className="text-xs text-[#5a4f45] leading-relaxed">
                            {item.details}
                          </p>
                        </div>

                        {/* Metadata pills (book, minutes, trip date, etc.) */}
                        {item.meta && (
                          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                            {item.meta.bookTitle && (
                              <span className="px-2.5 py-0.5 rounded-md bg-[#ede4d9] text-[#5a4f45] font-medium">
                                Book: <strong className="text-[#1a1410]">{item.meta.bookTitle}</strong>
                              </span>
                            )}
                            {item.meta.minutesRead && (
                              <span className="px-2.5 py-0.5 rounded-md bg-[#ede4d9] text-[#5a4f45] font-medium">
                                Duration: <strong className="text-[#1a1410]">{item.meta.minutesRead} mins</strong>
                              </span>
                            )}
                            {item.meta.nightsCount && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#d4e8da] text-[#1e3828] font-medium">
                                <Award className="w-3 h-3 text-[#2a4a35]" />
                                <span>Night {item.meta.nightsCount} of 5 &bull; Golden Star Ready</span>
                              </span>
                            )}
                            {item.meta.amount && (
                              <span className="px-2.5 py-0.5 rounded-md bg-[#f5e6c8] text-[#7a4e10] font-medium">
                                Paid via UPI: <strong className="text-[#1a1410]">{item.meta.amount}</strong>
                              </span>
                            )}
                            {item.meta.activityDate && (
                              <span className="px-2.5 py-0.5 rounded-md bg-[#ede4d9] text-[#5a4f45] font-medium">
                                Excursion Date: <strong className="text-[#1a1410]">{item.meta.activityDate}</strong>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action buttons or Signed info */}
                        {item.status === 'signed' ? (
                          <div className="pt-2 border-t border-[#c0d6c4] flex items-center gap-2 text-xs text-[#2a4a35] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Countersigned by <strong>{item.signedBy || 'Aman Raj'}</strong> &bull; {item.signedAt || 'Today'}
                            </span>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-[#e8e2d8] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  if (activeRemarkId === item.id) {
                                    signOffItem(item.id, activeRemarkText.trim() || undefined);
                                    setActiveRemarkId(null);
                                    setActiveRemarkText('');
                                  } else {
                                    signOffItem(item.id);
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#2a4a35] hover:bg-[#1e3828] text-white text-xs font-semibold shadow-xs transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Sign Off &amp; Verify</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (activeRemarkId === item.id) {
                                    setActiveRemarkId(null);
                                    setActiveRemarkText('');
                                  } else {
                                    setActiveRemarkId(item.id);
                                    setActiveRemarkText(
                                      item.type === 'reading_log'
                                        ? 'Splendid reading fluency! Well done!'
                                        : 'Verified and approved.'
                                    );
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#ede4d9] hover:bg-[#d4cdc4] text-[#5a4f45] text-xs font-semibold transition-colors"
                              >
                                {activeRemarkId === item.id ? 'Cancel Remark' : 'Add Teacher Praise & Sign'}
                              </button>

                              <button
                                type="button"
                                onClick={() => rejectSignOffItem(item.id, 'Parent requested to verify page count')}
                                className="px-2.5 py-1 rounded-lg bg-[#ede4d9] hover:bg-[#f5ddd9] text-[#5a4f45] hover:text-[#9b2c2c] text-xs font-semibold transition-colors"
                                title="Send query back to parent"
                              >
                                Query Parent
                              </button>
                            </div>

                            <span className="text-[11px] text-[#6b5a48]">
                              ID: {item.id}
                            </span>
                          </div>
                        )}

                        {/* Inline remark box */}
                        {activeRemarkId === item.id && item.status === 'pending' && (
                          <div className="pt-2 space-y-2">
                            <input
                              type="text"
                              value={activeRemarkText}
                              onChange={(e) => setActiveRemarkText(e.target.value)}
                              placeholder="Write a warm note or praise to record alongside teacher sign-off..."
                              className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#8a6f5a] bg-white text-[#1a1410] focus:outline-none focus:ring-1 focus:ring-[#2a4a35]"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  signOffItem(item.id, activeRemarkText.trim() || undefined);
                                  setActiveRemarkId(null);
                                  setActiveRemarkText('');
                                }}
                                className="px-3 py-1 rounded-lg bg-[#2a4a35] text-white text-xs font-semibold hover:bg-[#1e3828] transition-colors"
                              >
                                Confirm &amp; Sign With Remark
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>

          {/* COMPOSER CARD */}
          <div className="order-1 bg-[#fdfaf6] rounded-2xl p-5 border border-[#d4cdc4] shadow-sm relative overflow-hidden space-y-4">
            <div className="h-1 bg-gradient-to-r from-[#8a6f5a] via-[#3d6b4f] to-[#6b5a48] -mx-6 -mt-6 mb-6" />

            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1a1410]" />
                <h2 className="font-serif text-lg font-medium text-[#1a1410]">New Ledger Entry</h2>
              </div>
              <button type="button" onClick={() => setIsComposerOpen((open) => !open)} className="rounded-full bg-[#1a1410] px-4 py-2 text-xs font-bold text-[#f7f3ed] hover:bg-[#2e2620]">
                {isComposerOpen ? 'Close composer' : 'Create notice'}
              </button>
            </div>

            {!isComposerOpen && <p className="text-sm text-[#5a4f45]">Create one clear notice at a time. Choose the audience, write the message, and post it to the ledger.</p>}
            {isComposerOpen && <form onSubmit={handlePost} className="space-y-5">
              {/* Classification Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5a4f45]">
                  Notice Classification
                </label>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Select Category">
                  {[
                    { id: 'note', label: 'Note Home', dot: '#3d6b4f' },
                    { id: 'event', label: 'Event & Assembly', dot: '#d97706' },
                    { id: 'fee', label: 'Payment / Fee', dot: '#9b2c2c' },
                    { id: 'general', label: 'General Bulletin', dot: '#6b5a48' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as EntryType)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        category === cat.id
                          ? 'bg-[#1a1410] text-[#f7f3ed] border-[#1a1410] shadow-sm'
                          : 'bg-[#f7f3ed] text-[#5a4f45] border-[#d4cdc4] hover:bg-[#ede4d9] hover:text-[#1a1410]'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: category === cat.id ? '#d4e8da' : cat.dot }}
                      />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Ledger Box */}
              <div className="p-4 rounded-xl bg-[#f7f3ed] border border-[#d4cdc4] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1a1410]">
                    Recipient Ledger
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-[#6b5a48]">
                    <Lock className="w-3 h-3 text-[#8a6f5a]" />
                    <span>Private &mdash; visible to designated families only</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#e8e2d8]" role="group" aria-label="Recipient Scope">
                  <button
                    type="button"
                    onClick={() => {
                      setRecipientScope('class');
                      setSelectedPupilNames([]);
                    }}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                      recipientScope === 'class'
                        ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm'
                        : 'text-[#6b5a48] hover:text-[#1a1410]'
                    }`}
                  >
                    Whole Class (28)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientScope('individual')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                      recipientScope === 'individual'
                        ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm'
                        : 'text-[#6b5a48] hover:text-[#1a1410]'
                    }`}
                  >
                    Individual Pupil
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientScope('group')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                      recipientScope === 'group'
                        ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm'
                        : 'text-[#6b5a48] hover:text-[#1a1410]'
                    }`}
                  >
                    Pupil Group
                  </button>
                </div>

                <p className="text-xs text-[#6b5a48]">
                  {recipientScope === 'class'
                    ? `Broadcasting to all ${classPupils.length} registered pupils in ${assignedClass}.`
                    : recipientScope === 'individual'
                      ? 'Select one specific child to dispatch a private note.'
                      : 'Select multiple children for group communication.'}
                </p>

                {/* Autocomplete Pupil Search for Individual / Group */}
                {recipientScope !== 'class' && (
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#6b5a48] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={pupilSearchQuery}
                        onChange={(e) => setPupilSearchQuery(e.target.value)}
                        placeholder="Search pupil by first name (e.g. Aarav, Ananya, Vivaan)…"
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#fdfaf6] border border-[#d4cdc4] rounded-lg focus:border-[#8a6f5a] outline-none"
                      />
                      {filteredSearchPupils.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-10 bg-[#fdfaf6] border border-[#d4cdc4] rounded-lg shadow-lg mt-1 overflow-hidden">
                          {filteredSearchPupils.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                togglePupilSelection(p.name);
                                setPupilSearchQuery('');
                              }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-[#f0ebe3] flex items-center justify-between border-b last:border-b-0 border-[#e8e2d8]"
                            >
                              <span>{p.name}</span>
                              <span className="text-[10px] text-[#6b5a48] uppercase">Select</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Pin Chips of all pupils */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5a48] block">
                        Quick-Select Roster
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-[#fdfaf6] border border-[#d4cdc4] rounded-lg">
                        {classifiedPupils.map((pupil) => {
                          const isSelected = selectedPupilNames.includes(pupil.name);
                          return (
                            <button
                              key={pupil.id}
                              type="button"
                              onClick={() => togglePupilSelection(pupil.name)}
                              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                                isSelected
                                  ? 'bg-[#1a1410] text-[#f7f3ed]'
                                  : 'bg-[#f0ebe3] text-[#5a4f45] hover:bg-[#e8e2d8]'
                              }`}
                            >
                              {pupil.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Pupil Tags */}
                    {selectedPupilNames.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {selectedPupilNames.map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ede4d9] text-[#1a1410] text-xs font-medium border border-[#d4cdc4]"
                          >
                            <span>{name}</span>
                            <button
                              type="button"
                              onClick={() => togglePupilSelection(name)}
                              className="hover:text-[#9b2c2c] transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Body Inputs */}
              <div className="space-y-3">
                <input
                  type="text"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="Notice Heading (e.g. Guided Reading Observation or Museum Trip)…"
                  className="w-full px-4 py-2.5 text-sm bg-[#f7f3ed] border border-[#d4cdc4] rounded-xl focus:border-[#8a6f5a] focus:bg-[#fdfaf6] outline-none font-medium"
                />

                <div className="relative">
                  <textarea
                    id="composerInput"
                    value={entryBody}
                    onChange={(e) => setEntryBody(e.target.value.slice(0, MAX_CHARS))}
                    rows={4}
                    placeholder="Write your diary entry, note home, or announcement… Use clear, reassuring language for families."
                    className="w-full p-4 text-xs sm:text-sm bg-[#f7f3ed] border border-[#d4cdc4] rounded-xl focus:border-[#8a6f5a] focus:bg-[#fdfaf6] outline-none leading-relaxed resize-y placeholder:text-[#b0a496]"
                  />
                  <div className="absolute right-3 bottom-3 text-[11px] font-mono font-semibold text-[#6b5a48]">
                    {entryBody.length} / {MAX_CHARS}
                  </div>
                </div>
              </div>

              {/* Preview Banner */}
              {showPreview && (
                <div className="p-4 rounded-xl bg-[#f0ebe3] border border-dashed border-[#d4cdc4] space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center text-xs font-bold text-[#1a1410]">
                    <span>Entry Preview &mdash; {category.toUpperCase()}</span>
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="text-[#6b5a48] hover:text-[#1a1410]"
                    >
                      Close Preview &times;
                    </button>
                  </div>
                  <p className="text-xs text-[#6b5a48]">
                    To:{' '}
                    {recipientScope === 'class'
                      ? 'Whole Class (28 pupils)'
                      : selectedPupilNames.join(', ') || 'No pupil selected'}
                  </p>
                  <h4 className="font-serif text-sm font-semibold text-[#1a1410]">
                    {entryTitle || 'Notice Title'}
                  </h4>
                  <p className="text-xs text-[#5a4f45] leading-relaxed">
                    {entryBody || 'Entry content goes here…'}
                  </p>
                </div>
              )}

              {/* Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-1 text-[#6b5a48]">
                  <button
                    type="button"
                    onClick={() => showToast('File attachment picker simulated.', 'info')}
                    title="Attach file"
                    className="p-2 rounded-lg hover:bg-[#ede4d9] hover:text-[#1a1410] transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Link inserted.', 'info')}
                    title="Insert link"
                    className="p-2 rounded-lg hover:bg-[#ede4d9] hover:text-[#1a1410] transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview((prev) => !prev)}
                    title="Preview entry"
                    className={`p-2 rounded-lg transition-colors ${
                      showPreview ? 'bg-[#ede4d9] text-[#1a1410]' : 'hover:bg-[#ede4d9] hover:text-[#1a1410]'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isPosting || !entryBody.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#1a1410] text-[#f7f3ed] hover:bg-[#2e2620] font-bold text-xs tracking-wide shadow-md flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isPosting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Posting to Ledger…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post to Ledger</span>
                    </>
                  )}
                </button>
              </div>
            </form>}
          </div>

          {/* SENT DISPATCH REGISTRY */}
          <div className="order-3 bg-[#fdfaf6] rounded-2xl p-5 border border-[#d4cdc4] shadow-sm space-y-4">
            <button type="button" onClick={() => setShowDispatchRegistry((open) => !open)} className="flex w-full items-center justify-between border-b border-[#e8e2d8] pb-3 text-left">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#8a6f5a]" />
                <h3 className="font-serif text-lg font-medium text-[#1a1410]">
                  Sent Dispatch Registry
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#6b5a48]">{showDispatchRegistry ? 'Hide' : 'Show'} recent</span>
            </button>

            {showDispatchRegistry && <ul className="space-y-3" aria-label="Recent dispatches">
              {dispatches.map((item) => (
                <li
                  key={item.id}
                  className="relative pl-4 pr-4 py-3 rounded-xl bg-[#f7f3ed] border border-[#d4cdc4] hover:border-[#8a6f5a]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden group"
                >
                  {/* Left Ruled Bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{
                      backgroundColor:
                        item.category === 'fee'
                          ? '#9b2c2c'
                          : item.category === 'note'
                            ? '#3d6b4f'
                            : item.category === 'event'
                              ? '#6b5a48'
                              : '#b0a496',
                    }}
                  />

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-[#e8e2d8] text-[#1a1410]">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-[#6b5a48]">
                        {item.sentAt} &bull; {item.targetScope === 'class' ? 'Whole class' : item.selectedPupils?.join(', ') || `${item.recipients} pupil${item.recipients === 1 ? '' : 's'}`}
                      </span>
                    </div>

                    <h4 className="font-serif text-sm font-semibold text-[#1a1410]">
                      {item.title}
                    </h4>

                    <p className="text-xs text-[#5a4f45] line-clamp-1">
                      {item.body}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#2a4a35] font-medium pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2a4a35]" />
                      <span>
                        Delivered to {item.delivered} {item.delivered === 1 ? 'family' : 'families'} &bull; {item.acknowledgedCount ?? 0} acknowledged
                      </span>
                    </div>
                  </div>

                  {/* Quick Dispatch Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => recallDispatch(item.id)}
                      className="px-2.5 py-1 rounded bg-[#e8e2d8] hover:bg-[#d4cdc4] text-[11px] font-semibold text-[#5a4f45] hover:text-[#9b2c2c] transition-colors"
                      title="Recall from parent timelines"
                    >
                      Recall
                    </button>
                    <button
                      type="button"
                      onClick={() => resendDispatch(item.id)}
                      className="px-2.5 py-1 rounded bg-[#e8e2d8] hover:bg-[#d4cdc4] text-[11px] font-semibold text-[#5a4f45] hover:text-[#1a1410] transition-colors"
                      title="Re-send prompt reminder"
                    >
                      Re-send
                    </button>
                    <button
                      type="button"
                      onClick={() => archiveDispatch(item.id)}
                      className="px-2.5 py-1 rounded bg-[#e8e2d8] hover:bg-[#d4cdc4] text-[11px] font-semibold text-[#5a4f45] hover:text-[#1a1410] transition-colors"
                      title="Archive to audit log"
                    >
                      Archive
                    </button>
                  </div>
                </li>
              ))}
            </ul>}
          </div>
        </div>

        {/* Right Column (4 cols): Classroom Desk & Analytics */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e8e2d8] pb-3"><div className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-[#2a5038]" /><h3 className="font-serif text-base text-[#1a1410]">Parent messages</h3></div><span className="rounded-full bg-[#edf7ef] px-2 py-0.5 text-[10px] font-bold text-[#1e3828]">{parentMessages.length}</span></div>
            <div className="mt-3 space-y-3">{parentMessages.length ? parentMessages.map(({ entry, message }) => <article key={message.id} className="rounded-xl border border-[#e8e2d8] bg-[#f7f3ed] p-3"><p className="text-[11px] font-bold text-[#1a1410]">{entry.title}</p><p className="mt-1 text-xs text-[#5a4f45]">Parent: “{message.text}”</p>{message.teacherReplyText ? <div className="mt-2 rounded-lg bg-[#d4e8da] p-2 text-xs text-[#1e3828]">Your reply: {message.teacherReplyText}</div> : <div className="mt-2 flex gap-1"><input value={parentReplyDrafts[message.id] || ''} onChange={(event) => setParentReplyDrafts((previous) => ({ ...previous, [message.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') { replyToParentMessage(entry.id, message.id, parentReplyDrafts[message.id] || ''); setParentReplyDrafts((previous) => ({ ...previous, [message.id]: '' })); } }} placeholder="Reply to parent…" className="min-w-0 flex-1 rounded-lg border border-[#d4cdc4] bg-white px-2 py-1.5 text-xs outline-none" /><button type="button" onClick={() => { replyToParentMessage(entry.id, message.id, parentReplyDrafts[message.id] || ''); setParentReplyDrafts((previous) => ({ ...previous, [message.id]: '' })); }} className="rounded-lg bg-[#1a1410] px-2 py-1 text-[10px] font-bold text-white">Reply</button></div>}</article>) : <p className="rounded-xl bg-[#f7f3ed] p-3 text-xs text-[#6b5a48]">No parent messages yet.</p>}</div>
          </section>
          {/* Widget 1: Classroom Desk & Roster */}
          <div className="bg-[#fdfaf6] rounded-2xl p-5 border border-[#d4cdc4] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8a6f5a]" />
                <h3 className="font-serif text-base font-medium text-[#1a1410]">{assignedClass} — Pupil Roster</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#e8e2d8] text-[10px] font-bold text-[#5a4f45]">
                {classPupils.length} Pupils
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b5a48]">Automatically grouped by parent connection status</p>
              <div className="flex flex-wrap gap-1.5" aria-label="Pupil connection status">
                {classifiedPupils.map((pupil) => (
                  <button
                    type="button"
                    key={pupil.id}
                    title={pupil.status === 'connected' ? `${pupil.name}: Parent connected` : `${pupil.name}: Invite pending`}
                    onClick={() => setProfilePupil(pupil)}
                    aria-label={`Open ${pupil.name}'s details, report card and performance graph`}
                    aria-haspopup="dialog"
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors hover:scale-105 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a6f5a] focus:ring-offset-1 ${
                      pupil.status === 'connected'
                        ? 'bg-[#d4e8da] text-[#1e3828]'
                        : 'bg-[#ede4d9] text-[#6b5a48]'
                    }`}
                  >
                    {pupil.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 text-[11px] font-medium text-[#6b5a48] pt-2 border-t border-[#e8e2d8]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3d6b4f]" />
                  <span>Connected ({connectedPupilCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8a6f5a]" />
                  <span>Invite pending ({pendingPupilCount})</span>
                </div>
              </div>
            </div>
          </div>

          <ClassSchedulePanel className={assignedClass} />

          {/* Widget 2: Engagement Index Bar Chart */}
          <div className="bg-[#fdfaf6] rounded-2xl p-5 border border-[#d4cdc4] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#8a6f5a]" />
                <h3 className="font-serif text-base font-medium text-[#1a1410]">Engagement Index</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#6b5a48]">This Week</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#5a4f45]">Notes</span>
                  <span className="text-[#1a1410] font-bold">92%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e8e2d8] overflow-hidden">
                  <div className="h-full bg-[#3d6b4f] rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#5a4f45]">Events</span>
                  <span className="text-[#1a1410] font-bold">87%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e8e2d8] overflow-hidden">
                  <div className="h-full bg-[#8a6f5a] rounded-full" style={{ width: '87%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#5a4f45]">Fees</span>
                  <span className="text-[#1a1410] font-bold">79%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e8e2d8] overflow-hidden">
                  <div className="h-full bg-[#9b2c2c] rounded-full" style={{ width: '79%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="text-[#5a4f45]">General</span>
                  <span className="text-[#1a1410] font-bold">64%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e8e2d8] overflow-hidden">
                  <div className="h-full bg-[#b0a496] rounded-full" style={{ width: '64%' }} />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#6b5a48] leading-snug pt-1">
              Based on open &amp; acknowledgement rates across all 24 connected families.
            </p>
          </div>

          {/* Widget 3: Attention Ledger */}
          <div className="bg-[#fdfaf6] rounded-2xl p-5 border border-[#d4cdc4] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#9b2c2c]" />
                <h3 className="font-serif text-base font-medium text-[#1a1410]">Attention Ledger</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#f5ddd9] text-[10px] font-bold text-[#7a1e1e]">
                {3 + (pendingSignOffs.length > 0 ? 1 : 0)} items
              </span>
            </div>

            <div className="space-y-3">
              {pendingSignOffs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSignOffQueue(true);
                    const el = document.getElementById('awaiting-signoff-ledger');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="w-full p-3 rounded-xl bg-[#fcfaf7] border border-[#f5e6c8] hover:border-[#7a4e10] transition-colors cursor-pointer space-y-1 group text-left"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#7a4e10] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pendingSignOffs.length} items awaiting sign-off</span>
                    </p>
                    <span className="text-[10px] text-[#7a4e10] font-semibold group-hover:underline">
                      Verify &rarr;
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6b5a48]">
                    {pendingSignOffs[0]?.pupilName} &bull; {pendingSignOffs[0]?.title}
                  </p>
                </button>
              )}

              <button
                type="button"
                onClick={() => prepareAttentionReminder('fee', 'Science Centre visit — payment reminder', 'A reminder that the ₹1,500 Science Centre visit contribution is due by 24 Oct. Please complete payment through the parent ledger.', 6)}
                className="w-full p-3 rounded-xl bg-[#f7f3ed] border border-[#d4cdc4] space-y-1 text-left transition-colors hover:border-[#9b2c2c] hover:bg-[#fff8f6]"
                title="Prepare a fee reminder for the six families"
              >
                <p className="text-xs font-bold text-[#9b2c2c]">6 families &mdash; Fee unacknowledged</p>
                <p className="text-[11px] text-[#6b5a48]">Science Centre visit ₹1,500 &bull; Due 24 Oct</p>
                <span className="text-[10px] font-semibold text-[#9b2c2c]">Prepare reminder &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => { setTeacherActiveTab('accounts'); window.setTimeout(() => document.getElementById('parent-account-manager')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }}
                className="w-full p-3 rounded-xl bg-[#edf7ef] border border-[#c6ddcb] space-y-1 text-left transition-colors hover:border-[#3d6b4f]"
                title="View registered parent accounts"
              >
                <p className="text-xs font-bold text-[#1e3828]">All {connectedPupilCount} families &mdash; Parent accounts registered</p>
                <p className="text-[11px] text-[#5a4f45]">View registered pupils and parent account details</p>
                <span className="text-[10px] font-semibold text-[#2a4a35]">Open parent accounts &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => prepareAttentionReminder('event', 'Harvest assembly — attendance reminder', 'Please confirm your family’s attendance for the Harvest assembly in the parent ledger.', 10)}
                className="w-full p-3 rounded-xl bg-[#f7f3ed] border border-[#d4cdc4] space-y-1 text-left transition-colors hover:border-[#2a4a35] hover:bg-[#f4faf5]"
                title="Prepare an assembly attendance reminder"
              >
                <p className="text-xs font-bold text-[#2a4a35]">Harvest assembly &mdash; reply needed</p>
                <p className="text-[11px] text-[#6b5a48]">10 families yet to confirm attendance</p>
                <span className="text-[10px] font-semibold text-[#2a4a35]">Prepare reminder &rarr;</span>
              </button>
            </div>
          </div>

        </aside>
      </div>
      )}
      <PupilProfileModal pupil={profilePupil} details={profilePupil ? getPupilDetailsForClass(profilePupil, assignedClass) : undefined} gradeCard={selectedPupilGradeCard} className={assignedClass} onClose={() => setProfilePupil(null)} />
    </div>
  );
};

const AccessRestricted: React.FC = () => <section className="rounded-2xl border border-[#f0d69f] bg-[#fff8e9] p-6 text-center shadow-sm"><ShieldCheck className="mx-auto h-8 w-8 text-[#7a4e10]" /><h2 className="mt-3 font-serif text-xl text-[#1a1410]">School office access required</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#5a4f45]">Only the authorised school office account can register or manage parent and teacher accounts.</p></section>;
