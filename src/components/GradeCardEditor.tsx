import React, { useState, useEffect } from 'react';
import { GradeCard, PerformanceBand, EffortRating, SubjectGrade } from '../types';
import {
  calculateGradeAndBand,
  computeGradeCardSummary,
  createDefaultGradeCardForPupil,
  generateCgpaTeacherNarrative,
  generateVerificationCode,
} from '../utils/gradeCalculations';
import { getPupilsForClass, PUPIL_CHILD_IDS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { GradeCardView } from './GradeCardView';
import { TeacherVerificationLookup } from './TeacherVerificationLookup';
import {
  Award,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  FileEdit,
  GraduationCap,
  Percent,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

interface GradeCardEditorProps {
  initialPupilId?: string;
  initialTab?: 'editor' | 'preview' | 'lookup';
  onSaved?: (gradeCard: GradeCard) => void;
}

export const GradeCardEditor: React.FC<GradeCardEditorProps> = ({
  initialPupilId = 'child-leo',
  initialTab = 'editor',
  onSaved,
}) => {
  const { gradeCards, saveGradeCard, showToast, childrenList, currentUser } = useAuth();
  const assignedClass = currentUser?.class || 'Class III A';
  const assignedPupils = getPupilsForClass(assignedClass);
  const assignedPupilIds = assignedPupils.map((pupil) => PUPIL_CHILD_IDS[pupil.id] || pupil.id);
  const firstAssignedPupilId = assignedPupilIds[0] || initialPupilId;

  const [selectedPupilId, setSelectedPupilId] = useState<string>(() => assignedPupilIds.includes(initialPupilId) ? initialPupilId : firstAssignedPupilId);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'lookup'>(initialTab);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);

  // Find existing grade card or initialize
  const existingCard = gradeCards.find(
    (gc) => gc.pupilId === selectedPupilId || (selectedPupilId === 'p12' && gc.pupilId === 'child-leo')
  );

  const [formCard, setFormCard] = useState<GradeCard>(() => {
    if (existingCard) return JSON.parse(JSON.stringify(existingCard));
    const firstPupil = assignedPupils[0];
    return createDefaultGradeCardForPupil(firstAssignedPupilId, firstPupil?.name || 'Pupil', 'Section A', assignedClass);
  });

  // When selected pupil changes, load or create their card
  useEffect(() => {
    const card = gradeCards.find(
      (gc) => gc.pupilId === selectedPupilId || (selectedPupilId === 'p12' && gc.pupilId === 'child-leo')
    );
    if (card) {
      setFormCard(JSON.parse(JSON.stringify(card)));
    } else {
      const pupil = assignedPupils.find((p) => (PUPIL_CHILD_IDS[p.id] || p.id) === selectedPupilId || p.id === selectedPupilId);
      const child = childrenList.find((c) => c.id === selectedPupilId);
      const name = pupil ? pupil.name : child ? child.fullName : 'Pupil';
      setFormCard(createDefaultGradeCardForPupil(selectedPupilId, name, 'Section A (Oak)', assignedClass));
    }
  }, [selectedPupilId, gradeCards, childrenList, assignedClass]);

  // Handle Theory & Internal Marks change for CBSE format
  const handleTheoryChange = (index: number, newTheory: number) => {
    const validTheory = Math.min(80, Math.max(0, isNaN(newTheory) ? 0 : newTheory));
    setFormCard((prev) => {
      const updatedSubjects = [...prev.subjects];
      const subj = { ...updatedSubjects[index] };
      subj.theoryMarks = validTheory;
      const internal = subj.internalMarks ?? 18;
      subj.marksObtained = Math.min(100, validTheory + internal);
      const { grade, gradePoint, band } = calculateGradeAndBand(subj.marksObtained, subj.maxMarks);
      subj.grade = grade;
      subj.gradePoint = gradePoint;
      subj.band = band;
      updatedSubjects[index] = subj;

      const summary = computeGradeCardSummary(updatedSubjects);
      return {
        ...prev,
        subjects: updatedSubjects,
        overallAverage: summary.overallAverage,
        cgpa: summary.cgpa,
        indicativePercentage: summary.indicativePercentage,
        overallGrade: summary.overallGrade,
        overallBand: summary.overallBand,
        resultStatus: summary.resultStatus,
        teacherGeneralRemarks: generateCgpaTeacherNarrative(prev.pupilName, summary.cgpa, summary.resultStatus),
      };
    });
  };

  const handleInternalChange = (index: number, newInternal: number) => {
    const validInternal = Math.min(20, Math.max(0, isNaN(newInternal) ? 0 : newInternal));
    setFormCard((prev) => {
      const updatedSubjects = [...prev.subjects];
      const subj = { ...updatedSubjects[index] };
      subj.internalMarks = validInternal;
      const theory = subj.theoryMarks ?? Math.round(subj.marksObtained * 0.8);
      subj.marksObtained = Math.min(100, theory + validInternal);
      const { grade, gradePoint, band } = calculateGradeAndBand(subj.marksObtained, subj.maxMarks);
      subj.grade = grade;
      subj.gradePoint = gradePoint;
      subj.band = band;
      updatedSubjects[index] = subj;

      const summary = computeGradeCardSummary(updatedSubjects);
      return {
        ...prev,
        subjects: updatedSubjects,
        overallAverage: summary.overallAverage,
        cgpa: summary.cgpa,
        indicativePercentage: summary.indicativePercentage,
        overallGrade: summary.overallGrade,
        overallBand: summary.overallBand,
        resultStatus: summary.resultStatus,
        teacherGeneralRemarks: generateCgpaTeacherNarrative(prev.pupilName, summary.cgpa, summary.resultStatus),
      };
    });
  };

  // Direct marks override if teacher types total marks
  const handleMarkChange = (index: number, newMark: number) => {
    const validMark = Math.min(100, Math.max(0, isNaN(newMark) ? 0 : newMark));
    setFormCard((prev) => {
      const updatedSubjects = [...prev.subjects];
      const subj = { ...updatedSubjects[index] };
      subj.marksObtained = validMark;
      subj.theoryMarks = Math.round(validMark * 0.8);
      subj.internalMarks = validMark - subj.theoryMarks;
      const { grade, gradePoint, band } = calculateGradeAndBand(validMark, subj.maxMarks);
      subj.grade = grade;
      subj.gradePoint = gradePoint;
      subj.band = band;
      updatedSubjects[index] = subj;

      const summary = computeGradeCardSummary(updatedSubjects);
      return {
        ...prev,
        subjects: updatedSubjects,
        overallAverage: summary.overallAverage,
        cgpa: summary.cgpa,
        indicativePercentage: summary.indicativePercentage,
        overallGrade: summary.overallGrade,
        overallBand: summary.overallBand,
        resultStatus: summary.resultStatus,
        teacherGeneralRemarks: generateCgpaTeacherNarrative(prev.pupilName, summary.cgpa, summary.resultStatus),
      };
    });
  };

  const handleEffortChange = (index: number, effort: EffortRating) => {
    setFormCard((prev) => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[index] = { ...updatedSubjects[index], effort };
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleCommentChange = (index: number, teacherComment: string) => {
    setFormCard((prev) => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[index] = { ...updatedSubjects[index], teacherComment };
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleAddSubject = () => {
    const newSubject: SubjectGrade = {
      id: `sub-custom-${Date.now()}`,
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
      teacherComment: 'Demonstrates solid algorithmic sequencing and digital creative design.',
    };

    setFormCard((prev) => {
      const updated = [...prev.subjects, newSubject];
      const summary = computeGradeCardSummary(updated);
      return {
        ...prev,
        subjects: updated,
        overallAverage: summary.overallAverage,
        cgpa: summary.cgpa,
        indicativePercentage: summary.indicativePercentage,
        overallGrade: summary.overallGrade,
        overallBand: summary.overallBand,
        resultStatus: summary.resultStatus,
      };
    });
    showToast('New CBSE subject added to grade card.', 'info');
  };

  const handleRemoveSubject = (index: number) => {
    if (formCard.subjects.length <= 1) {
      showToast('At least one subject must remain on the grade card.', 'error');
      return;
    }
    setFormCard((prev) => {
      const updated = prev.subjects.filter((_, i) => i !== index);
      const summary = computeGradeCardSummary(updated);
      return {
        ...prev,
        subjects: updated,
        overallAverage: summary.overallAverage,
        cgpa: summary.cgpa,
        indicativePercentage: summary.indicativePercentage,
        overallGrade: summary.overallGrade,
        overallBand: summary.overallBand,
        resultStatus: summary.resultStatus,
      };
    });
  };

  const handleRegenerateVerificationCode = () => {
    const newCode = generateVerificationCode(formCard.pupilId, formCard.pupilName, String(Date.now()));
    const issuedAt = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedCard: GradeCard = {
      ...formCard,
      verificationCode: newCode,
      verifiedAt: issuedAt,
      verificationStatus: 'VERIFIED_ACTIVE',
      status: 'published',
      lastUpdated: issuedAt,
    };
    setFormCard(updatedCard);
    saveGradeCard(updatedCard);
    showToast(`New verification code issued and published: ${newCode}`, 'success');
  };

  const handleCopyCode = () => {
    if (formCard.verificationCode) {
      navigator.clipboard.writeText(formCard.verificationCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      showToast('Verification code copied to clipboard!', 'info');
    }
  };

  const handleTargetChange = (index: number, text: string) => {
    setFormCard((prev) => {
      const updated = [...prev.targetAreas];
      updated[index] = text;
      return { ...prev, targetAreas: updated };
    });
  };

  const handleAddTarget = () => {
    setFormCard((prev) => ({
      ...prev,
      targetAreas: [...prev.targetAreas, 'New academic improvement target.'],
    }));
  };

  const handleRemoveTarget = (index: number) => {
    setFormCard((prev) => ({
      ...prev,
      targetAreas: prev.targetAreas.filter((_, i) => i !== index),
    }));
  };

  const handleAttendanceChange = (daysPresent: number, daysTotal: number) => {
    const present = Math.max(0, daysPresent);
    const total = Math.max(present, daysTotal || 1);
    const pct = Math.round((present / total) * 1000) / 10;

    setFormCard((prev) => ({
      ...prev,
      daysPresent: present,
      daysTotal: total,
      attendancePercentage: pct,
    }));
  };

  const handleGenerateAiNarrative = async () => {
    setIsGeneratingNarrative(true);
    try {
      const response = await fetch('/api/ai/grade-card-narrative', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pupilName: formCard.pupilName, cgpa: formCard.cgpa, overallGrade: formCard.overallGrade, resultStatus: formCard.resultStatus, subjects: formCard.subjects }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(error?.error || 'AI service unavailable');
      }
      const data = await response.json() as { narrative?: string };
      if (!data.narrative) throw new Error('No narrative returned');
      setFormCard((previous) => ({ ...previous, teacherGeneralRemarks: data.narrative! }));
      showToast('AI generated a tutor narrative from the latest CGPA and marks.', 'success');
    } catch (error) {
      const narrative = generateCgpaTeacherNarrative(formCard.pupilName, formCard.cgpa, formCard.resultStatus);
      setFormCard((previous) => ({ ...previous, teacherGeneralRemarks: narrative }));
      showToast(`${error instanceof Error ? error.message : 'AI service is unavailable'}. A CGPA-based narrative was generated locally.`, 'info');
    } finally { setIsGeneratingNarrative(false); }
  };

  const handleSaveAndPublish = () => {
    const cardToSave: GradeCard = {
      ...formCard,
      status: 'published',
      verificationStatus: 'VERIFIED_ACTIVE',
      lastUpdated:
        new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) + `, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };

    saveGradeCard(cardToSave);
    showToast(`CBSE Grade Card for ${formCard.pupilName} published with code ${formCard.verificationCode}!`, 'success');
    if (onSaved) onSaved(cardToSave);
  };

  // Teacher can assess only the pupils assigned to their class.
  const rosterOptions = assignedPupils.map((pupil) => ({ id: PUPIL_CHILD_IDS[pupil.id] || pupil.id, name: `${pupil.name} (${assignedClass})` }));

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="p-5 rounded-2xl bg-[#fdfaf6] border border-[#d4cdc4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#2a4a35]" />
            <h2 className="font-serif text-xl font-bold text-[#1a1410]">
              CBSE Grading Assessor &amp; Verification Studio
            </h2>
          </div>
          <p className="text-xs text-[#6b5a48]">
            Continuous &amp; Comprehensive Evaluation (CCE) &bull; 9-Point Scale &bull; Direct Code Verification
          </p>
        </div>

        {/* 3-Way Mode Switcher: Marks Studio | Direct Code Lookup | Preview Certificate */}
        <div className="flex flex-wrap items-center p-1 bg-[#e8e2d8] rounded-xl shadow-inner gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'editor'
                ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm'
                : 'text-[#6b5a48] hover:text-[#1a1410]'
            }`}
          >
            <FileEdit className="w-4 h-4 text-[#8a6f5a]" />
            <span>Marks Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lookup')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'lookup'
                ? 'bg-[#fdfaf6] text-[#2a5038] shadow-sm ring-1 ring-[#2a5038]/30'
                : 'text-[#6b5a48] hover:text-[#1a1410]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#2a5038]" />
            <span>Direct Code Access</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#d4e8da] text-[#1e3828]">
              Verify
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'preview'
                ? 'bg-[#fdfaf6] text-[#1a1410] shadow-sm'
                : 'text-[#6b5a48] hover:text-[#1a1410]'
            }`}
          >
            <Eye className="w-4 h-4 text-[#2a5038]" />
            <span>Preview Certificate</span>
          </button>
        </div>
      </div>

      {/* Mode 1: DIRECT CODE LOOKUP (Feature Requested by User) */}
      {activeTab === 'lookup' && (
        <TeacherVerificationLookup
          allowedPupilIds={assignedPupilIds}
          onSelectForEdit={(pupilId) => {
            setSelectedPupilId(pupilId);
            setActiveTab('editor');
          }}
        />
      )}

      {/* Mode 2: PREVIEW OFFICIAL CERTIFICATE */}
      {activeTab === 'preview' && (
        <GradeCardView
          gradeCard={formCard}
          isTeacherMode={true}
          onEditMarks={() => setActiveTab('editor')}
          onOpenTeacherLookup={() => setActiveTab('lookup')}
        />
      )}

      {/* Mode 3: MARKS STUDIO EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          {/* Pupil Selector & Verification Tag Bar */}
          <div className="p-5 rounded-2xl bg-[#f7f3ed] border border-[#d4cdc4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6b5a48] shrink-0">
                Active Pupil Roster:
              </label>
              <select
                value={selectedPupilId}
                onChange={(e) => setSelectedPupilId(e.target.value)}
                className="w-full sm:w-auto text-xs font-bold px-3 py-2 bg-[#fdfaf6] border border-[#d4cdc4] rounded-xl outline-none focus:border-[#8a6f5a] text-[#1a1410] shadow-sm"
              >
                {rosterOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Official Verification Tag & Code Manager */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto bg-[#fdfaf6] p-2.5 rounded-xl border border-[#a5cfb2] shadow-sm">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2a5038]" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#2a5038]">
                  Verification Tag:
                </span>
              </div>
              <span className="font-mono text-xs font-black text-[#7a4e10] bg-[#fbf6ed] px-2 py-0.5 rounded border border-[#edd8be]">
                {formCard.verificationCode || 'CBSE-VER-9842-LEO7'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy code"
                className="p-1 text-[#6b5a48] hover:text-[#1a1410] rounded"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#2a5038]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleRegenerateVerificationCode}
                title="Regenerate unique verification code"
                className="p-1 text-[#6b5a48] hover:text-[#1a1410] rounded hover:bg-[#ede4d9]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar (CGPA, Indicative %, Subjects, Attendance) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#fdfaf6] border-2 border-[#3d6b4f]/40 shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2a5038] flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#3d6b4f]" /> CGPA (10-Pt Scale)
              </span>
              <p className="font-serif text-3xl font-black text-[#1a1410]">
                {(formCard.cgpa || 9.5).toFixed(1)} <span className="text-xs font-normal text-[#8a6f5a]">/ 10.0</span>
              </p>
              <span className="text-[10px] font-bold text-[#2a5038]">
                Band: {formCard.overallBand}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fdfaf6] border border-[#d4cdc4] shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a4e10] flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-[#7a4e10]" /> Indicative % (CGPA &times; 9.5)
              </span>
              <p className="font-serif text-3xl font-bold text-[#7a4e10]">
                {(formCard.indicativePercentage || 90.3).toFixed(1)}%
              </p>
              <span className="text-[10px] text-[#6b5a48]">CBSE Result: {formCard.resultStatus || 'PASSED'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fdfaf6] border border-[#d4cdc4] shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5a48]">
                Assessed Subjects
              </span>
              <p className="font-serif text-2xl font-bold text-[#1a1410]">
                {formCard.subjects.length} Subjects
              </p>
              <span className="text-[10px] text-[#6b5a48]">Theory 80 + IA 20 = 100</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#fdfaf6] border border-[#d4cdc4] shadow-sm space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5a48]">
                Term Attendance
              </span>
              <p className="font-serif text-2xl font-bold text-[#1e3828]">
                {formCard.attendancePercentage}%
              </p>
              <span className="text-[10px] text-[#6b5a48]">
                {formCard.daysPresent} / {formCard.daysTotal} days
              </span>
            </div>
          </div>

          {/* Student CBSE Credentials (Roll No, Reg No, Mother/Father Name) */}
          <div className="p-5 rounded-2xl bg-[#f7f3ed] border border-[#d4cdc4] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b5a48] mb-1">
                CBSE Roll Number
              </label>
              <input
                type="text"
                value={formCard.rollNumber || 'CBSE/2026/3012'}
                onChange={(e) => setFormCard({ ...formCard, rollNumber: e.target.value })}
                className="w-full text-xs font-mono font-bold px-3 py-2 bg-[#fdfaf6] border border-[#d4cdc4] rounded-xl outline-none focus:border-[#8a6f5a]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b5a48] mb-1">
                Registration / Scholar No
              </label>
              <input
                type="text"
                value={formCard.registrationNumber || 'SCH/89421/26'}
                onChange={(e) => setFormCard({ ...formCard, registrationNumber: e.target.value })}
                className="w-full text-xs font-mono font-bold px-3 py-2 bg-[#fdfaf6] border border-[#d4cdc4] rounded-xl outline-none focus:border-[#8a6f5a]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b5a48] mb-1">
                Admit Card ID
              </label>
              <input
                type="text"
                value={formCard.admitCardId || 'DL301226'}
                onChange={(e) => setFormCard({ ...formCard, admitCardId: e.target.value })}
                className="w-full text-xs font-mono font-bold px-3 py-2 bg-[#fdfaf6] border border-[#d4cdc4] rounded-xl outline-none focus:border-[#8a6f5a]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b5a48] mb-1">
                Attendance (Days Present / Total)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formCard.daysPresent}
                  onChange={(e) => handleAttendanceChange(parseInt(e.target.value) || 0, formCard.daysTotal)}
                  className="w-16 text-xs font-bold text-center px-2 py-2 bg-[#fdfaf6] border border-[#d4cdc4] rounded-xl outline-none"
                />
                <span className="text-xs text-[#6b5a48]">/</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formCard.daysTotal}
                  onChange={(e) => handleAttendanceChange(formCard.daysPresent, parseInt(e.target.value) || 63)}
                  className="w-16 text-xs font-bold text-center px-2 py-2 bg-[#fdfaf6] border border-[#d4cdc4] rounded-xl outline-none"
                />
                <span className="text-xs font-bold text-[#1e3828]">
                  {formCard.attendancePercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Subjects Marks Entry Table (CBSE Scheme: Code, Sub, Theory 80, IA 20, Total 100, Grade, GP) */}
          <div className="bg-[#fdfaf6] rounded-2xl border border-[#d4cdc4] p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1a1410] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#2a5038]" />
                  <span>CBSE Scholastic Marks Assessor (Part 1)</span>
                </h3>
                <p className="text-xs text-[#6b5a48]">
                  Enter Theory (max 80) and Internal Assessment / Practical (max 20). Total, Grade (A1-E2) and GP calculate dynamically.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSubject}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#ede4d9] text-[#1a1410] hover:bg-[#dfd8cd] border border-[#d4cdc4] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add CBSE Subject</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#d4cdc4] text-[10px] font-bold uppercase tracking-wider text-[#6b5a48] bg-[#f7f3ed]">
                    <th className="py-3 px-2 w-16">Code</th>
                    <th className="py-3 px-3">Subject &amp; Domain</th>
                    <th className="py-3 px-2 w-24 text-center">Theory (80)</th>
                    <th className="py-3 px-2 w-24 text-center">IA / PR (20)</th>
                    <th className="py-3 px-2 w-24 text-center">Total (100)</th>
                    <th className="py-3 px-2 w-16 text-center">Grade</th>
                    <th className="py-3 px-2 w-16 text-center">GP</th>
                    <th className="py-3 px-3 min-w-[200px]">Teacher Observation</th>
                    <th className="py-3 px-2 w-10 text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ede4d9] text-xs">
                  {formCard.subjects.map((subj, idx) => (
                    <tr key={subj.id} className="hover:bg-[#fcfaf7]">
                      {/* Subject Code */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={subj.subjectCode || `0${idx + 41}`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormCard((prev) => {
                              const updated = [...prev.subjects];
                              updated[idx].subjectCode = val;
                              return { ...prev, subjects: updated };
                            });
                          }}
                          className="w-12 font-mono font-bold text-center px-1 py-1 bg-[#f7f3ed] border border-[#d4cdc4] rounded text-xs outline-none"
                        />
                      </td>

                      {/* Subject Name */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={subj.subject}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormCard((prev) => {
                              const updated = [...prev.subjects];
                              updated[idx].subject = val;
                              return { ...prev, subjects: updated };
                            });
                          }}
                          className="w-full font-bold text-[#1a1410] bg-transparent border-b border-transparent hover:border-[#d4cdc4] focus:border-[#8a6f5a] outline-none"
                        />
                        <span className="text-[10px] text-[#8a6f5a] block">{subj.category}</span>
                      </td>

                      {/* Theory Marks (out of 80) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="80"
                          value={subj.theoryMarks ?? Math.round(subj.marksObtained * 0.8)}
                          onChange={(e) => handleTheoryChange(idx, parseInt(e.target.value))}
                          className="w-14 font-bold text-center py-1.5 px-1 bg-[#f7f3ed] border border-[#d4cdc4] rounded-lg focus:border-[#2a5038] outline-none text-xs"
                        />
                      </td>

                      {/* Internal Assessment (out of 20) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={subj.internalMarks ?? Math.round(subj.marksObtained * 0.2)}
                          onChange={(e) => handleInternalChange(idx, parseInt(e.target.value))}
                          className="w-14 font-bold text-center py-1.5 px-1 bg-[#f7f3ed] border border-[#d4cdc4] rounded-lg focus:border-[#2a5038] outline-none text-xs"
                        />
                      </td>

                      {/* Total Marks (out of 100) */}
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={subj.marksObtained}
                          onChange={(e) => handleMarkChange(idx, parseInt(e.target.value))}
                          className="w-14 font-black text-center py-1.5 px-1 bg-white border-2 border-[#2a5038]/40 rounded-lg text-xs outline-none"
                        />
                      </td>

                      {/* CBSE Grade */}
                      <td className="py-3 px-2 text-center">
                        <span className="font-black text-xs px-2 py-0.5 rounded bg-[#d4e8da] text-[#1e3828]">
                          {subj.grade}
                        </span>
                      </td>

                      {/* Grade Point */}
                      <td className="py-3 px-2 text-center font-bold text-[#1a1410]">
                        {(subj.gradePoint || 9.0).toFixed(1)}
                      </td>

                      {/* Teacher Observation */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={subj.teacherComment}
                          onChange={(e) => handleCommentChange(idx, e.target.value)}
                          placeholder="Teacher observation…"
                          className="w-full text-xs p-1.5 bg-[#f7f3ed] border border-[#d4cdc4] rounded-lg outline-none focus:border-[#8a6f5a]"
                        />
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(idx)}
                          className="p-1 text-[#b0a496] hover:text-[#9b2c2c] hover:bg-[#f5ddd9] rounded-lg transition-colors"
                          title="Remove subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* General Remarks & Targets Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Tutor General Remarks */}
            <div className="p-5 rounded-2xl bg-[#fdfaf6] border border-[#d4cdc4] space-y-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2a4a35]" />
                <h4 className="font-serif text-base font-bold text-[#1a1410]">
                  Form Tutor's General Narrative
                </h4>
                </div>
                <button type="button" onClick={handleGenerateAiNarrative} disabled={isGeneratingNarrative} className="rounded-full bg-[#2a4a35] px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60">{isGeneratingNarrative ? 'Writing...' : 'Generate with AI'}</button>
              </div>
              <textarea
                rows={4}
                value={formCard.teacherGeneralRemarks}
                onChange={(e) => setFormCard({ ...formCard, teacherGeneralRemarks: e.target.value })}
                placeholder="Overall observations on pupil demeanour, curiosity, and academic standing…"
                className="w-full text-xs p-3 bg-[#f7f3ed] border border-[#d4cdc4] rounded-xl outline-none focus:border-[#8a6f5a] leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-[#6b5a48]">
                <span>Form Tutor: {formCard.teacherName}</span>
                <span>Conduct: {formCard.conductRating}</span>
              </div>
            </div>

            {/* Target Areas for Next Term */}
            <div className="p-5 rounded-2xl bg-[#fdfaf6] border border-[#d4cdc4] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#7a4e10]" />
                  <h4 className="font-serif text-base font-bold text-[#1a1410]">
                    Key Targets for Next Term
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleAddTarget}
                  className="text-xs font-bold text-[#7a4e10] hover:underline"
                >
                  + Add Target
                </button>
              </div>

              <div className="space-y-2">
                {formCard.targetAreas.map((target, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#f5e6c8] text-[#7a4e10] font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={target}
                      onChange={(e) => handleTargetChange(idx, e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 bg-[#f7f3ed] border border-[#d4cdc4] rounded-lg outline-none focus:border-[#8a6f5a]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTarget(idx)}
                      className="text-[#b0a496] hover:text-[#9b2c2c] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 rounded-2xl bg-[#ede4d9] border border-[#d4cdc4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#5a4f45]">
              Verification Code: <strong className="font-mono text-[#7a4e10]">{formCard.verificationCode}</strong> &bull; Status:{' '}
              <span className="font-bold text-[#2a5038] uppercase text-[10px] bg-[#d4e8da] px-2 py-0.5 rounded-full">
                {formCard.status}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('lookup')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#fdfaf6] text-[#2a5038] border border-[#a5cfb2] hover:bg-[#d4e8da] transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Code Access</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#fdfaf6] text-[#1a1410] border border-[#d4cdc4] hover:bg-[#dfd8cd] transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Certificate</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndPublish}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1a1410] text-[#f7f3ed] hover:bg-[#2e2620] shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-[#8fe2a4]" />
                <span>Save &amp; Publish to Parent Website</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
