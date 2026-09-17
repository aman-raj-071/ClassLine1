import React, { useState } from 'react';
import { KeyRound, Mail, Plus, ShieldAlert, UserPlus, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CHILDREN, PUPIL_DETAILS } from '../data/mockData';
import { SchoolCredential } from '../data/mockData';

type ParentAccount = Omit<SchoolCredential, 'password'>;

const pupilRecordIdForChild = (childId: string) => {
  if (childId === 'child-leo') return 'p12';
  if (childId === 'child-maya') return 'p13';
  return childId.startsWith('child-p') ? childId.slice('child-'.length) : undefined;
};

export const ParentAccountManager: React.FC = () => {
  const { createParentAccount, parentAccounts, childrenList } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', childId: '' });
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<ParentAccount | null>(null);

  const update = (field: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setError(null);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = createParentAccount(form);
    if (!result.success) { setError(result.error || 'Unable to create account.'); return; }
    setForm({ name: '', email: '', username: '', password: '', childId: '' });
  };

  return (
    <div id="parent-account-manager" className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <section className="lg:col-span-7 rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-6 shadow-sm">
        <div className="mb-6 flex items-start gap-3 border-b border-[#e8e2d8] pb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d4e8da] text-[#1e3828]"><UserPlus className="h-5 w-5" /></div>
          <div><h2 className="font-serif text-2xl text-[#1a1410]">Create parent login</h2><p className="mt-1 text-sm text-[#5a4f45]">Assign credentials when a parent is registered to a pupil.</p></div>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45]"><span>Parent name</span><input value={form.name} onChange={(event) => update('name', event.target.value)} className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#8a6f5a]" placeholder="Full name" /></label>
          <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45]"><span>Email</span><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#8a6f5a]" placeholder="parent@example.com" /></label>
          <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45]"><span>Username</span><input value={form.username} onChange={(event) => update('username', event.target.value)} className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#8a6f5a]" placeholder="e.g. alex.smith" /></label>
          <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45]"><span>Temporary password</span><input type="password" value={form.password} onChange={(event) => update('password', event.target.value)} className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#8a6f5a]" placeholder="At least 8 characters" /></label>
          <label className="space-y-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45] sm:col-span-2"><span>Registered pupil</span><select value={form.childId} onChange={(event) => update('childId', event.target.value)} className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#8a6f5a]"><option value="">Select a pupil</option>{childrenList.map((child) => <option key={child.id} value={child.id}>{child.fullName} — {child.class}</option>)}</select></label>
          {error && <p role="alert" className="sm:col-span-2 rounded-lg bg-[#f5ddd9] p-3 text-xs font-medium text-[#7a1e1e]">{error}</p>}
          <button type="submit" className="sm:col-span-2 flex items-center justify-center gap-2 rounded-full bg-[#1a1410] px-4 py-3 text-sm font-bold text-[#f7f3ed] transition-colors hover:bg-[#2e2620]"><Plus className="h-4 w-4" /> Create parent account</button>
        </form>
        <div className="mt-5 flex gap-2 rounded-xl border border-[#f0d69f] bg-[#fff8e9] p-3 text-xs leading-relaxed text-[#70500a]"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /><p>Local demo mode: credentials are stored only in this browser. Share the temporary password privately; this should be moved to a secure server before real use.</p></div>
      </section>
      <section className="lg:col-span-5 rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ede4d9] text-[#6b5a48]"><Users className="h-5 w-5" /></div><div><h2 className="font-serif text-xl text-[#1a1410]">Parent accounts</h2><p className="text-xs text-[#6b5a48]">{parentAccounts.length} registered</p></div></div>
        <div className="space-y-3">{parentAccounts.map((account) => <button type="button" key={account.username} onClick={() => setSelectedAccount(account)} aria-label={`View registered pupils for ${account.name}`} className="w-full rounded-xl border border-[#e8e2d8] bg-[#f7f3ed] p-3 text-left transition-all hover:border-[#b0a496] hover:bg-[#fffdf9] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8a6f5a]/50"><p className="text-sm font-semibold text-[#1a1410]">{account.name}</p><p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-[#6b5a48]"><KeyRound className="h-3.5 w-3.5" /> {account.username}</p><p className="mt-1 text-[11px] text-[#8a6f5a]">{account.children?.map((id) => childrenList.find((child) => child.id === id)?.fullName || id).join(', ') || 'No pupil assigned'}</p><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#3d6b4f]">View registered pupil details</p></button>)}</div>
      </section>
      {selectedAccount && <ParentRegistrationModal account={selectedAccount} childrenList={childrenList} onClose={() => setSelectedAccount(null)} />}
    </div>
  );
};

const ParentRegistrationModal: React.FC<{ account: ParentAccount; childrenList: typeof CHILDREN; onClose: () => void }> = ({ account, childrenList, onClose }) => {
  const registeredChildren = (account.children || []).map((id) => childrenList.find((child) => child.id === id)).filter(Boolean);
  return <div role="dialog" aria-modal="true" aria-labelledby="parentRegistrationTitle" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[150] flex items-center justify-center bg-[#14100c]/70 p-4 backdrop-blur-sm">
    <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] p-6 shadow-2xl">
      <button type="button" onClick={onClose} aria-label="Close registered pupil details" className="absolute right-4 top-4 rounded-full p-1.5 text-[#6b5a48] hover:bg-[#ede4d9] hover:text-[#1a1410]"><X className="h-5 w-5" /></button>
      <div className="border-b border-[#e8e2d8] pb-5 pr-8"><p className="text-[11px] font-bold uppercase tracking-wider text-[#6b5a48]">Parent account</p><h2 id="parentRegistrationTitle" className="mt-1 font-serif text-3xl text-[#1a1410]">{account.name}</h2><p className="mt-2 flex items-center gap-1.5 text-sm text-[#5a4f45]"><Mail className="h-4 w-4 text-[#8a6f5a]" /> {account.email}</p><p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-[#6b5a48]"><KeyRound className="h-3.5 w-3.5" /> {account.username}</p></div>
      <div className="mt-5"><h3 className="mb-3 flex items-center gap-2 font-serif text-lg text-[#1a1410]"><Users className="h-4 w-4 text-[#8a6f5a]" /> Registered pupil{registeredChildren.length === 1 ? '' : 's'} ({registeredChildren.length})</h3><div className="space-y-3">{registeredChildren.length ? registeredChildren.map((child) => {
        if (!child) return null;
        const details = PUPIL_DETAILS[pupilRecordIdForChild(child.id) || ''];
        return <article key={child.id} className="rounded-xl border border-[#e8e2d8] bg-[#f7f3ed] p-4"><h4 className="font-semibold text-[#1a1410]">{child.fullName}</h4><p className="mt-1 text-xs text-[#5a4f45]">{child.year} — Section {child.class}</p>{details && <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[#e8e2d8] pt-3 text-xs"><div><dt className="text-[#8a6f5a]">Admission no.</dt><dd className="font-medium text-[#1a1410]">{details.admissionNumber}</dd></div><div><dt className="text-[#8a6f5a]">Date of birth</dt><dd className="font-medium text-[#1a1410]">{details.dateOfBirth}</dd></div><div><dt className="text-[#8a6f5a]">Blood group</dt><dd className="font-medium text-[#1a1410]">{details.bloodGroup}</dd></div><div><dt className="text-[#8a6f5a]">Portal status</dt><dd className="font-medium text-[#1a1410]">Registered</dd></div></dl>}</article>;
      }) : <p className="rounded-xl border border-dashed border-[#d4cdc4] p-4 text-sm text-[#6b5a48]">No pupil is registered to this account.</p>}</div></div>
    </div>
  </div>;
};
