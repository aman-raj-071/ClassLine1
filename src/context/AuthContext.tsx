import React, { createContext, useContext, useState, useEffect } from 'react';
import { Child, Dispatch, GradeCard, SignOffItem, TimelineEntry, UserRole, UserSession } from '../types';
import { CHILDREN, INITIAL_DISPATCHES, INITIAL_GRADE_CARDS, INITIAL_SIGNOFF_ITEMS, INITIAL_TIMELINE_ENTRIES, PUPIL_CHILD_IDS, PUPILS, SCHOOL_CREDENTIALS, SchoolCredential } from '../data/mockData';

interface ToastState {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface AppNotification {
  id: string;
  recipientRole: UserRole;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface AuthContextType {
  currentUser: UserSession | null;
  activeView: 'landing' | 'parent' | 'teacher';
  activeChildId: string;
  focusMode: boolean;
  timelineEntries: TimelineEntry[];
  dispatches: Dispatch[];
  signOffItems: SignOffItem[];
  gradeCards: GradeCard[];
  toast: ToastState | null;
  notifications: AppNotification[];
  loginWithCredentials: (username: string, password: string, expectedRole: UserRole) => { success: boolean; error?: string };
  requestParentPasswordReset: (username: string) => { success: boolean; error?: string; emailHint?: string };
  resetParentPassword: (username: string, newPassword: string) => { success: boolean; error?: string };
  requestPasswordReset: (username: string, role: UserRole) => { success: boolean; error?: string; emailHint?: string };
  resetPassword: (username: string, newPassword: string, role: UserRole) => { success: boolean; error?: string };
  parentAccounts: Omit<SchoolCredential, 'password'>[];
  teacherAccounts: Omit<SchoolCredential, 'password'>[];
  createParentAccount: (account: { name: string; email: string; username: string; password: string; childId: string }) => { success: boolean; error?: string };
  createTeacherAccount: (account: { name: string; email: string; username: string; password: string; className: string }) => { success: boolean; error?: string };
  logout: () => void;
  setActiveView: (view: 'landing' | 'parent' | 'teacher') => void;
  setActiveChildId: (childId: string) => void;
  setFocusMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  hideToast: () => void;
  markNotificationsRead: (role: UserRole) => void;
  payFee: (entryId: string, paymentReference?: string) => void;
  sendTeacherNote: (entryId: string, noteText: string) => void;
  replyToParentMessage: (entryId: string, messageId: string, messageText: string) => void;
  logReadingNight: (childId: string) => void;
  signOffItem: (id: string, notes?: string) => void;
  signOffAllItems: () => void;
  rejectSignOffItem: (id: string, reason?: string) => void;
  saveGradeCard: (gradeCard: GradeCard) => void;
  getGradeCardForChild: (childId: string) => GradeCard | undefined;
  addDispatch: (dispatch: Omit<Dispatch, 'id' | 'sentAt' | 'delivered' | 'status'>) => void;
  recallDispatch: (id: string) => void;
  archiveDispatch: (id: string) => void;
  resendDispatch: (id: string) => void;
  childrenList: Child[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'classline_user_session';
const TIMELINE_STORAGE_KEY = 'classline_timeline_entries';
const DISPATCHES_STORAGE_KEY = 'classline_dispatches';
const CHILDREN_STORAGE_KEY = 'classline_children';
const SIGNOFF_STORAGE_KEY = 'classline_signoffs';
const GRADE_CARDS_STORAGE_KEY = 'classline_grade_cards';
const CREDENTIALS_STORAGE_KEY = 'classline_school_credentials';
const NOTIFICATIONS_STORAGE_KEY = 'classline_notifications';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeView, setActiveView] = useState<'landing' | 'parent' | 'teacher'>(() => {
    if (currentUser) {
      return currentUser.role === 'teacher' ? 'teacher' : 'parent';
    }
    return 'landing';
  });

  const [activeChildId, setActiveChildId] = useState<string>('child-leo');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [childrenList, setChildrenList] = useState<Child[]>(() => {
    try {
      const saved = localStorage.getItem(CHILDREN_STORAGE_KEY);
      const stored: Child[] = saved ? JSON.parse(saved) : [];
      // Merge older local-demo data with the complete school roster. This
      // preserves any locally added pupils while ensuring every registered
      // account can resolve its assigned pupil after a data update.
      return [
        ...CHILDREN,
        ...stored.filter((child) => !CHILDREN.some((rosterChild) => rosterChild.id === child.id)),
      ];
    } catch {
      return CHILDREN;
    }
  });

  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>(() => {
    try {
      const saved = localStorage.getItem(TIMELINE_STORAGE_KEY);
      const stored: TimelineEntry[] = saved ? JSON.parse(saved) : INITIAL_TIMELINE_ENTRIES;
      return stored.some((entry) => entry.meta?.amount?.includes('£') || entry.body.includes('Oakridge')) ? INITIAL_TIMELINE_ENTRIES : stored;
    } catch {
      return INITIAL_TIMELINE_ENTRIES;
    }
  });

  const [dispatches, setDispatches] = useState<Dispatch[]>(() => {
    try {
      const saved = localStorage.getItem(DISPATCHES_STORAGE_KEY);
      const stored: Dispatch[] = saved ? JSON.parse(saved) : INITIAL_DISPATCHES;
      return stored.some((dispatch) => dispatch.body.includes('£') || dispatch.body.includes('Leo Evans')) ? INITIAL_DISPATCHES : stored;
    } catch {
      return INITIAL_DISPATCHES;
    }
  });

  const [signOffItems, setSignOffItems] = useState<SignOffItem[]>(() => {
    try {
      const saved = localStorage.getItem(SIGNOFF_STORAGE_KEY);
      const stored: SignOffItem[] = saved ? JSON.parse(saved) : INITIAL_SIGNOFF_ITEMS;
      return stored.some((item) => item.pupilName === 'Leo Evans' || item.pupilName === 'Isla Miller' || item.meta?.amount?.includes('£')) ? INITIAL_SIGNOFF_ITEMS : stored;
    } catch {
      return INITIAL_SIGNOFF_ITEMS;
    }
  });

  const [gradeCards, setGradeCards] = useState<GradeCard[]>(() => {
    try {
      const saved = localStorage.getItem(GRADE_CARDS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_GRADE_CARDS;
    } catch {
      return INITIAL_GRADE_CARDS;
    }
  });

  const [credentials, setCredentials] = useState<SchoolCredential[]>(() => {
    try {
      const saved = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
      if (!saved) return SCHOOL_CREDENTIALS;
      const storedCredentials: SchoolCredential[] = JSON.parse(saved);
      // Keep school-managed starter accounts current while preserving accounts
      // created by a teacher in this browser.
      const managedUsernames = new Set(SCHOOL_CREDENTIALS.map((account) => account.username));
      const legacyStarterUsernames = new Set([
        'eleanor.vance', 'james.okafor', 'priya.sharma', 'e.reynolds',
        // Replaced by the complete Class III A family-registration roster.
        'rajesh.kumar', 'kavita.verma',
      ]);
      return [
        ...SCHOOL_CREDENTIALS,
        ...storedCredentials.filter((account) => !managedUsernames.has(account.username) && !legacyStarterUsernames.has(account.username)),
      ];
    } catch {
      return SCHOOL_CREDENTIALS;
    }
  });

  // Keep the selected workspace aligned with the authenticated role. This is
  // enforced here as well as in the navigation so a view cannot be switched
  // to the other role's workspace by a stale UI state.
  const setAuthorizedView = (view: 'landing' | 'parent' | 'teacher') => {
    if (view === 'landing') {
      setActiveView('landing');
      return;
    }

    if (currentUser?.role === view) {
      setActiveView(view);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(GRADE_CARDS_STORAGE_KEY, JSON.stringify(gradeCards));
    } catch {
      // Ignore
    }
  }, [gradeCards]);

  useEffect(() => {
    try {
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials));
    } catch {
      // Ignore storage quota errors in local demo mode.
    }
  }, [credentials]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Ignore storage quota errors in local demo mode.
    }
  }, [notifications]);

  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(timelineEntries));
    } catch {
      // Ignore
    }
  }, [timelineEntries]);

  useEffect(() => {
    try {
      localStorage.setItem(DISPATCHES_STORAGE_KEY, JSON.stringify(dispatches));
    } catch {
      // Ignore
    }
  }, [dispatches]);

  useEffect(() => {
    try {
      localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(childrenList));
    } catch {
      // Ignore
    }
  }, [childrenList]);

  useEffect(() => {
    try {
      localStorage.setItem(SIGNOFF_STORAGE_KEY, JSON.stringify(signOffItems));
    } catch {
      // Ignore
    }
  }, [signOffItems]);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const notify = (recipientRole: UserRole, title: string, body: string) => {
    setNotifications((previous) => [
      { id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, recipientRole, title, body, createdAt: 'Just now', read: false },
      ...previous,
    ].slice(0, 50));
  };

  const markNotificationsRead = (role: UserRole) => {
    setNotifications((previous) => previous.map((notification) =>
      notification.recipientRole === role ? { ...notification, read: true } : notification
    ));
  };

  const loginWithCredentials = (rawUsername: string, password: string, expectedRole: UserRole): { success: boolean; error?: string } => {
    const username = rawUsername.trim().toLowerCase();
    if (!username || !password) {
      return { success: false, error: 'Enter the username and password issued by your school.' };
    }

    const found = credentials.find(
      (item) => item.username.toLowerCase() === username && item.password === password
    );
    if (!found) {
      return { success: false, error: 'Those school credentials were not recognised. Please contact your teacher or school office.' };
    }
    if (found.role !== expectedRole) {
      return { success: false, error: `These are ${found.role} credentials. Please use the ${found.role === 'teacher' ? 'Teacher' : 'Parent'} Login.` };
    }

    const sessionData: UserSession = {
      username: found.username,
      role: found.role,
      name: found.name,
      email: found.email,
      children: found.children,
      class: found.class,
      isAuthorized: found.isAuthorized,
      loginTime: Date.now(),
    };

    setCurrentUser(sessionData);
    setActiveView(found.role === 'teacher' ? 'teacher' : 'parent');
    showToast(`Welcome back, ${found.name.split(' ')[0]}!`, 'success');
    return { success: true };
  };

  const findParentAccount = (rawUsername: string) => {
    const username = rawUsername.trim().toLowerCase();
    return credentials.find((credential) => credential.role === 'parent' && credential.username.toLowerCase() === username);
  };

  const requestParentPasswordReset = (rawUsername: string): { success: boolean; error?: string; emailHint?: string } => {
    if (!rawUsername.trim()) return { success: false, error: 'Enter your parent username.' };
    const account = findParentAccount(rawUsername);
    if (!account) return { success: false, error: 'We could not find a parent account for that username. Please contact the school office.' };
    const [localPart, domain] = account.email.split('@');
    const emailHint = `${localPart.slice(0, 2)}${'•'.repeat(Math.max(3, localPart.length - 2))}@${domain}`;
    return { success: true, emailHint };
  };

  const resetParentPassword = (rawUsername: string, newPassword: string): { success: boolean; error?: string } => {
    const username = rawUsername.trim().toLowerCase();
    if (newPassword.length < 8) return { success: false, error: 'Use a new password with at least 8 characters.' };
    const account = findParentAccount(username);
    if (!account) return { success: false, error: 'We could not find a parent account for that username. Please contact the school office.' };

    setCredentials((previous) => previous.map((credential) =>
      credential.username === account.username ? { ...credential, password: newPassword } : credential
    ));
    return { success: true };
  };

  const requestPasswordReset = (rawUsername: string, role: UserRole): { success: boolean; error?: string; emailHint?: string } => {
    const username = rawUsername.trim().toLowerCase();
    const accountLabel = role === 'teacher' ? 'teacher' : 'parent';
    if (!username) return { success: false, error: `Enter your ${accountLabel} username.` };
    const account = credentials.find((credential) => credential.role === role && credential.username.toLowerCase() === username);
    if (!account) return { success: false, error: `We could not find a ${accountLabel} account for that username. Please contact the school office.` };
    const [localPart, domain] = account.email.split('@');
    return { success: true, emailHint: `${localPart.slice(0, 2)}${'•'.repeat(Math.max(3, localPart.length - 2))}@${domain}` };
  };

  const resetPassword = (rawUsername: string, newPassword: string, role: UserRole): { success: boolean; error?: string } => {
    const username = rawUsername.trim().toLowerCase();
    const accountLabel = role === 'teacher' ? 'teacher' : 'parent';
    if (newPassword.length < 8) return { success: false, error: 'Use a new password with at least 8 characters.' };
    const account = credentials.find((credential) => credential.role === role && credential.username.toLowerCase() === username);
    if (!account) return { success: false, error: `We could not find a ${accountLabel} account for that username. Please contact the school office.` };
    setCredentials((previous) => previous.map((credential) => credential.username === account.username ? { ...credential, password: newPassword } : credential));
    return { success: true };
  };

  const createParentAccount = (account: { name: string; email: string; username: string; password: string; childId: string }): { success: boolean; error?: string } => {
    if (!currentUser?.isAuthorized) {
      return { success: false, error: 'Only the authorised school office account can create parent accounts.' };
    }
    const username = account.username.trim().toLowerCase();
    if (!account.name.trim() || !account.email.trim() || !username || !account.password || !account.childId) {
      return { success: false, error: 'Complete every field before creating the parent account.' };
    }
    if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
      return { success: false, error: 'Username must be 3–40 characters using letters, numbers, dots, hyphens, or underscores.' };
    }
    if (account.password.length < 8) {
      return { success: false, error: 'Use a password with at least 8 characters.' };
    }
    if (credentials.some((credential) => credential.username.toLowerCase() === username)) {
      return { success: false, error: 'That username is already assigned.' };
    }

    setCredentials((previous) => [...previous, {
      username,
      password: account.password,
      role: 'parent',
      name: account.name.trim(),
      email: account.email.trim(),
      children: [account.childId],
    }]);
    showToast(`Parent account created for ${account.name.trim()}. Share the credentials securely.`, 'success');
    return { success: true };
  };

  const createTeacherAccount = (account: { name: string; email: string; username: string; password: string; className: string }): { success: boolean; error?: string } => {
    if (!currentUser?.isAuthorized) return { success: false, error: 'Only the authorised school office account can register teacher accounts.' };
    const username = account.username.trim().toLowerCase();
    if (!account.name.trim() || !account.email.trim() || !username || !account.password || !account.className.trim()) return { success: false, error: 'Name, email, username, password, and assigned standard are required.' };
    if (!/^[a-z0-9._-]{3,40}$/.test(username)) return { success: false, error: 'Username must be 3–40 characters using letters, numbers, dots, hyphens, or underscores.' };
    if (account.password.length < 8) return { success: false, error: 'Use a password with at least 8 characters.' };
    if (credentials.some((credential) => credential.username.toLowerCase() === username)) return { success: false, error: 'That username is already registered.' };
    setCredentials((previous) => [...previous, { username, password: account.password, role: 'teacher', name: account.name.trim(), email: account.email.trim().toLowerCase(), class: account.className.trim() }]);
    showToast(`Teacher account created for ${account.name.trim()} — ${account.className.trim()}.`, 'success');
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveView('landing');
    setFocusMode(false);
    showToast('Signed out of ClassLine.', 'info');
  };

  const payFee = (entryId: string, paymentReference?: string) => {
    setTimelineEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, paid: true, seenAt: `Paid - ${paymentReference || 'UPI confirmation pending'}` } : e))
    );
    notify('teacher', 'Fee payment received', `A parent has paid the ₹1,500 Science Centre visit contribution${paymentReference ? ` (receipt ${paymentReference})` : ''}.`);
    showToast(`Payment of ₹1,500 confirmed${paymentReference ? ` - receipt ${paymentReference}` : ''}.`, 'success');
  };

  const sendTeacherNote = (entryId: string, noteText: string) => {
    if (!noteText.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const message = { id: `parent-message-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: noteText.trim(), sentAt: timeStr };
    setTimelineEntries((prev) => prev.map((entry) => entry.id === entryId ? { ...entry, parentMessages: [...(entry.parentMessages || []), message] } : entry));
    notify('teacher', 'New parent message', `${currentUser?.name || 'A parent'} sent a note: “${noteText.trim()}”`);
    showToast('Quiet note delivered directly to teacher.', 'success');
  };

  const replyToParentMessage = (entryId: string, messageId: string, messageText: string) => {
    if (!messageText.trim()) return;
    const entry = timelineEntries.find((item) => item.id === entryId);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTimelineEntries((previous) => previous.map((item) => item.id === entryId ? { ...item, parentMessages: (item.parentMessages || []).map((message) => message.id === messageId ? { ...message, teacherReplyText: messageText.trim(), teacherReplyTime: timeStr } : message) } : item));
    notify('parent', 'New teacher reply', `${currentUser?.name || 'Class teacher'} replied regarding ${entry?.title || 'your message'}.`);
    showToast('Reply sent to the parent dashboard.', 'success');
  };

  const logReadingNight = (childId: string) => {
    let childName = 'Pupil';
    setChildrenList((prev) =>
      prev.map((child) => {
        if (child.id === childId) {
          childName = child.fullName;
          const nextVal = Math.min(child.readingNights.target, child.readingNights.completed + 1);
          return {
            ...child,
            readingNights: { ...child.readingNights, completed: nextVal },
          };
        }
        return child;
      })
    );

    // Queue or update sign-off item awaiting teacher verification
    setSignOffItems((prev) => {
      const existing = prev.find((item) => item.pupilId === (childId === 'child-leo' ? 'p12' : 'p13') && item.type === 'reading_log' && item.status === 'pending');
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                details: `Nightly reading logged by parent. Completed night ${Math.min(5, (item.meta?.nightsCount || 4) + 1)} of 5.`,
                submittedAt: 'Just now',
                meta: {
                  ...item.meta,
                  nightsCount: Math.min(5, (item.meta?.nightsCount || 4) + 1),
                },
              }
            : item
        );
      } else {
        const newItem: SignOffItem = {
          id: `so-${Date.now()}`,
          type: 'reading_log',
          pupilId: childId === 'child-leo' ? 'p12' : 'p13',
          pupilName: childId === 'child-leo' ? 'Aarav Sharma' : 'Ananya Sharma',
          parentName: currentUser?.name || 'Parent Guardian',
          title: `Nightly Reading Log — ${childId === 'child-leo' ? 'The Iron Man' : 'Owl Babies'}`,
          details: `Completed reading session logged by parent. Ready for teacher ledger sign-off.`,
          submittedAt: 'Just now',
          status: 'pending',
          meta: {
            bookTitle: childId === 'child-leo' ? 'The Iron Man' : 'Owl Babies',
            minutesRead: 20,
            nightsCount: 5,
          },
        };
        return [newItem, ...prev];
      }
    });

    notify('teacher', 'Reading log submitted', `${childName}'s parent logged tonight's reading for teacher verification.`);
    showToast("Tonight's reading signed and verified! Forwarded to teacher ledger.", 'success');
  };

  const signOffItem = (id: string, notes?: string) => {
    const item = signOffItems.find((i) => i.id === id);
    if (!item) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const teacherName = currentUser?.name || 'Aman Raj';

    setSignOffItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'signed',
              signedAt: `Today, ${timeStr}`,
              signedBy: teacherName,
              details: notes ? `${i.details} • Notes: ${notes}` : i.details,
            }
          : i
      )
    );

    notify('parent', 'Teacher sign-off complete', `${item.title} has been verified by ${teacherName}.`);

    showToast(
      item.type === 'reading_log'
        ? `Reading log verified and signed for ${item.pupilName}. Golden star awarded!`
        : `Signed off and archived for ${item.pupilName}.`,
      'success'
    );
  };

  const signOffAllItems = () => {
    const pendingCount = signOffItems.filter((i) => i.status === 'pending').length;
    if (pendingCount === 0) {
      showToast('No pending items awaiting sign-off.', 'info');
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const teacherName = currentUser?.name || 'Aman Raj';

    setSignOffItems((prev) =>
      prev.map((i) =>
        i.status === 'pending'
          ? {
              ...i,
              status: 'signed',
              signedAt: `Today, ${timeStr}`,
              signedBy: teacherName,
            }
          : i
      )
    );

    showToast(`All ${pendingCount} pending items verified and signed off in classroom ledger.`, 'success');
  };

  const rejectSignOffItem = (id: string, reason?: string) => {
    const item = signOffItems.find((i) => i.id === id);
    if (!item) return;

    setSignOffItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'rejected',
              details: reason ? `${i.details} [Returned: ${reason}]` : i.details,
            }
          : i
      )
    );

    notify('parent', 'Submission needs attention', `${item.title} was returned by the teacher${reason ? `: ${reason}` : '.'}`);
    showToast(`Returned ${item.pupilName}'s submission to parent for verification.`, 'info');
  };

  const addDispatch = (dispatchData: Omit<Dispatch, 'id' | 'sentAt' | 'delivered' | 'status'>) => {
    const newDispatch: Dispatch = {
      ...dispatchData,
      id: `disp-${Date.now()}`,
      sentAt: 'Just now',
      delivered: dispatchData.recipients,
      status: 'delivered',
      acknowledgedCount: 0,
    };

    setDispatches((prev) => [newDispatch, ...prev]);

    // Route the entry only to its intended registered pupil(s), using the
    // explicit registration map rather than the displayed roster order.
    const selectedNames = new Set(dispatchData.selectedPupils || []);
    const targetChildIds = dispatchData.targetScope === 'class'
      ? childrenList.map((child) => child.id)
      : PUPILS.flatMap((pupil) => selectedNames.has(pupil.name) ? [PUPIL_CHILD_IDS[pupil.id]].filter(Boolean) : []);
    const title = dispatchData.title || (dispatchData.category === 'note' ? 'Note from Teacher' : 'New School Notice');
    const accentColor = dispatchData.category === 'fee' ? '#9b2c2c' : dispatchData.category === 'note' ? '#3d6b4f' : dispatchData.category === 'event' ? '#6b5a48' : '#b0a496';
    const timestamp = Date.now();
    const newEntries: TimelineEntry[] = targetChildIds.map((childId, index) => ({
      id: `entry-${timestamp}-${index}`,
      childId,
      type: dispatchData.category,
      title,
      body: dispatchData.body,
      date: 'Today',
      dateGroup: 'today',
      accentColor,
      seenAt: 'Delivered just now',
      markedSeen: false,
    }));

    if (!newEntries.length) {
      showToast('No registered pupil was selected. Please select one or more pupils before posting.', 'error');
      return;
    }

    setTimelineEntries((prev) => [...newEntries, ...prev]);
    notify('parent', title, 'Your teacher has posted a new item to the school ledger.');
    showToast(`Ledger entry delivered to ${newEntries.length} parent timeline${newEntries.length === 1 ? '' : 's'}.`, 'success');
  };

  const recallDispatch = (id: string) => {
    setDispatches((prev) => prev.filter((d) => d.id !== id));
    showToast('Dispatch recalled and removed from parent timelines.', 'info');
  };

  const archiveDispatch = (id: string) => {
    setDispatches((prev) => prev.filter((d) => d.id !== id));
    showToast('Entry archived to school audit records.', 'info');
  };

  const resendDispatch = (id: string) => {
    showToast('Prompt reminder re-sent to pending families.', 'success');
  };

  const saveGradeCard = (card: GradeCard) => {
    setGradeCards((prev) => {
      const idx = prev.findIndex(
        (g) => g.id === card.id || g.pupilId === card.pupilId
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = card;
        return next;
      } else {
        return [card, ...prev];
      }
    });
  };

  const getGradeCardForChild = (childId: string): GradeCard | undefined => {
    return gradeCards.find(
      (gc) => gc.pupilId === childId || (childId === 'child-leo' && gc.pupilId === 'p12') || (childId === 'child-maya' && gc.pupilId === 'p13')
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeView,
        activeChildId,
        focusMode,
        timelineEntries,
        dispatches,
        signOffItems,
        gradeCards,
        toast,
        notifications,
        loginWithCredentials,
        requestParentPasswordReset,
        resetParentPassword,
        requestPasswordReset,
        resetPassword,
        parentAccounts: credentials.filter((credential) => credential.role === 'parent').map(({ password: _password, ...account }) => account),
        teacherAccounts: credentials.filter((credential) => credential.role === 'teacher').map(({ password: _password, ...account }) => account),
        createParentAccount,
        createTeacherAccount,
        logout,
        setActiveView: setAuthorizedView,
        setActiveChildId,
        setFocusMode,
        showToast,
        hideToast,
        markNotificationsRead,
        payFee,
        sendTeacherNote,
        replyToParentMessage,
        logReadingNight,
        signOffItem,
        signOffAllItems,
        rejectSignOffItem,
        saveGradeCard,
        getGradeCardForChild,
        addDispatch,
        recallDispatch,
        archiveDispatch,
        resendDispatch,
        childrenList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
