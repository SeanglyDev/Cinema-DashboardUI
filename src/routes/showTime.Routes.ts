import { Router } from 'express';
import { PERMISSIONS } from '../authorization/permissions';
import { getAll, getByMovieId, getById, create, update, remove } from '../controllers/showTime.Controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

const router = Router();

router.get('/', getAll);
router.get('/movie/:movieId', getByMovieId); // get by movie
router.get('/:id', getById);
router.post('/', requireAuth, requirePermission(PERMISSIONS.SHOWTIME_CREATE), create);
router.put('/:id', requireAuth, requirePermission(PERMISSIONS.SHOWTIME_UPDATE), update);
router.delete('/:id', requireAuth, requirePermission(PERMISSIONS.SHOWTIME_DELETE), remove);

export default router;
