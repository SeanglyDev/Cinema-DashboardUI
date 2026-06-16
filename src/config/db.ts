import { Client, Pool } from "pg";
import dotenv from 'dotenv';
import { release } from "node:os";

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
})

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully!');
    release();
  }
});

export default pool;