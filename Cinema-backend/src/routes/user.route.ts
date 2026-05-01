import { Router } from 'express';
import { PERMISSIONS } from '../authorization/permissions';
import { getAllUsers } from '../controllers/user.Controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

const router = Router();

router.get('/', requireAuth, requirePermission(PERMISSIONS.USER_READ), getAllUsers);

export default router;
