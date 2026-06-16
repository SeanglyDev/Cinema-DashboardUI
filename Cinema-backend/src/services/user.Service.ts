import bcrypt from 'bcrypt';
import type { CreateUserInput, UpdateUserInput, UserListItem } from '../@types/user';
import { createUser, deleteUser, getAllUsers, getUserByEmail, getUserById, updateUser } from '../models/userModel';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function fetchAllUsers(): Promise<UserListItem[]> {
  return await getAllUsers();
}

export async function fetchUserById(id: number): Promise<UserListItem> {
  const user = await getUserById(id);
  if (!user) throw new Error('User not found');
  return user;
}

export async function addUser(data: CreateUserInput): Promise<UserListItem> {
  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();

  if (!name) throw new Error('Name is required');
  if (!email) throw new Error('Email is required');
  if (!emailRegex.test(email)) throw new Error('Email is invalid');
  if (!data.password || data.password.length < 6) throw new Error('Password must be at least 6 characters');
  if (![1, 2, 3].includes(data.role_id)) throw new Error('Invalid role');
  if (data.is_active !== undefined && typeof data.is_active !== 'boolean') throw new Error('is_active must be boolean');

  const existingUser = await getUserByEmail(email);
  if (existingUser) throw new Error('Email already exists');

  const password_hash = await bcrypt.hash(data.password, 10);
  const user = await createUser({
    ...data,
    name,
    email,
    profile_user: data.profile_user?.trim() || null,
    password_hash,
  });

  if (!user) throw new Error('Unable to create user');
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
