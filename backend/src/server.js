import express from 'express';
import cors from 'cors';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  database: process.env.DB_NAME || 'appdb'
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
  }
});

app.get('/api/tasks', async (_req, res) => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
  res.json(result.rows);
});

app.post('/api/tasks', async (req, res) => {
  const title = String(req.body?.title || '').trim();
  if (!title) return res.status(400).json({ error: 'title is required' });
  const result = await pool.query('INSERT INTO tasks(title) VALUES($1) RETURNING *', [title]);
  res.status(201).json(result.rows[0]);
});

app.delete('/api/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

initDb()
  .then(() => app.listen(port, '0.0.0.0', () => console.log(`API listening on ${port}`)))
  .catch((err) => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
