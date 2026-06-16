import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedUser } from '../@types/auth';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export function requireRole(roleId: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (user.role_id !== roleId) {
      res.status(403).json({ success: false, message: 'You do not have permission' });
      return;
    }

    next();
  };
}
