import type { UpdateUserInput, UserListItem } from '../@types/user';
import { deleteUser, getAllUsers, getUserByEmail, getUserById, updateUser } from '../models/userModel';

export async function fetchAllUsers(): Promise<UserListItem[]> {
  return await getAllUsers();
}

export async function fetchUserById(id: number): Promise<UserListItem> {
  const user = await getUserById(id);
  if (!user) throw new Error('User not found');
  return user;
}

export async function editUser(id: number, data: UpdateUserInput): Promise<UserListItem> {
  const user = await getUserById(id);
  if (!user) throw new Error('User not found');

  if (data.name !== undefined) {
    data.name = data.name.trim();
    if (!data.name) throw new Error('Name is required');
  }

  if (data.email !== undefined) {
    data.email = data.email.trim().toLowerCase();
    if (!data.email) throw new Error('Email is required');

    const existingUser = await getUserByEmail(data.email);
    if (existingUser && existingUser.user_id !== id) {
      throw new Error('Email already exists');
    }
  }

  if (data.role_id !== undefined && ![1, 2, 3].includes(data.role_id)) {
    throw new Error('Invalid role');
  }

  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
    throw new Error('is_active must be boolean');
  }

  const updated = await updateUser(id, data);
  return updated!;
}

export async function removeUser(id: number): Promise<void> {
  const user = await getUserById(id);
  if (!user) throw new Error('User not found');
  await deleteUser(id);
}
