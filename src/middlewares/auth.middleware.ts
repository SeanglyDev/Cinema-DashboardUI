import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthenticatedUser } from '../@types/auth';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

interface TokenPayload {
  user_id: number;
  role_id: number;
}

function isTokenPayload(payload: string | jwt.JwtPayload): payload is TokenPayload {
  return (
    typeof payload !== 'string' &&
    typeof payload.user_id === 'number' &&
    typeof payload.role_id === 'number'
  );
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ success: false, message: 'Bearer token is required' });
    return;
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : authHeader.trim();
  const jwtSecret = process.env.JWT_SECRET;

  if (!token) {
    res.status(401).json({ success: false, message: 'Bearer token is required' });
    return;
  }

  if (!jwtSecret) {
    res.status(500).json({ success: false, message: 'JWT secret is not configured' });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    if (!isTokenPayload(payload)) {
      res.status(401).json({ success: false, message: 'Invalid token payload' });
      return;
    }

    const user: AuthenticatedUser = {
      user_id: payload.user_id,
      role_id: payload.role_id,
    };

    (req as AuthenticatedRequest).user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
