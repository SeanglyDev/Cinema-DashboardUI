import pool from '../config/db';
import type { UserListItem } from '../@types/user';

export async function getAllUsers(): Promise<UserListItem[]> {
  const result = await pool.query(
    `SELECT
       u.user_id,
       u.role_id,
       r.role_name,
       u.name,
       u.email,
       u.profile_user,
       u.is_active,
       u.created_at
     FROM users u
     LEFT JOIN roles r ON r.role_id = u.role_id
     ORDER BY u.created_at DESC NULLS LAST, u.user_id DESC`
  );

  return result.rows;
}
