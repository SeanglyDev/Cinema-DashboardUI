import type { Request, Response } from 'express';
import { fetchAllUsers } from '../services/user.Service';

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await fetchAllUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
