import { PERMISSIONS, type Permission } from './permissions';

export const ROLES = {
  SUPER_ADMIN: 1,
  CUSTOMER: 2,
  STAFF: 3,
} as const;

export type RoleId = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_NAMES: Record<RoleId, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.STAFF]: 'Staff',
};

export const ROLE_PERMISSIONS: Record<number, Permission[]> = {
  [ROLES.SUPER_ADMIN]: [PERMISSIONS.ALL],
  [ROLES.CUSTOMER]: [
    PERMISSIONS.MOVIE_READ,
    PERMISSIONS.CINEMA_READ,
    PERMISSIONS.HALL_READ,
    PERMISSIONS.SEAT_READ,
    PERMISSIONS.SHOWTIME_READ,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.TICKET_READ,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.NOTIFICATION_READ,
    PERMISSIONS.MOVIE_READ,
    PERMISSIONS.CINEMA_READ,
    PERMISSIONS.HALL_READ,
    PERMISSIONS.SEAT_READ,
    PERMISSIONS.SHOWTIME_READ,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.TICKET_READ,
    PERMISSIONS.TICKET_UPDATE,
  ],
};

export function roleHasPermission(roleId: number, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[roleId] || [];
  return permissions.includes(PERMISSIONS.ALL) || permissions.includes(permission);
}
