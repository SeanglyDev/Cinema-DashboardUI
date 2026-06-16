import pool from '../config/db';
import type { CreateUserInput, UpdateUserInput, UserListItem } from '../@types/user';

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

export async function getUserById(id: number): Promise<UserListItem | null> {
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
     WHERE u.user_id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<UserListItem | null> {
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
     WHERE LOWER(u.email) = LOWER($1)`,
    [email]
  );

  return result.rows[0] || null;
}

export async function createUser(data: CreateUserInput & { password_hash: string }): Promise<UserListItem | null> {
  const result = await pool.query(
    `INSERT INTO users (role_id, name, email, password_hash, profile_user, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING user_id`,
    [
      data.role_id,
      data.name,
      data.email,
      data.password_hash,
      data.profile_user ?? null,
      data.is_active ?? true,
    ]
  );

  return await getUserById(result.rows[0].user_id);
}

export async function updateUser(id: number, data: UpdateUserInput): Promise<UserListItem | null> {
  const result = await pool.query(
    `UPDATE users SET
       role_id = COALESCE($1, role_id),
       name = COALESCE($2, name),
       email = COALESCE($3, email),
       profile_user = COALESCE($4, profile_user),
       is_active = COALESCE($5, is_active)
     WHERE user_id = $6
     RETURNING user_id, role_id, name, email, profile_user, is_active, created_at`,
    [
      data.role_id,
      data.name,
      data.email,
      data.profile_user,
      data.is_active,
      id,
    ]
  );

  return result.rows[0] || null;
}

export async function deleteUser(id: number): Promise<void> {
  await pool.query(
    'UPDATE users SET is_active = false WHERE user_id = $1',
    [id]
  );
}
