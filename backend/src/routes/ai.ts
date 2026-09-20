import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../auth/middleware';
import { generateTeacherDraft, generateWebsiteAssistantReply } from '../services/ai/teacherAssistant';

export const aiRouter = Router();

// --- Existing Schemas ---
const gradeCardSchema = z.object({
  pupilName: z.string().trim().min(1).max(100),
  cgpa: z.number().min(0).max(10),
  overallGrade: z.string().trim().max(20).optional(),
  resultStatus: z.string().trim().max(40).optional(),
  subjects: z.array(z.object({
    subject: z.string().trim().min(1).max(100),
    marksObtained: z.number().min(0).max(100),
    grade: z.string().trim().max(20),
  })).min(1).max(20),
});

const assistantSchema = z.discriminatedUnion('task', [
  z.object({ task: z.literal('grade_card_narrative'), gradeCard: gradeCardSchema }),
  z.object({ task: z.literal('parent_message'), topic: z.string().trim().min(1).max(160), notes: z.string().trim().min(1).max(2000), audience: z.enum(['whole_class', 'individual']) }),
  z.object({ task: z.literal('translate'), text: z.string().trim().min(1).max(3000), language: z.enum(['Hindi', 'English', 'Kannada', 'Tamil', 'Marathi', 'Bengali']) }),
]);

// The current demo login has no Cognito token. Keep local development usable,
// but enforce a role check after deployment.
const protectProductionAi = (...roles: ('parent' | 'teacher' | 'admin')[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV !== 'production') return next();
    return authenticate(req, res, (error?: unknown) => {
      if (error) return next(error);
      return authorize(...roles)(req, res, next);
    });
  };

// --- Existing AI Routes ---

aiRouter.post('/grade-card-narrative', protectProductionAi('teacher', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gradeCard = gradeCardSchema.parse(req.body);
    const result = await generateTeacherDraft({ task: 'grade_card_narrative', gradeCard });
    res.status(200).json({ narrative: result.text, provider: result.provider });
  } catch (error) {
    next(error);
  }
});

aiRouter.post('/teacher-assistant', protectProductionAi('teacher', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = assistantSchema.parse(req.body);
    const result = await generateTeacherDraft(request);
    res.status(200).json({ draft: result.text, provider: result.provider });
  } catch (error) {
    next(error);
  }
});

// Public, website-only help. This endpoint deliberately has no access to
// pupil, family, fee, message, or account records.
aiRouter.post('/website-assistant', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, role } = z.object({
      message: z.string().trim().min(1).max(1000),
      role: z.enum(['parent', 'teacher']).optional(),
    }).parse(req.body);
    const result = await generateWebsiteAssistantReply(message, role);
    res.status(200).json({ response: result.text, provider: result.provider });
  } catch (error) {
    next(error);
  }
});

aiRouter.post('/parent-assistant', protectProductionAi('parent', 'teacher', 'admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({
      task: z.enum(['message', 'translate']),
      text: z.string().trim().min(1).max(2000),
      language: z.enum(['Hindi', 'English', 'Kannada', 'Tamil', 'Marathi', 'Bengali']).optional(),
    }).parse(req.body);
    const request = body.task === 'message'
      ? { task: 'parent_question' as const, notes: body.text }
      : { task: 'translate' as const, text: body.text, language: body.language || 'Hindi' };
    const result = await generateTeacherDraft(request);
    res.status(200).json({ draft: result.text, provider: result.provider });
  } catch (error) {
    next(error);
  }
});
