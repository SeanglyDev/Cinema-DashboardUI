import { Router } from 'express';
import { PERMISSIONS } from '../authorization/permissions';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/user.Controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

const router = Router();

router.get('/', requireAuth, requirePermission(PERMISSIONS.USER_READ), getAllUsers);
router.get('/:id', requireAuth, requirePermission(PERMISSIONS.USER_READ), getUserById);
router.post('/', requireAuth, requirePermission(PERMISSIONS.USER_CREATE), createUser);
router.put('/:id', requireAuth, requirePermission(PERMISSIONS.USER_UPDATE), updateUser);
router.delete('/:id', requireAuth, requirePermission(PERMISSIONS.USER_DELETE), deleteUser);

export default router;
