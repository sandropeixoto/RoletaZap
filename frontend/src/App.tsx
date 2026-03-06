import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import './App.css';
import { Admin } from './Admin';

interface Prize {
  id: string;
  label: string;
  coupon: string;
}

const API_URL = 'http://localhost:3001/api';

const PRIZES_LABELS = [
  'Café Expresso',
  '10% OFF',
  'Pão de Queijo',
  '20% OFF',
  'Compre 1 Leve 2'
];

function App() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('u') || params.get('id');
    const adminMode = params.get('admin') === 'true';
    
    setIsAdmin(adminMode);
    
    if (id) {
      setClientId(id);
    } else if (!adminMode) {
      setError('Acesse via link oficial do WhatsApp!');
    }
  }, []);

  if (isAdmin) {
    return <Admin />;
  }

  const handleSpin = async () => {
    if (!clientId || spinning) return;

    try {
      setSpinning(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/spin`, { clientId });
      const wonPrize = response.data.prize;

      // Calcular rotação
      // Cada prêmio ocupa 360 / 5 = 72 graus.
      // O prêmio sorteado está em um índice específico.
      const prizeIndex = PRIZES_LABELS.indexOf(wonPrize.label);
      const extraDegrees = 360 * 5; // 5 voltas completas
      const prizeDegrees = 360 - (prizeIndex * 72) - 36; // Centraliza no setor
      const totalRotation = rotation + extraDegrees + prizeDegrees;

      setRotation(totalRotation);

      setTimeout(() => {
        setSpinning(false);
        setPrize(wonPrize);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6F4E37', '#A67B5B', '#D2B48C']
        });
      }, 4000);

    } catch (err: any) {
      setSpinning(false);
      setError(err.response?.data?.error || 'Erro ao girar a roleta.');
    }
  };

  if (error && !spinning && !prize) {
    return (
      <div className="container">
        <h2 style={{ color: 'red' }}>{error}</h2>
        <p>Peça seu link no nosso WhatsApp!</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo">☕</div>
        <h1 className="title">Roleta de Brindes</h1>
        <p className="subtitle">Olá! Gire e ganhe um presente especial.</p>
      </header>

      <div className="rouletteWrapper">
        <div className="pointer" />
        <div 
          className="wheel" 
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            {PRIZES_LABELS.map((label, i) => {
              const angle = 72;
              const startAngle = i * angle;
              const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * (startAngle + angle - 90)) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * (startAngle + angle - 90)) / 180);
              
              const largeArcFlag = 0;
              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              return (
                <g key={i}>
                  <path d={pathData} fill={i % 2 === 0 ? '#6F4E37' : '#A67B5B'} />
                  <text
                    x="50"
                    y="20"
                    transform={`rotate(${startAngle + angle / 2} 50 50)`}
                    fill="white"
                    fontSize="5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="centerLogo">☕</div>
        </div>
      </div>

      <button 
        className="spinButton" 
        onClick={handleSpin}
        disabled={spinning || !!prize || !clientId}
      >
        {spinning ? 'Girando...' : prize ? 'Prêmio Ganho!' : 'GIRAR AGORA'}
      </button>

      {prize && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h2>🎉 PARABÉNS!</h2>
            <p>Você ganhou:</p>
            <h3 className="prizeTitle">{prize.label}</h3>
            <p>Apresente este código no caixa:</p>
            <span className="couponCode">{prize.coupon}</span>
            <button 
              className="spinButton" 
              onClick={() => setPrize(null)}
              style={{ marginTop: '10px' }}
            >
              FECHAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
