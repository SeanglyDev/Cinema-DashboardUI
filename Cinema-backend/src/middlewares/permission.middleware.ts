import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedUser } from '../@types/auth';
import type { Permission } from '../authorization/permissions';
import pool from '../config/db';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

async function roleHasPermission(roleId: number, permission: Permission): Promise<boolean> {
  const [module, action] = permission.split(':');

  const result = await pool.query(
    `SELECT 1
     FROM role_permissions rp
     JOIN permissions p ON p.permission_id = rp.permission_id
     WHERE rp.role_id = $1
       AND (
         (p.module = $2 AND p.action = $3)
         OR (p.module = '*' AND p.action = '*')
       )
     LIMIT 1`,
    [roleId, module, action]
  );

  return (result.rowCount ?? 0) > 0;
}

export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    try {
      if (!(await roleHasPermission(user.role_id, permission))) {
        res.status(403).json({ success: false, message: 'You do not have permission' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
