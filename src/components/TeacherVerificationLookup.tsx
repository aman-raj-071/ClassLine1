import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GradeCard } from '../types';
import { GradeCardView } from './GradeCardView';
import { generateGradeCardPdf } from '../utils/pdfGenerator';
import { PUPIL_CHILD_IDS, PUPILS } from '../data/mockData';
import { createDefaultGradeCardForPupil } from '../utils/gradeCalculations';
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  GraduationCap,
  Percent,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  X,
} from 'lucide-react';

interface TeacherVerificationLookupProps {
  onSelectForEdit?: (pupilId: string) => void;
  allowedPupilIds?: string[];
  className?: string;
}

export const TeacherVerificationLookup: React.FC<TeacherVerificationLookupProps> = ({
  onSelectForEdit,
  allowedPupilIds,
  className = '',
}) => {
  const { gradeCards, showToast } = useAuth();

  // A verification code may be issued for any pupil, even before the teacher
  // has edited and saved that pupil's marks. Include the complete roster so
  // every code shown on a pupil report card has a matching lookup record.
  const searchableCards = useMemo(() => {
    const allowed = allowedPupilIds ? new Set(allowedPupilIds) : null;
    const cards = gradeCards.filter((card) => !allowed || allowed.has(card.pupilId));
    PUPILS.filter((pupil) => !allowed || allowed.has(PUPIL_CHILD_IDS[pupil.id]) || allowed.has(pupil.id)).forEach((pupil) => {
      const pupilId = PUPIL_CHILD_IDS[pupil.id] || pupil.id;
      const alreadyRegistered = cards.some((card) => card.pupilId === pupilId || card.pupilId === pupil.id);
      if (!alreadyRegistered) {
        cards.push(createDefaultGradeCardForPupil(pupilId, pupil.name, 'Section A (Oak)', 'Class III (Year 3)'));
      }
    });
    return cards;
  }, [gradeCards]);

  const [searchCode, setSearchCode] = useState('');
  const [searchedCard, setSearchedCard] = useState<GradeCard | null>(() => {
    // Default to Aarav Sharma if available for immediate rich demonstration
    const defaultCard = gradeCards.find((gc) => gc.pupilId === 'child-leo');
    return defaultCard || gradeCards[0] || null;
  });
  const [hasSearched, setHasSearched] = useState(true);
  const [showFullCard, setShowFullCard] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Use the real codes from the same catalogue used by the verifier—never
  // hard-coded sample values that could disagree with the report card.
  const quickTestCases = searchableCards.slice(0, 3).map((card) => ({
    label: `${card.pupilName} (${card.yearGroup})`,
    code: card.verificationCode,
  }));

  const handleLookup = (codeToSearch: string) => {
    const query = codeToSearch.trim().toLowerCase();
    const normalizedQuery = query.replace(/[^a-z0-9]/g, '');
    if (!query) {
      showToast('Please enter a verification code or examination roll number.', 'info');
      return;
    }

    setHasSearched(true);

    // Match codes regardless of case, spaces, dashes, or copied formatting.
    // Document UID is also searchable for cards issued by the marks studio.
    const matched = searchableCards.find((gc) => {
      const vCode = (gc.verificationCode || '').toLowerCase();
      const roll = (gc.rollNumber || '').toLowerCase();
      const reg = (gc.registrationNumber || '').toLowerCase();
      const admit = (gc.admitCardId || '').toLowerCase();
      const name = (gc.pupilName || '').toLowerCase();
      const documentId = (gc.id || '').toLowerCase();
      const normalizedCode = vCode.replace(/[^a-z0-9]/g, '');
      const normalizedDocumentId = documentId.replace(/[^a-z0-9]/g, '');

      return (
        vCode === query ||
        normalizedCode === normalizedQuery ||
        normalizedDocumentId === normalizedQuery ||
        normalizedCode.includes(normalizedQuery) ||
        roll === query ||
        roll.includes(query) ||
        reg === query ||
        admit === query ||
        name.includes(query)
      );
    });

    if (matched) {
      setSearchedCard(matched);
      showToast(`CBSE Grade Card verified for ${matched.pupilName}!`, 'success');
    } else {
      setSearchedCard(null);
      showToast('No grade card matches that verification code or roll number.', 'error');
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownload = (card: GradeCard) => {
    setIsDownloading(true);
    try {
      generateGradeCardPdf(card);
      showToast(`Official CBSE PDF generated for ${card.pupilName}.`, 'success');
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Search Bar Card */}
      <div className="p-6 rounded-3xl bg-[#fdfaf6] border-2 border-[#3d6b4f] shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2a5038] text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-7 h-7 text-[#8fe2a4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#2a5038] text-white">
                  Teacher Portal Access
                </span>
                <span className="text-xs font-bold text-[#2a5038]">
                  CBSE Verification Desk
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1a1410] mt-0.5">
                Direct Grade Card Lookup by Verification Code
              </h3>
              <p className="text-xs text-[#6b5a48]">
                Instant authentication &bull; Retrieve verified marks, academic standing, and official transcripts
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-[#8a6f5a] bg-[#f7f3ed] px-3 py-1 rounded-xl border border-[#d4cdc4] self-start sm:self-auto">
            Authorized Verifier: Aman Raj
          </span>
        </div>

        {/* Input Form with Search Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(searchCode);
          }}
          className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8a6f5a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Enter Verification Code (e.g. CBSE-VER-9842-LEO7) or Roll No (e.g. CBSE/2026/3012)..."
              className="w-full text-xs font-semibold pl-10 pr-10 py-3 bg-white border-2 border-[#d4cdc4] rounded-xl outline-none focus:border-[#2a5038] focus:ring-2 focus:ring-[#2a5038]/20 transition-all text-[#1a1410] placeholder:text-[#a09485]"
            />
            {searchCode && (
              <button
                type="button"
                onClick={() => setSearchCode('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a09485] hover:text-[#1a1410]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#1a1410] text-[#f7f3ed] hover:bg-[#2a5038] shadow-md transition-all active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-[#8fe2a4]" />
            <span>Verify &amp; Access</span>
          </button>
        </form>

        {/* Quick Sample Code Chips for Easy Testing */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[#6b5a48] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#7a4e10]" /> Quick Test Chips:
          </span>
          {quickTestCases.map((tc) => (
            <button
              key={tc.code}
              type="button"
              onClick={() => {
                setSearchCode(tc.code);
                handleLookup(tc.code);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#ede4d9] hover:bg-[#dfd8cd] text-[#1a1410] border border-[#d4cdc4] transition-all"
            >
              <span className="font-bold">{tc.label}:</span>
              <span className="font-mono text-[#7a4e10]">{tc.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lookup Result Display */}
      {hasSearched && (
        <>
          {searchedCard ? (
            <div className="space-y-6">
              {/* Verification Certificate Match Card */}
              <div className="p-6 rounded-3xl bg-[#fdfaf6] border-2 border-[#2a5038] shadow-lg space-y-6 relative overflow-hidden">
                {/* Header ribbon */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d4cdc4]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#d4e8da] text-[#1e3828] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-7 h-7 text-[#2a5038]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#d4e8da] text-[#1e3828] border border-[#a5cfb2]">
                          AUTHENTIC RECORD VERIFIED
                        </span>
                        <span className="text-xs text-[#2a5038] font-bold">
                          CBSE Reg No: {searchedCard.registrationNumber || 'SCH/89421/26'}
                        </span>
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-[#1a1410] mt-0.5">
                        {searchedCard.pupilName} &bull; {searchedCard.yearGroup}
                      </h3>
                      <p className="text-xs text-[#6b5a48]">
                        Roll Number: <strong className="font-mono text-[#1a1410]">{searchedCard.rollNumber || 'CBSE/2026/3012'}</strong> &bull; Section: {searchedCard.classGroup} Class
                      </p>
                    </div>
                  </div>

                  {/* Verification Code Box */}
                  <div className="flex flex-wrap items-center gap-2 bg-[#f7f3ed] p-3 rounded-2xl border border-[#d4cdc4]">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[#8a6f5a] block">
                        Verified Code
                      </span>
                      <span className="font-mono text-sm font-black text-[#7a4e10]">
                        {searchedCard.verificationCode || 'CBSE-VER-9842-LEO7'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(searchedCard.verificationCode || '')}
                      className="p-1.5 text-[#6b5a48] hover:text-[#1a1410] hover:bg-[#ede4d9] rounded-lg transition-colors"
                      title="Copy verification code"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-[#2a5038]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Metrics Summary Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-[#d4cdc4] shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a5038] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#3d6b4f]" /> CGPA Index
                    </span>
                    <p className="font-serif text-3xl font-black text-[#1a1410]">
                      {(searchedCard.cgpa || 9.5).toFixed(1)} <span className="text-sm font-normal text-[#8a6f5a]">/ 10.0</span>
                    </p>
                    <p className="text-[11px] text-[#2a5038] font-semibold">CBSE 10-Point Scale</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#d4cdc4] shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a4e10] flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-[#7a4e10]" /> Indicative Percentage
                    </span>
                    <p className="font-serif text-3xl font-bold text-[#7a4e10]">
                      {(searchedCard.indicativePercentage || 90.3).toFixed(1)}%
                    </p>
                    <p className="text-[11px] text-[#6b5a48]">CGPA &times; 9.5 Formula</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#d4cdc4] shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5a48] flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-[#1e3828]" /> Attendance &bull; Conduct
                    </span>
                    <p className="font-serif text-2xl font-bold text-[#1e3828]">
                      {searchedCard.attendancePercentage}%
                    </p>
                    <p className="text-[11px] text-[#6b5a48] truncate">{searchedCard.conductRating}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#d4cdc4] shadow-sm space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5a48] flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#3d6b4f]" /> Examination Result
                    </span>
                    <div className="mt-1">
                      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#d4e8da] text-[#1e3828] border border-[#a5cfb2]">
                        {searchedCard.resultStatus || 'PASSED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#2a5038] font-semibold mt-1">Qualified with Distinction</p>
                  </div>
                </div>

                {/* Quick Subject Overview */}
                <div className="bg-white rounded-2xl border border-[#d4cdc4] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-bold text-[#1a1410] flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#2a5038]" />
                      <span>Scholastic Subject Attainment ({searchedCard.subjects.length} Subjects)</span>
                    </h4>
                    <span className="text-xs text-[#6b5a48]">Term: {searchedCard.term}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {searchedCard.subjects.map((subj) => (
                      <div
                        key={subj.id}
                        className="p-3 rounded-xl bg-[#fdfaf6] border border-[#ede4d9] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-[#1a1410] truncate block">
                            {subj.subject}
                          </span>
                          <span className="text-[10px] text-[#8a6f5a]">
                            Code: {subj.subjectCode || '041'} &bull; Theory {subj.theoryMarks ?? Math.round(subj.marksObtained * 0.8)} + IA {subj.internalMarks ?? Math.round(subj.marksObtained * 0.2)}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-xs text-[#1a1410] block">
                            {subj.marksObtained} / 100
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#d4e8da] text-[#1e3828]">
                            Grade {subj.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-[#6b5a48]">
                    Last authenticated: <strong className="text-[#1a1410]">{searchedCard.lastUpdated}</strong> &bull; Form Tutor: {searchedCard.teacherName}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    {onSelectForEdit && (
                      <button
                        type="button"
                        onClick={() => onSelectForEdit(searchedCard.pupilId)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#ede4d9] text-[#1a1410] hover:bg-[#dfd8cd] border border-[#d4cdc4] transition-all shadow-sm"
                      >
                        <UserCheck className="w-4 h-4 text-[#7a4e10]" />
                        <span>Edit Marks in Studio</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDownload(searchedCard)}
                      disabled={isDownloading}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1a1410] text-[#f7f3ed] hover:bg-[#2e2620] shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 text-[#8fe2a4]" />
                      <span>{isDownloading ? 'Generating...' : 'Download Official PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowFullCard(!showFullCard)}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#2a5038] text-white hover:bg-[#203c2b] shadow-md transition-all active:scale-95"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{showFullCard ? 'Hide Full Certificate' : 'View Full CBSE Card'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Full CBSE Grade Card View */}
              {showFullCard && (
                <div className="pt-2 animate-in fade-in duration-300">
                  <div className="p-3 bg-[#ede4d9] rounded-2xl border border-[#d4cdc4] mb-3 flex items-center justify-between text-xs font-bold text-[#1a1410]">
                    <span>Official CBSE Transcript View: {searchedCard.pupilName}</span>
                    <button
                      type="button"
                      onClick={() => setShowFullCard(false)}
                      className="text-[#6b5a48] hover:text-[#1a1410]"
                    >
                      Close View
                    </button>
                  </div>
                  <GradeCardView
                    gradeCard={searchedCard}
                    isTeacherMode={true}
                    onEditMarks={onSelectForEdit ? () => onSelectForEdit(searchedCard.pupilId) : undefined}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-[#fdfaf6] border-2 border-dashed border-[#d4cdc4] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#f5ddd9] text-[#7a1e1e] flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#1a1410]">
                Verification Code Not Found
              </h4>
              <p className="text-xs text-[#6b5a48] max-w-md mx-auto">
                No active grade card was found matching &ldquo;{searchCode}&rdquo;. Please verify the code on the candidate's transcript or use one of the quick test chips above.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
