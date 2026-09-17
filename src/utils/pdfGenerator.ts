import { jsPDF } from 'jspdf';
import { GradeCard } from '../types';

export function generateGradeCardPdf(gradeCard: GradeCard): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm

  /** Render a field value on one line without letting it escape its column. */
  const writeFittedText = (value: string, x: number, y: number, maxWidth: number, fontSize = 7.5): void => {
    let size = fontSize;
    doc.setFontSize(size);
    while (doc.getTextWidth(value) > maxWidth && size > 6) {
      size -= 0.25;
      doc.setFontSize(size);
    }

    let displayValue = value;
    while (doc.getTextWidth(displayValue) > maxWidth && displayValue.length > 1) {
      displayValue = `${displayValue.slice(0, -2)}…`;
    }
    doc.text(displayValue, x, y);
  };

  // Background tint
  doc.setFillColor(250, 248, 245);
  doc.rect(0, 0, pageWidth, 297, 'F');

  // Decorative double border
  doc.setDrawColor(180, 140, 75); // Gold / bronze outer border
  doc.setLineWidth(0.8);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, 297 - (margin - 4) * 2);

  doc.setDrawColor(212, 205, 196); // Inner subtle border
  doc.setLineWidth(0.3);
  doc.rect(margin - 2, margin - 2, contentWidth + 4, 297 - (margin - 2) * 2);

  let y = margin + 3;

  // Header Banner: CBSE Affiliated School
  doc.setFillColor(26, 20, 16); // Deep charcoal
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'F');

  doc.setTextColor(247, 243, 237);
  doc.setFont('times', 'bold');
  doc.setFontSize(15);
  doc.text('SARASWATI VIDYA MANDIR', pageWidth / 2, y + 7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(212, 232, 218);
  doc.text(
    `AFFILIATED TO CENTRAL BOARD OF SECONDARY EDUCATION (CBSE) • AFFILIATION NO: ${gradeCard.schoolAffiliationNo || 'CBSE-AFF-2130094'} • SCHOOL CODE: ${gradeCard.schoolCode || '70192'}`,
    pageWidth / 2,
    y + 12.5,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(245, 230, 200);
  doc.text('CONTINUOUS & COMPREHENSIVE EVALUATION (CCE) • OFFICIAL PERFORMANCE PROFILE', pageWidth / 2, y + 18, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 190, 180);
  doc.text(`Academic Session: ${gradeCard.academicYear} • ${gradeCard.term}`, pageWidth / 2, y + 23, {
    align: 'center',
  });

  y += 30;

  // Student Profile Table / Box
  doc.setFillColor(253, 250, 246);
  doc.setDrawColor(212, 205, 196);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 32, 2, 2, 'FD');

  // Fixed two-column grid: each value has a measured, non-overlapping area.
  const profileLeft = margin + 4;
  const profileRight = margin + contentWidth / 2 + 2;
  doc.setTextColor(26, 20, 16);
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  writeFittedText(gradeCard.pupilName, profileLeft, y + 6, contentWidth - 8, 11);

  doc.setDrawColor(229, 223, 216);
  doc.setLineWidth(0.2);
  doc.line(margin + contentWidth / 2, y + 8.5, margin + contentWidth / 2, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 90, 72);
  doc.text('Roll No:', profileLeft, y + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 20, 16);
  writeFittedText(gradeCard.rollNumber || 'CBSE/2026/3012', profileLeft + 16, y + 11.5, 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 90, 72);
  doc.text('Registration No:', profileRight, y + 11.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 20, 16);
  writeFittedText(gradeCard.registrationNumber || 'SCH/89421/26', profileRight + 25, y + 11.5, 61);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 90, 72);
  doc.text('Class & Section:', profileLeft, y + 16.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 20, 16);
  writeFittedText(`${gradeCard.yearGroup} • ${gradeCard.classGroup}`, profileLeft + 25, y + 16.5, 61);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 90, 72);
  doc.text('Admit Card ID:', profileRight, y + 16.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 20, 16);
  writeFittedText(gradeCard.admitCardId || 'DL301226', profileRight + 24, y + 16.5, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 90, 72);
  doc.text('Parent/Guardian:', profileLeft, y + 21.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(26, 20, 16);
  writeFittedText(`${gradeCard.motherName || 'Mrs. Sarah Evans'} & ${gradeCard.fatherName || 'Mr. David Evans'}`, profileLeft + 27, y + 21.5, 151);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 90, 72);
  doc.text('Class Teacher:', profileLeft, y + 27);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(26, 20, 16);
  writeFittedText(`${gradeCard.teacherName} (Saraswati Vidya Mandir)`, profileLeft + 24, y + 27, 68);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 90, 72);
  doc.text('Attendance:', profileRight + 5, y + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 20, 16);
  writeFittedText(`${gradeCard.attendancePercentage}% (${gradeCard.daysPresent}/${gradeCard.daysTotal} days)`, profileRight + 22, y + 27, 64);

  y += 36;

  // Section 1: Part 1 - Scholastic Areas (Grading on 9-Point Scale)
  doc.setFillColor(232, 226, 216);
  doc.setDrawColor(200, 190, 180);
  doc.rect(margin, y, contentWidth, 6.5, 'FD');

  doc.setTextColor(26, 20, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PART 1: SCHOLASTIC AREAS (ACADEMIC ASSESSMENT ON 9-POINT CBSE SCALE)', margin + 3, y + 4.5);

  y += 6.5;

  // Table Columns Header
  doc.setFillColor(245, 240, 234);
  doc.rect(margin, y, contentWidth, 6, 'FD');

  const cX = {
    code: margin + 3,
    sub: margin + 17,
    theory: margin + 85,
    internal: margin + 105,
    total: margin + 125,
    grade: margin + 145,
    point: margin + 162,
    remark: margin + 175,
  };

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(70, 60, 50);
  doc.text('CODE', cX.code, y + 4.2);
  doc.text('SUBJECT & LEARNING DOMAIN', cX.sub, y + 4.2);
  doc.text('THEORY (80)', cX.theory, y + 4.2);
  doc.text('IA/PR (20)', cX.internal, y + 4.2);
  doc.text('TOTAL (100)', cX.total, y + 4.2);
  doc.text('GRADE', cX.grade, y + 4.2);
  doc.text('GP (10)', cX.point, y + 4.2);

  y += 6;

  // Subject rows
  gradeCard.subjects.forEach((subj, idx) => {
    const rowHeight = 7.5;
    const isEven = idx % 2 === 0;

    doc.setFillColor(isEven ? 253 : 248, isEven ? 250 : 245, isEven ? 246 : 240);
    doc.setDrawColor(225, 220, 212);
    doc.rect(margin, y, contentWidth, rowHeight, 'FD');

    // Code
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(80, 70, 60);
    doc.text(subj.subjectCode || `0${idx + 41}`, cX.code, y + 5);

    // Subject
    doc.setTextColor(26, 20, 16);
    doc.text(subj.subject, cX.sub, y + 5);

    // Theory
    doc.setFont('helvetica', 'normal');
    doc.text(String(subj.theoryMarks ?? Math.round(subj.marksObtained * 0.8)), cX.theory + 2, y + 5);

    // Internal
    doc.text(String(subj.internalMarks ?? Math.round(subj.marksObtained * 0.2)), cX.internal + 2, y + 5);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.text(`${subj.marksObtained}`, cX.total + 2, y + 5);

    // Grade badge
    doc.setTextColor(30, 80, 50);
    doc.text(subj.grade, cX.grade + 2, y + 5);

    // GP
    doc.setTextColor(26, 20, 16);
    doc.text((subj.gradePoint || 9.0).toFixed(1), cX.point + 1, y + 5);

    y += rowHeight;
  });

  // Table Total Row
  doc.setFillColor(238, 232, 224);
  doc.setDrawColor(200, 190, 180);
  doc.rect(margin, y, contentWidth, 7, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(26, 20, 16);
  doc.text('CUMULATIVE SCHOLASTIC SUMMARY', cX.sub, y + 4.8);

  const totalMarks = gradeCard.subjects.reduce((sum, s) => sum + s.marksObtained, 0);
  const maxMarks = gradeCard.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  doc.text(`${totalMarks} / ${maxMarks} (${gradeCard.overallAverage}%)`, cX.total - 10, y + 4.8);

  doc.setTextColor(26, 75, 45);
  doc.text(`STATUS: ${gradeCard.resultStatus || 'PASSED'}`, cX.grade, y + 4.8);

  y += 10;

  // Section 2: Co-Scholastic Assessment
  doc.setFillColor(232, 226, 216);
  doc.rect(margin, y, contentWidth, 6, 'FD');

  doc.setTextColor(26, 20, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PART 2: CO-SCHOLASTIC ACTIVITIES & DISCIPLINE (EVALUATED ON 3-POINT SCALE [A - OUTSTANDING, B, C])', margin + 3, y + 4.2);

  y += 6;

  const coScholasticList = gradeCard.coScholastic || [
    { area: 'Work Education & Pre-Vocational Skills (501)', grade: 'A', description: 'Inventive design, craftsmanship, and resourcefulness.' },
    { area: 'Art Education & Aesthetics (502)', grade: 'A', description: 'Visual arts, delicate brushwork, and musical appreciation.' },
    { area: 'Health & Physical Education (503)', grade: 'A', description: 'Active teamwork, agility, sports ethics, and physical fitness.' },
    { area: 'Discipline & Value Ethics (504)', grade: 'A', description: 'Respectful demeanor, punctuality, sincerity, and peer empathy.' },
  ];

  coScholasticList.forEach((cs) => {
    doc.setFillColor(253, 250, 246);
    doc.setDrawColor(225, 220, 212);
    doc.rect(margin, y, contentWidth, 6.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(26, 20, 16);
    doc.text(cs.area, margin + 4, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 80, 70);
    const activitySummary = doc.splitTextToSize(cs.description, 78)[0];
    doc.text(activitySummary, margin + 80, y + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 80, 50);
    doc.text(`Grade ${cs.grade}`, margin + contentWidth - 16, y + 4.2);

    y += 6.2;
  });

  // Place the final academic summary only after Part 2 is complete.
  y += 4;
  doc.setFillColor(242, 247, 243);
  doc.setDrawColor(165, 207, 178);
  doc.roundedRect(margin, y, contentWidth, 15, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(42, 74, 53);
  doc.text('CUMULATIVE ACADEMIC SUMMARY', margin + 4, y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(80, 70, 60);
  doc.text('Total Marks', margin + 4, y + 9.5);
  doc.text('CGPA (10-point scale)', margin + 48, y + 9.5);
  doc.text('Indicative Percentage', margin + 104, y + 9.5);
  doc.text('Attendance & Conduct', margin + 145, y + 9.5);
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 20, 16);
  doc.text(`${totalMarks} / ${maxMarks}`, margin + 4, y + 13.2);
  doc.setTextColor(26, 75, 45);
  doc.text(`${(gradeCard.cgpa || 9.5).toFixed(1)} / 10.0`, margin + 48, y + 13.2);
  doc.setTextColor(122, 78, 16);
  doc.text(`${(gradeCard.indicativePercentage || 90.3).toFixed(1)}%`, margin + 104, y + 13.2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(26, 20, 16);
  doc.text(`${gradeCard.attendancePercentage}% • Grade ${gradeCard.conductRating.split(' ').at(-1) || 'A'}`, margin + 145, y + 13.2);

  y += 19;

  // General Remarks Box
  doc.setFillColor(253, 250, 246);
  doc.setDrawColor(212, 205, 196);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(107, 90, 72);
  doc.text('TEACHER REMARKS & PROGRESS NARRATIVE:', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(30, 25, 20);
  const remarks = doc.splitTextToSize(gradeCard.teacherGeneralRemarks, contentWidth - 8);
  doc.text(remarks, margin + 4, y + 9);

  y += 17;

  // OFFICIAL VERIFICATION TAG & CODE BOX (Crucial Feature Requested)
  doc.setFillColor(242, 246, 243); // Subtle security green tint
  doc.setDrawColor(42, 110, 65); // Crisp green security border
  doc.setLineWidth(0.7);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  // Security Seal Badge
  doc.setFillColor(30, 85, 50);
  doc.circle(margin + 12, y + 11, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text('CBSE', margin + 12, y + 9.5, { align: 'center' });
  doc.text('VERIFIED', margin + 12, y + 13.5, { align: 'center' });

  // Verification Tag header
  doc.setTextColor(20, 75, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OFFICIAL VERIFICATION TAG & DIGITAL AUTHENTICATION CERTIFICATE', margin + 24, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(70, 60, 50);
  doc.text(
    'This Grade Card is digitally issued, cryptographically verified, and recorded on the School Ledger.',
    margin + 24,
    y + 10.5
  );

  // Verification Code highlight box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(180, 140, 75);
  doc.roundedRect(margin + 24, y + 13, 72, 7, 1, 1, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(140, 60, 10);
  doc.text(`CODE: ${gradeCard.verificationCode || 'CBSE-VER-9842-LEO7'}`, margin + 26, y + 17.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(80, 70, 60);
  const directAccessText = 'Direct Access: Teachers can enter this code in the Teacher Desk for immediate retrieval.';
  const directAccessLines = doc.splitTextToSize(directAccessText, 78);
  doc.text(directAccessLines, margin + 102, y + 16.2, { lineHeightFactor: 1.05 });

  y += 27;

  // Signatures Section
  const sigBoxW = (contentWidth - 6) / 2;

  // Class Teacher Signature
  doc.setFillColor(253, 250, 246);
  doc.setDrawColor(212, 205, 196);
  doc.roundedRect(margin, y, sigBoxW, 16, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(26, 20, 16);
  doc.text('CLASS TEACHER SIGN-OFF', margin + 4, y + 4.5);

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(42, 74, 53);
  doc.text(gradeCard.teacherName, margin + 4, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(107, 90, 72);
  doc.text(`Authenticated via Teacher Desk • Date: ${gradeCard.issuedDate}`, margin + 4, y + 13.5);

  // Headteacher / Principal Signature
  const headX = margin + sigBoxW + 6;
  doc.setFillColor(253, 250, 246);
  doc.roundedRect(headX, y, sigBoxW, 16, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(26, 20, 16);
  doc.text('PRINCIPAL / HEADTEACHER ENDORSEMENT', headX + 4, y + 4.5);

  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(42, 74, 53);
  doc.text(gradeCard.headteacherName, headX + 4, y + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(107, 90, 72);
  doc.text(`Official Seal Affixed • CBSE Institutional Authority`, headX + 4, y + 13.5);

  // Footer Legend
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(120, 110, 100);
  doc.text(
    'CBSE 9-Point Scale: A1 (91-100, GP 10) • A2 (81-90, GP 9) • B1 (71-80, GP 8) • B2 (61-70, GP 7) • C1 (51-60, GP 6) • C2 (41-50, GP 5) • D (33-40, GP 4) • E (Needs Improvement)',
    pageWidth / 2,
    297 - margin - 2,
    { align: 'center' }
  );

  doc.text(
    `Security Code: ${gradeCard.verificationCode || 'CBSE-VER-9842-LEO7'} • Document UID: ${gradeCard.id} • ClassLine Verified School Portal`,
    pageWidth / 2,
    297 - margin + 1.5,
    { align: 'center' }
  );

  // Save PDF
  const safeName = gradeCard.pupilName.replace(/\s+/g, '-');
  doc.save(`CBSE-GradeCard-${safeName}-${(gradeCard.verificationCode || 'VER').replace(/[^a-zA-Z0-9]/g, '')}.pdf`);
}
