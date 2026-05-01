export const PERMISSIONS = {
  ALL: '*',
  MOVIE_CREATE: 'movie:create',
  MOVIE_UPDATE: 'movie:update',
  MOVIE_DELETE: 'movie:delete',
  USER_READ: 'user:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
