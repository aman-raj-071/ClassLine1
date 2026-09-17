import React, { useMemo, useState } from 'react';
import { Copy, Search, ShieldCheck, Users } from 'lucide-react';
import { getAllSchoolPupils, getPupilDetailsForClass, SCHOOL_STANDARDS, SchoolDirectoryPupil } from '../data/mockData';
import { PupilProfileModal } from './PupilProfileModal';
import { useAuth } from '../context/AuthContext';

export const SchoolDirectory: React.FC = () => {
  const { showToast } = useAuth();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All classes');
  const [selected, setSelected] = useState<SchoolDirectoryPupil | null>(null);
  const pupils = useMemo(() => getAllSchoolPupils(), []);
  const filtered = pupils.filter((record) => (classFilter === 'All classes' || record.className === classFilter) && `${record.pupil.name} ${record.studentCode}`.toLowerCase().includes(query.trim().toLowerCase()));

  const copyCode = async (code: string) => { await navigator.clipboard.writeText(code); showToast(`Student code ${code} copied.`, 'success'); };

  return <section className="space-y-5">
    <div className="rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-6 shadow-sm"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[#2a5038]"><ShieldCheck className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">Authorised school office</span></div><h2 className="mt-1 font-serif text-2xl text-[#1a1410]">All-student directory</h2><p className="mt-1 text-sm text-[#5a4f45]">Nursery through Class XII. Every enrolled pupil has a unique student code.</p></div><span className="rounded-full bg-[#d4e8da] px-3 py-1 text-xs font-bold text-[#1e3828]">{pupils.length} enrolled pupils</span></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]"><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a6f5a]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search pupil name or unique student code" className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#2a5038]" /></label><select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-3 py-2.5 text-sm outline-none focus:border-[#2a5038]"><option>All classes</option>{SCHOOL_STANDARDS.map((className) => <option key={className}>{className}</option>)}</select></div>
    </div>
    <div className="overflow-hidden rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] shadow-sm"><div className="flex items-center justify-between border-b border-[#e8e2d8] px-5 py-3"><span className="flex items-center gap-2 text-sm font-bold text-[#1a1410]"><Users className="h-4 w-4 text-[#8a6f5a]" />{filtered.length} records</span><span className="text-[11px] text-[#6b5a48]">Select a pupil to view profile details</span></div><div className="max-h-[520px] overflow-y-auto"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-[#f0ebe3] text-[10px] uppercase tracking-wider text-[#6b5a48]"><tr><th className="px-5 py-3">Student</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Unique code</th><th className="px-5 py-3 text-right">Profile</th></tr></thead><tbody>{filtered.map((record) => <tr key={`${record.className}-${record.pupil.id}`} className="border-t border-[#e8e2d8] hover:bg-[#f7f3ed]"><td className="px-5 py-3"><p className="font-bold text-[#1a1410]">{record.pupil.name}</p><p className="text-[11px] text-[#6b5a48]">{record.pupil.status === 'connected' ? 'Parent account connected' : 'Parent invitation pending'}</p></td><td className="px-4 py-3 text-xs font-medium text-[#5a4f45]">{record.className}</td><td className="px-4 py-3"><button type="button" onClick={() => copyCode(record.studentCode)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#edf7ef] px-2 py-1 font-mono text-[11px] font-bold text-[#1e3828] hover:bg-[#d4e8da]"><Copy className="h-3 w-3" />{record.studentCode}</button></td><td className="px-5 py-3 text-right"><button type="button" onClick={() => setSelected(record)} className="rounded-lg bg-[#1a1410] px-3 py-1.5 text-xs font-bold text-[#fdfaf6] hover:bg-[#2a5038]">View details</button></td></tr>)}</tbody></table></div></div>
    <PupilProfileModal pupil={selected?.pupil || null} details={selected ? getPupilDetailsForClass(selected.pupil, selected.className) : undefined} className={selected?.className} onClose={() => setSelected(null)} />
  </section>;
};
