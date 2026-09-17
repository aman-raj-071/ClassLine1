import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileEdit,
  Clock,
  MapPin,
  Mail,
  BookOpen,
  Image as ImageIcon,
  ChevronRight,
  Send,
  Eye,
  Paperclip,
  Check,
  AlertCircle,
  Sparkles,
  Award,
  Download,
  GraduationCap,
} from 'lucide-react';
import { EntryType, TimelineEntry } from '../types';
import { GradeCardView } from './GradeCardView';
import { createDefaultGradeCardForPupil } from '../utils/gradeCalculations';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';
import { PUPIL_CHILD_IDS, PUPILS } from '../data/mockData';
import { PupilPerformanceGraph } from './PerformanceGraph';
import { ClassSchedulePanel } from './ClassSchedulePanel';

export const ParentTimeline: React.FC = () => {
  const {
    currentUser,
    activeChildId,
    setActiveChildId,
    timelineEntries,
    dispatches,
    focusMode,
    setFocusMode,
    payFee,
    sendTeacherNote,
    logReadingNight,
    showToast,
    childrenList,
    getGradeCardForChild,
  } = useAuth();

  const [parentViewSection, setParentViewSection] = useState<'chronicle' | 'gradebook'>('chronicle');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFocusCardId, setActiveFocusCardId] = useState<string>('entry-a');
  const [quickNoteInputs, setQuickNoteInputs] = useState<Record<string, string>>({});
  const [markedSeenMap, setMarkedSeenMap] = useState<Record<string, boolean>>({});
  const [paymentEntryId, setPaymentEntryId] = useState<string | null>(null);

  // A parent must only ever see the pupils explicitly assigned to their
  // account. The shared school roster is used by the teacher workspace only.
  const parentChildren = childrenList.filter((child) => currentUser?.children?.includes(child.id));
  const activeChild = parentChildren.find((child) => child.id === activeChildId) || parentChildren[0];

  useEffect(() => {
    if (activeChild && activeChildId !== activeChild.id) {
      setActiveChildId(activeChild.id);
    }
  }, [activeChild, activeChildId, setActiveChildId]);

  // Keep the parent ledger in sync with teacher dispatches. This fallback also
  // displays whole-class notices issued before the browser's local timeline
  // cache was updated.
  const dispatchEntries = dispatches.flatMap((dispatch) => {
    const isRecipient = dispatch.targetScope === 'class' || PUPILS.some((pupil) =>
      PUPIL_CHILD_IDS[pupil.id] === activeChild.id && dispatch.selectedPupils?.includes(pupil.name)
    );
    if (!isRecipient) return [];
    return [{
      id: `dispatch-${dispatch.id}-${activeChild.id}`,
      childId: activeChild.id,
      type: dispatch.category,
      title: dispatch.title,
      body: dispatch.body,
      date: 'Today',
      dateGroup: 'today' as const,
      accentColor: dispatch.category === 'fee' ? '#9b2c2c' : dispatch.category === 'note' ? '#3d6b4f' : dispatch.category === 'event' ? '#6b5a48' : '#b0a496',
      seenAt: 'Delivered just now',
      markedSeen: false,
    }];
  });
  const childEntries = [
    ...timelineEntries.filter((entry) => entry.childId === activeChild.id),
    ...dispatchEntries.filter((entry) => !timelineEntries.some((saved) => saved.childId === activeChild.id && saved.title === entry.title && saved.body === entry.body)),
  ];

  // Apply category and search filters
  const filteredEntries = childEntries.filter((entry) => {
    if (activeFilter === 'fee' && entry.type !== 'fee') return false;
    if (activeFilter === 'event' && entry.type !== 'event') return false;
    if (activeFilter === 'note' && entry.type !== 'note') return false;
    if (activeFilter === 'general' && entry.type !== 'general') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = entry.title.toLowerCase().includes(q);
      const matchBody = entry.body.toLowerCase().includes(q);
      return matchTitle || matchBody;
    }
    return true;
  });

  // Group filtered entries by dateGroup
  const todayEntries = filteredEntries.filter((e) => e.dateGroup === 'today');
  const yesterdayEntries = filteredEntries.filter((e) => e.dateGroup === 'yesterday');
  const lastWeekEntries = filteredEntries.filter((e) => e.dateGroup === 'last-week');

  // Count pending fees
  const pendingFeesCount = childEntries.filter((e) => e.type === 'fee' && !e.paid).length;

  // Keyboard navigation for Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle focus mode with 'f' key if not typing in an input
      if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setFocusMode((prev) => !prev);
        return;
      }

      if (!focusMode) return;

      const visibleIds = filteredEntries.map((item) => item.id);
      if (!visibleIds.length) return;

      const currentIndex = visibleIds.indexOf(activeFocusCardId);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (currentIndex + 1) % visibleIds.length;
        setActiveFocusCardId(visibleIds[nextIdx]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (currentIndex - 1 + visibleIds.length) % visibleIds.length;
        setActiveFocusCardId(visibleIds[prevIdx]);
      } else if (e.key === 'Escape') {
        setFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, filteredEntries, activeFocusCardId, setFocusMode]);

  if (!activeChild) {
    return <div className="mx-auto max-w-[1240px] px-4 py-12 text-center text-sm text-[#6b5a48]">No pupil is assigned to this parent account. Please contact the school office.</div>;
  }

  const handleNoteInputChange = (entryId: string, val: string) => {
    setQuickNoteInputs((prev) => ({ ...prev, [entryId]: val }));
  };

  const openPaymentCheckout = (entryId: string) => setPaymentEntryId(entryId);

  const handleSendNote = (entryId: string) => {
    const text = quickNoteInputs[entryId] || '';
    if (!text.trim()) {
      showToast('Please enter a note before sending.', 'error');
      return;
    }
    sendTeacherNote(entryId, text);
    setQuickNoteInputs((prev) => ({ ...prev, [entryId]: '' }));
  };

  const toggleMarkSeen = (entryId: string) => {
    setMarkedSeenMap((prev) => {
      const nextVal = !prev[entryId];
      if (nextVal) {
        showToast('Marked as acknowledged.', 'info');
      }
      return { ...prev, [entryId]: nextVal };
    });
  };

  const readingPct = Math.round(
    (activeChild.readingNights.completed / activeChild.readingNights.target) * 100
  );

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Ledger Header & Child Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[#d4cdc4]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6b5a48]">
            <BookOpen className="w-4 h-4 text-[#8a6f5a]" />
            <span>Saraswati Vidya Mandir &bull; Parent Ledger</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#1a1410] tracking-tight">
            Family Chronicle &amp; Daily Log
          </h1>

          <p className="text-xs text-[#6b5a48] font-medium">
            {activeChild.fullName} &bull; {activeChild.year} &bull; {activeChild.class} Class
          </p>

          {focusMode && (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ede4d9] text-xs font-semibold text-[#1a1410] animate-in fade-in">
                <Sparkles className="w-3.5 h-3.5 text-[#8a6f5a]" />
                <span>
                  Focus mode active &mdash; click any card or use &uarr;&darr; arrow keys to spotlight. Press Esc to exit.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Child Switcher Tabs */}
        <div className="flex p-1 bg-[#e8e2d8] rounded-full shadow-inner" role="tablist" aria-label="Switch child">
          {parentChildren.map((child) => {
            const isSelected = child.id === activeChild.id;
            return (
              <button
                key={child.id}
                id={`tab-${child.firstName.toLowerCase()}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveChildId(child.id)}
                className={`flex items-center gap-2 py-2 px-4 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm'
                    : 'text-[#6b5a48] hover:text-[#1a1410]'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-[#1a1410] shrink-0"
                  style={{ backgroundColor: child.avatarColor }}
                >
                  {child.firstName[0]}
                </div>
                <span>{child.fullName}</span>
                <span className="hidden sm:inline text-[#6b5a48] font-normal">
                  ({child.year} &mdash; {child.class})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Portal Navigation Tabs: Chronicle vs Gradebook */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-[#f0ebe3] rounded-2xl border border-[#d4cdc4]">
        <div className="flex p-1 bg-[#e8e2d8] rounded-xl shadow-inner gap-1">
          <button
            type="button"
            id="tab-chronicle"
            onClick={() => setParentViewSection('chronicle')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              parentViewSection === 'chronicle'
                ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm'
                : 'text-[#6b5a48] hover:text-[#1a1410]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#8a6f5a]" />
            <span>Daily Chronicle &amp; Log</span>
          </button>

          <button
            type="button"
            id="tab-gradebook"
            onClick={() => setParentViewSection('gradebook')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              parentViewSection === 'gradebook'
                ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm'
                : 'text-[#6b5a48] hover:text-[#1a1410]'
            }`}
          >
            <Award className="w-4 h-4 text-[#7a4e10]" />
            <span>Gradebook &amp; Report Card</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#d4e8da] text-[#1e3828] border border-[#b4d4be]">
              Autumn Report Ready
            </span>
          </button>
        </div>

        <div className="text-xs text-[#6b5a48] px-2 hidden sm:block">
          Active Pupil: <strong className="text-[#1a1410]">{activeChild.fullName}</strong> ({activeChild.year} {activeChild.class})
        </div>
      </div>

      {parentViewSection === 'gradebook' ? (
        /* GRADEBOOK SECTION */
        <div className="space-y-6">
          {(() => {
            const gradeCard =
              getGradeCardForChild(activeChild.id) ||
              createDefaultGradeCardForPupil(
                activeChild.id,
                activeChild.fullName,
                activeChild.class,
                activeChild.year
              );

            return <GradeCardView gradeCard={gradeCard} isTeacherMode={false} />;
          })()}
        </div>
      ) : (
        /* DAILY CHRONICLE & TIMELINE SECTION */
        <>
          {/* Filter Bar & Search */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#f0ebe3] border border-[#d4cdc4] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-[#6b5a48] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="timelineSearch"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entries, teacher notes, trips or reminders…"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#fdfaf6] border border-[#d4cdc4] rounded-xl focus:border-[#8a6f5a] focus:ring-2 focus:ring-[#8a6f5a]/20 outline-none transition-all placeholder:text-[#b0a496]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto" role="group" aria-label="Filter entries">
              {[
                { id: 'all', label: 'All entries' },
                { id: 'fee', label: `Fees pending (${pendingFeesCount})` },
                { id: 'event', label: 'Upcoming events' },
                { id: 'note', label: 'Notes home' },
                { id: 'general', label: 'General' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveFilter(chip.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    activeFilter === chip.id
                      ? 'bg-[#1a1410] text-[#f7f3ed] border-[#1a1410] shadow-sm'
                      : 'bg-[#fdfaf6] text-[#5a4f45] border-[#d4cdc4] hover:bg-[#ede4d9] hover:text-[#1a1410]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

      {/* Main Grid: Left Column (Timeline) & Right Column (Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Timeline Spine & Entries (8 cols) */}
        <div className="lg:col-span-8 relative">
          {/* Vertical axis line */}
          <div
            className={`absolute left-4 sm:left-6 top-6 bottom-4 w-px bg-[#d4cdc4] transition-opacity duration-300 ${
              focusMode ? 'opacity-20' : 'opacity-80'
            }`}
          />

          <div className="space-y-8">
            {filteredEntries.length === 0 ? (
              <div className="bg-[#fdfaf6] rounded-2xl p-8 text-center border border-[#d4cdc4] space-y-2">
                <p className="font-serif text-lg text-[#1a1410]">No entries match your search criteria.</p>
                <p className="text-xs text-[#6b5a48]">Try clearing filters or checking Maya’s timeline.</p>
              </div>
            ) : (
              <>
                {/* DATE GROUP: TODAY */}
                {todayEntries.length > 0 && (
                  <div className="relative pl-10 sm:pl-14 space-y-4">
                    {/* Date Dot */}
                    <div className="absolute left-2.5 sm:left-4.5 top-1 w-3 h-3 rounded-full bg-[#1a1410] ring-4 ring-[#f7f3ed]" />

                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="font-serif text-lg font-medium text-[#1a1410]">
                        Today &mdash; Tuesday, 14 October
                      </h2>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b5a48]">
                        Autumn Term &bull; Week 6
                      </span>
                    </div>

                    <div className="space-y-4">
                      {todayEntries.map((entry) => renderCard(entry))}
                    </div>
                  </div>
                )}

                {/* DATE GROUP: YESTERDAY */}
                {yesterdayEntries.length > 0 && (
                  <div className="relative pl-10 sm:pl-14 space-y-4 pt-4">
                    <div className="absolute left-2.5 sm:left-4.5 top-5 w-3 h-3 rounded-full bg-[#6b5a48] ring-4 ring-[#f7f3ed]" />

                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="font-serif text-lg font-medium text-[#1a1410]">
                        Yesterday &mdash; Monday, 13 October
                      </h2>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b5a48]">
                        Saraswati Vidya Mandir Log
                      </span>
                    </div>

                    <div className="space-y-4">
                      {yesterdayEntries.map((entry) => renderCard(entry))}
                    </div>
                  </div>
                )}

                {/* DATE GROUP: LAST WEEK */}
                {lastWeekEntries.length > 0 && (
                  <div className="relative pl-10 sm:pl-14 space-y-4 pt-4">
                    <div className="absolute left-2.5 sm:left-4.5 top-5 w-3 h-3 rounded-full bg-[#b0a496] ring-4 ring-[#f7f3ed]" />

                    <div className="flex items-baseline justify-between gap-2">
                      <h2 className="font-serif text-lg font-medium text-[#1a1410]">
                        Last Week &mdash; Thursday, 9 October
                      </h2>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b5a48]">
                        Past Records
                      </span>
                    </div>

                    <div className="space-y-4">
                      {lastWeekEntries.map((entry) => renderCard(entry))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Term at a Glance Sidebar (4 cols) */}
        <aside
          className={`lg:col-span-4 space-y-5 transition-opacity duration-300 ${
            focusMode ? 'opacity-25 pointer-events-none' : 'opacity-100'
          }`}
          aria-label="Term at a glance"
        >
          {/* Card 0: Academic Gradebook Feature Card */}
          <div className="bg-gradient-to-br from-[#fdfaf6] to-[#f7f3ed] rounded-2xl p-5 border border-[#d4cdc4] shadow-sm space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1a1410] text-[#f7f3ed] flex items-center justify-center">
                  <Award className="w-4 h-4 text-[#d4e8da]" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#1a1410]">Academic Gradebook</h3>
                  <span className="text-[10px] text-[#6b5a48]">Official Progress Report</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#d4e8da] text-[#1e3828] border border-[#b4d4be]">
                Autumn Report
              </span>
            </div>

            <div className="p-3 bg-[#fdfaf6] rounded-xl border border-[#d4cdc4]/70 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-[#6b5a48] uppercase tracking-wider block font-semibold">Average Result</span>
                <span className="font-serif text-base font-bold text-[#1a1410]">
                  {getGradeCardForChild(activeChild.id)?.overallAverage ?? 89.2}% &bull; {getGradeCardForChild(activeChild.id)?.overallGrade ?? 'A*'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#6b5a48] uppercase tracking-wider block font-semibold">Standing</span>
                <span className="font-bold text-[#2a5038] text-xs">
                  {getGradeCardForChild(activeChild.id)?.overallBand ?? 'Greater Depth'}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="view-gradebook-sidebar-btn"
              onClick={() => setParentViewSection('gradebook')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#1a1410] hover:bg-[#2e2620] text-[#f7f3ed] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
            >
              <Award className="w-3.5 h-3.5 text-[#d4e8da]" />
              <span>Open Gradebook &amp; Download PDF &rarr;</span>
            </button>
          </div>

          {/* Card 1: Term at a Glance Overview */}
          <PupilPerformanceGraph gradeCard={getGradeCardForChild(activeChild.id)} />

          <ClassSchedulePanel className={activeChild.year} />

          {/* Card 1: Term at a Glance Overview */}
          <div className="bg-[#fdfaf6] rounded-2xl p-5 border border-[#d4cdc4] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d8]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8a6f5a]" />
                <h3 className="font-serif text-base font-medium text-[#1a1410]">Term at a Glance</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#e8e2d8] text-[10px] font-bold uppercase text-[#5a4f45]">
                {activeChild.year}
              </span>
            </div>

            {/* Fee Alert Box */}
            <div className="p-3.5 rounded-xl bg-[#f5ddd9] border border-[#e4a09a]/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#7a1e1e]">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Outstanding Contribution
                </span>
                <span className="font-serif text-sm">₹1,500</span>
              </div>
              <p className="text-[11px] text-[#7a1e1e]/85">
                Natural History Museum workshop trip. Due in 10 days.
              </p>
              <button
                type="button"
                onClick={() => openPaymentCheckout('entry-a')}
                className="w-full py-2 px-3 rounded-lg bg-[#7a1e1e] text-[#fdfaf6] hover:bg-[#5a1414] font-bold text-xs transition-colors"
              >
                Review and Pay (₹1,500)
              </button>
            </div>

            {/* Upcoming Dates List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5a48] block">
                Upcoming Key Dates
              </span>

              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e8e2d8] flex flex-col items-center justify-center shrink-0 leading-none">
                    <span className="text-[9px] uppercase font-bold text-[#6b5a48]">Oct</span>
                    <span className="font-serif text-sm font-bold text-[#1a1410]">24</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1410]">Harvest Festival Assembly</p>
                    <p className="text-[11px] text-[#6b5a48]">09:15 AM &bull; Parents welcome</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e8e2d8] flex flex-col items-center justify-center shrink-0 leading-none">
                    <span className="text-[9px] uppercase font-bold text-[#6b5a48]">Oct</span>
                    <span className="font-serif text-sm font-bold text-[#1a1410]">28</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1410]">Staff INSET Day</p>
                    <p className="text-[11px] text-[#6b5a48]">School closed to pupils</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#e8e2d8] flex flex-col items-center justify-center shrink-0 leading-none">
                    <span className="text-[9px] uppercase font-bold text-[#6b5a48]">Nov</span>
                    <span className="font-serif text-sm font-bold text-[#1a1410]">06</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1410]">Museum Excursion</p>
                    <p className="text-[11px] text-[#6b5a48]">Coach departure 08:45 AM</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Classroom Leadership */}
            <div className="pt-3 border-t border-[#e8e2d8]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5a48] block mb-2">
                Classroom Leadership
              </span>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#ede4d9] text-[#6b5a48] font-bold text-xs flex items-center justify-center shrink-0">
                  {activeChild.class === 'Oak' ? 'ER' : 'AO'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1a1410] truncate">
                    {activeChild.class === 'A' ? 'Aman Raj' : 'Rohit Verma'}
                  </p>
                  <p className="text-[11px] text-[#6b5a48] truncate">
                    Class Teacher &bull; {activeChild.class} Class
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Messaging window open with class teacher.', 'info')}
                  aria-label="Send direct email"
                  className="w-8 h-8 rounded-full bg-[#e8e2d8] text-[#6b5a48] hover:text-[#1a1410] hover:bg-[#d4cdc4] flex items-center justify-center transition-colors shrink-0"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Weekly Reading Target & Interactive Log */}
          <div className="bg-[#f0ebe3] rounded-2xl p-5 border border-[#d4cdc4] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#1a1410]">Weekly Reading Target</span>
              <span className="text-[#2a4a35] font-bold">
                {activeChild.readingNights.completed} / {activeChild.readingNights.target} Nights
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-[#dfd8cd] overflow-hidden">
              <div
                className="h-full bg-[#3d6b4f] rounded-full transition-all duration-500"
                style={{ width: `${readingPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 text-[#6b5a48]">
              <span>Last signed: Mon 13 Oct</span>
              <button
                type="button"
                onClick={() => logReadingNight(activeChild.id)}
                disabled={activeChild.readingNights.completed >= activeChild.readingNights.target}
                className="font-bold text-[#1a1410] hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {activeChild.readingNights.completed >= activeChild.readingNights.target
                  ? 'Target Reached ✓'
                  : "Log tonight's reading"}
              </button>
            </div>
          </div>

          {/* Card 3: Photo Gallery Snapshot Pill */}
          <div
            onClick={() => showToast('Opening Science Week Snapshot Gallery…', 'info')}
            className="cursor-pointer bg-[#fdfaf6] hover:bg-[#ede4d9] rounded-2xl p-3 border border-[#d4cdc4] shadow-sm flex items-center gap-3 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#ede4d9] text-[#8a6f5a] flex items-center justify-center shrink-0">
              <ImageIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1a1410] truncate">
                {activeChild.class} Class Photo Gallery
              </p>
              <p className="text-[11px] text-[#6b5a48] truncate">
                12 new snapshots from Science Week
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8a6f5a] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </aside>
      </div>
        </>
      )}
    </div>
  );

  // Helper render function for individual timeline card
  function renderCard(entry: TimelineEntry) {
    const isSpotlight = focusMode && activeFocusCardId === entry.id;
    const isDimmed = focusMode && activeFocusCardId !== entry.id;

    return (
      <article
        key={entry.id}
        onClick={() => {
          if (focusMode) {
            setActiveFocusCardId(entry.id);
          }
        }}
        className={`relative bg-[#fdfaf6] rounded-2xl p-5 sm:p-6 border transition-all duration-300 overflow-hidden ${
          isSpotlight
            ? 'ring-2 ring-[#3d6b4f] shadow-2xl scale-[1.01] -translate-y-1 z-20 border-[#3d6b4f]'
            : isDimmed
              ? 'opacity-20 blur-[0.8px] grayscale border-[#d4cdc4]'
              : 'border-[#d4cdc4]/80 shadow-sm hover:shadow-md'
        }`}
      >
        {/* Left Ruled Colored Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: entry.accentColor }}
        />

        {/* Card Header Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {entry.type === 'fee' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f5ddd9] text-[#7a1e1e]">
                <CreditCard className="w-3 h-3" />
                {entry.paid ? 'Paid &bull; ₹1,500' : 'Fee due &bull; ₹1,500'}
              </span>
            )}
            {entry.type === 'note' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d4e8da] text-[#1e3828]">
                <FileEdit className="w-3 h-3" />
                Note home
              </span>
            )}
            {entry.type === 'event' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ede4d9] text-[#4a3c30]">
                <Calendar className="w-3 h-3" />
                Event &bull; {entry.meta?.date || 'Upcoming'}
              </span>
            )}
            {entry.type === 'general' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e8e2d8] text-[#5a4f45]">
                General Notice
              </span>
            )}

            <span className="text-[11px] text-[#6b5a48] font-medium">
              &bull; {entry.meta?.subject || `${activeChild.year} Excursion`}
            </span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0ebe3] text-[11px] text-[#6b5a48]">
            <CheckCircle2 className="w-3 h-3 text-[#2a4a35]" />
            <span>Seen by you at {entry.seenAt || '08:24'}</span>
          </div>
        </div>

        {/* Card Title & Content */}
        <h3 className="font-serif text-lg sm:text-xl font-medium text-[#1a1410] mb-2 leading-snug">
          {entry.title}
        </h3>

        {/* If Event, show location & time tags */}
        {entry.type === 'event' && entry.meta?.time && (
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#6b5a48] mb-3">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {entry.meta.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {entry.meta.location}
            </span>
          </div>
        )}

        {/* Teacher Byline for notes */}
        {entry.type === 'note' && entry.meta?.from && (
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-[#ede4d9] text-[#6b5a48] flex items-center justify-center font-bold text-xs shrink-0">
              ER
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1a1410] leading-tight">{entry.meta.from}</p>
              <p className="text-[10px] text-[#6b5a48]">Class Teacher &bull; {entry.meta.time || '11:35 AM'}</p>
            </div>
          </div>
        )}

        <p className="text-xs sm:text-sm text-[#5a4f45] leading-relaxed mb-4">
          {entry.body}
        </p>

        {/* Special Section 1: Itemised Fee Payment Block */}
        {entry.type === 'fee' && (
          <div className="bg-[#f7f3ed] rounded-xl p-4 border border-[#d4cdc4] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-[#1a1410]">Itemised Contribution</p>
              <p className="text-[11px] text-[#6b5a48]">
                Coach transport (₹900) + entry &amp; materials (₹600)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-serif text-xl font-bold text-[#1a1410]">
                {entry.meta?.amount || '₹1,500'}
              </span>

              {entry.paid ? (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#d4e8da] text-[#1e3828] text-xs font-bold">
                  <Check className="w-4 h-4" />
                  <span>Paid &amp; Receipted</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openPaymentCheckout(entry.id)}
                  className="px-4 py-2 rounded-lg bg-[#1a1410] hover:bg-[#2e2620] text-[#f7f3ed] font-bold text-xs tracking-wide shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay via UPI</span>
                </button>
              )}
      <PaymentCheckoutModal
        isOpen={Boolean(paymentEntryId)}
        onClose={() => setPaymentEntryId(null)}
        pupilName={activeChild.fullName}
        parentName={currentUser?.name || 'Parent / Guardian'}
        onPaymentConfirmed={(reference) => { if (paymentEntryId) payFee(paymentEntryId, reference); }}
      />
    </div>
          </div>
        )}

        {/* Special Section 2: Quoted Note block & Existing Family Reply */}
        {entry.replyText && (
          <div className="p-3.5 mb-4 rounded-xl bg-[#ede4d9]/50 border-l-2 border-[#8a6f5a] space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6b5a48]">
              <Check className="w-3.5 h-3.5 text-[#2a4a35]" />
              <span>You replied at {entry.replyTime || '13:10'}:</span>
            </div>
            <p className="font-serif italic text-xs sm:text-sm text-[#1a1410]">
              &ldquo;{entry.replyText}&rdquo;
            </p>
          </div>
        )}

        {/* Special Section 3: Event Actions footer */}
        {entry.type === 'event' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e8e2d8]">
            <button
              type="button"
              onClick={() => showToast('Downloading Harvest Programme & Song sheet (PDF)…', 'info')}
              className="flex items-center gap-1.5 text-xs text-[#6b5a48] hover:text-[#1a1410] transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Download Event Programme &amp; Songs (PDF)</span>
            </button>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-[#6b5a48] cursor-pointer">
                <input
                  type="checkbox"
                  checked={markedSeenMap[entry.id] ?? entry.markedSeen}
                  onChange={() => toggleMarkSeen(entry.id)}
                  className="w-3.5 h-3.5 accent-[#1a1410] rounded"
                />
                <span>Awaiting Attendance</span>
              </label>

              <button
                type="button"
                onClick={() => showToast('Event added to your device calendar!', 'success')}
                className="px-3 py-1 rounded-md bg-[#e8e2d8] hover:bg-[#d4cdc4] text-xs font-semibold text-[#1a1410] transition-colors"
              >
                Add to Calendar
              </button>
            </div>
          </div>
        )}

        {/* Quick Quiet Note to Teacher Input */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#f0ebe3]/80 border border-[#d4cdc4]/60">
          <FileEdit className="w-4 h-4 text-[#8a6f5a] ml-2 shrink-0" />
          <input
            type="text"
            value={quickNoteInputs[entry.id] || ''}
            onChange={(e) => handleNoteInputChange(entry.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendNote(entry.id);
              }
            }}
            placeholder="Send a quiet note to Mrs. Reynolds regarding this entry…"
            className="flex-1 bg-transparent px-2 py-1 text-xs text-[#1a1410] placeholder:text-[#b0a496] outline-none"
          />
          <button
            type="button"
            onClick={() => handleSendNote(entry.id)}
            className="px-3 py-1.5 rounded-lg bg-[#fdfaf6] hover:bg-[#ede4d9] text-[#1a1410] text-xs font-bold shadow-sm transition-colors shrink-0 flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            <span>Send Note</span>
          </button>
        </div>
      </article>
    );
  }
};
