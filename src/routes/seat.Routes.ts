import { Router } from 'express';
import { PERMISSIONS } from '../authorization/permissions';
import { getAll, getByHallId, getById, create, createBulk, update, remove } from '../controllers/seat.Controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

const router = Router();

router.get('/', getAll);
router.get('/hall/:hallId', getByHallId);  // get seats by hall
router.post('/bulk', requireAuth, requirePermission(PERMISSIONS.SEAT_CREATE), createBulk);
router.get('/:id', getById);
router.post('/', requireAuth, requirePermission(PERMISSIONS.SEAT_CREATE), create);
router.put('/:id', requireAuth, requirePermission(PERMISSIONS.SEAT_UPDATE), update);
router.delete('/:id', requireAuth, requirePermission(PERMISSIONS.SEAT_DELETE), remove);

export default router;
