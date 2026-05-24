import express from 'express';
import type { Request, Response } from 'express';
import  './config/db'

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}🚀✅`);
});
