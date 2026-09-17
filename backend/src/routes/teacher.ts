import { Router, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { authenticate, authorize } from '../auth/middleware';
import { CreateEntrySchema } from '../validation/schemas';
import {
  getTeacherClass,
  getPupilsByClass,
  createEntryWithRecipients,
  getSentDispatches,
  recallEntry,
  archiveEntry,
  resendEntry,
  getEngagementMetrics,
  getAttentionItems,
  getUpcomingDates,
  getSignOffItems,
  signOffItemInDb,
  signOffAllInDb,
} from '../db/queries';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const teacherRouter = Router();

// Apply auth middlewares for all teacher routes
teacherRouter.use(authenticate, authorize('teacher', 'admin'));

/** Generate a concise, professional tutor narrative without exposing API keys to the browser. */
teacherRouter.post('/grade-cards/narrative', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI narrative service is not configured.' });
    }
    const { pupilName, cgpa, overallGrade, resultStatus, subjects } = req.body;
    if (typeof pupilName !== 'string' || typeof cgpa !== 'number' || !Array.isArray(subjects)) {
      return res.status(400).json({ error: 'Invalid grade-card narrative request.' });
    }
    const subjectSummary = subjects.slice(0, 8).map((subject: { subject: string; marksObtained: number; grade: string }) => `${subject.subject}: ${subject.marksObtained}/100 (${subject.grade})`).join('; ');
    const prompt = `Write one factual, supportive UK-English form-tutor narrative of 45-65 words for a school report. Do not invent facts, diagnoses, or personal traits. Refer to the pupil by first name only. Base it on: pupil ${pupilName}; CGPA ${cgpa}; overall grade ${overallGrade}; result ${resultStatus}; subjects ${subjectSummary}. Return only the narrative.`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 130 } }),
    });
    if (!response.ok) throw new Error(`Gemini response ${response.status}`);
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const narrative = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!narrative) throw new Error('Gemini returned no narrative');
    res.status(200).json({ narrative });
  } catch (err) { next(err); }
});

/**
 * GET /api/teacher/class
 * Class metadata, pupil roster with connection status, and key metrics
 */
teacherRouter.get('/class', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user!.id;
    const classInfo = await getTeacherClass(teacherId);

    const classId = (classInfo?.PK as string)?.replace('CLASS#', '') || 'class-y3-oak';
    const pupils = await getPupilsByClass(classId);

    const connectedCount = pupils.filter((p) => p.status === 'connected').length;
    const totalPupils = pupils.length;
    const signOffItems = await getSignOffItems(classId);
    const awaitingSignOffCount = signOffItems.filter((item) => item.status === 'pending').length;

    res.status(200).json({
      class: {
        id: classId,
        name: classInfo?.name || 'Year 3 Oak Class',
        year: classInfo?.year || 'Year 3',
        term: 'Autumn Term 2026',
      },
      metrics: {
        connectedParents: `${connectedCount} of ${totalPupils}`,
        connectedPercentage: totalPupils ? Math.round((connectedCount / totalPupils) * 100) : 0,
        deliveredThisWeek: '98%',
        awaitingSignOff: `${awaitingSignOffCount} items`,
        awaitingSignOffCount,
      },
      pupils,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/teacher/pupils?search=
 * Search pupils in teacher's class
 */
teacherRouter.get('/pupils', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user!.id;
    const classInfo = await getTeacherClass(teacherId);
    const classId = (classInfo?.PK as string)?.replace('CLASS#', '') || 'class-y3-oak';

    const search = req.query.search as string;
    const pupils = await getPupilsByClass(classId, search);

    res.status(200).json({
      count: pupils.length,
      pupils,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/teacher/entries
 * Publish a new entry to the class or targeted pupils
 */
teacherRouter.post('/entries', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateEntrySchema.parse(req.body);
    const teacherId = req.user!.id;
    const teacherName = req.user!.name;

    const classInfo = await getTeacherClass(teacherId);
    const classId = (classInfo?.PK as string)?.replace('CLASS#', '') || 'class-y3-oak';

    // Resolve target student IDs
    let targetStudentIds: string[] = [];

    if (body.recipientScope === 'whole_class') {
      const allPupils = await getPupilsByClass(classId);
      targetStudentIds = allPupils.map((p) => p.id);
    } else {
      targetStudentIds = body.recipientIds;
    }

    const entryId = `entry-${randomUUID().slice(0, 8)}`;

    const createdEntry = await createEntryWithRecipients({
      id: entryId,
      category: body.category,
      title: body.title,
      body: body.body,
      authorId: teacherId,
      authorName: teacherName,
      classId,
      dueDate: body.dueDate,
      amount: body.amount,
      attachmentUrl: body.attachmentUrl,
      recipientScope: body.recipientScope,
      recipientIds: targetStudentIds,
    });

    res.status(201).json({
      success: true,
      message: 'Dispatch published and synchronized with parent timelines',
      entry: createdEntry,
      recipientsCount: targetStudentIds.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/teacher/entries
 * Sent dispatches for the last 7 days with live delivery metrics
 */
teacherRouter.get('/entries', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user!.id;
    const classInfo = await getTeacherClass(teacherId);
    const classId = (classInfo?.PK as string)?.replace('CLASS#', '') || 'class-y3-oak';

    const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
    const dispatches = await getSentDispatches(classId, days);

    res.status(200).json({
      dispatches,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/teacher/entries/:id/recall
 * Recall an entry
 */
teacherRouter.post('/entries/:id/recall', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entryId = req.params.id;
    const teacherId = req.user!.id;

    const result = await recallEntry(entryId, teacherId);

    logger.info('Entry recalled by teacher', {
      action: 'teacher.recallEntry',
      userId: teacherId,
      targetId: entryId,
    });

    res.status(200).json({
      success: true,
      message: 'Entry recalled and hidden from parent timelines',
      entryId,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/teacher/entries/:id/archive
 * Archive an entry
 */
teacherRouter.post('/entries/:id/archive', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entryId = req.params.id;
    const teacherId = req.user!.id;

    const result = await archiveEntry(entryId, teacherId);

    logger.info('Entry archived by teacher', {
      action: 'teacher.archiveEntry',
      userId: teacherId,
      targetId: entryId,
    });

    res.status(200).json({
      success: true,
      message: 'Entry archived',
      entryId,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/teacher/entries/:id/resend
 * Resend entry to unacknowledged families
 */
teacherRouter.post('/entries/:id/resend', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entryId = req.params.id;
    const teacherId = req.user!.id;

    const result = await resendEntry(entryId, teacherId);

    logger.info('Entry resent to unacknowledged recipients', {
      action: 'teacher.resendEntry',
      userId: teacherId,
      targetId: entryId,
      metadata: { resentCount: result.resentCount },
    });

    res.status(200).json({
      success: true,
      message: `Re-sent to ${result.resentCount} unacknowledged recipients`,
      entryId,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/teacher/engagement
 * Weekly engagement percentages by category
 */
teacherRouter.get('/engagement', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user!.id;
    const classInfo = await getTeacherClass(teacherId);
    const classId = (classInfo?.PK as string)?.replace('CLASS#', '') || 'class-y3-oak';

    const metrics = await getEngagementMetrics(classId);

    res.status(200).json({
      metrics,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/teacher/attention
 * Items needing teacher attention
 */
teacherRouter.get('/attention', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user!.id;
    const classInfo = await getTeacherClass(teacherId);
    const classId = (classInfo?.PK as string)?.replace('CLASS#', '') || 'class-y3-oak';

    const attentionItems = await getAttentionItems(classId);

    res.status(200).json({
      items: attentionItems,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/teacher/upcoming
 * Upcoming school/class calendar dates
 */
teacherRouter.get('/upcoming', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user!.id;
    const classInfo = await getTeacherClass(teacherId);
    const classId = (classInfo?.PK as string)?.replace('CLASS#', '') || 'class-y3-oak';

    const dates = await getUpcomingDates(classId);

    res.status(200).json({
      dates,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/teacher/sign-offs
 * Retrieve all items awaiting teacher sign-off or recently verified
 */
teacherRouter.get('/sign-offs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user!.id;
    const classInfo = await getTeacherClass(teacherId);
    const classId = (classInfo?.PK as string)?.replace('CLASS#', '') || 'class-y3-oak';

    const items = await getSignOffItems(classId);
    const pendingCount = items.filter((i) => i.status === 'pending').length;

    res.status(200).json({
      success: true,
      pendingCount,
      items,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/teacher/sign-offs/:id/sign
 * Sign off an individual item
 */
teacherRouter.post('/sign-offs/:id/sign', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { notes } = req.body || {};
    const teacherId = req.user!.id;
    const teacherName = req.user!.name || 'Teacher';

    const result = await signOffItemInDb(id, teacherId, teacherName, notes);

    logger.info('Sign-off item verified and signed', {
      action: 'teacher.signOff',
      userId: teacherId,
      targetId: id,
    });

    res.status(200).json({
      success: true,
      message: 'Item verified and signed off in classroom ledger',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/teacher/sign-offs/all
 * Sign off all pending items in bulk
 */
teacherRouter.post('/sign-offs/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teacherId = req.user!.id;
    const teacherName = req.user!.name || 'Teacher';
    const classInfo = await getTeacherClass(teacherId);
    const classId = (classInfo?.PK as string)?.replace('CLASS#', '') || 'class-y3-oak';

    const result = await signOffAllInDb(classId, teacherId, teacherName);

    logger.info('Bulk sign-off completed', {
      action: 'teacher.signOffAll',
      userId: teacherId,
      targetId: classId,
    });

    res.status(200).json({
      success: true,
      message: 'All pending items successfully signed off and filed',
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

// In-memory store for grade cards in backend
const backendGradeCards: any[] = [
  {
    id: 'gc-autumn-2026-leo',
    pupilId: 'p12',
    pupilName: 'Leo Evans',
    classGroup: 'Oak',
    yearGroup: 'Year 3',
    academicYear: '2026 – 2027',
    term: 'Autumn Term Mid-Year Assessment',
    issuedDate: '15 Dec 2026',
    teacherName: 'Mrs. Eleanor Reynolds',
    headteacherName: 'Dr. Alistair Finch',
    attendancePercentage: 98.4,
    daysPresent: 62,
    daysTotal: 63,
    conductRating: 'Exemplary & Diligent',
    status: 'published',
    lastUpdated: '15 Dec 2026, 16:30',
    overallAverage: 89.2,
    overallGrade: 'A*',
    overallBand: 'Greater Depth',
    subjects: [
      {
        id: 'sub-eng-reading',
        subject: 'English (Reading & Comprehension)',
        category: 'Core',
        marksObtained: 92,
        maxMarks: 100,
        grade: 'A*',
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Outstanding interpretive depth. Consistently exceeds reading targets.',
      },
      {
        id: 'sub-maths',
        subject: 'Mathematics (Number & Reasoning)',
        category: 'Core',
        marksObtained: 91,
        maxMarks: 100,
        grade: 'A*',
        band: 'Greater Depth',
        effort: 'Outstanding',
        teacherComment: 'Superb fluency in mental arithmetic and multi-step reasoning problems.',
      },
      {
        id: 'sub-science',
        subject: 'Science & Enquiry',
        category: 'Core',
        marksObtained: 88,
        maxMarks: 100,
        grade: 'A',
        band: 'Greater Depth',
        effort: 'High Effort',
        teacherComment: 'Excellent curiosity in forces and light units.',
      },
    ],
    teacherGeneralRemarks: 'Leo has had an exceptional term in Year 3 Oak. He approaches every lesson with sustained curiosity and mature kindness toward peers.',
    targetAreas: [
      'Refine cursive penmanship joins during extended writing.',
      'Begin exploratory work on 7-times table division patterns.',
      'Take on reading buddy duties for Reception Willow class.',
    ],
  },
];

/**
 * GET /api/teacher/grade-cards
 * Retrieve grade cards for teacher's class
 */
teacherRouter.get('/grade-cards', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      gradeCards: backendGradeCards,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/teacher/grade-cards
 * Save / publish pupil grade card
 */
teacherRouter.post('/grade-cards', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = req.body;
    if (!card || !card.pupilId) {
      res.status(400).json({ success: false, message: 'Pupil ID and card data required' });
      return;
    }

    const idx = backendGradeCards.findIndex((g) => g.pupilId === card.pupilId || g.id === card.id);
    if (idx >= 0) {
      backendGradeCards[idx] = { ...card, lastUpdated: new Date().toISOString() };
    } else {
      backendGradeCards.unshift({ ...card, lastUpdated: new Date().toISOString() });
    }

    logger.info('Grade card saved and published', {
      action: 'teacher.saveGradeCard',
      targetId: card.pupilId,
    });

    res.status(200).json({
      success: true,
      message: `Grade card for ${card.pupilName || 'pupil'} saved and published to Parent Gradebook`,
      gradeCard: card,
    });
  } catch (err) {
    next(err);
  }
});
