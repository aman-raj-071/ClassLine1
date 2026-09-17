import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { env } from '../config/env';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'teacher' | 'admin';
  schoolId: string;
  avatarInitials: string;
  accessCode?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Lazy init of CognitoJwtVerifier to prevent startup crash if pool id is not set
let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier && env.COGNITO_USER_POOL_ID && env.COGNITO_CLIENT_ID) {
    try {
      verifier = CognitoJwtVerifier.create({
        userPoolId: env.COGNITO_USER_POOL_ID,
        tokenUse: 'id',
        clientId: env.COGNITO_CLIENT_ID,
      });
    } catch (e) {
      logger.warn('Cognito JWT verifier initialization deferred', {
        error: (e as Error).message,
      });
    }
  }
  return verifier;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  // Development/Test mock token bypass:
  // Allows testing and local preview without live Cognito endpoints
  if (token.startsWith('mock-jwt-') || process.env.NODE_ENV === 'test') {
    try {
      // Decode mock payload if formatted as mock-jwt-<role>-<id> or JSON base64
      if (token.startsWith('mock-jwt-')) {
        const parts = token.split('-');
        const role = (parts[2] as 'parent' | 'teacher' | 'admin') || 'parent';
        const id = parts[3] || 'mock-user-id';
        req.user = {
          id,
          name: role === 'teacher' ? 'Mrs. Eleanor Reynolds' : 'Eleanor Vance',
          email: `${role}@oakridgeprimary.sch.uk`,
          role,
          schoolId: 'oakridge-primary',
          avatarInitials: role === 'teacher' ? 'ER' : 'EV',
          accessCode: role === 'teacher' ? 'TCH001' : 'PAR001',
        };
        return next();
      }

      // Try base64 payload
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
      req.user = decoded;
      return next();
    } catch {
      // Continue to verifier
    }
  }

  try {
    const jwtVerifier = getVerifier();
    if (!jwtVerifier) {
      throw new Error('JWT Verifier not configured');
    }

    const payload = await jwtVerifier.verify(token);

    req.user = {
      id: (payload.sub as string) || (payload['cognito:username'] as string),
      name: (payload.name as string) || '',
      email: (payload.email as string) || '',
      role: (payload['custom:role'] as 'parent' | 'teacher' | 'admin') || 'parent',
      schoolId: (payload['custom:schoolId'] as string) || 'oakridge-primary',
      avatarInitials: (payload['custom:avatarInitials'] as string) || 'CL',
      accessCode: (payload['custom:accessCode'] as string) || '',
    };

    next();
  } catch (err) {
    logger.warn('Token verification failed', {
      error: (err as Error).message,
    });
    next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}

export function authorize(...allowedRoles: ('parent' | 'teacher' | 'admin')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Forbidden access attempt', {
        userId: req.user.id,
        role: req.user.role,
        action: `${req.method} ${req.originalUrl}`,
        metadata: { allowedRoles },
      });
      return next(
        new ForbiddenError(
          `Access restricted to: ${allowedRoles.join(', ')}. Your role is: ${req.user.role}`
        )
      );
    }

    next();
  };
}

// In-memory rate limiting for login attempts (5 attempts per 15 minutes)
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

export function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const forwarded = req.headers ? (req.headers['x-forwarded-for'] as string) : undefined;
  const ip = forwarded?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
  const maxAttempts = env.RATE_LIMIT_MAX_ATTEMPTS;

  const current = loginAttempts.get(ip);

  if (!current || now - current.firstAttempt > windowMs) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (current.count >= maxAttempts) {
    const remainingTimeSeconds = Math.ceil((current.firstAttempt + windowMs - now) / 1000);
    logger.warn('Login rate limit exceeded', {
      action: 'loginRateLimit',
      metadata: { ip, remainingTimeSeconds },
    });
    return res.status(429).json({
      error: `Too many login attempts. Please wait ${remainingTimeSeconds} seconds before trying again.`,
      retryAfterSeconds: remainingTimeSeconds,
    });
  }

  current.count++;
  next();
}
