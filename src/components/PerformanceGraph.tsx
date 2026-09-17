import React, { useState } from 'react';
import { BarChart3, LineChart, TrendingUp } from 'lucide-react';
import { GradeCard } from '../types';

const shortSubjectName = (subject: string) => subject
  .replace('Mathematics & Numeracy', 'Maths')
  .replace('English Language & Literature', 'English')
  .replace('Science & Environmental Discovery', 'Science')
  .replace('Second Language (Hindi Course B)', 'Hindi')
  .replace('Computer Applications & IT Foundation', 'Computer');

interface PupilPerformanceGraphProps {
  gradeCard?: GradeCard;
}

/** A responsive, dependency-free graph used on the family dashboard. */
export const PupilPerformanceGraph: React.FC<PupilPerformanceGraphProps> = ({ gradeCard }) => {
  const [pattern, setPattern] = useState<'bar' | 'line'>('bar');
  if (!gradeCard?.subjects?.length) return null;

  const average = Math.round(gradeCard.subjects.reduce((total, subject) => total + subject.marksObtained, 0) / gradeCard.subjects.length);
  const strongest = gradeCard.subjects.reduce((best, subject) => subject.marksObtained > best.marksObtained ? subject : best, gradeCard.subjects[0]);

  return (
    <section className="rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-5 shadow-sm" aria-labelledby="pupil-performance-title">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4e8da] text-[#1e3828]"><BarChart3 className="h-4 w-4" /></div>
          <div>
            <h3 id="pupil-performance-title" className="font-serif text-base font-bold text-[#1a1410]">Performance graph</h3>
            <p className="text-[10px] text-[#6b5a48]">Autumn term subject results</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#edf7ef] px-2 py-1 text-[10px] font-bold text-[#1e3828]">Avg. {average}%</span>
          <div className="flex rounded-lg border border-[#d4cdc4] bg-[#f7f3ed] p-0.5" role="group" aria-label="Performance graph pattern">
            <button type="button" onClick={() => setPattern('bar')} aria-pressed={pattern === 'bar'} title="Show bar chart" className={`rounded-md p-1 ${pattern === 'bar' ? 'bg-[#1a1410] text-[#fdfaf6]' : 'text-[#6b5a48] hover:text-[#1a1410]'}`}><BarChart3 className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => setPattern('line')} aria-pressed={pattern === 'line'} title="Show line chart" className={`rounded-md p-1 ${pattern === 'line' ? 'bg-[#1a1410] text-[#fdfaf6]' : 'text-[#6b5a48] hover:text-[#1a1410]'}`}><LineChart className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>

      {pattern === 'bar' ? <div className="mt-5 flex h-32 items-end gap-2 border-b border-[#d4cdc4] px-1" role="img" aria-label={`Bar chart. Subject performance average ${average} percent.`}>
        {gradeCard.subjects.map((subject) => <div key={subject.id} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5 text-center"><span className="text-[10px] font-bold text-[#2a4a35]">{subject.marksObtained}</span><div className="min-h-[5px] rounded-t-md bg-[#2a5038] transition-all" style={{ height: `${Math.max(subject.marksObtained, 5)}%` }} title={`${subject.subject}: ${subject.marksObtained}%`} /></div>)}
      </div> : <div className="mt-5 h-32 border-b border-[#d4cdc4]" role="img" aria-label={`Line chart. Subject performance average ${average} percent.`}>
        <svg viewBox="0 0 300 125" className="h-full w-full" preserveAspectRatio="none">
          <line x1="0" y1="110" x2="300" y2="110" stroke="#d4cdc4" strokeWidth="1" />
          <line x1="0" y1="55" x2="300" y2="55" stroke="#e8e2d8" strokeWidth="1" strokeDasharray="3 3" />
          <polyline fill="none" stroke="#2a5038" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={gradeCard.subjects.map((subject, index) => `${gradeCard.subjects.length === 1 ? 150 : 10 + index * (280 / (gradeCard.subjects.length - 1))},${110 - subject.marksObtained}`).join(' ')} />
          {gradeCard.subjects.map((subject, index) => <g key={subject.id}><circle cx={gradeCard.subjects.length === 1 ? 150 : 10 + index * (280 / (gradeCard.subjects.length - 1))} cy={110 - subject.marksObtained} r="4" fill="#fdfaf6" stroke="#2a5038" strokeWidth="2" /><text x={gradeCard.subjects.length === 1 ? 150 : 10 + index * (280 / (gradeCard.subjects.length - 1))} y={Math.max(12, 104 - subject.marksObtained)} textAnchor="middle" fontSize="10" fontWeight="700" fill="#2a4a35">{subject.marksObtained}</text></g>)}
        </svg>
      </div>}
      <div className="mt-2 flex gap-2">
        {gradeCard.subjects.map((subject) => <span key={subject.id} className="min-w-0 flex-1 truncate text-center text-[9px] font-medium text-[#6b5a48]" title={subject.subject}>{shortSubjectName(subject.subject)}</span>)}
      </div>
      <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#f7f3ed] px-3 py-2 text-[11px] text-[#5a4f45]"><TrendingUp className="h-3.5 w-3.5 text-[#2a5038]" />Strongest subject: <strong className="text-[#1a1410]">{shortSubjectName(strongest.subject)} ({strongest.marksObtained}%)</strong></p>
    </section>
  );
};

interface ClassPerformanceGraphProps {
  gradeCards: GradeCard[];
}

/** A teacher-facing graph: averages subject marks across published class cards. */
export const ClassPerformanceGraph: React.FC<ClassPerformanceGraphProps> = ({ gradeCards }) => {
  const publishedCards = gradeCards.filter((card) => card.status === 'published');
  const subjects = new Map<string, { label: string; total: number; count: number }>();
  publishedCards.forEach((card) => card.subjects.forEach((subject) => {
    const current = subjects.get(subject.subject) || { label: shortSubjectName(subject.subject), total: 0, count: 0 };
    current.total += subject.marksObtained;
    current.count += 1;
    subjects.set(subject.subject, current);
  }));
  const data = [...subjects.values()].map((subject) => ({ ...subject, average: Math.round(subject.total / subject.count) }));
  const classAverage = data.length ? Math.round(data.reduce((total, subject) => total + subject.average, 0) / data.length) : 0;

  return (
    <section className="rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-5 shadow-sm" aria-labelledby="class-performance-title">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4e8da] text-[#1e3828]"><BarChart3 className="h-5 w-5" /></div><div><h2 id="class-performance-title" className="font-serif text-lg font-bold text-[#1a1410]">Class performance</h2><p className="text-[11px] text-[#6b5a48]">Published grade cards by subject</p></div></div>
        <span className="rounded-full bg-[#edf7ef] px-2.5 py-1 text-[10px] font-bold text-[#1e3828]">Class avg. {classAverage}%</span>
      </div>
      {data.length ? <><div className="mt-5 flex h-36 items-end gap-3 border-b border-[#d4cdc4] px-2" role="img" aria-label={`Class performance chart. Class average ${classAverage} percent.`}>{data.map((subject) => <div key={subject.label} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5 text-center"><span className="text-[10px] font-bold text-[#2a4a35]">{subject.average}%</span><div className="min-h-[5px] rounded-t-md bg-[#7a4e10]" style={{ height: `${Math.max(subject.average, 5)}%` }} title={`${subject.label}: ${subject.average}%`} /></div>)}</div><div className="mt-2 flex gap-3 px-2">{data.map((subject) => <span key={subject.label} className="min-w-0 flex-1 truncate text-center text-[9px] font-medium text-[#6b5a48]">{subject.label}</span>)}</div></> : <p className="mt-4 rounded-lg bg-[#f7f3ed] p-3 text-sm text-[#6b5a48]">Publish a grade card to show class performance.</p>}
    </section>
  );
};
