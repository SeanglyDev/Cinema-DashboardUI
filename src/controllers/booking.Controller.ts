import type { Request, Response } from 'express';
import type { AuthenticatedUser } from '../@types/auth';
import { PERMISSIONS } from '../authorization/permissions';
import { ROLES, roleHasPermission } from '../authorization/roles';
import {
  fetchAllBookings,
  fetchBookingById,
  fetchBookingsByUserId,
  addBooking,
  editBookingStatus,
  removeBooking,
} from '../services/booking.Service';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

// GET /api/bookings
export async function getAll(req: Request, res: Response) {
  try {
    const bookings = await fetchAllBookings();
    res.json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/bookings/:id
export async function getById(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const booking = await fetchBookingById(Number(req.params.id));

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (
      user.role_id !== ROLES.SUPER_ADMIN &&
      user.role_id !== ROLES.STAFF &&
      booking.user_id !== user.user_id
    ) {
      res.status(403).json({ success: false, message: 'You do not have permission' });
      return;
    }

    res.json({ success: true, data: booking });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

// GET /api/bookings/user/:userId
export async function getByUserId(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const userId = Number(req.params.userId);

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (user.role_id !== ROLES.SUPER_ADMIN && user.role_id !== ROLES.STAFF && user.user_id !== userId) {
      res.status(403).json({ success: false, message: 'You do not have permission' });
      return;
    }

    const bookings = await fetchBookingsByUserId(userId);
    res.json({ success: true, data: bookings });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

// POST /api/bookings
export async function create(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const canCreateForOthers = user.role_id !== ROLES.CUSTOMER && roleHasPermission(user.role_id, PERMISSIONS.BOOKING_CREATE);

    if (!roleHasPermission(user.role_id, PERMISSIONS.BOOKING_CREATE)) {
      res.status(403).json({ success: false, message: 'You do not have permission' });
      return;
    }

    const booking = await addBooking({
      ...req.body,
      user_id: canCreateForOthers && req.body.user_id ? Number(req.body.user_id) : user.user_id,
    });
    res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// PUT /api/bookings/:id
export async function updateStatus(req: Request, res: Response) {
  try {
    const booking = await editBookingStatus(Number(req.params.id), req.body);
    res.json({ success: true, data: booking });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

// DELETE /api/bookings/:id
export async function remove(req: Request, res: Response) {
  try {
    await removeBooking(Number(req.params.id));
    res.json({ success: true, message: 'Booking deleted' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}
