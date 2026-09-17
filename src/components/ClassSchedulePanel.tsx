import React, { useState } from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

const events = [
  { date: '17', month: 'OCT', title: 'Reading Log Sign-off', time: 'By 8:00 PM', place: 'Parent Ledger' },
  { date: '24', month: 'OCT', title: 'Harvest Festival Assembly', time: '09:15 AM', place: 'School Auditorium' },
  { date: '24', month: 'OCT', title: 'Science Centre Workshop', time: '10:30 AM', place: 'Science Centre' },
];

const primaryTimetable = [
  { day: 'Monday', lessons: ['English', 'Mathematics', 'Science', 'Hindi'] },
  { day: 'Tuesday', lessons: ['Mathematics', 'English', 'Social Science', 'Computer'] },
  { day: 'Wednesday', lessons: ['Science', 'Hindi', 'Mathematics', 'Art'] },
  { day: 'Thursday', lessons: ['English', 'Social Science', 'Computer', 'Games'] },
  { day: 'Friday', lessons: ['Mathematics', 'Science', 'Hindi', 'Library'] },
];

const earlyYearsTimetable = [
  { day: 'Monday', lessons: ['Circle Time', 'Phonics', 'Numbers', 'Play & Art'] },
  { day: 'Tuesday', lessons: ['Story Time', 'Early Maths', 'EVS', 'Music'] },
  { day: 'Wednesday', lessons: ['Phonics', 'Numbers', 'Movement', 'Creative Play'] },
  { day: 'Thursday', lessons: ['Language', 'Early Maths', 'Art', 'Outdoor Play'] },
  { day: 'Friday', lessons: ['Show & Tell', 'Rhymes', 'Games', 'Library'] },
];

const middleYearsTimetable = [
  { day: 'Monday', lessons: ['English', 'Mathematics', 'Science', 'Social Science'] },
  { day: 'Tuesday', lessons: ['Mathematics', 'Hindi', 'Computer', 'Science'] },
  { day: 'Wednesday', lessons: ['English', 'Social Science', 'Mathematics', 'Art'] },
  { day: 'Thursday', lessons: ['Science', 'English', 'Hindi', 'Physical Education'] },
  { day: 'Friday', lessons: ['Mathematics', 'Social Science', 'Computer', 'Library'] },
];

const seniorTimetable = [
  { day: 'Monday', lessons: ['Core Subject I', 'Core Subject II', 'Core Subject III', 'Practical / Lab'] },
  { day: 'Tuesday', lessons: ['Core Subject II', 'Elective', 'Core Subject I', 'Tutorial'] },
  { day: 'Wednesday', lessons: ['Core Subject III', 'Core Subject I', 'Practical / Lab', 'Physical Education'] },
  { day: 'Thursday', lessons: ['Elective', 'Core Subject II', 'Core Subject III', 'Career Guidance'] },
  { day: 'Friday', lessons: ['Core Subject I', 'Core Subject II', 'Library / Study', 'Club Activity'] },
];

const timetableForClass = (className: string) => {
  const lower = className.toLowerCase();
  if (/(nursery|lkg|ukg|kindergarten|pre-?primary)/.test(lower)) return { stage: 'Early Years', rows: earlyYearsTimetable };
  const level = Number(lower.match(/class\s*(\d+)/)?.[1]);
  if (level >= 11) return { stage: 'Senior Secondary', rows: seniorTimetable };
  if (level >= 6) return { stage: level <= 8 ? 'Middle School' : 'Secondary School', rows: middleYearsTimetable };
  return { stage: 'Primary School', rows: primaryTimetable };
};

interface ClassSchedulePanelProps { className?: string; }

export const ClassSchedulePanel: React.FC<ClassSchedulePanelProps> = ({ className = 'Class III A' }) => {
  const [tab, setTab] = useState<'events' | 'timetable'>('timetable');
  const schedule = timetableForClass(className);
  const weekday = new Date().getDay();
  const todayIndex = weekday >= 1 && weekday <= 5 ? weekday - 1 : -1;

  return <section className="rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-5 shadow-sm" aria-labelledby="class-schedule-title">
    <div className="flex items-start justify-between gap-3 border-b border-[#e8e2d8] pb-3">
      <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#8a6f5a]" /><div><h3 id="class-schedule-title" className="font-serif text-base font-medium text-[#1a1410]">Class calendar</h3><p className="text-[10px] text-[#6b5a48]">{className} • {schedule.stage}</p></div></div>
      <div className="flex rounded-lg bg-[#e8e2d8] p-0.5" role="tablist" aria-label="Class calendar section">
        <button type="button" role="tab" aria-selected={tab === 'events'} onClick={() => setTab('events')} className={`rounded-md px-2 py-1 text-[10px] font-bold ${tab === 'events' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}>Events</button>
        <button type="button" role="tab" aria-selected={tab === 'timetable'} onClick={() => setTab('timetable')} className={`rounded-md px-2 py-1 text-[10px] font-bold ${tab === 'timetable' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}>Timetable</button>
      </div>
    </div>
    {tab === 'events' ? <div className="mt-3 space-y-2.5">{events.map((event) => <div key={event.title} className="flex gap-3 rounded-xl bg-[#f7f3ed] p-2.5"><div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[#ede4d9] leading-none"><strong className="font-serif text-base text-[#1a1410]">{event.date}</strong><span className="text-[8px] font-bold text-[#6b5a48]">{event.month}</span></div><div className="min-w-0"><p className="text-xs font-bold text-[#1a1410]">{event.title}</p><p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#6b5a48]"><Clock className="h-3 w-3" />{event.time}</p><p className="flex items-center gap-1 text-[10px] text-[#6b5a48]"><MapPin className="h-3 w-3" />{event.place}</p></div></div>)}</div> : <div className="mt-3 space-y-2">{schedule.rows.map((row, index) => <div key={row.day} className={`rounded-xl border p-2.5 ${index === todayIndex ? 'border-[#b4d4be] bg-[#edf7ef]' : 'border-[#e8e2d8] bg-[#f7f3ed]'}`}><div className="mb-1.5 flex justify-between"><span className="text-[11px] font-bold text-[#1a1410]">{row.day}</span>{index === todayIndex && <span className="text-[9px] font-bold uppercase text-[#2a5038]">Today</span>}</div><div className="flex flex-wrap gap-1">{row.lessons.map((lesson) => <span key={lesson} className="rounded bg-[#fdfaf6] px-1.5 py-0.5 text-[9px] font-medium text-[#5a4f45]">{lesson}</span>)}</div></div>)}</div>}
  </section>;
};
