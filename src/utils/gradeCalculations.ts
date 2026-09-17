import { CoScholasticGrade, GradeCard, PerformanceBand, SubjectGrade } from '../types';

/**
 * CBSE 9-Point Grading Scale Matrix:
 * 91 - 100 : A1 (GP 10.0) - Top 1/8th of passed candidates / Outstanding
 * 81 - 90  : A2 (GP 9.0)  - Next 1/8th / Excellent
 * 71 - 80  : B1 (GP 8.0)  - Next 1/8th / Very Good
 * 61 - 70  : B2 (GP 7.0)  - Next 1/8th / Good
 * 51 - 60  : C1 (GP 6.0)  - Next 1/8th / Fair
 * 41 - 50  : C2 (GP 5.0)  - Next 1/8th / Average
 * 33 - 40  : D  (GP 4.0)  - Marginal / Minimum Passing
 * 21 - 32  : E1 (GP 0.0)  - Essential Repeat / Compartment
 * 00 - 20  : E2 (GP 0.0)  - Essential Repeat
 */
export function calculateGradeAndBand(marks: number, maxMarks: number = 100): {
  percentage: number;
  grade: string;
  gradePoint: number;
  band: PerformanceBand;
} {
  const percentage = Math.round((marks / maxMarks) * 100);
  if (percentage >= 91) {
    return { percentage, grade: 'A1', gradePoint: 10.0, band: 'Greater Depth' };
  } else if (percentage >= 81) {
    return { percentage, grade: 'A2', gradePoint: 9.0, band: 'Greater Depth' };
  } else if (percentage >= 71) {
    return { percentage, grade: 'B1', gradePoint: 8.0, band: 'Expected Standard' };
  } else if (percentage >= 61) {
    return { percentage, grade: 'B2', gradePoint: 7.0, band: 'Expected Standard' };
  } else if (percentage >= 51) {
    return { percentage, grade: 'C1', gradePoint: 6.0, band: 'Working Towards' };
  } else if (percentage >= 41) {
    return { percentage, grade: 'C2', gradePoint: 5.0, band: 'Working Towards' };
  } else if (percentage >= 33) {
    return { percentage, grade: 'D', gradePoint: 4.0, band: 'Foundational' };
  } else if (percentage >= 21) {
    return { percentage, grade: 'E1', gradePoint: 0.0, band: 'Foundational' };
  } else {
    return { percentage, grade: 'E2', gradePoint: 0.0, band: 'Foundational' };
  }
}

/**
 * CBSE Cumulative Grade Point Average (CGPA) and Indicative Percentage:
 * CGPA = Sum of Grade Points of 5 Main Subjects / 5 (or total scholastic subjects)
 * Indicative Percentage = CGPA * 9.5 (Official CBSE Formula)
 */
export function computeGradeCardSummary(subjects: SubjectGrade[]): {
  overallAverage: number;
  cgpa: number;
  indicativePercentage: number;
  overallGrade: string;
  overallBand: PerformanceBand;
  resultStatus: 'PASSED' | 'QUALIFIED' | 'COMPARTMENT' | 'ESSENTIAL REPEAT';
  totalMarksObtained: number;
  totalMaxMarks: number;
} {
  if (!subjects.length) {
    return {
      overallAverage: 0,
      cgpa: 0,
      indicativePercentage: 0,
      overallGrade: 'N/A',
      overallBand: 'Working Towards',
      resultStatus: 'PASSED',
      totalMarksObtained: 0,
      totalMaxMarks: 0,
    };
  }

  const totalMarksObtained = subjects.reduce((sum, s) => sum + s.marksObtained, 0);
  const totalMaxMarks = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  const averagePct = Math.round((totalMarksObtained / totalMaxMarks) * 1000) / 10;

  // Compute CGPA
  const totalGradePoints = subjects.reduce((sum, s) => sum + (s.gradePoint || 0), 0);
  const rawCgpa = totalGradePoints / subjects.length;
  const cgpa = Math.round(rawCgpa * 10) / 10; // e.g. 9.2

  // Official CBSE formula for equivalent percentage: CGPA * 9.5
  const indicativePercentage = Math.round(cgpa * 9.5 * 10) / 10;

  let overallGrade = 'B1 (Very Good)';
  let overallBand: PerformanceBand = 'Expected Standard';
  let resultStatus: 'PASSED' | 'QUALIFIED' | 'COMPARTMENT' | 'ESSENTIAL REPEAT' = 'PASSED';

  const hasFailingSubject = subjects.some((s) => s.marksObtained < 33);
  if (hasFailingSubject) {
    resultStatus = 'COMPARTMENT';
  } else {
    resultStatus = 'PASSED';
  }

  if (cgpa >= 9.1) {
    overallGrade = 'A1 (Outstanding / Exemplary)';
    overallBand = 'Greater Depth';
  } else if (cgpa >= 8.1) {
    overallGrade = 'A2 (Distinction / Greater Depth)';
    overallBand = 'Greater Depth';
  } else if (cgpa >= 7.1) {
    overallGrade = 'B1 (Very Good / Expected Standard)';
    overallBand = 'Expected Standard';
  } else if (cgpa >= 6.1) {
    overallGrade = 'B2 (Good / Expected Standard)';
    overallBand = 'Expected Standard';
  } else if (cgpa >= 5.1) {
    overallGrade = 'C1 (Fair / Working Towards)';
    overallBand = 'Working Towards';
  } else if (cgpa >= 4.1) {
    overallGrade = 'C2 (Average)';
    overallBand = 'Working Towards';
  } else {
    overallGrade = 'D (Marginal Pass)';
    overallBand = 'Foundational';
  }

  return {
    overallAverage: averagePct,
    cgpa,
    indicativePercentage,
    overallGrade,
    overallBand,
    resultStatus,
    totalMarksObtained,
    totalMaxMarks,
  };
}

/** Create a consistent overall form-tutor narrative from the calculated CGPA. */
export function generateCgpaTeacherNarrative(pupilName: string, cgpa: number, resultStatus: string): string {
  const firstName = pupilName.split(' ')[0] || 'The pupil';
  if (resultStatus === 'COMPARTMENT') return `${firstName} requires focused support in one or more core areas. A structured revision plan, regular practice, and home-school follow-up will help build confidence for the next assessment.`;
  if (cgpa >= 9.1) return `${firstName} has demonstrated exceptional academic discipline, intellectual curiosity, and consistently outstanding attainment across subjects. Continue extending independent enquiry and higher-order thinking.`;
  if (cgpa >= 8.1) return `${firstName} has achieved a strong distinction-level performance with secure understanding across the curriculum. Continued challenge and careful attention to detail will support further excellence.`;
  if (cgpa >= 7.1) return `${firstName} has made very good progress and meets the expected standard confidently. Regular independent practice will help convert secure understanding into consistently higher attainment.`;
  if (cgpa >= 6.1) return `${firstName} has shown good progress and a sound grasp of key learning objectives. Focused revision and active participation will strengthen confidence across all subjects.`;
  if (cgpa >= 5.1) return `${firstName} is developing steadily and benefits from regular guided practice. Consistent completion of classwork and home learning will help reinforce essential skills.`;
  return `${firstName} needs sustained support to strengthen foundational learning. A simple, regular practice routine and close home-school partnership are recommended for the next term.`;
}

/**
 * Generate a standard CBSE Verification Code and Roll Number for any pupil
 */
export function generateVerificationCode(pupilId: string, pupilName: string, issuanceToken: string = ''): string {
  const cleanId = pupilId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const initials = pupilName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  // Deterministic for the initial card, with an optional issuance token when
  // a school officer reissues a fresh verification code.
  let hash = 0;
  const hashSource = `${pupilId}:${issuanceToken}`;
  for (let i = 0; i < hashSource.length; i++) {
    hash = (hash << 5) - hash + hashSource.charCodeAt(i);
    hash |= 0;
  }
  const positiveCode = Math.abs(hash % 9000) + 1000;

  return `CBSE-VER-${positiveCode}-${initials}${cleanId.slice(-2)}`;
}

export const DEFAULT_CO_SCHOLASTIC: CoScholasticGrade[] = [
  {
    area: 'Work Education & Pre-Vocational Skills (501)',
    grade: 'A',
    description: 'Demonstrates outstanding creative problem-solving, craftsmanship, and practical resourcefulness.',
  },
  {
    area: 'Art Education & Visual Expression (502)',
    grade: 'A',
    description: 'Displays superb aesthetic perception, colour harmony, and active participation in cultural showcases.',
  },
  {
    area: 'Health & Physical Education (Sports, Games & Yoga) (503)',
    grade: 'A',
    description: 'Maintains high physical stamina, motor coordination, exemplary sportsmanship, and personal hygiene.',
  },
  {
    area: 'Discipline & School Values (504)',
    grade: 'A',
    description: 'Consistently displays respectful behaviour, punctuality, sincerity, and obedience toward school regulations.',
  },
];

export function createDefaultGradeCardForPupil(
  pupilId: string,
  pupilName: string,
  className: string = 'Oak',
  yearGroup: string = 'Year 3 (Class III)',
  teacherName: string = 'Aman Raj'
): GradeCard {
  // CBSE Scholastic Assessment subjects with Subject Codes & Theory/Internal split
  const defaultSubjects: SubjectGrade[] = [
    {
      id: `sub-eng-${pupilId}`,
      subjectCode: '184',
      subject: 'English Language & Literature',
      category: 'Language',
      theoryMarks: 72,
      internalMarks: 18,
      marksObtained: 90,
      maxMarks: 100,
      grade: 'A2',
      gradePoint: 9.0,
      band: 'Greater Depth',
      effort: 'Outstanding',
      teacherComment: 'Superb expressive fluency in communicative English, rich vocabulary, and sound comprehension.',
    },
    {
      id: `sub-math-${pupilId}`,
      subjectCode: '041',
      subject: 'Mathematics & Logical Reasoning',
      category: 'Core',
      theoryMarks: 76,
      internalMarks: 19,
      marksObtained: 95,
      maxMarks: 100,
      grade: 'A1',
      gradePoint: 10.0,
      band: 'Greater Depth',
      effort: 'Outstanding',
      teacherComment: 'Exceptional computational speed, geometrical clarity, and rapid multi-step problem solving.',
    },
    {
      id: `sub-sci-${pupilId}`,
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
      teacherComment: 'Enthusiastic experimental enquiry; logs hypothesis, observations, and inferences systematically.',
    },
    {
      id: `sub-sst-${pupilId}`,
      subjectCode: '087',
      subject: 'Social Science (Hist, Geog, Civics)',
      category: 'Core',
      theoryMarks: 68,
      internalMarks: 18,
      marksObtained: 86,
      maxMarks: 100,
      grade: 'A2',
      gradePoint: 9.0,
      band: 'Greater Depth',
      effort: 'High Effort',
      teacherComment: 'Good grasp of Indian heritage, democratic values, and regional topography and map skills.',
    },
    {
      id: `sub-lang2-${pupilId}`,
      subjectCode: '085',
      subject: 'Second Language (Hindi Course B)',
      category: 'Language',
      theoryMarks: 70,
      internalMarks: 18,
      marksObtained: 88,
      maxMarks: 100,
      grade: 'A2',
      gradePoint: 9.0,
      band: 'Greater Depth',
      effort: 'High Effort',
      teacherComment: 'Reads Devnagari script with accurate pronunciation and composes concise creative paragraphs.',
    },
    {
      id: `sub-comp-${pupilId}`,
      subjectCode: '165',
      subject: 'Computer Applications & Coding Foundations',
      category: 'Elective',
      theoryMarks: 74,
      internalMarks: 20,
      marksObtained: 94,
      maxMarks: 100,
      grade: 'A1',
      gradePoint: 10.0,
      band: 'Greater Depth',
      effort: 'Outstanding',
      teacherComment: 'Excellent command of block-based logic, algorithm sequencing, and keyboard navigation.',
    },
  ];

  const summary = computeGradeCardSummary(defaultSubjects);
  const verCode = generateVerificationCode(pupilId, pupilName);

  // Clean numeric roll number
  let rollNum = 3012;
  if (pupilId.includes('maya')) rollNum = 3014;
  else if (pupilId.includes('sophie')) rollNum = 3018;

  return {
    id: `gc-${pupilId}-cbse-2026`,
    pupilId,
    pupilName,
    motherName: 'Mrs. Sarah Evans',
    fatherName: 'Mr. David Evans',
    rollNumber: `CBSE/2026/${rollNum}`,
    registrationNumber: `SCH/${rollNum + 86000}/26`,
    admitCardId: `DL${rollNum}26`,
    verificationCode: verCode,
    verificationStatus: 'VERIFIED_ACTIVE',
    verifiedAt: '14 Oct 2026, 10:30 UTC',
    schoolAffiliationNo: 'CBSE-AFF-2130094',
    schoolCode: 'SCH-70192',
    yearGroup,
    classGroup: className,
    academicYear: '2026 – 2027',
    term: 'CBSE Mid-Year Assessment & Progress Card',
    issuedDate: '14 October 2026',
    teacherName,
    headteacherName: 'Dr. Alistair Finch',
    attendancePercentage: 97.8,
    daysPresent: 61,
    daysTotal: 63,
    conductRating: 'Exemplary & Diligent',
    subjects: defaultSubjects,
    coScholastic: DEFAULT_CO_SCHOLASTIC,
    overallAverage: summary.overallAverage,
    cgpa: summary.cgpa,
    indicativePercentage: summary.indicativePercentage,
    overallGrade: summary.overallGrade,
    overallBand: summary.overallBand,
    resultStatus: summary.resultStatus,
    teacherGeneralRemarks: `${pupilName} has demonstrated admirable academic discipline and intellectual curiosity across all scholastic subjects. Conforms outstandingly to CBSE continuous and comprehensive evaluation standards.`,
    targetAreas: [
      'Further enhance multi-digit mental computation and algebraic reasoning.',
      'Refine advanced grammatical conjunctions in descriptive Hindi and English writing.',
    ],
    status: 'published',
    lastUpdated: '14 Oct 2026, 14:30',
  };
}
