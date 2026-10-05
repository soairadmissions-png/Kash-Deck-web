import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from './tokens';
import { db } from '../../db/client';
import { users, workspaceMembers, workspaces } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    phone?: string | null;
    emailVerifiedAt?: string | null;
    phoneVerifiedAt?: string | null;
    activeWorkspaceId?: string | null;
  };
  workspaceId?: string;
  workspaceRole?: string;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please sign in again.' });
  }

  // Fetch fresh user from DB
  const userRows = await db.select().from(users).where(eq(users.id, payload.userId));
  if (userRows.length === 0) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  const u = userRows[0];
  req.user = {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    emailVerifiedAt: u.emailVerifiedAt,
    phoneVerifiedAt: u.phoneVerifiedAt,
    activeWorkspaceId: u.activeWorkspaceId
  };

  next();
}

export function requireWorkspaceMember(requiredRoles?: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const workspaceId = req.params.workspaceId || req.params.id || req.body.workspaceId || req.user.activeWorkspaceId;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID required.' });
    }

    // Verify membership in workspace
    const memberRows = await db
      .select()
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, req.user.id)));

    if (memberRows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this workspace.' });
    }

    const membership = memberRows[0];
    if (requiredRoles && !requiredRoles.includes(membership.role)) {
      return res.status(403).json({ error: `Permission denied. Requires one of roles: ${requiredRoles.join(', ')}` });
    }

    req.workspaceId = workspaceId;
    req.workspaceRole = membership.role;
    next();
  };
}
