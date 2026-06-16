import type { Request, Response } from 'express';
import { addUser, editUser, fetchAllUsers, fetchUserById, removeUser } from '../services/user.Service';

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await fetchAllUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const user = await fetchUserById(Number(req.params.id));
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await addUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const user = await editUser(Number(req.params.id), req.body);
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    await removeUser(Number(req.params.id));
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}
