import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDb,
  getDbStatus,
  getAllExpenses,
  insertExpense,
  updateExpense,
  deleteExpense,
  bulkInsertExpenses,
  getBankState,
  saveBankState,
  getPreferences,
  savePreferences,
  getSavingsGoal,
  saveSavingsGoal,
  resetDatabase
} from './src/server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Parse incoming JSON
app.use(express.json());

// ----------------- API ROUTES -----------------

// Health & DB status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: getDbStatus()
  });
});

// Expenses CRUD
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await getAllExpenses();
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch expenses', message: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const expense = req.body;
    if (!expense || !expense.merchant || typeof expense.amount !== 'number') {
      return res.status(400).json({ error: 'Invalid expense payload' });
    }
    const created = await insertExpense(expense);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create expense', message: err.message });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const updated = await updateExpense(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update expense', message: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await deleteExpense(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete expense', message: err.message });
  }
});

app.post('/api/expenses/bulk', async (req, res) => {
  try {
    const expenses = req.body;
    if (!Array.isArray(expenses)) {
      return res.status(400).json({ error: 'Payload must be an array of expenses' });
    }
    const result = await bulkInsertExpenses(expenses);
    res.status(201).json({ count: result.length, expenses: result });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to bulk insert expenses', message: err.message });
  }
});

// Bank State
app.get('/api/bank', async (req, res) => {
  try {
    const bank = await getBankState();
    res.json(bank);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch bank state', message: err.message });
  }
});

app.put('/api/bank', async (req, res) => {
  try {
    const updated = await saveBankState(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update bank state', message: err.message });
  }
});

// Preferences
app.get('/api/preferences', async (req, res) => {
  try {
    const prefs = await getPreferences();
    res.json(prefs);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch preferences', message: err.message });
  }
});

app.put('/api/preferences', async (req, res) => {
  try {
    const updated = await savePreferences(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update preferences', message: err.message });
  }
});

// Savings Goal
app.get('/api/savings-goal', async (req, res) => {
  try {
    const goal = await getSavingsGoal();
    res.json(goal);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch savings goal', message: err.message });
  }
});

app.put('/api/savings-goal', async (req, res) => {
  try {
    const updated = await saveSavingsGoal(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update savings goal', message: err.message });
  }
});

// Reset Demo Data
app.post('/api/reset', async (req, res) => {
  try {
    await resetDatabase();
    res.json({ success: true, message: 'Database reset to initial demo state' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset database', message: err.message });
  }
});

// ----------------- VITE / STATIC SERVING -----------------

async function startServer() {
  // Connect to DB asynchronously
  await initDb();

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Spendwise Server] Running on http://0.0.0.0:${PORT} (Mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('[Spendwise Server] Startup error:', err);
  process.exit(1);
});
