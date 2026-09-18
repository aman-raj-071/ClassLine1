import express, { Request, Response, NextFunction } from 'express';
import { authRouter } from './routes/auth';
import { parentRouter } from './routes/parent';
import { teacherRouter } from './routes/teacher';
import { adminRouter } from './routes/admin';
import { aiRouter } from './routes/ai';
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

app.use('/api/ai', aiRouter);

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
