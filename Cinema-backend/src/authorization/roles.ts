import { PERMISSIONS, type Permission } from './permissions';

export const ROLES = {
  SUPER_ADMIN: 1,
  CUSTOMER: 2,
  STAFF: 3,
} as const;

export type RoleId = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_PERMISSIONS: Record<number, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [PERMISSIONS.ALL],
  [ROLES.CUSTOMER]: [],
  [ROLES.STAFF]: [],
};

export function roleHasPermission(roleId: number, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[roleId] || [];
  return permissions.includes(PERMISSIONS.ALL) || permissions.includes(permission);
}
