import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { handleSpin, handleWinnersList } from './controllers/spinController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rotas
app.post('/api/spin', handleSpin);
app.get('/api/winners', handleWinnersList);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Roleta Backend rodando em http://localhost:${PORT}`);
});