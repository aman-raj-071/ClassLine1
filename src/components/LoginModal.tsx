import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, LogIn, Mail, UserRound, X } from 'lucide-react';
import { UserRole } from '../types';

interface LoginModalProps { isOpen: boolean; onClose: () => void; defaultRole: UserRole; }

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, defaultRole }) => {
  const { loginWithCredentials, requestPasswordReset, resetPassword } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'reset'>('sign-in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [emailHint, setEmailHint] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');
  const [resetComplete, setResetComplete] = useState(false);
  const [role, setRole] = useState<UserRole>(defaultRole);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null); setIsSuccess(false); setResetComplete(false); setResetLinkSent(false); setEmailHint(''); setIsLoading(false); setPassword(''); setNewPassword(''); setConfirmPassword(''); setMode('sign-in');
    window.setTimeout(() => usernameRef.current?.focus(), 150);
  }, [isOpen]);

  useEffect(() => { setRole(defaultRole); }, [defaultRole]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    window.setTimeout(() => {
      const result = loginWithCredentials(username, password, role);
      if (!result.success) { setIsLoading(false); setError(result.error || 'Unable to sign in with those credentials.'); return; }
      const name = username.split(/[.@]/)[0] || 'there';
      setSuccessName(name.charAt(0).toUpperCase() + name.slice(1));
      setIsSuccess(true);
      window.setTimeout(() => { setIsLoading(false); onClose(); }, 1000);
    }, 450);
  };

  const handlePasswordReset = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) { setError('The new passwords do not match.'); return; }
    setIsLoading(true);
    window.setTimeout(() => {
      const result = resetPassword(resetUsername, newPassword, role);
      setIsLoading(false);
      if (!result.success) { setError(result.error || 'Unable to reset your password.'); return; }
      setUsername(resetUsername);
      setPassword('');
      setResetComplete(true);
    }, 450);
  };

  const handleResetRequest = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    window.setTimeout(() => {
      const result = requestPasswordReset(resetUsername, role);
      setIsLoading(false);
      if (!result.success) { setError(result.error || 'Unable to request a password reset.'); return; }
      setEmailHint(result.emailHint || 'your registered email');
      setResetLinkSent(true);
    }, 450);
  };

  const returnToSignIn = () => {
    setMode('sign-in'); setResetComplete(false); setResetLinkSent(false); setEmailHint(''); setError(null); setNewPassword(''); setConfirmPassword('');
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modalTitle" className="fixed inset-0 z-[200] flex items-center justify-center bg-[#14100c]/80 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#d4cdc4] bg-[#fdfaf6] shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-[#6b5a48] via-[#8a6f5a] to-[#2a4a35]" />
        <button type="button" onClick={onClose} aria-label="Close login dialog" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#6b5a48] transition-colors hover:bg-[#ede4d9] hover:text-[#1a1410]"><X className="h-5 w-5" /></button>
        <div className="p-6 pb-4">
          <div className="mb-2 flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1410] text-[#d4e8da]"><BookOpen className="h-4 w-4" /></div><h2 id="modalTitle" className="font-serif text-2xl tracking-tight text-[#1a1410]">ClassLine sign in</h2></div>
          <p className="pr-6 text-sm leading-relaxed text-[#5a4f45]">{mode === 'reset' ? 'Enter your username and we’ll send a reset link to the email registered for that account.' : `Use the ${role === 'teacher' ? 'teacher' : 'parent'} username and password supplied by your school.`}</p>
        </div>
        {mode === 'sign-in' ? <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <div className="flex rounded-full bg-[#e8e2d8] p-1 shadow-inner" role="tablist" aria-label="Choose account type">
            <button type="button" role="tab" aria-selected={role === 'parent'} onClick={() => { setRole('parent'); setError(null); }} className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-all ${role === 'parent' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}>Parent Login</button>
            <button type="button" role="tab" aria-selected={role === 'teacher'} onClick={() => { setRole('teacher'); setError(null); }} className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-all ${role === 'teacher' ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm' : 'text-[#6b5a48]'}`}>Teacher Login</button>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="usernameInput" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45]"><UserRound className="h-3.5 w-3.5 text-[#8a6f5a]" /> Username</label>
            <input id="usernameInput" ref={usernameRef} type="text" value={username} onChange={(event) => { setUsername(event.target.value); setError(null); }} placeholder="Your school username" autoComplete="username" spellCheck="false" className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-4 py-3 text-sm text-[#1a1410] outline-none transition-all placeholder:text-[#b0a496] focus:border-[#8a6f5a] focus:bg-[#fdfaf6] focus:ring-2 focus:ring-[#8a6f5a]/20" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="passwordInput" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45]"><LockKeyhole className="h-3.5 w-3.5 text-[#8a6f5a]" /> Password</label>
            <div className="relative"><input id="passwordInput" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError(null); }} placeholder="Your school password" autoComplete="current-password" className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-4 py-3 pr-12 text-sm text-[#1a1410] outline-none transition-all placeholder:text-[#b0a496] focus:border-[#8a6f5a] focus:bg-[#fdfaf6] focus:ring-2 focus:ring-[#8a6f5a]/20" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#6b5a48] hover:text-[#1a1410]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          </div>
          <div className="-mt-1 text-right"><button type="button" onClick={() => { setMode('reset'); setError(null); setPassword(''); }} className="text-xs font-semibold text-[#3d6b4f] underline decoration-[#9dc9aa] underline-offset-4 hover:text-[#1e3828]">Forgot password?</button></div>
          {error && <div role="alert" className="flex items-start gap-2.5 rounded-lg border-l-4 border-[#9b2c2c] bg-[#f5ddd9] p-3 text-xs font-medium text-[#7a1e1e]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
          <button id="loginSubmitBtn" type="submit" disabled={isLoading || isSuccess} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1410] px-5 py-3 text-sm font-bold tracking-wide text-[#f7f3ed] shadow-md transition-all hover:bg-[#2e2620] disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f7f3ed]/30 border-t-[#f7f3ed]" /> Verifying credentials…</> : <><LogIn className="h-4 w-4" /> Sign in</>}</button>
          <p className="text-center text-[11px] leading-relaxed text-[#6b5a48]">Your account type is assigned by the school. Contact your teacher or school office if you do not have credentials.</p>
        </form> : <form onSubmit={resetLinkSent ? handlePasswordReset : handleResetRequest} className="space-y-4 px-6 pb-6">
          <button type="button" onClick={returnToSignIn} className="flex items-center gap-1.5 text-xs font-semibold text-[#5a4f45] hover:text-[#1a1410]"><ArrowLeft className="h-3.5 w-3.5" /> Back to sign in</button>
          {!resetLinkSent ? <div className="space-y-1.5"><label htmlFor="resetUsernameInput" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45]"><UserRound className="h-3.5 w-3.5 text-[#8a6f5a]" /> {role === 'teacher' ? 'Teacher' : 'Parent'} username</label><input id="resetUsernameInput" type="text" value={resetUsername} onChange={(event) => { setResetUsername(event.target.value); setError(null); }} placeholder="Your school username" autoComplete="username" spellCheck="false" className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-4 py-3 text-sm text-[#1a1410] outline-none transition-all placeholder:text-[#b0a496] focus:border-[#8a6f5a] focus:bg-[#fdfaf6] focus:ring-2 focus:ring-[#8a6f5a]/20" /></div> : <>
            <div className="flex items-start gap-2.5 rounded-xl border border-[#c6ddcb] bg-[#edf7ef] p-3 text-xs leading-relaxed text-[#1e3828]"><Mail className="mt-0.5 h-4 w-4 shrink-0" /><p>A password-reset link was sent to <strong>{emailHint}</strong>. Open that link from your email to continue.</p></div>
            <div className="space-y-1.5"><label htmlFor="newPasswordInput" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45]"><KeyRound className="h-3.5 w-3.5 text-[#8a6f5a]" /> New password</label><input id="newPasswordInput" type="password" value={newPassword} onChange={(event) => { setNewPassword(event.target.value); setError(null); }} placeholder="At least 8 characters" autoComplete="new-password" className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-4 py-3 text-sm text-[#1a1410] outline-none transition-all placeholder:text-[#b0a496] focus:border-[#8a6f5a] focus:bg-[#fdfaf6] focus:ring-2 focus:ring-[#8a6f5a]/20" /></div>
            <div className="space-y-1.5"><label htmlFor="confirmPasswordInput" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5a4f45]"><LockKeyhole className="h-3.5 w-3.5 text-[#8a6f5a]" /> Confirm new password</label><input id="confirmPasswordInput" type="password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError(null); }} placeholder="Re-enter your new password" autoComplete="new-password" className="w-full rounded-xl border border-[#d4cdc4] bg-[#f7f3ed] px-4 py-3 text-sm text-[#1a1410] outline-none transition-all placeholder:text-[#b0a496] focus:border-[#8a6f5a] focus:bg-[#fdfaf6] focus:ring-2 focus:ring-[#8a6f5a]/20" /></div>
          </>}
          {error && <div role="alert" className="flex items-start gap-2.5 rounded-lg border-l-4 border-[#9b2c2c] bg-[#f5ddd9] p-3 text-xs font-medium text-[#7a1e1e]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
          <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1410] px-5 py-3 text-sm font-bold tracking-wide text-[#f7f3ed] shadow-md transition-all hover:bg-[#2e2620] disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? (resetLinkSent ? 'Updating password…' : 'Sending reset link…') : (resetLinkSent ? 'Set new password' : 'Send reset link')}</button>
          <p className="text-center text-[11px] leading-relaxed text-[#6b5a48]">For this local demo, the reset-link step is simulated. A live school system should send a time-limited, single-use link to the saved email address.</p>
        </form>}
        {isSuccess && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#fdfaf6] p-6 text-center animate-in fade-in duration-300"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d4e8da] text-[#1e3828] shadow-inner"><CheckCircle2 className="h-8 w-8" /></div><h3 className="font-serif text-2xl text-[#1a1410]">Welcome, {successName}!</h3><p className="text-xs font-semibold uppercase tracking-wider text-[#6b5a48]">Opening your school workspace…</p></div>}
        {resetComplete && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#fdfaf6] p-6 text-center animate-in fade-in duration-300"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d4e8da] text-[#1e3828] shadow-inner"><CheckCircle2 className="h-8 w-8" /></div><h3 className="font-serif text-2xl text-[#1a1410]">Password updated</h3><p className="text-sm leading-relaxed text-[#5a4f45]">You can now sign in using your new password.</p><button type="button" onClick={returnToSignIn} className="mt-2 rounded-full bg-[#1a1410] px-5 py-2.5 text-sm font-bold text-[#f7f3ed] hover:bg-[#2e2620]">Back to sign in</button></div>}
      </div>
    </div>
  );
};
