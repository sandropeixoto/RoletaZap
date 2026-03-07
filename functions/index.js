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

const DEFAULT_PRIZES = [
  { id: '1', label: 'CAFÉ', description: 'Um delicioso Café Expresso Gourmet Tancredi', weight: 30, coupon: 'TANCREDI-CAFE' },
  { id: '2', label: '10% OFF', description: '10% de desconto em qualquer produto da nossa distribuidora', weight: 40, coupon: 'TANCREDI-10' },
  { id: '3', label: 'PÃO DE QUEIJO', description: 'Um Pão de Queijo artesanal quentinho para acompanhar seu café', weight: 15, coupon: 'TANCREDI-PAO' },
  { id: '4', label: '20% OFF', description: '20% de desconto exclusivo para sua próxima compra premium', weight: 10, coupon: 'TANCREDI-20' },
  { id: '5', label: 'LEVE 2', description: 'Na compra de 1 pacote de café, o segundo é por nossa conta', weight: 5, coupon: 'TANCREDI-BOGO' },
];

const DEFAULT_APP_CONFIG = {
  title: "Distribuidora Tancredi",
  subtitle: "EXCLUSIVIDADE EM CADA GRÃO",
  wheelFontSize: 4.5,
  fontFamily: "'Playfair Display', serif" // Fonte padrão original
};

const getConfig = async () => {
  const prizesDoc = await db.collection('settings').doc('prizesConfig').get();
  const appDoc = await db.collection('settings').doc('appConfig').get();
  
  if (!prizesDoc.exists) await db.collection('settings').doc('prizesConfig').set({ prizes: DEFAULT_PRIZES });
  if (!appDoc.exists) await db.collection('settings').doc('appConfig').set(DEFAULT_APP_CONFIG);
  
  return {
    prizes: prizesDoc.exists ? prizesDoc.data().prizes : DEFAULT_PRIZES,
    appConfig: appDoc.exists ? appDoc.data() : DEFAULT_APP_CONFIG
  };
};

const router = express.Router();

router.get('/config', async (req, res) => {
  try {
    const data = await getConfig();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao carregar.' });
  }
});

router.post('/config', async (req, res) => {
  try {
    const { prizes, appConfig } = req.body;
    if (prizes) await db.collection('settings').doc('prizesConfig').set({ prizes });
    if (appConfig) await db.collection('settings').doc('appConfig').set(appConfig);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao salvar.' });
  }
});

router.post('/spin', async (req, res) => {
  try {
    const { clientId } = req.body;
    const { prizes } = await getConfig();
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    let wonPrize = prizes[0];
    for (const p of prizes) {
      if (random < p.weight) { wonPrize = p; break; }
      random -= p.weight;
    }
    const ticketId = crypto.randomBytes(3).toString('hex').toUpperCase();
    await db.collection('winners').add({
      clientId: clientId || 'ANON',
      prizeLabel: wonPrize.label,
      prizeDescription: wonPrize.description,
      coupon: wonPrize.coupon,
      ticketId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.json({ prize: wonPrize, ticketId, date: new Date().toLocaleString('pt-BR') });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno.' });
  }
});

router.get('/winners', async (req, res) => {
  try {
    const snapshot = await db.collection('winners').orderBy('timestamp', 'desc').get();
    return res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar.' });
  }
});

app.use('/api', router);
exports.api = onRequest(app);
