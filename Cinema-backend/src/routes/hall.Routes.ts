import { Router } from 'express';
import { getAll, getByCinemaId, getById, create, update, remove } from '../controllers/hall.Controller';
import { PERMISSIONS } from '../authorization/permissions';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

const router = Router();

router.get('/', getAll);
router.get('/cinema/:cinemaId', getByCinemaId);
router.get('/:id', getById);
router.post('/', requireAuth, requirePermission(PERMISSIONS.HALL_CREATE), create);
router.put('/:id', requireAuth, requirePermission(PERMISSIONS.HALL_UPDATE), update);
router.delete('/:id', requireAuth, requirePermission(PERMISSIONS.HALL_DELETE), remove);

export default router;
