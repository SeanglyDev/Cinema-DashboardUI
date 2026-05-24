export const PERMISSIONS = {
  ALL: '*',
  MOVIE_CREATE: 'movie:create',
  MOVIE_UPDATE: 'movie:update',
  MOVIE_DELETE: 'movie:delete',
  CINEMA_CREATE: 'cinema:create',
  CINEMA_UPDATE: 'cinema:update',
  CINEMA_DELETE: 'cinema:delete',
  HALL_CREATE: 'hall:create',
  HALL_UPDATE: 'hall:update',
  HALL_DELETE: 'hall:delete',
  SEAT_CREATE: 'seat:create',
  SEAT_UPDATE: 'seat:update',
  SEAT_DELETE: 'seat:delete',
  SHOWTIME_CREATE: 'showtime:create',
  SHOWTIME_UPDATE: 'showtime:update',
  SHOWTIME_DELETE: 'showtime:delete',
  USER_READ: 'user:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
