import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedUser } from '../@types/auth';
import type { Permission } from '../authorization/permissions';
import { roleHasPermission } from '../authorization/roles';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roleHasPermission(user.role_id, permission)) {
      res.status(403).json({ success: false, message: 'You do not have permission' });
      return;
    }

    next();
  };
}
