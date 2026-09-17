import React from 'react';
import { AlertCircle, CalendarDays, HeartPulse, Mail, MapPin, Phone, UserRound, X } from 'lucide-react';
import { GradeCard, Pupil, PupilDetails } from '../types';
import { GradeCardView } from './GradeCardView';
import { PupilPerformanceGraph } from './PerformanceGraph';

interface PupilProfileModalProps { pupil: Pupil | null; details?: PupilDetails; gradeCard?: GradeCard; className?: string; onClose: () => void; }

export const PupilProfileModal: React.FC<PupilProfileModalProps> = ({ pupil, details, gradeCard, className = 'Class III A', onClose }) => {
  if (!pupil || !details) return null;
  const connected = pupil.status === 'connected';
  return <div role="dialog" aria-modal="true" aria-labelledby="pupilProfileTitle" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[150] flex items-center justify-center bg-[#14100c]/70 p-4 backdrop-blur-sm">
    <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-6 shadow-2xl">
      <button type="button" onClick={onClose} aria-label="Close pupil profile" className="absolute right-4 top-4 rounded-full p-1.5 text-[#6b5a48] hover:bg-[#ede4d9] hover:text-[#1a1410]"><X className="h-5 w-5" /></button>
      <div className="mb-5 border-b border-[#e8e2d8] pb-5 pr-8">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b5a48]">Student information record</p>
        <h2 id="pupilProfileTitle" className="mt-1 font-serif text-3xl text-[#1a1410]">{details.fullName}</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-[#ede4d9] px-2.5 py-1 font-semibold text-[#5a4f45]">{className}</span><span className={`rounded-full px-2.5 py-1 font-semibold ${connected ? 'bg-[#d4e8da] text-[#1e3828]' : 'bg-[#f5e6c8] text-[#7a4e10]'}`}>{connected ? 'Parent connected' : 'Parent invitation pending'}</span></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Info icon={<UserRound />} title="Student details"><p>Admission no.: {details.admissionNumber}</p><p>Date of birth: {details.dateOfBirth}</p><p>Blood group: {details.bloodGroup}</p></Info>
        <Info icon={<UserRound />} title="Parents / guardians">
          <div className="space-y-3">
            {details.parents.map((parent) => <div key={`${parent.name}-${parent.phone}`} className="border-b border-[#e8e2d8] pb-3 last:border-0 last:pb-0">
              <p className="font-semibold text-[#1a1410]">{parent.name}{parent.isPrimary && <span className="ml-1.5 rounded bg-[#d4e8da] px-1.5 py-0.5 text-[10px] text-[#1e3828]">Primary contact</span>}</p>
              <p>{parent.relationship}</p>
            </div>)}
          </div>
        </Info>
        <Info icon={<Phone />} title="Phone numbers">
          <div className="space-y-2">{details.parents.map((parent) => <p key={`${parent.name}-phone`}><span className="font-medium text-[#1a1410]">{parent.relationship}:</span> {parent.phone}</p>)}<p className="border-t border-[#e8e2d8] pt-2"><span className="font-medium text-[#1a1410]">Emergency:</span> {details.emergencyContact}</p></div>
        </Info>
        <Info icon={<Mail />} title="Email addresses">
          <div className="space-y-2">{details.parents.map((parent) => <p key={`${parent.name}-email`} className="break-all"><span className="font-medium text-[#1a1410]">{parent.relationship}:</span> {parent.email}</p>)}</div>
        </Info>
        <Info icon={<MapPin />} title="Home address"><p>{details.address}</p></Info>
        <Info icon={<HeartPulse />} title="Health information"><p>{details.medicalNotes}</p></Info>
        <Info icon={<CalendarDays />} title="School status"><p>{connected ? 'Parent portal account is active.' : 'Parent portal invitation has not yet been accepted.'}</p></Info>
      </div>
      {gradeCard && <div className="mt-6 border-t border-[#e8e2d8] pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><p className="text-[11px] font-bold uppercase tracking-wider text-[#6b5a48]">Academic progress</p><h3 className="font-serif text-2xl text-[#1a1410]">Report card &amp; performance</h3></div><span className="rounded-full bg-[#d4e8da] px-2.5 py-1 text-xs font-bold text-[#1e3828]">CGPA {gradeCard.cgpa.toFixed(1)} / 10</span></div>
        <PupilPerformanceGraph gradeCard={gradeCard} />
        <div className="mt-6"><GradeCardView gradeCard={gradeCard} isTeacherMode /></div>
      </div>}
      <div className="mt-5 flex gap-2 rounded-xl border border-[#f0d69f] bg-[#fff8e9] p-3 text-xs text-[#70500a]"><AlertCircle className="h-4 w-4 shrink-0" /><p>Demo data only. In production, restrict this profile to authorised school staff and retrieve it from a secure server.</p></div>
    </div>
  </div>;
};

const Info: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => <section className="rounded-xl border border-[#e8e2d8] bg-[#f7f3ed] p-4 text-xs leading-relaxed text-[#5a4f45]"><h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#1a1410]"><span className="text-[#8a6f5a]">{icon}</span>{title}</h3>{children}</section>;
