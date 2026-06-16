import express from 'express';
import type { Request, Response } from 'express';
import './config/db';
import { syncAuthorizationData } from './authorization/syncAuthorization';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use((req, res, next) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter(Boolean);
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

import authRouter from './routes/auth.route';
app.use('/api/auth', authRouter);

import movieRoutes from './routes/movie.route';
app.use('/api/movies', movieRoutes);

import userRoutes from './routes/user.route';
app.use('/api/users', userRoutes);

import cinemaRoutes from './routes/cinema.Routes';
app.use('/api/cinemas', cinemaRoutes);

import hallRoutes from './routes/hall.Routes';
app.use('/api/halls', hallRoutes);

import seatRoutes from './routes/seat.Routes';
app.use('/api/seats', seatRoutes);

import showTimeRoutes from './routes/showTime.Routes';
app.use('/api/showtimes', showTimeRoutes);

import bookingRoutes from './routes/booking.Routes';
app.use('/api/bookings', bookingRoutes);

import ticketRoutes from './routes/ticket.Routes';
app.use('/api', ticketRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript!');
});

syncAuthorizationData()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Authorization setup failed:', error.message);
    process.exit(1);
  });
