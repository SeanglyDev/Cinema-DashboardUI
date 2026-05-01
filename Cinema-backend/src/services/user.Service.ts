import type { UserListItem } from '../@types/user';
import { getAllUsers } from '../models/userModel';

export async function fetchAllUsers(): Promise<UserListItem[]> {
  return await getAllUsers();
}
