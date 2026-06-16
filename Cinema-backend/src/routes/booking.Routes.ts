import { Router } from 'express';
import { PERMISSIONS } from '../authorization/permissions';
import { getAll, getById, getByUserId, create, updateStatus, remove } from '../controllers/booking.Controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

const router = Router();

router.get('/', requireAuth, requirePermission(PERMISSIONS.BOOKING_READ), getAll);
router.get('/user/:userId', requireAuth, getByUserId); // get bookings by user
router.get('/:id', requireAuth, getById);
router.post('/', requireAuth, requirePermission(PERMISSIONS.BOOKING_CREATE), create);
router.put('/:id', requireAuth, requirePermission(PERMISSIONS.BOOKING_UPDATE), updateStatus);
router.delete('/:id', requireAuth, requirePermission(PERMISSIONS.BOOKING_DELETE), remove);

export default router;
