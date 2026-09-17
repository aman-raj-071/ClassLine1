import express, { Request, Response, NextFunction } from 'express';
import { authRouter } from './routes/auth';
import { parentRouter } from './routes/parent';
import { teacherRouter } from './routes/teacher';
import { adminRouter } from './routes/admin';
import { errorHandler } from './utils/errors';
import { logger } from './utils/logger';
import { env } from './config/env';

export const app = express();

// Disable X-Powered-By header
app.disable('x-powered-by');

// Middleware: CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', env.CORS_ORIGIN);
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, X-Amz-Date, X-Api-Key'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Middleware: JSON parser
app.use(express.json({ limit: '1mb' }));

// Middleware: Structured request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    if (req.path !== '/api/health') {
      logger.info(`${req.method} ${req.path} ${res.statusCode}`, {
        action: 'http_request',
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs,
        },
      });
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ClassLine Serverless API',
    region: env.AWS_REGION,
    version: '1.0.0',
  });
});

// Local development AI route. Production should protect this with the normal
// teacher authentication middleware or an API gateway authorizer.
app.post('/api/ai/grade-card-narrative', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!env.GEMINI_API_KEY) return res.status(503).json({ error: 'GEMINI_API_KEY is not configured on the API server.' });
    const { pupilName, cgpa, overallGrade, resultStatus, subjects } = req.body;
    if (typeof pupilName !== 'string' || typeof cgpa !== 'number' || !Array.isArray(subjects)) return res.status(400).json({ error: 'Invalid grade-card narrative request.' });
    const subjectSummary = subjects.slice(0, 8).map((subject: { subject: string; marksObtained: number; grade: string }) => `${subject.subject}: ${subject.marksObtained}/100 (${subject.grade})`).join('; ');
    const prompt = `Write one factual, supportive UK-English form-tutor narrative of 45-65 words for a school report. Do not invent facts, diagnoses, or personal traits. Refer to the pupil by first name only. Pupil: ${pupilName}; CGPA: ${cgpa}; overall grade: ${overallGrade}; result: ${resultStatus}; subjects: ${subjectSummary}. Return only the narrative.`;
    const providerResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 130 } }) });
    if (!providerResponse.ok) {
      const providerError = await providerResponse.json().catch(() => null) as { error?: { message?: string } } | null;
      return res.status(providerResponse.status).json({ error: providerError?.error?.message || `Gemini request failed (${providerResponse.status}).` });
    }
    const data = await providerResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const narrative = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!narrative) return res.status(502).json({ error: 'Gemini returned no usable narrative.' });
    res.status(200).json({ narrative });
  } catch (err) { next(err); }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/parent', parentRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
  });
});

// Centralized error handler
app.use(errorHandler);
