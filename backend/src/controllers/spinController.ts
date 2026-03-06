import { Request, Response } from 'express';
import { getRandomPrize } from '../services/prizeService';
import { saveResult, listWinners } from '../services/firebase';

export const handleSpin = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.body;
    
    if (!clientId) {
      return res.status(400).json({ error: 'ID do cliente é obrigatório.' });
    }

    const prize = getRandomPrize();
    
    // Tenta salvar no banco (se falhar é porque já girou ou erro real)
    try {
      await saveResult(clientId, prize);
    } catch (err: any) {
      if (err.message === 'Você já girou a roleta!') {
        return res.status(403).json({ error: err.message });
      }
      throw err;
    }

    return res.json({ prize });
  } catch (error) {
    console.error('Spin error:', error);
    return res.status(500).json({ error: 'Erro ao processar o sorteio.' });
  }
};

export const handleWinnersList = async (req: Request, res: Response) => {
  try {
    const winners = await listWinners();
    return res.json(winners);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar ganhadores.' });
  }
};