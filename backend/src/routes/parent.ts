import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../auth/middleware';
import {
  TimelineQuerySchema,
  ReadingLogSchema,
  PayFeeSchema,
} from '../validation/schemas';
import {
  getStudentsByParent,
  isParentOfStudent,
  getEntriesForStudent,
  markEntrySeen,
  markFeePaid,
  recordReadingLog,
  getUpcomingDates,
  getTeacherClass,
  getUserById,
} from '../db/queries';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export const parentRouter = Router();

// Apply auth middlewares for all parent routes
parentRouter.use(authenticate, authorize('parent', 'admin'));

/**
 * GET /api/parent/children
 * List of children for logged-in parent
 */
parentRouter.get('/children', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parentId = req.user!.id;
    const children = await getStudentsByParent(parentId);

    res.status(200).json({
      children,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/parent/timeline?childId=&filter=&search=
 * Ledger entries for a pupil with seen and payment status
 */
parentRouter.get('/timeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = TimelineQuerySchema.parse(req.query);
    const parentId = req.user!.id;

    // Security check: ensure this parent is linked to childId (unless admin)
    if (req.user!.role !== 'admin') {
      const isAuthorized = await isParentOfStudent(parentId, query.childId);
      if (!isAuthorized) {
        throw new ForbiddenError('You are not authorized to view records for this pupil');
      }
    }

    const entries = await getEntriesForStudent(query.childId, query.filter, query.search);

    res.status(200).json({
      childId: query.childId,
      filter: query.filter,
      count: entries.length,
      entries,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/parent/entries/:id/seen
 * Mark entry as seen by parent for a specific child
 */
parentRouter.post('/entries/:id/seen', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entryId = req.params.id;
    const { childId } = req.body;

    if (!childId) {
      return res.status(400).json({ error: 'childId is required in request body' });
    }

    if (req.user!.role !== 'admin') {
      const isAuthorized = await isParentOfStudent(req.user!.id, childId);
      if (!isAuthorized) {
        throw new ForbiddenError('You are not authorized to update records for this pupil');
      }
    }

    const result = await markEntrySeen(entryId, childId);

    logger.info('Entry marked as seen', {
      action: 'parent.markSeen',
      userId: req.user!.id,
      targetId: entryId,
      metadata: { childId },
    });

    res.status(200).json({
      success: true,
      entryId,
      childId,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/parent/entries/:id/pay
 * Mark fee as paid via SchoolPay integration simulation
 */
parentRouter.post('/entries/:id/pay', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const entryId = req.params.id;
    const { childId, paymentReference } = req.body;
    PayFeeSchema.parse(req.body);

    if (!childId) {
      return res.status(400).json({ error: 'childId is required in request body' });
    }

    if (req.user!.role !== 'admin') {
      const isAuthorized = await isParentOfStudent(req.user!.id, childId);
      if (!isAuthorized) {
        throw new ForbiddenError('You are not authorized to settle payments for this pupil');
      }
    }

    const result = await markFeePaid(entryId, childId, paymentReference);

    logger.info('Fee payment settled', {
      action: 'parent.payFee',
      userId: req.user!.id,
      targetId: entryId,
      metadata: { childId, paymentReference: result.paymentReference },
    });

    res.status(200).json({
      success: true,
      message: 'SchoolPay payment recorded successfully',
      entryId,
      childId,
      ...result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/parent/reading-log
 * Parent logs nightly reading progress
 */
parentRouter.post('/reading-log', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { childId, date, book, minutes } = ReadingLogSchema.parse(req.body);

    if (req.user!.role !== 'admin') {
      const isAuthorized = await isParentOfStudent(req.user!.id, childId);
      if (!isAuthorized) {
        throw new ForbiddenError('You are not authorized to log reading for this pupil');
      }
    }

    const log = await recordReadingLog(childId, date, book, minutes, req.user!.id);

    logger.info('Reading night logged', {
      action: 'parent.readingLog',
      userId: req.user!.id,
      targetId: childId,
      metadata: { date, minutes },
    });

    res.status(201).json({
      success: true,
      message: 'Reading session recorded in pupil log',
      log,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/parent/upcoming?childId=
 * Upcoming events and deadlines
 */
parentRouter.get('/upcoming', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const childId = req.query.childId as string;
    const upcoming = await getUpcomingDates('class-y3-oak');

    res.status(200).json({
      childId: childId || null,
      upcoming,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/parent/teacher-info?classId=
 * Class teacher contact details
 */
parentRouter.get('/teacher-info', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const classId = (req.query.classId as string) || 'class-y3-oak';
    const classItem = await getTeacherClass('user-tch-001');

    let teacher = null;
    if (classItem?.teacherId) {
      teacher = await getUserById(classItem.teacherId as string);
    }

    if (!teacher) {
      teacher = {
        name: 'Mrs. Eleanor Reynolds',
        email: 'e.reynolds@oakridgeprimary.sch.uk',
        role: 'Class Teacher, Year 3 Oak',
      };
    }

    res.status(200).json({
      classId,
      className: classItem?.name || 'Year 3 Oak Class',
      teacher: {
        name: teacher.name,
        email: teacher.email,
        room: 'Room 14 (Key Stage 2 Building)',
        officeHours: 'Mon-Thu 15:30 - 16:00',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/parent/grade-card?childId=
 * Returns the pupil's official grade card
 */
parentRouter.get('/grade-card', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const childId = (req.query.childId as string) || 'child-leo';

    // Mock official published grade card for parent view
    const gradeCard = {
      id: 'gc-autumn-2026-leo',
      pupilId: childId === 'child-maya' ? 'child-maya' : 'child-leo',
      pupilName: childId === 'child-maya' ? 'Maya Evans' : 'Leo Evans',
      classGroup: childId === 'child-maya' ? 'Willow' : 'Oak',
      yearGroup: childId === 'child-maya' ? 'Reception' : 'Year 3',
      academicYear: '2026 – 2027',
      term: 'Autumn Term Mid-Year Assessment',
      issuedDate: '15 Dec 2026',
      teacherName: childId === 'child-maya' ? 'Miss Clara Higgins' : 'Mrs. Eleanor Reynolds',
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
          subject: 'English (Reading & Phonics)',
          category: 'Core',
          marksObtained: 92,
          maxMarks: 100,
          grade: 'A*',
          band: 'Greater Depth',
          effort: 'Outstanding',
          teacherComment: 'Outstanding interpretive depth and comprehension.',
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
          teacherComment: 'Superb fluency in mental arithmetic.',
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
          teacherComment: 'Excellent curiosity in investigation units.',
        },
      ],
      teacherGeneralRemarks: 'Approaches every lesson with sustained curiosity and mature kindness toward peers.',
      targetAreas: [
        'Refine cursive penmanship joins during extended writing.',
        'Begin exploratory work on 7-times table division patterns.',
      ],
    };

    res.status(200).json({
      success: true,
      gradeCard,
    });
  } catch (err) {
    next(err);
  }
});
