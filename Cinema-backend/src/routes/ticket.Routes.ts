import { Router } from 'express';
import { PERMISSIONS } from '../authorization/permissions';
import { confirmTicket, payBooking, scanTicket } from '../controllers/ticket.Controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';

const router = Router();

router.post('/bookings/:bookingId/pay', requireAuth, payBooking);
router.get('/tickets/:ticketId/scan', scanTicket);
router.post('/tickets/:ticketId/confirm', requireAuth, requirePermission(PERMISSIONS.TICKET_UPDATE), confirmTicket);
router.put('/tickets/:ticketId/confirm', requireAuth, requirePermission(PERMISSIONS.TICKET_UPDATE), confirmTicket);

export default router;
