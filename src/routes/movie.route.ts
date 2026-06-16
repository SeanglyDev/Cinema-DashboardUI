import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/movie.Controller';
import { PERMISSIONS } from '../authorization/permissions';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', requireAuth, requirePermission(PERMISSIONS.MOVIE_CREATE), create);
router.put('/:id', requireAuth, requirePermission(PERMISSIONS.MOVIE_UPDATE), update);
router.delete('/:id', requireAuth, requirePermission(PERMISSIONS.MOVIE_DELETE), remove);

export default router;
