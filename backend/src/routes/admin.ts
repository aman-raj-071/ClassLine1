import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../auth/middleware';
import { deleteUserAndDataGDPR } from '../db/queries';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export const adminRouter = Router();

adminRouter.use(authenticate, authorize('admin'));

/**
 * DELETE /api/admin/users/:id/gdpr-delete
 * Permanently removes user account and parent-student relationship data
 */
adminRouter.delete('/users/:id/gdpr-delete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.params.id;
    const success = await deleteUserAndDataGDPR(targetUserId);

    if (!success) {
      throw new NotFoundError(`User ${targetUserId} not found`);
    }

    logger.info('GDPR data removal completed', {
      action: 'admin.gdprDelete',
      userId: req.user!.id,
      targetId: targetUserId,
    });

    res.status(200).json({
      success: true,
      message: `GDPR data removal completed for user ${targetUserId}`,
    });
  } catch (err) {
    next(err);
  }
});
