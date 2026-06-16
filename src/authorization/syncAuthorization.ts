import pool from '../config/db';
import { PERMISSIONS, type Permission } from './permissions';
import { ROLE_NAMES, ROLE_PERMISSIONS, ROLES, type RoleId } from './roles';

function splitPermission(permission: Permission) {
  if (permission === PERMISSIONS.ALL) return { module: '*', action: '*' };

  const [module, action] = permission.split(':');
  return { module, action };
}

async function ensureRole(roleId: RoleId) {
  const existing = await pool.query('SELECT role_id FROM roles WHERE role_id = $1 LIMIT 1', [roleId]);
  if (existing.rows[0]) return;

  await pool.query('INSERT INTO roles (role_id, role_name) VALUES ($1, $2)', [
    roleId,
    ROLE_NAMES[roleId],
  ]);
}

async function ensurePermission(permission: Permission): Promise<number> {
  const { module, action } = splitPermission(permission);
  const existing = await pool.query(
    'SELECT permission_id FROM permissions WHERE module = $1 AND action = $2 LIMIT 1',
    [module, action]
  );

  if (existing.rows[0]) return existing.rows[0].permission_id;

  const created = await pool.query(
    'INSERT INTO permissions (module, action) VALUES ($1, $2) RETURNING permission_id',
    [module, action]
  );

  return created.rows[0].permission_id;
}

export async function syncAuthorizationData() {
  const permissionIds = new Map<Permission, number>();

  for (const roleId of Object.values(ROLES)) {
    await ensureRole(roleId);
  }

  for (const permission of Object.values(PERMISSIONS)) {
    permissionIds.set(permission, await ensurePermission(permission));
  }

  for (const roleId of Object.values(ROLES)) {
    await pool.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);

    for (const permission of ROLE_PERMISSIONS[roleId] ?? []) {
      const permissionId = permissionIds.get(permission);
      if (!permissionId) continue;

      await pool.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
        [roleId, permissionId]
      );
    }
  }
}
