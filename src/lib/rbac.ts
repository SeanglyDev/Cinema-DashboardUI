export type RoleId = 1 | 2 | 3

export type PageName =
  | 'dashboard'
  | 'reports'
  | 'movies'
  | 'showtimes'
  | 'cinemas'
  | 'seat-manager'
  | 'bookings'
  | 'payments'
  | 'users'
  | 'roles'
  | 'notifications'

export type Permission =
  | '*'
  | 'dashboard:read'
  | 'report:read'
  | 'notification:read'
  | 'movie:read'
  | 'movie:create'
  | 'movie:update'
  | 'movie:delete'
  | 'cinema:read'
  | 'cinema:create'
  | 'cinema:update'
  | 'cinema:delete'
  | 'hall:read'
  | 'hall:create'
  | 'hall:update'
  | 'hall:delete'
  | 'seat:read'
  | 'seat:create'
  | 'seat:update'
  | 'seat:delete'
  | 'showtime:read'
  | 'showtime:create'
  | 'showtime:update'
  | 'showtime:delete'
  | 'booking:create'
  | 'booking:read'
  | 'booking:update'
  | 'booking:delete'
  | 'payment:create'
  | 'ticket:read'
  | 'ticket:update'
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'

export const ROLES = {
  SUPER_ADMIN: 1,
  CUSTOMER: 2,
  STAFF: 3,
} as const

export const ROLE_LABELS: Record<RoleId, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.STAFF]: 'Staff',
}

export const ROLE_PERMISSIONS: Record<RoleId, Permission[]> = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.CUSTOMER]: [
    'movie:read',
    'cinema:read',
    'hall:read',
    'seat:read',
    'showtime:read',
    'booking:create',
    'payment:create',
    'ticket:read',
  ],
  [ROLES.STAFF]: [
    'dashboard:read',
    'report:read',
    'notification:read',
    'movie:read',
    'cinema:read',
    'hall:read',
    'seat:read',
    'showtime:read',
    'booking:read',
    'booking:update',
    'payment:create',
    'ticket:read',
    'ticket:update',
  ],
}

export const ROLE_PAGE_ACCESS: Record<RoleId, PageName[]> = {
  [ROLES.SUPER_ADMIN]: [
    'dashboard',
    'reports',
    'movies',
    'showtimes',
    'cinemas',
    'seat-manager',
    'bookings',
    'payments',
    'users',
    'roles',
    'notifications',
  ],
  [ROLES.CUSTOMER]: ['movies', 'showtimes', 'cinemas', 'bookings', 'payments'],
  [ROLES.STAFF]: [
    'dashboard',
    'reports',
    'movies',
    'showtimes',
    'cinemas',
    'seat-manager',
    'bookings',
    'payments',
    'notifications',
  ],
}

export const ROLE_ACTION_SUMMARY: Record<RoleId, string[]> = {
  [ROLES.SUPER_ADMIN]: [
    'Open every dashboard page',
    'Create, edit, and delete movies, cinemas, halls, seats, and showtimes',
    'Create, edit, deactivate users, and manage roles',
    'View reports and manage all bookings, payments, and tickets',
  ],
  [ROLES.CUSTOMER]: [
    'Browse movies, cinemas, seats, and showtimes',
    'Create bookings only for their own account',
    'Pay their own bookings and view their own tickets',
    'Cannot create movies, users, cinemas, halls, seats, or showtimes',
  ],
  [ROLES.STAFF]: [
    'Open operations pages for movies, showtimes, venues, seats, bookings, payments, and reports',
    'View setup data but cannot add, edit, or delete movies, users, cinemas, halls, seats, or showtimes',
    'View all bookings and update booking status',
    'Confirm scanned tickets',
  ],
}

export function getCurrentRoleId(): RoleId | null {
  const token = localStorage.getItem('cinemax_token')
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { role_id?: number }
    if (payload.role_id === ROLES.SUPER_ADMIN || payload.role_id === ROLES.CUSTOMER || payload.role_id === ROLES.STAFF) {
      return payload.role_id
    }
  } catch {
    return null
  }

  return null
}

export function canAccessPage(roleId: RoleId | null, page: PageName) {
  if (!roleId) return false
  return ROLE_PAGE_ACCESS[roleId].includes(page)
}

export function firstAllowedPage(roleId: RoleId | null): PageName {
  if (!roleId) return 'dashboard'
  return ROLE_PAGE_ACCESS[roleId][0] ?? 'dashboard'
}

export function hasPermission(roleId: RoleId | null, permission: Permission) {
  if (!roleId) return false
  const permissions = ROLE_PERMISSIONS[roleId]
  return permissions.includes('*') || permissions.includes(permission)
}
