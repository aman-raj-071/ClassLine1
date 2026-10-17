import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CognitoIdentityProviderServiceException } from '@aws-sdk/client-cognito-identity-provider';
import { loginWithCognitoPassword, requestCognitoPasswordReset, confirmCognitoPasswordReset } from '../auth/cognito';
import { authenticate, loginRateLimiter } from '../auth/middleware';
import { UnauthorizedError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export const authRouter = Router();
const LoginSchema = z.object({ username: z.string().trim().min(1).max(128), password: z.string().min(1).max(256), });

function getCognitoMessage(error: unknown) {
  const name = (error as { name?: string })?.name;
  if (name === 'NotAuthorizedException' || name === 'UserNotFoundException') return 'Username or password is incorrect.';
  if (name === 'PasswordResetRequiredException') return 'Password reset is required. Use Forgot password to continue.';
  if (name === 'UserNotConfirmedException') return 'This account is not confirmed. Contact the school office.';
  return 'Unable to authenticate with Cognito. Please try again or contact the school office.';
}

authRouter.post('/login', loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = LoginSchema.parse(req.body);
    const result = await loginWithCognitoPassword(username, password);
    const payload = JSON.parse(Buffer.from(result.IdToken!.split('.')[1], 'base64url').toString('utf8'));
    const role = payload['custom:role'] || 'parent';
    res.status(200).json({
      token: result.IdToken,
      user: {
        id: payload.sub, username: payload['cognito:username'] || username,
        name: payload.name || username, email: payload.email || '', role,
        schoolId: payload['custom:schoolId'] || '', avatarInitials: payload['custom:avatarInitials'] || '',
        children: [], class: payload['custom:class'] || undefined,
        isAuthorized: payload['custom:isAuthorized'] === 'true' || payload['custom:role'] === 'admin',
      },
    });
  } catch (error) {
    if (error instanceof CognitoIdentityProviderServiceException) {
      logger.warn('Cognito password login failed', { action: 'auth.login', metadata: { errorName: error.name } });
      next(new UnauthorizedError(getCognitoMessage(error)));
      return;
    }
    next(error);
  }
});

authRouter.post('/forgot-password', loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = z.string().trim().min(1).max(128).parse(req.body?.username);
    await requestCognitoPasswordReset(username);
    res.status(200).json({ message: 'If this account can receive a reset code, Cognito has sent it to the registered contact method.' });
  } catch (error) {
    if (error instanceof CognitoIdentityProviderServiceException) {
      next(new BadRequestError(getCognitoMessage(error)));
      return;
    }
    next(error);
  }
});

authRouter.post('/confirm-password-reset', loginRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = z.object({ username: z.string().trim().min(1).max(128), code: z.string().trim().min(1).max(32), password: z.string().min(8).max(256) }).parse(req.body);
    await confirmCognitoPasswordReset(input.username, input.code, input.password);
    res.status(200).json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    if (error instanceof CognitoIdentityProviderServiceException) {
      next(new BadRequestError(getCognitoMessage(error)));
      return;
    }
    next(error);
  }
});

authRouter.get('/me', authenticate, async (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
});