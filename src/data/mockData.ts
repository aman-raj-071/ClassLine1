import { Child, Dispatch, GradeCard, Pupil, PupilDetails, SignOffItem, SubjectGrade, TeamMember, TimelineEntry, UserSession } from '../types';

// Local-only school registration records. In production, credentials must be
// verified by the server and passwords must never be stored in browser code.
export type SchoolCredential = UserSession & { password: string };

export const INITIAL_TIMELINE_ENTRIES: TimelineEntry[] = [
  /* LEO: TODAY */
  {
    id: 'entry-a',
    childId: 'child-leo',
    type: 'fee',
    title: 'Science Centre Educational Visit Contribution',
    body: 'We are pleased to confirm our Class III visit to the National Science Centre, New Delhi. The contribution covers coach transport, entry, and activity materials. Please complete payment by Friday, 24 October.',
    date: 'Tuesday, 14 October',
    dateGroup: 'today',
    accentColor: '#9b2c2c',
    meta: {
      amount: '₹1,500',
      due: '24 Oct 2024',
      paid: false,
    },
    seenAt: '08:24',
    paid: false,
    markedSeen: true,
  },
  {
    id: 'entry-b',
    childId: 'child-leo',
    type: 'note',
    title: 'Class III Reading Circle — Notable Progress',
    body: 'Aarav showed wonderful patience during paired reading today and earned a star for our class achievement board.',
    date: 'Tuesday, 14 October',
    dateGroup: 'today',
    accentColor: '#3d6b4f',
    meta: {
      from: 'Aman Raj',
      subject: 'Reading Circle',
      time: '11:35 AM',
    },
    seenAt: '12:00',
    acknowledged: true,
    replyText: 'Thank you Mrs. Reynolds! He was telling us all about James and the tree over breakfast — it made his whole morning.',
    replyTime: '13:10',
    markedSeen: true,
  },
  /* LEO: YESTERDAY */
  {
    id: 'entry-c',
    childId: 'child-leo',
    type: 'event',
    title: 'Harvest Festival Assembly & Bread Making',
    body: 'Parents are warmly invited to join our annual Harvest singing and bread celebration. Children will be kneading harvest sheaves with baker John from St. Jude’s Mill. Please ensure your child brings a clean, named kitchen apron on Thursday afternoon.',
    date: 'Monday, 13 October',
    dateGroup: 'yesterday',
    accentColor: '#6b5a48',
    meta: {
      time: '09:15 – 10:30 AM',
      location: 'Main Assembly Hall',
      date: 'Friday, 24 Oct',
    },
    seenAt: 'Yesterday 14:15',
    markedSeen: true,
  },
  /* LEO: LAST WEEK */
  {
    id: 'entry-d',
    childId: 'child-leo',
    type: 'general',
    title: 'Autumn Term Wellies & Waterproofs Reminder',
    body: 'With rain expected across the coming fortnight, forest school and field playtime will proceed outdoors. Please verify all outdoor boots and raincoats carry your child’s initials in permanent marker on the interior heel tab.',
    date: 'Thursday, 9 October',
    dateGroup: 'last-week',
    accentColor: '#b0a496',
    meta: {
      from: 'Pastoral Care',
    },
    seenAt: 'Archived 5 days ago',
    markedSeen: true,
  },

  /* MAYA: TODAY */
  {
    id: 'maya-1',
    childId: 'child-maya',
    type: 'event',
    title: 'Willow Class Autumn Leaf Hunt & Story Gathering',
    body: 'This Friday morning, Reception Willow will take part in a nature walk across the school wildlife copse. Please send your child with their waterproof fleece and wellies.',
    date: 'Tuesday, 14 October',
    dateGroup: 'today',
    accentColor: '#6b5a48',
    meta: {
      time: '09:30 – 11:00 AM',
      location: 'School Wildlife Copse',
      date: 'Friday, 17 Oct',
    },
    seenAt: '09:05',
    markedSeen: true,
  },
  {
    id: 'maya-2',
    childId: 'child-maya',
    type: 'note',
    title: 'Willow Book Club & Phonics Milestone',
    body: 'Maya has been a wonderful reading buddy this week. She finished sounding out her set 2 phonics flashcards with complete confidence and shared her favourite picture book with the circle.',
    date: 'Tuesday, 14 October',
    dateGroup: 'today',
    accentColor: '#3d6b4f',
    meta: {
      from: 'Ms. Amara Osei',
      time: '10:05 AM',
    },
    seenAt: '10:45',
    acknowledged: true,
    replyText: 'Maya was so excited to show us the phonics rhymes last night!',
    replyTime: '11:20',
    markedSeen: true,
  },
];

export const INITIAL_DISPATCHES: Dispatch[] = [
  {
    id: 'disp-001',
    category: 'note',
    title: 'Reading Progress Note Home',
    body: 'Leo showed wonderful patience during paired reading today, helping James decode difficult sounds in our poetry collection…',
    sentAt: 'Today, 11:35',
    recipients: 28,
    delivered: 28,
    status: 'delivered',
    targetScope: 'class',
    acknowledgedCount: 26,
  },
  {
    id: 'disp-002',
    category: 'fee',
    title: 'Natural History Museum Workshop Contribution',
    body: 'Science Centre Educational Visit Contribution — ₹1,500 due by Friday, 24 October. Coach transport (₹900) + entry & materials (₹600)…',
    sentAt: 'Today, 08:15',
    recipients: 28,
    delivered: 28,
    status: 'delivered',
    targetScope: 'class',
    acknowledgedCount: 22,
  },
  {
    id: 'disp-003',
    category: 'event',
    title: 'Harvest Festival Assembly & Bread Making',
    body: 'Harvest Festival Assembly & Bread Making — Parents warmly invited, 09:15 AM, Main Assembly Hall. Aprons requested.',
    sentAt: 'Mon 13 Oct, 11:00',
    recipients: 28,
    delivered: 28,
    status: 'delivered',
    targetScope: 'class',
    acknowledgedCount: 27,
  },
  {
    id: 'disp-004',
    category: 'general',
    title: 'Autumn Term Wellies & Waterproofs Reminder',
    body: 'Autumn Term Wellies & Waterproofs Reminder — All outdoor boots and raincoats should carry initials on the interior heel tab.',
    sentAt: 'Thu 9 Oct, 14:00',
    recipients: 28,
    delivered: 28,
    status: 'partial',
    targetScope: 'class',
    acknowledgedCount: 18,
  },
];

export const PUPILS: Pupil[] = [
  { id: 'p01', name: 'Aadhya S.', initial: 'AS', status: 'connected' },
  { id: 'p02', name: 'Arjun K.', initial: 'AK', status: 'connected' },
  { id: 'p03', name: 'Bhavya P.', initial: 'BP', status: 'connected' },
  { id: 'p04', name: 'Diya G.', initial: 'DG', status: 'connected' },
  { id: 'p05', name: 'Dev R.', initial: 'DR', status: 'connected' },
  { id: 'p06', name: 'Ira N.', initial: 'IN', status: 'connected' },
  { id: 'p07', name: 'Kabir J.', initial: 'KJ', status: 'connected' },
  { id: 'p08', name: 'Kiara S.', initial: 'KS', status: 'connected' },
  { id: 'p09', name: 'Laksh M.', initial: 'LM', status: 'connected' },
  { id: 'p10', name: 'Rajesh K.', initial: 'RK', status: 'connected' },
  { id: 'p11', name: 'Nisha P.', initial: 'NP', status: 'connected' },
  { id: 'p12', name: 'Aarav S.', initial: 'AS', status: 'connected' },
  { id: 'p13', name: 'Ananya S.', initial: 'AS', status: 'connected' },
  { id: 'p14', name: 'Pari V.', initial: 'PV', status: 'connected' },
  { id: 'p15', name: 'Pranav C.', initial: 'PC', status: 'connected' },
  { id: 'p16', name: 'Riya M.', initial: 'RM', status: 'connected' },
  { id: 'p17', name: 'Rudra A.', initial: 'RA', status: 'connected' },
  { id: 'p18', name: 'Saanvi H.', initial: 'SH', status: 'connected' },
  { id: 'p19', name: 'Shaurya T.', initial: 'ST', status: 'connected' },
  { id: 'p20', name: 'Tanvi N.', initial: 'TN', status: 'connected' },
  { id: 'p21', name: 'Ved B.', initial: 'VB', status: 'connected' },
  { id: 'p22', name: 'Vivaan S.', initial: 'VS', status: 'connected' },
  { id: 'p23', name: 'Yash D.', initial: 'YD', status: 'connected' },
  { id: 'p24', name: 'Zoya F.', initial: 'ZF', status: 'connected' },
  { id: 'p25', name: 'Ishaan M.', initial: 'IM', status: 'connected' },
  { id: 'p26', name: 'Kavya R.', initial: 'KR', status: 'connected' },
  { id: 'p27', name: 'Vihaan S.', initial: 'VS', status: 'connected' },
  { id: 'p28', name: 'Meera P.', initial: 'MP', status: 'connected' },
];

// Demo rosters are separated by assigned class. Class III retains the
// established registered families; other standards receive their own pupils
// rather than incorrectly displaying the Class III A list.
const OTHER_STANDARD_NAMES = [
  'Aarush Mehta', 'Aditi Nair', 'Advait Kapoor', 'Anika Bose', 'Aryan Gupta', 'Avni Shah', 'Daksh Jain', 'Diya Thomas',
  'Eshan Rao', 'Ishita Das', 'Kabir Malhotra', 'Kavya Iyer', 'Krish Bhat', 'Meher Sood', 'Myra Khanna', 'Nakul Singh',
  'Navya Menon', 'Neil Arora', 'Prisha Roy', 'Reyansh Chopra', 'Ritvik Sinha', 'Riya Kulkarni', 'Samar Joshi', 'Sara Ali',
  'Shivansh Verma', 'Tanishka Goel', 'Vivaan Kapoor', 'Zara Khan',
];

export const getPupilsForClass = (className: string): Pupil[] => {
  const key = className.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key === 'classiiia') return PUPILS;
  const classLabel = className.replace(/\s+[A-D]$/i, '').trim();
  return OTHER_STANDARD_NAMES.map((name, index) => {
    const parts = name.split(' ');
    return {
      id: `${key || 'class'}-p${String(index + 1).padStart(2, '0')}`,
      name,
      initial: parts.map((part) => part[0]).join(''),
      status: index % 6 === 5 ? 'pending' : 'connected',
    };
  });
};

export const getPupilDetailsForClass = (pupil: Pupil, className: string): PupilDetails => {
  if (PUPIL_DETAILS[pupil.id]) return PUPIL_DETAILS[pupil.id];
  const [firstName, parentSurname = 'Family'] = pupil.name.split(' ');
  const recordNumber = Number(pupil.id.match(/(\d+)$/)?.[1] || 1);
  const classCode = className.replace(/\W/g, '').toUpperCase();
  const primaryParent = `${recordNumber % 2 === 0 ? 'Mrs.' : 'Mr.'} ${parentSurname}`;
  const secondaryParent = `${recordNumber % 2 === 0 ? 'Mr.' : 'Mrs.'} ${parentSurname}`;
  const basePhone = String(7000000000 + recordNumber).replace(/(\d{5})(\d{5})$/, '$1 $2');
  return {
    fullName: pupil.name,
    admissionNumber: `SVM/2026/${classCode}/${String(recordNumber).padStart(2, '0')}`,
    dateOfBirth: `${String((recordNumber % 27) + 1).padStart(2, '0')}/${String((recordNumber % 9) + 1).padStart(2, '0')}/20${String(12 + (recordNumber % 8)).padStart(2, '0')}`,
    parents: [
      { name: primaryParent, relationship: recordNumber % 2 === 0 ? 'Mother' : 'Father', phone: `+91 ${basePhone}`, email: `${firstName.toLowerCase()}.${parentSurname.toLowerCase()}.parent@example.in`, isPrimary: true },
      { name: secondaryParent, relationship: recordNumber % 2 === 0 ? 'Father' : 'Mother', phone: `+91 ${String(7100000000 + recordNumber).replace(/(\d{5})(\d{5})$/, '$1 $2')}`, email: `${parentSurname.toLowerCase()}.guardian@example.in` },
    ],
    address: `${20 + recordNumber}, Sector ${50 + (recordNumber % 9)}, Noida, Uttar Pradesh 20130${recordNumber % 10}`,
    emergencyContact: `${primaryParent} — +91 ${basePhone}`,
    bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'O-'][recordNumber % 5],
    medicalNotes: recordNumber % 6 === 0 ? 'Mild seasonal allergy noted. Parent contact verified.' : 'No medical alert recorded. Parent contact verified.',
  };
};

export const SCHOOL_STANDARDS = ['Nursery A', 'LKG A', 'UKG A', 'Class I A', 'Class II A', 'Class III A', 'Class IV A', 'Class V A', 'Class VI A', 'Class VII A', 'Class VIII A', 'Class IX A', 'Class X A', 'Class XI A', 'Class XII A'];

export interface SchoolDirectoryPupil {
  pupil: Pupil;
  className: string;
  studentCode: string;
}

/** School-office catalogue. The code is deterministic and unique per pupil/class. */
export const getAllSchoolPupils = (): SchoolDirectoryPupil[] => SCHOOL_STANDARDS.flatMap((className) => {
  const classCode = className.replace('Class ', 'C').replace(' ', '').toUpperCase();
  return getPupilsForClass(className).map((pupil, index) => ({
    pupil,
    className,
    studentCode: `SVM-26-${classCode}-${String(index + 1).padStart(3, '0')}`,
  }));
});

// Entirely fictional local-demo records. Replace these with secure server data
// before using the application with real pupil information.
const PUPIL_GUARDIANS: Record<string, [string, string]> = {
  p01: ['Aadhya Singh', 'Pooja Singh'], p02: ['Arjun Kapoor', 'Manoj Kapoor'],
  p03: ['Bhavya Patel', 'Rina Patel'], p04: ['Diya Gupta', 'Sonal Gupta'],
  p05: ['Dev Raj', 'Kiran Raj'], p06: ['Ira Nair', 'Meena Nair'],
  p07: ['Kabir Jain', 'Rakesh Jain'], p08: ['Kiara Sharma', 'Neha Sharma'],
  p09: ['Laksh Mehta', 'Ankit Mehta'], p10: ['Rajesh Kumar', 'Sunita Kumar'],
  p11: ['Nisha Prasad', 'Vandana Prasad'], p12: ['Aarav Sharma', 'Anjali Sharma'],
  p13: ['Ananya Sharma', 'Anjali Sharma'], p14: ['Pari Verma', 'Amit Verma'],
  p15: ['Pranav Chawla', 'Sonia Chawla'], p16: ['Riya Malhotra', 'Ritu Malhotra'],
  p17: ['Rudra Ahuja', 'Nitin Ahuja'], p18: ['Saanvi Handa', 'Kavita Handa'],
  p19: ['Shaurya Tiwari', 'Deepak Tiwari'], p20: ['Tanvi Narang', 'Shweta Narang'],
  p21: ['Ved Bansal', 'Pankaj Bansal'], p22: ['Vivaan Sethi', 'Aarti Sethi'],
  p23: ['Yash Dubey', 'Rohit Dubey'], p24: ['Zoya Farooqi', 'Saba Farooqi'],
  p25: ['Ishaan Malik', 'Priyanka Malik'], p26: ['Kavya Rana', 'Pallavi Rana'],
  p27: ['Vihaan Saxena', 'Gaurav Saxena'], p28: ['Meera Pandey', 'Nidhi Pandey'],
};

export const PUPIL_DETAILS: Record<string, PupilDetails> = Object.fromEntries(
  PUPILS.map((pupil, index) => {
    const [fullName, guardianName] = PUPIL_GUARDIANS[pupil.id];
    const phone = `+91 98765 ${String(41000 + index).slice(-5)}`;
    const surname = fullName.split(' ').at(-1) || '';
    const secondParentNames = ['Rohan', 'Sneha', 'Vikram', 'Anita', 'Arun', 'Kavya', 'Sanjay', 'Priya'];
    const secondPhone = `+91 98765 ${String(46000 + index).slice(-5)}`;
    const primaryRelationship = index % 3 === 0 ? 'Father' : 'Mother';
    const secondRelationship = primaryRelationship === 'Father' ? 'Mother' : 'Father';
    const secondParentName = `${secondParentNames[index % secondParentNames.length]} ${surname}`;
    return [pupil.id, {
      fullName,
      admissionNumber: `SVM/2026/3A/${String(index + 1).padStart(2, '0')}`,
      dateOfBirth: `${String((index % 27) + 1).padStart(2, '0')}/0${(index % 8) + 1}/2018`,
      parents: [
        {
          name: guardianName,
          relationship: primaryRelationship,
          phone,
          email: `${guardianName.toLowerCase().replace(/[^a-z]/g, '.')}@example.in`,
          isPrimary: true,
        },
        {
          name: secondParentName,
          relationship: secondRelationship,
          phone: secondPhone,
          email: `${secondParentName.toLowerCase().replace(/[^a-z]/g, '.')}@example.in`,
        },
      ],
      address: `${12 + index}, Sector ${50 + (index % 8)}, Noida, Uttar Pradesh 20130${index % 9}`,
      emergencyContact: `${guardianName} — ${phone}`,
      bloodGroup: ['B+', 'O+', 'A+', 'AB+', 'O-'][index % 5],
      medicalNotes: index % 7 === 0 ? 'No known allergies. Emergency contact verified.' : 'No medical alert recorded.',
    }];
  })
) as Record<string, PupilDetails>;

// Every pupil in the Class III A roster has a corresponding portal profile.
// Aarav and Ananya retain their established IDs so their existing timeline
// entries continue to be available to their registered parent.
export const PUPIL_CHILD_IDS: Record<string, string> = Object.fromEntries(
  PUPILS.map((pupil) => [
    pupil.id,
    pupil.id === 'p12' ? 'child-leo' : pupil.id === 'p13' ? 'child-maya' : `child-${pupil.id}`,
  ])
) as Record<string, string>;

export const CHILDREN: Child[] = PUPILS.map((pupil, index) => {
  const details = PUPIL_DETAILS[pupil.id];
  return {
    id: PUPIL_CHILD_IDS[pupil.id],
    firstName: details.fullName.split(' ')[0],
    fullName: details.fullName,
    year: 'Class III',
    class: 'A',
    avatarColor: ['#d4c4b0', '#c9bdb0', '#d4e8da', '#ede4d9'][index % 4],
    readingNights: { completed: 3 + (index % 3), target: 5 },
    guardians: [`PAR${String(index * 2 + 1).padStart(3, '0')}`, `PAR${String(index * 2 + 2).padStart(3, '0')}`],
  };
});

const parentPupilAssignments = new Map<string, string[]>();
PUPILS.forEach((pupil) => {
  const primaryParent = PUPIL_GUARDIANS[pupil.id][1];
  parentPupilAssignments.set(primaryParent, [
    ...(parentPupilAssignments.get(primaryParent) || []),
    PUPIL_CHILD_IDS[pupil.id],
  ]);
});

// Local-demo parent registrations for every roster pupil. One guardian account
// can be linked to more than one child, as with Anjali Sharma's two pupils.
const ROSTER_PARENT_CREDENTIALS: SchoolCredential[] = Array.from(parentPupilAssignments.entries()).map(([name, children]) => {
  const username = name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
  return {
    username,
    password: 'Parent@2026',
    role: 'parent',
    name,
    email: `${username}@example.in`,
    children,
  };
});

export const SCHOOL_CREDENTIALS: SchoolCredential[] = [
  ...ROSTER_PARENT_CREDENTIALS,
  {
    username: 'school.office', password: 'Office@2026!', role: 'teacher', name: 'School Office',
    email: 'office@saraswativm.edu.in', class: 'School Administration', isAuthorized: true,
  },
  {
    username: 'ayiman.tarannum', password: 'Ayiman@2026!', role: 'teacher', name: 'Ayiman Tarannum',
    email: 'ayiman.tarannum@saraswativm.edu.in', class: 'Class III A',
  },
  {
    username: 'aman_raj', password: 'Ravi@123#', role: 'teacher', name: 'Aman Raj',
    email: 'aman.raj@saraswativm.edu.in', class: 'Class III A',
  },
  {
    username: 'd.hartley', password: 'Teacher@2026', role: 'teacher', name: 'Neha Singh',
    email: 'neha.singh@saraswativm.edu.in', class: 'Class IV A',
  },
  {
    username: 'a.osei', password: 'Teacher@2026', role: 'teacher', name: 'Rohit Verma',
    email: 'rohit.verma@saraswativm.edu.in', class: 'Class I B',
  },
];

export const INITIAL_SIGNOFF_ITEMS: SignOffItem[] = [
  {
    id: 'so-001',
    type: 'reading_log',
    pupilId: 'p12',
    pupilName: 'Aarav Sharma',
    parentName: 'Anjali Sharma',
    title: 'Nightly Reading Log — Chapter 4, The Iron Man',
    details: 'Completed 25 mins paired reading. Fluency verified with parent notes.',
    submittedAt: 'Yesterday, 19:40',
    status: 'pending',
    meta: {
      bookTitle: 'The Iron Man (Ted Hughes)',
      minutesRead: 25,
      nightsCount: 4,
    },
  },
  {
    id: 'so-002',
    type: 'trip_permission',
    pupilId: 'p09',
    pupilName: 'Isla Miller',
    parentName: 'David Miller',
    title: 'Natural History Museum Consent Form & Contribution',
    details: 'Parental consent signed for coach travel and guided Earth Galleries workshop.',
    submittedAt: 'Today, 08:20',
    status: 'pending',
    meta: {
      activityDate: 'Thu, 6 Nov',
      amount: '₹1,500',
    },
  },
  {
    id: 'so-003',
    type: 'consent_form',
    pupilId: 'p10',
    pupilName: 'Rajesh Kumar',
    parentName: 'Sunita Kumar',
    title: 'Forest School Wildlife Walk & Medical Protocol',
    details: 'Emergency inhaler protocol acknowledged & off-site trail walking permitted.',
    submittedAt: 'Today, 09:10',
    status: 'pending',
    meta: {
      activityDate: 'Fri, 17 Oct',
    },
  },
  {
    id: 'so-004',
    type: 'reading_log',
    pupilId: 'p13',
    pupilName: 'Ananya Sharma',
    parentName: 'Anjali Sharma',
    title: 'Phonics Rhymes & Picture Book Circle',
    details: 'Sounding out set 2 phonics flashcards confirmed.',
    submittedAt: 'Mon 13 Oct, 18:15',
    status: 'signed',
    signedAt: 'Tue 14 Oct, 08:30',
    signedBy: 'Aman Raj',
    meta: {
      bookTitle: 'Owl Babies',
      minutesRead: 20,
      nightsCount: 5,
    },
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Sophie Raines',
    role: 'Founder & CEO',
    bio: 'Former primary-school teacher turned product thinker. Sophie spent eight years in the classroom before building the tool she always wished she had.',
    tags: ['Product', 'Strategy', 'Education'],
    initials: 'SR',
    bgClass: 'bg-[#dce4f0]',
    textClass: 'text-[#364e78]',
  },
  {
    name: 'Marcus Lowe',
    role: 'Head of Engineering',
    bio: 'Full-stack engineer obsessed with performance and accessibility. Marcus ensures every interaction in ClassLine is fast, resilient, and delightfully smooth.',
    tags: ['Engineering', 'Accessibility', 'Security'],
    initials: 'ML',
    bgClass: 'bg-[#cce8e4]',
    textClass: 'text-[#1d5e58]',
  },
  {
    name: 'Aisha Kamara',
    role: 'Lead Designer',
    bio: 'Systems thinker and typophile. Aisha shaped the ClassLine visual language — every token, every spacing rule, every micro-animation bears her fingerprints.',
    tags: ['Design Systems', 'UX Research', 'Motion'],
    initials: 'AK',
    bgClass: 'bg-[#f5e6c8]',
    textClass: 'text-[#7a4e10]',
  },
  {
    name: 'Oliver Bright',
    role: 'School Partnerships',
    bio: 'The voice of every school we work with. Oliver listens, feeds back, and makes sure ClassLine grows in the right direction for the real people using it daily.',
    tags: ['Partnerships', 'Onboarding', 'Feedback'],
    initials: 'OB',
    bgClass: 'bg-[#f5ddd9]',
    textClass: 'text-[#7a2020]',
  },
  {
    name: 'Nina Petrov',
    role: 'Data & Privacy Lead',
    bio: 'Privacy and information-governance lead. Nina helps schools keep family information organised, access-controlled, and handled with care.',
    tags: ['Privacy', 'Governance', 'Information safety'],
    initials: 'NP',
    bgClass: 'bg-[#e8dff0]',
    textClass: 'text-[#4e3070]',
  },
  {
    name: 'James Teo',
    role: 'Customer Support',
    bio: 'First-responder for every school, parent and teacher who needs help. James turns support tickets into product improvements and keeps satisfaction scores sky-high.',
    tags: ['Support', 'Training', 'Documentation'],
    initials: 'JT',
    bgClass: 'bg-[#d4e8da]',
    textClass: 'text-[#2a5038]',
  },
];

export const INITIAL_GRADE_CARDS: GradeCard[] = [
  {
    id: 'gc-leo-autumn-2026',
    pupilId: 'child-leo',
    pupilName: 'Aarav Sharma',
    motherName: 'Mrs. Sarah Evans',
    fatherName: 'Mr. David Evans',
    rollNumber: 'CBSE/2026/3012',
    registrationNumber: 'SCH/89421/26',
    admitCardId: 'DL301226',
    verificationCode: 'CBSE-VER-9842-LEO7',
    verificationStatus: 'VERIFIED_ACTIVE',
    verifiedAt: '14 Oct 2026, 10:30 UTC',
    schoolAffiliationNo: 'CBSE-AFF-2130094',
    schoolCode: 'SCH-70192',
    yearGroup: 'Class III (Year 3)',
    classGroup: 'Section A (Oak)',
    academicYear: '2026 – 2027',
    term: 'CBSE Mid-Year Assessment & Progress Report',
    issuedDate: '14 October 2026',
    teacherName: 'Aman Raj',
    headteacherName: 'Dr. Alistair Finch',
    attendancePercentage: 98.4,
    daysPresent: 62,
    daysTotal: 63,
    conductRating: 'Exemplary & Diligent (Grade A)',
    overallAverage: 91.5,
    cgpa: 9.5,
    indicativePercentage: 90.3,
    overallGrade: 'A1 (Outstanding / Greater Depth)',
    overallBand: 'Greater Depth',
    resultStatus: 'PASSED',
    teacherGeneralRemarks:
      'Leo has demonstrated outstanding academic mastery and disciplined enthusiasm across all CBSE scholastic subjects. His mental arithmetic speed, scientific inquiry, and respectful demeanor are exceptional. Qualified with Distinction.',
    targetAreas: [
      'Incorporate varied subordinate clauses and descriptive idiom in Hindi & English creative composition.',
      'Tackle multi-step non-routine word problems in geometry and fractions.',
      'Lead the junior division in the upcoming Inter-School CBSE Science Congress.',
    ],
    status: 'published',
    lastUpdated: '14 Oct 2026, 14:30',
    subjects: [
      {
        id: 'sub-math-leo',
        subjectCode: '041',
        subject: 'Mathematics & Numeracy',
        category: 'Core',
        theoryMarks: 76,
        internalMarks: 19,
        marksObtained: 95,
        maxMarks: 100,
        grade: 'A1',
        gradePoint: 10.0,
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Exceptional speed in mental calculations, rapid geometry comprehension, and solid logical deduction.',
      },
      {
        id: 'sub-eng-leo',
        subjectCode: '184',
        subject: 'English Language & Literature',
        category: 'Language',
        theoryMarks: 74,
        internalMarks: 18,
        marksObtained: 92,
        maxMarks: 100,
        grade: 'A1',
        gradePoint: 10.0,
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Superb expressive fluency in reading comprehension, analytical inference, and creative narrative.',
      },
      {
        id: 'sub-sci-leo',
        subjectCode: '086',
        subject: 'Science & Environmental Discovery',
        category: 'Core',
        theoryMarks: 73,
        internalMarks: 19,
        marksObtained: 92,
        maxMarks: 100,
        grade: 'A1',
        gradePoint: 10.0,
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Formulates clear hypotheses; documents laboratory experiments with exemplary precision and curiosity.',
      },
      {
        id: 'sub-sst-leo',
        subjectCode: '087',
        subject: 'Social Science (Hist, Geog, Civics)',
        category: 'Core',
        theoryMarks: 70,
        internalMarks: 18,
        marksObtained: 88,
        maxMarks: 100,
        grade: 'A2',
        gradePoint: 9.0,
        band: 'Greater Depth',
        effort: 'High Effort',
        teacherComment: 'Deep understanding of historical timelines, geographical landmarks, and environmental stewardship.',
      },
      {
        id: 'sub-lang2-leo',
        subjectCode: '085',
        subject: 'Second Language (Hindi Course B)',
        category: 'Language',
        theoryMarks: 69,
        internalMarks: 18,
        marksObtained: 87,
        maxMarks: 100,
        grade: 'A2',
        gradePoint: 9.0,
        band: 'Greater Depth',
        effort: 'High Effort',
        teacherComment: 'Clear Devnagari handwriting, accurate matra usage, and attentive pronunciation in recitation.',
      },
      {
        id: 'sub-comp-leo',
        subjectCode: '165',
        subject: 'Computer Applications & IT Foundation',
        category: 'Elective',
        theoryMarks: 75,
        internalMarks: 20,
        marksObtained: 95,
        maxMarks: 100,
        grade: 'A1',
        gradePoint: 10.0,
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Shows superior aptitude in block-based algorithms, algorithmic patterns, and digital presentation design.',
      },
    ],
    coScholastic: [
      {
        area: 'Work Education & Pre-Vocational (501)',
        grade: 'A',
        description: 'Exemplary craftsmanship, hands-on scientific projects, and resource preservation.',
      },
      {
        area: 'Art Education & Aesthetics (502)',
        grade: 'A',
        description: 'Delicate watercolour shading, creative perspective drawing, and keen visual expression.',
      },
      {
        area: 'Health & Physical Education (503)',
        grade: 'A',
        description: 'High athletic stamina, disciplined soccer teamwork, and consistent practice of pranayama & yoga.',
      },
      {
        area: 'Discipline & School Values (504)',
        grade: 'A',
        description: 'Impeccable attendance, punctuality, humble manners, and constructive peer leadership.',
      },
    ],
  },
  {
    id: 'gc-maya-autumn-2026',
    pupilId: 'child-maya',
    pupilName: 'Ananya Sharma',
    motherName: 'Mrs. Sarah Evans',
    fatherName: 'Mr. David Evans',
    rollNumber: 'CBSE/2026/3014',
    registrationNumber: 'SCH/89423/26',
    admitCardId: 'DL301426',
    verificationCode: 'CBSE-VER-4519-MAY3',
    verificationStatus: 'VERIFIED_ACTIVE',
    verifiedAt: '14 Oct 2026, 11:15 UTC',
    schoolAffiliationNo: 'CBSE-AFF-2130094',
    schoolCode: 'SCH-70192',
    yearGroup: 'Class I (Primary Preparatory)',
    classGroup: 'Section B (Willow)',
    academicYear: '2026 – 2027',
    term: 'CBSE Foundational Learning Profile',
    issuedDate: '14 October 2026',
    teacherName: 'Ms. Amara Osei',
    headteacherName: 'Dr. Alistair Finch',
    attendancePercentage: 100,
    daysPresent: 63,
    daysTotal: 63,
    conductRating: 'Joyful & Exemplary (Grade A)',
    overallAverage: 94.6,
    cgpa: 9.8,
    indicativePercentage: 93.1,
    overallGrade: 'A1 (Outstanding / Exemplary)',
    overallBand: 'Greater Depth',
    resultStatus: 'PASSED',
    teacherGeneralRemarks:
      'Maya is a joyful and brilliantly focused learner. Her phonetic decoding, spatial visualization, and gentle empathy bring warmth and cheer to our classroom every day.',
    targetAreas: [
      'Begin introductory two-digit mental arithmetic using abacus and counting beads.',
      'Explore nature journaling and leaf pigment mixing in environmental art.',
    ],
    status: 'published',
    lastUpdated: '14 Oct 2026, 11:15',
    subjects: [
      {
        id: 'sub-maya-lit',
        subjectCode: '184',
        subject: 'English Literacy & Phonics',
        category: 'Language',
        theoryMarks: 76,
        internalMarks: 20,
        marksObtained: 96,
        maxMarks: 100,
        grade: 'A1',
        gradePoint: 10.0,
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Effortlessly segments CVC words; reads aloud with rhythm and theatrical flair.',
      },
      {
        id: 'sub-maya-num',
        subjectCode: '041',
        subject: 'Early Mathematics & Shapes',
        category: 'Core',
        theoryMarks: 74,
        internalMarks: 19,
        marksObtained: 93,
        maxMarks: 100,
        grade: 'A1',
        gradePoint: 10.0,
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Instantly identifies symmetric polygons and pattern progressions.',
      },
      {
        id: 'sub-maya-evs',
        subjectCode: '086',
        subject: 'Environmental Studies (EVS)',
        category: 'Core',
        theoryMarks: 75,
        internalMarks: 20,
        marksObtained: 95,
        maxMarks: 100,
        grade: 'A1',
        gradePoint: 10.0,
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Fascinated by plant life cycles and miniature garden ecosystems.',
      },
      {
        id: 'sub-maya-lang2',
        subjectCode: '085',
        subject: 'Second Language (Hindi Course B)',
        category: 'Language',
        theoryMarks: 73,
        internalMarks: 19,
        marksObtained: 92,
        maxMarks: 100,
        grade: 'A1',
        gradePoint: 10.0,
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Loves nursery rhymes in Hindi and identifies varnamala letters with joyful enthusiasm.',
      },
      {
        id: 'sub-maya-comp',
        subjectCode: '165',
        subject: 'Early ICT & Interactive Media',
        category: 'Elective',
        theoryMarks: 77,
        internalMarks: 20,
        marksObtained: 97,
        maxMarks: 100,
        grade: 'A1',
        gradePoint: 10.0,
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Navigates educational puzzles and interactive touch tablets with ease.',
      },
    ],
    coScholastic: [
      {
        area: 'Work Education & Practical Skills (501)',
        grade: 'A',
        description: 'Tidies classroom blocks diligently and follows safe tool routines.',
      },
      {
        area: 'Art Education (502)',
        grade: 'A',
        description: 'Vibrant painting, expressive clay crafts, and melodic singing.',
      },
      {
        area: 'Health & Physical Development (503)',
        grade: 'A',
        description: 'Terrific agility, balance, and cooperative play during outdoor games.',
      },
      {
        area: 'Discipline & Values (504)',
        grade: 'A',
        description: 'Polite, cheerful, and extraordinarily kind toward shy classmates.',
      },
    ],
  },
  {
    id: 'gc-sophie-autumn-2026',
    pupilId: 'child-sophie',
    pupilName: 'Sophie Davies',
    motherName: 'Mrs. Claire Davies',
    fatherName: 'Mr. Mark Davies',
    rollNumber: 'CBSE/2026/3018',
    registrationNumber: 'SCH/89427/26',
    admitCardId: 'DL301826',
    verificationCode: 'CBSE-VER-7721-SOP8',
    verificationStatus: 'VERIFIED_ACTIVE',
    verifiedAt: '14 Oct 2026, 12:00 UTC',
    schoolAffiliationNo: 'CBSE-AFF-2130094',
    schoolCode: 'SCH-70192',
    yearGroup: 'Class IV (Year 4)',
    classGroup: 'Section C (Ash)',
    academicYear: '2026 – 2027',
    term: 'CBSE Mid-Year Assessment & Progress Report',
    issuedDate: '14 October 2026',
    teacherName: 'Mr. Julian Thorne',
    headteacherName: 'Dr. Alistair Finch',
    attendancePercentage: 96.8,
    daysPresent: 60,
    daysTotal: 63,
    conductRating: 'Courteous & Sincere (Grade A)',
    overallAverage: 88.6,
    cgpa: 9.2,
    indicativePercentage: 87.4,
    overallGrade: 'A1 (Outstanding / Greater Depth)',
    overallBand: 'Greater Depth',
    resultStatus: 'PASSED',
    teacherGeneralRemarks:
      'Sophie displays diligent focus, creative eloquence in language subjects, and solid conceptual clarity in science. Commended for exemplary behavior.',
    targetAreas: [
      'Further cultivate speed in fraction operations and long division.',
      'Participate in inter-school debate and recitation competitions.',
    ],
    status: 'published',
    lastUpdated: '14 Oct 2026, 12:00',
    subjects: [
      {
        id: 'sub-sophie-math',
        subjectCode: '041',
        subject: 'Mathematics & Numeracy',
        category: 'Core',
        theoryMarks: 70,
        internalMarks: 18,
        marksObtained: 88,
        maxMarks: 100,
        grade: 'A2',
        gradePoint: 9.0,
        band: 'Greater Depth',
        effort: 'High Effort',
        teacherComment: 'Solid grasp of decimals and geometric properties.',
      },
      {
        id: 'sub-sophie-eng',
        subjectCode: '184',
        subject: 'English Language & Literature',
        category: 'Language',
        theoryMarks: 75,
        internalMarks: 19,
        marksObtained: 94,
        maxMarks: 100,
        grade: 'A1',
        gradePoint: 10.0,
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Captivating storytelling style and rich figurative language.',
      },
      {
        id: 'sub-sophie-sci',
        subjectCode: '086',
        subject: 'Science & Environmental Discovery',
        category: 'Core',
        theoryMarks: 71,
        internalMarks: 18,
        marksObtained: 89,
        maxMarks: 100,
        grade: 'A2',
        gradePoint: 9.0,
        band: 'Greater Depth',
        effort: 'High Effort',
        teacherComment: 'Excellent lab notebooks and keen ecological observations.',
      },
      {
        id: 'sub-sophie-sst',
        subjectCode: '087',
        subject: 'Social Science (Hist, Geog, Civics)',
        category: 'Core',
        theoryMarks: 67,
        internalMarks: 17,
        marksObtained: 84,
        maxMarks: 100,
        grade: 'A2',
        gradePoint: 9.0,
        band: 'Greater Depth',
        effort: 'High Effort',
        teacherComment: 'Engages with Indian historical movements and geographic formations.',
      },
      {
        id: 'sub-sophie-lang2',
        subjectCode: '085',
        subject: 'Second Language (Hindi Course B)',
        category: 'Language',
        theoryMarks: 69,
        internalMarks: 18,
        marksObtained: 87,
        maxMarks: 100,
        grade: 'A2',
        gradePoint: 9.0,
        band: 'Greater Depth',
        effort: 'High Effort',
        teacherComment: 'Very good vocabulary and expressive comprehension.',
      },
      {
        id: 'sub-sophie-comp',
        subjectCode: '165',
        subject: 'Computer Applications & Coding',
        category: 'Elective',
        theoryMarks: 72,
        internalMarks: 18,
        marksObtained: 90,
        maxMarks: 100,
        grade: 'A2',
        gradePoint: 9.0,
        band: 'Greater Depth',
        effort: 'High Effort',
        teacherComment: 'Skilful in multimedia tools, presentations, and algorithmic thinking.',
      },
    ],
    coScholastic: [
      {
        area: 'Work Education & Skills (501)',
        grade: 'A',
        description: 'Organised, inventive in craft and practical projects.',
      },
      {
        area: 'Art Education (502)',
        grade: 'A',
        description: 'Beautiful sketches, paper crafts, and vocal music.',
      },
      {
        area: 'Health & Physical Education (503)',
        grade: 'A',
        description: 'Active badminton player, excellent fitness and sports ethics.',
      },
      {
        area: 'Discipline (504)',
        grade: 'A',
        description: 'Always punctual, polite, and supportive of peers.',
      },
    ],
  },
];
