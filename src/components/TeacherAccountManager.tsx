import React, { useState } from 'react';
import { GraduationCap, Plus, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const standards = ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'];
const initialForm = { name: '', email: '', username: '', password: '', standard: '', section: 'A' };

export const TeacherAccountManager: React.FC = () => {
  const { createTeacherAccount, teacherAccounts } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault(); setError(null); setCreated(null);
    if (!form.standard) { setError('Select the standard assigned to this teacher.'); return; }
    const result = createTeacherAccount({ ...form, className: `${form.standard} ${form.section}` });
    if (!result.success) { setError(result.error || 'Unable to create teacher account.'); return; }
    setCreated(`${form.name} — ${form.standard} ${form.section}`); setForm(initialForm);
  };

  return <section id="teacher-account-manager" className="rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-6 shadow-sm">
    <div className="flex flex-col justify-between gap-3 border-b border-[#e8e2d8] pb-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2 text-[#2a5038]"><GraduationCap className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-wider">School staff</span></div><h2 className="mt-1 font-serif text-2xl text-[#1a1410]">Register teacher account</h2><p className="mt-1 text-sm text-[#5a4f45]">Choose the teacher’s standard during registration. Their dashboard and timetable will then match that class.</p></div><span className="rounded-full bg-[#d4e8da] px-3 py-1 text-xs font-bold text-[#1e3828]">{teacherAccounts.length} teachers</span></div>
    <form onSubmit={submit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field label="Teacher name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></Field>
      <Field label="School email"><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@school.edu.in" /></Field>
      <Field label="Username"><input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. teacher.name" autoComplete="off" /></Field>
      <Field label="Temporary password"><input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" autoComplete="new-password" /></Field>
      <Field label="Assigned standard"><select required value={form.standard} onChange={(e) => setForm({ ...form, standard: e.target.value })}><option value="">Select standard</option>{standards.map((standard) => <option key={standard} value={standard}>{standard}</option>)}</select></Field>
      <Field label="Section"><select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>{['A', 'B', 'C', 'D'].map((section) => <option key={section}>{section}</option>)}</select></Field>
      {error && <p role="alert" className="rounded-lg bg-[#f5ddd9] p-3 text-sm text-[#7a1e1e] md:col-span-2">{error}</p>}
      {created && <p className="rounded-lg bg-[#edf7ef] p-3 text-sm text-[#1e3828] md:col-span-2"><ShieldCheck className="mr-1 inline h-4 w-4" />Registered {created}. Share the temporary password securely.</p>}
      <div className="md:col-span-2"><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#1a1410] px-5 py-3 text-sm font-bold text-[#fdfaf6] hover:bg-[#2a5038]"><Plus className="h-4 w-4" />Register teacher</button></div>
    </form>
    <div className="mt-7 border-t border-[#e8e2d8] pt-5"><h3 className="flex items-center gap-2 font-serif text-lg text-[#1a1410]"><Users className="h-4 w-4 text-[#8a6f5a]" />Registered teachers</h3><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{teacherAccounts.map((teacher) => <div key={teacher.username} className="rounded-xl border border-[#e8e2d8] bg-[#f7f3ed] p-3"><p className="text-sm font-bold text-[#1a1410]">{teacher.name}</p><p className="mt-0.5 text-xs text-[#5a4f45]">{teacher.class || 'Standard not assigned'}</p><p className="mt-1 font-mono text-[10px] text-[#8a6f5a]">{teacher.username}</p></div>)}</div></div>
  </section>;
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45]"><span>{label}</span><div className="[&>input]:w-full [&>input]:rounded-xl [&>input]:border [&>input]:border-[#d4cdc4] [&>input]:bg-[#f7f3ed] [&>input]:px-3 [&>input]:py-2.5 [&>input]:text-sm [&>input]:font-normal [&>input]:normal-case [&>select]:w-full [&>select]:rounded-xl [&>select]:border [&>select]:border-[#d4cdc4] [&>select]:bg-[#f7f3ed] [&>select]:px-3 [&>select]:py-2.5 [&>select]:text-sm [&>select]:font-normal [&>select]:normal-case">{children}</div></label>;
