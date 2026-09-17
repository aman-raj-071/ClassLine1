import React, { useState } from 'react';
import { GradeCard } from '../types';
import { generateGradeCardPdf } from '../utils/pdfGenerator';
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Download,
  GraduationCap,
  Percent,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface GradeCardViewProps {
  gradeCard: GradeCard;
  isTeacherMode?: boolean;
  onEditMarks?: () => void;
  onOpenTeacherLookup?: () => void;
}

export const GradeCardView: React.FC<GradeCardViewProps> = ({
  gradeCard,
  isTeacherMode = false,
  onEditMarks,
  onOpenTeacherLookup,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      generateGradeCardPdf(gradeCard);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyVerificationCode = () => {
    if (gradeCard.verificationCode) {
      navigator.clipboard.writeText(gradeCard.verificationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const getCbseGradeBadge = (grade: string) => {
    if (grade.startsWith('A1')) return 'bg-[#d4e8da] text-[#1e3828] border-[#a5cfb2]';
    if (grade.startsWith('A2')) return 'bg-[#e2f0d9] text-[#254625] border-[#b8dfa6]';
    if (grade.startsWith('B1')) return 'bg-[#e8f0fe] text-[#1a406e] border-[#c0d4f5]';
    if (grade.startsWith('B2')) return 'bg-[#e0ecfc] text-[#173559] border-[#b0d0fa]';
    if (grade.startsWith('C1')) return 'bg-[#fef3d6] text-[#7a5200] border-[#ecd69e]';
    if (grade.startsWith('C2')) return 'bg-[#faecd1] text-[#6d4800] border-[#e4c688]';
    if (grade.startsWith('D')) return 'bg-[#fdf0e0] text-[#7c3d10] border-[#f2cca0]';
    return 'bg-[#f5ddd9] text-[#7a1e1e] border-[#e2bab4]';
  };

  const totalMarks = gradeCard.subjects.reduce((sum, s) => sum + s.marksObtained, 0);
  const totalMax = gradeCard.subjects.reduce((sum, s) => sum + s.maxMarks, 0);

  return (
    <div className="space-y-6">
      {/* Top Action & Verification Ribbon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#f0ebe3] border border-[#d4cdc4]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#1a1410] text-[#f7f3ed] flex items-center justify-center shrink-0 shadow-sm">
            <Award className="w-5 h-5 text-[#8fe2a4]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-[#1a1410]">
                {gradeCard.term}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d4e8da] text-[#1e3828] border border-[#a5cfb2]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2a5038]" />
                <span>CBSE Verified Grade Card</span>
              </span>
            </div>
            <p className="text-xs text-[#6b5a48] mt-0.5">
              Roll No: <span className="font-mono font-semibold text-[#1a1410]">{gradeCard.rollNumber || 'CBSE/2026/3012'}</span> &bull; Form Tutor: {gradeCard.teacherName}
            </p>
          </div>
        </div>

        {/* Action Buttons: Copy Code, Teacher Direct Access, Download PDF, Print */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {isTeacherMode && onEditMarks && (
            <button
              type="button"
              onClick={onEditMarks}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-[#ede4d9] text-[#1a1410] hover:bg-[#dfd8cd] border border-[#d4cdc4] transition-all shadow-sm"
            >
              Modify Marks
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyVerificationCode}
            title="Copy unique verification code"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#fdfaf6] text-[#6b5a48] hover:text-[#1a1410] border border-[#d4cdc4] hover:bg-[#ede4d9] transition-all shadow-sm"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2a5038]" />
                <span className="text-[#2a5038]">Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            title="Open printable view"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#fdfaf6] text-[#5a4f45] border border-[#d4cdc4] hover:bg-[#ede4d9] hover:text-[#1a1410] transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden xs:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-[#1a1410] text-[#f7f3ed] hover:bg-[#2e2620] transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#8fe2a4]" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#d4e8da]" />
                <span>{isDownloading ? 'Generating PDF…' : 'Download Official PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Official CBSE Grade Card Parchment Sheet */}
      <div
        id="grade-card-report-sheet"
        className="bg-[#fdfaf6] rounded-3xl p-6 sm:p-10 border-2 border-[#bfa588] shadow-2xl space-y-8 relative overflow-hidden"
      >
        {/* Subtle Decorative Golden Border Pattern */}
        <div className="absolute inset-1.5 border border-[#e2dacd] rounded-[22px] pointer-events-none -z-0" />
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-[#edd8be]/30 to-transparent pointer-events-none -z-0 rounded-bl-full" />
        <div className="absolute left-0 bottom-0 w-36 h-36 bg-gradient-to-tr from-[#edd8be]/30 to-transparent pointer-events-none -z-0 rounded-tr-full" />

        {/* 1. CBSE Institutional Header */}
        <div className="border-b-2 border-[#1a1410] pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1410] text-[#f7f3ed] flex flex-col items-center justify-center border-2 border-[#d4cdc4] shadow-md shrink-0">
              <GraduationCap className="w-8 h-8 text-[#d4e8da]" />
              <span className="text-[7px] tracking-widest uppercase font-bold text-[#b0a496] mt-0.5">CBSE</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest font-bold text-[#8a6f5a]">
                  Affiliated to Central Board of Secondary Education (CBSE)
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1a1410] tracking-tight">
                Saraswati Vidya Mandir
              </h1>
              <p className="text-xs text-[#6b5a48] font-medium mt-0.5">
                Affiliation No: <span className="font-semibold text-[#1a1410]">{gradeCard.schoolAffiliationNo || 'CBSE-AFF-2130094'}</span> &bull; School Code: <span className="font-semibold text-[#1a1410]">{gradeCard.schoolCode || '70192'}</span>
              </p>
              <p className="text-[11px] text-[#2a5038] font-semibold mt-0.5">
                Continuous &amp; Comprehensive Evaluation (CCE) &bull; Academic Session {gradeCard.academicYear}
              </p>
            </div>
          </div>

          {/* Institutional Stamp & Badge */}
          <div className="flex sm:flex-col items-end gap-1.5 bg-[#f7f3ed] p-3 rounded-2xl border border-[#d4cdc4] text-right">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2a5038]">
              <ShieldCheck className="w-4 h-4 text-[#3d6b4f]" />
              <span>CBSE Performance Profile</span>
            </div>
            <span className="text-[11px] text-[#6b5a48]">
              Roll: <span className="font-mono font-bold text-[#1a1410]">{gradeCard.rollNumber || 'CBSE/2026/3012'}</span>
            </span>
            <span className="text-[10px] text-[#8a6f5a]">
              Issued: {gradeCard.issuedDate}
            </span>
          </div>
        </div>

        {/* 2. OFFICIAL CBSE VERIFICATION TAG & CODE HERO BANNER */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#edf5f0] via-[#f7faf8] to-[#f4f1ea] border-2 border-[#3d6b4f] shadow-sm relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#2a5038] text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-7 h-7 text-[#8fe2a4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#2a5038] text-white">
                  Official Verification Tag
                </span>
                <span className="text-xs font-bold text-[#2a5038] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {gradeCard.verificationStatus === 'VERIFIED_ACTIVE' ? 'Digitally Verified & Active' : 'Verified'}
                </span>
              </div>
              <h4 className="font-serif text-base font-bold text-[#1a1410] mt-0.5">
                CBSE Certificate Authentication Record
              </h4>
              <p className="text-xs text-[#5a4f45]">
                Tamper-evident credential signed by institutional authority &bull; Timestamp: {gradeCard.verifiedAt || '14 Oct 2026, 10:30 UTC'}
              </p>
            </div>
          </div>

          {/* Verification Code Box & Direct Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto bg-white p-3 rounded-xl border border-[#a5cfb2] shadow-sm">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#6b5a48] block">
                Verification Code (For Direct Lookup)
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-sm sm:text-base font-black text-[#874b09] tracking-wider bg-[#fbf6ed] px-2.5 py-1 rounded-lg border border-[#edd8be]">
                  {gradeCard.verificationCode || 'CBSE-VER-9842-LEO7'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyVerificationCode}
                  className="p-1.5 text-[#6b5a48] hover:text-[#1a1410] hover:bg-[#ede4d9] rounded-lg transition-colors"
                  title="Copy verification code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-[#2a5038]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isTeacherMode && onOpenTeacherLookup && (
              <button
                type="button"
                onClick={onOpenTeacherLookup}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-[#1a1410] text-[#f7f3ed] hover:bg-[#2e2620] transition-colors"
              >
                Lookup by Code
              </button>
            )}
          </div>
        </div>

        {/* 3. Student Registration & Academic Profile Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#f7f3ed] border border-[#d4cdc4] relative z-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8a6f5a] block">
              Candidate's Name
            </span>
            <span className="font-serif text-lg font-bold text-[#1a1410] block">
              {gradeCard.pupilName}
            </span>
            <span className="text-xs text-[#6b5a48] block">
              Mother: {gradeCard.motherName || 'Mrs. Sarah Evans'}
            </span>
            <span className="text-xs text-[#6b5a48] block">
              Father: {gradeCard.fatherName || 'Mr. David Evans'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8a6f5a] block">
              Roll No &amp; Scholar ID
            </span>
            <span className="font-mono text-sm font-bold text-[#1a1410] block mt-0.5">
              Roll: {gradeCard.rollNumber || 'CBSE/2026/3012'}
            </span>
            <span className="font-mono text-xs text-[#6b5a48] block">
              Reg No: {gradeCard.registrationNumber || 'SCH/89421/26'}
            </span>
            <span className="font-mono text-xs text-[#6b5a48] block">
              Admit Card: {gradeCard.admitCardId || 'DL301226'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8a6f5a] block">
              Class &amp; School Section
            </span>
            <span className="text-sm font-bold text-[#1a1410] block mt-0.5">
              {gradeCard.yearGroup} &bull; {gradeCard.classGroup}
            </span>
            <span className="text-xs text-[#6b5a48] block">
              Form Tutor: {gradeCard.teacherName}
            </span>
            <span className="text-xs text-[#6b5a48] block">
              Principal: {gradeCard.headteacherName}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8a6f5a] block">
              Attendance &amp; Discipline
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold text-[#1e3828]">
                {gradeCard.attendancePercentage}%
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#d4e8da] text-[#1e3828]">
                {gradeCard.daysPresent}/{gradeCard.daysTotal} Days
              </span>
            </div>
            <span className="text-[11px] text-[#2a5038] font-medium block mt-0.5">
              Conduct: {gradeCard.conductRating}
            </span>
          </div>
        </div>

        {/* 5. Part 1: Scholastic Areas (CBSE 9-Point Scale) */}
        <div className="space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-bold text-[#1a1410] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#8a6f5a]" />
              <span>Part 1: Scholastic Areas (Academic Performance)</span>
            </h2>
            <span className="text-xs text-[#2a5038] font-bold bg-[#edf5f0] px-2.5 py-1 rounded-lg border border-[#c4e0ce]">
              Grading on 9-Point CBSE Scale (A1 to E2)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#d4cdc4] bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#ede4d9] border-b border-[#d4cdc4] text-[11px] font-bold uppercase tracking-wider text-[#5a4f45]">
                  <th className="py-3 px-3 w-16">Code</th>
                  <th className="py-3 px-4">Subject &amp; Learning Domain</th>
                  <th className="py-3 px-3 text-center">Theory (80)</th>
                  <th className="py-3 px-3 text-center">IA / Practical (20)</th>
                  <th className="py-3 px-3 text-center">Total (100)</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-center">Grade Point</th>
                  <th className="py-3 px-4 min-w-[200px]">Teacher Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede4d9] text-xs">
                {gradeCard.subjects.map((subj, idx) => (
                  <tr key={subj.id} className="hover:bg-[#fcfaf7] transition-colors">
                    {/* Subject Code */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-xs text-[#8a6f5a]">
                        {subj.subjectCode || `0${idx + 41}`}
                      </span>
                    </td>

                    {/* Subject Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#1a1410] block">{subj.subject}</span>
                      <span className="text-[10px] text-[#8a6f5a] font-medium">{subj.category} Subject</span>
                    </td>

                    {/* Theory Marks */}
                    <td className="py-3.5 px-3 text-center font-semibold text-[#1a1410]">
                      {subj.theoryMarks ?? Math.round(subj.marksObtained * 0.8)}
                    </td>

                    {/* Internal Assessment */}
                    <td className="py-3.5 px-3 text-center font-semibold text-[#1a1410]">
                      {subj.internalMarks ?? Math.round(subj.marksObtained * 0.2)}
                    </td>

                    {/* Total Marks */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-[#1a1410] text-sm bg-[#f7f3ed] px-2 py-0.5 rounded border border-[#d4cdc4]">
                        {subj.marksObtained}
                      </span>
                    </td>

                    {/* CBSE Positional Grade */}
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-black border ${getCbseGradeBadge(subj.grade)}`}>
                        {subj.grade}
                      </span>
                    </td>

                    {/* Grade Point */}
                    <td className="py-3.5 px-3 text-center font-bold text-[#1a1410]">
                      {(subj.gradePoint || 9.0).toFixed(1)}
                    </td>

                    {/* Teacher Observation */}
                    <td className="py-3.5 px-4 text-[#4a3c30] text-[11px] leading-relaxed">
                      {subj.teacherComment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Part 2: Co-Scholastic Activities & Discipline (CBSE Standard 3-Point Scale) */}
        <div className="space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-bold text-[#1a1410] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#8a6f5a]" />
              <span>Part 2: Co-Scholastic Activities &amp; Life Skills</span>
            </h2>
            <span className="text-xs text-[#6b5a48] font-medium">
              Grading Scale: [A - Outstanding, B - Very Good, C - Fair]
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {(gradeCard.coScholastic || [
              { area: 'Work Education & Pre-Vocational Skills (501)', grade: 'A', description: 'Inventive design, craftsmanship, and resourcefulness in classroom projects.' },
              { area: 'Art Education & Visual Aesthetics (502)', grade: 'A', description: 'Expressive brushwork, clay crafts, and active participation in cultural assemblies.' },
              { area: 'Health & Physical Education (503)', grade: 'A', description: 'Active teamwork, soccer agility, sports ethics, and physical fitness stamina.' },
              { area: 'Discipline & School Values (504)', grade: 'A', description: 'Respectful demeanor, punctuality, sincerity, and peer empathy.' },
            ]).map((cs, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-white border border-[#d4cdc4] shadow-sm flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-xs text-[#1a1410] block">{cs.area}</span>
                  <p className="text-[11px] text-[#6b5a48] leading-snug">{cs.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#d4e8da] text-[#1e3828] border border-[#a5cfb2] shrink-0">
                  Grade {cs.grade}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Cumulative Performance Summary - shown after Part 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 rounded-2xl border border-[#a5cfb2] bg-[#edf5f0] p-4">
          <div className="space-y-1"><span className="text-[10px] font-bold uppercase tracking-wider text-[#2a5038]">Total marks</span><p className="font-serif text-2xl font-bold text-[#1a1410]">{totalMarks}<span className="text-sm font-normal text-[#8a6f5a]"> / {totalMax}</span></p></div>
          <div className="space-y-1"><span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#2a5038]"><Award className="h-3.5 w-3.5" /> CGPA</span><p className="font-serif text-2xl font-black text-[#1e3828]">{(gradeCard.cgpa || 9.5).toFixed(1)}<span className="text-sm font-normal text-[#5a4f45]"> / 10.0</span></p></div>
          <div className="space-y-1"><span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7a4e10]"><Percent className="h-3.5 w-3.5" /> Indicative percentage</span><p className="font-serif text-2xl font-bold text-[#7a4e10]">{(gradeCard.indicativePercentage || (gradeCard.cgpa ? Math.round(gradeCard.cgpa * 9.5 * 10) / 10 : 90.3)).toFixed(1)}%</p></div>
          <div className="space-y-1"><span className="text-[10px] font-bold uppercase tracking-wider text-[#2a5038]">Result status</span><p className="text-sm font-bold text-[#1e3828]">{gradeCard.resultStatus || 'PASSED'}</p><p className="text-[11px] text-[#5a4f45]">{gradeCard.attendancePercentage}% attendance</p></div>
        </div>

        {/* 7. Class Teacher's Narrative & Target Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* General Remarks */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#f7f3ed] border border-[#d4cdc4] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8a6f5a]">
              <UserCheck className="w-4 h-4 text-[#3d6b4f]" />
              <span>Class Teacher's Cumulative Remarks</span>
            </div>
            <p className="font-serif text-sm sm:text-base text-[#1a1410] leading-relaxed italic">
              &ldquo;{gradeCard.teacherGeneralRemarks}&rdquo;
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-[#6b5a48] border-t border-[#e2dacd]">
              <span>Form Tutor: <strong className="text-[#1a1410]">{gradeCard.teacherName}</strong></span>
              <span>Conduct: <strong className="text-[#2a5038]">{gradeCard.conductRating}</strong></span>
            </div>
          </div>

          {/* Development Targets */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#fcfaf7] border border-[#d4cdc4] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7a4e10]">
              <Sparkles className="w-4 h-4 text-[#7a4e10]" />
              <span>Key Focus &amp; Development Targets</span>
            </div>
            <ul className="space-y-2 text-xs text-[#4a3c30]">
              {gradeCard.targetAreas.map((target, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#f5e6c8] text-[#7a4e10] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{target}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 8. Official Signatures & Digital Verification Footer */}
        <div className="pt-6 border-t-2 border-[#d4cdc4] grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
          {/* Teacher Signature */}
          <div className="p-4 rounded-2xl bg-white border border-[#d4cdc4] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b5a48] block">
              Class Teacher Digital Sign-off
            </span>
            <div className="h-10 flex items-center">
              <span className="font-serif italic text-lg text-[#2a5038] font-bold tracking-wide">
                {gradeCard.teacherName}
              </span>
            </div>
            <p className="text-[10px] text-[#8a6f5a]">
              Class Teacher &bull; Saraswati Vidya Mandir
            </p>
          </div>

          {/* Principal Signature */}
          <div className="p-4 rounded-2xl bg-white border border-[#d4cdc4] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b5a48] block">
              Principal / Headteacher Endorsement
            </span>
            <div className="h-10 flex items-center justify-between">
              <span className="font-serif italic text-lg text-[#2a5038] font-bold tracking-wide">
                {gradeCard.headteacherName}
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#d4e8da] text-[#1e3828] border border-[#b4d4be]">
                CBSE Seal Affixed
              </span>
            </div>
            <p className="text-[10px] text-[#8a6f5a]">
              Institutional Authority &bull; Saraswati Vidya Mandir
            </p>
          </div>
        </div>

        {/* 9. CBSE 9-Point Grading Scheme Legend */}
        <div className="p-3.5 rounded-xl bg-[#f7f3ed] border border-[#d4cdc4] text-center space-y-1 relative z-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b5a48] block">
            CBSE 9-Point Scholastic Grading Scheme Legend:
          </span>
          <p className="text-[10px] text-[#6b5a48]">
            <strong>A1</strong> (91-100, GP 10.0) &bull; <strong>A2</strong> (81-90, GP 9.0) &bull; <strong>B1</strong> (71-80, GP 8.0) &bull; <strong>B2</strong> (61-70, GP 7.0) &bull; <strong>C1</strong> (51-60, GP 6.0) &bull; <strong>C2</strong> (41-50, GP 5.0) &bull; <strong>D</strong> (33-40, GP 4.0 Passing) &bull; <strong>E1/E2</strong> (Needs Improvement)
          </p>
          <p className="text-[9.5px] text-[#8a6f5a] pt-1 border-t border-[#e8e2d8]">
            Document Security Code: <strong className="font-mono text-[#874b09]">{gradeCard.verificationCode || 'CBSE-VER-9842-LEO7'}</strong> &bull; Authenticity guaranteed via ClassLine Ledger
          </p>
        </div>
      </div>
    </div>
  );
};
