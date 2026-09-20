export type GradeNote = {
  id: string;
  title: string;
  grade: string;
  subject: string;
  description: string;
  resourceUrl: string;
  resourceType: 'pdf' | 'link';
  fileName: string;
  visibility: 'public' | 'registered';
  uploadedBy: string;
  uploadedAt: string;
};

export const GRADE_NOTES_STORAGE_KEY = 'classline_grade_notes';

export const DEMO_GRADE_NOTES: GradeNote[] = [
  { id: 'demo-maths-iii', title: 'Mathematics Revision Notes', grade: 'Class III A', subject: 'Mathematics', description: 'Number work, fractions and time.', resourceUrl: '/demo-notes/class-iii-mathematics.html', resourceType: 'link', fileName: 'Class III Mathematics Revision', visibility: 'public', uploadedBy: 'Aman Raj', uploadedAt: 'Demo resource' },
  { id: 'demo-science-iii', title: 'Science Revision Notes', grade: 'Class III A', subject: 'Science', description: 'Plants, animals, materials and health.', resourceUrl: '/demo-notes/class-iii-science.html', resourceType: 'link', fileName: 'Class III Science Revision', visibility: 'public', uploadedBy: 'Aman Raj', uploadedAt: 'Demo resource' },
  { id: 'demo-english-iii', title: 'English Revision Notes', grade: 'Class III A', subject: 'English', description: 'Grammar, punctuation and reading.', resourceUrl: '/demo-notes/class-iii-english.html', resourceType: 'link', fileName: 'Class III English Revision', visibility: 'public', uploadedBy: 'Aman Raj', uploadedAt: 'Demo resource' },
  { id: 'demo-hindi-iii', title: 'Hindi Revision Notes', grade: 'Class III A', subject: 'Hindi', description: 'वर्णमाला, मात्राएँ और वाक्य निर्माण।', resourceUrl: '/demo-notes/class-iii-hindi.html', resourceType: 'link', fileName: 'Class III Hindi Revision', visibility: 'public', uploadedBy: 'Aman Raj', uploadedAt: 'Demo resource' },
];

export function getGradeNotes(): GradeNote[] {
  try {
    const saved = localStorage.getItem(GRADE_NOTES_STORAGE_KEY);
    const notes = saved ? JSON.parse(saved) as GradeNote[] : [];
    return notes.length ? notes : DEMO_GRADE_NOTES;
  } catch {
    return DEMO_GRADE_NOTES;
  }
}

export function saveGradeNotes(notes: GradeNote[]) {
  localStorage.setItem(GRADE_NOTES_STORAGE_KEY, JSON.stringify(notes));
}
