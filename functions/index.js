const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PRIZES = [
  { id: '1', label: 'CAFÉ EXPRESSO', weight: 30, coupon: 'CAFEFREE' },
  { id: '2', label: '10% DE DESCONTO', weight: 40, coupon: 'CAFEOFF10' },
  { id: '3', label: 'PÃO DE QUEIJO', weight: 15, coupon: 'PAOFREE' },
  { id: '4', label: '20% DE DESCONTO', weight: 10, coupon: 'CAFEOFF20' },
  { id: '5', label: 'COMPRE 1 LEVE 2', weight: 5, coupon: 'BOGO' },
];

const generateTicketId = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

const getRandomPrize = () => {
  const totalWeight = PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  for (const prize of PRIZES) {
    if (random < prize.weight) return prize;
    random -= prize.weight;
  }
  return PRIZES[0];
};

const router = express.Router();

router.post('/spin', async (req, res) => {
  try {
    const { clientId } = req.body;
    const effectiveId = clientId || `ANON_${Date.now()}`;

    const prize = getRandomPrize();
    const ticketId = generateTicketId();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    await db.collection('winners').add({
      clientId: effectiveId,
      prize: prize.label,
      coupon: prize.coupon,
      ticketId: ticketId,
      timestamp: timestamp,
      redeemed: false,
    });

    return res.json({ 
      prize, 
      ticketId, 
      date: new Date().toLocaleString('pt-BR') 
    });
  } catch (error) {
    console.error('Spin error:', error);
    return res.status(500).json({ error: 'Erro interno.' });
  }
});

router.get('/winners', async (req, res) => {
  try {
    const snapshot = await db.collection('winners').orderBy('timestamp', 'desc').get();
    const winners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json(winners);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar dados.' });
  }
});

app.use('/api', router);

exports.api = onRequest(app);
