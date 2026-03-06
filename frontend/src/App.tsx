import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import './App.css';
import { Admin } from './Admin';

interface Prize {
  id: string;
  label: string;
  coupon: string;
}

interface Result {
  prize: Prize;
  ticketId: string;
  date: string;
}

const API_URL = '/api';

const PRIZES_LABELS = [
  'CAFÉ EXPRESSO',
  '10% OFF',
  'PÃO DE QUEIJO',
  '20% OFF',
  'COMPRE 1 LEVE 2'
];

function App() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('u') || params.get('id');
    const adminMode = params.get('admin') === 'true';
    const debugMode = params.get('debug') === 'true';
    
    setIsAdmin(adminMode);
    
    if (adminMode) return;

    // Verificar LocalStorage para impedir giro duplicado
    const alreadyPlayed = localStorage.getItem('tancredi_played');
    if (alreadyPlayed && !debugMode) {
       setError('Você já girou sua roleta! Aproveite seu prêmio.');
       return;
    }

    setClientId(idFromUrl || 'ANON');
  }, []);

  const handleSpin = async () => {
    if (spinning || result) return;

    try {
      setSpinning(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/spin`, { clientId });
      const data = response.data;

      const prizeIndex = PRIZES_LABELS.indexOf(data.prize.label.toUpperCase());
      const extraDegrees = 360 * 10; 
      const prizeDegrees = 360 - (prizeIndex * 72) - 36; 
      const totalRotation = rotation + extraDegrees + prizeDegrees;

      setRotation(totalRotation);

      setTimeout(() => {
        setSpinning(false);
        setResult(data);
        localStorage.setItem('tancredi_played', 'true');
        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F9F295', '#4E342E']
        });
      }, 5000);

    } catch (err: any) {
      setSpinning(false);
      setError(err.response?.data?.error || 'Erro ao processar sorteio.');
    }
  };

  const captureAndShare = async () => {
    if (!modalRef.current) return;
    
    try {
      const canvas = await html2canvas(modalRef.current, {
        backgroundColor: '#2C1B12',
        scale: 2,
        useCORS: true
      });
      
      const image = canvas.toDataURL('image/png');
      
      // Tentativa de compartilhamento nativo em mobile
      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], 'meu-premio.png', { type: 'image/png' });
        
        await navigator.share({
          files: [file],
          title: 'Meu Prêmio Tancredi Cafés',
          text: 'Olha o que ganhei na roleta Tancredi!'
        });
      } else {
        // Fallback: Download da imagem
        const link = document.createElement('a');
        link.download = `premio-tancredi-${result?.ticketId}.png`;
        link.href = image;
        link.click();
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      alert('Tire um print da tela para salvar seu prêmio!');
    }
  };

  if (isAdmin) return <Admin />;

  return (
    <div className="container">
      <header className="header">
        <div className="logo">☕</div>
        <h1 className="title">Tancredi Cafés</h1>
        <p className="subtitle">LUXURY COFFEE EXPERIENCE</p>
      </header>

      {error ? (
        <div className="error-card">
          <h2 style={{ color: '#D4AF37' }}>{error}</h2>
          <button className="spinButton" onClick={() => window.location.reload()} style={{padding: '10px 20px', fontSize: '14px', marginTop: '20px'}}>
            TENTAR NOVAMENTE
          </button>
        </div>
      ) : (
        <>
          <div className="rouletteWrapper">
            <div className="pointer" />
            <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                {PRIZES_LABELS.map((label, i) => {
                  const angle = 72;
                  const startAngle = i * angle;
                  const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * (startAngle + angle - 90)) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * (startAngle + angle - 90)) / 180);
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                  return (
                    <g key={i}>
                      <path d={pathData} fill={i % 2 === 0 ? '#2C1B12' : '#3D2B1F'} stroke="#D4AF37" strokeWidth="0.2"/>
                      <text x="50" y="15" transform={`rotate(${startAngle + angle / 2} 50 50)`} fill="#D4AF37" fontSize="3.5" fontWeight="600" textAnchor="middle">
                        {label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="centerLogo"><span>☕</span></div>
            </div>
          </div>

          <button className="spinButton" onClick={handleSpin} disabled={spinning || !!result}>
            {spinning ? 'SORTEANDO...' : result ? 'PRÊMIO GARANTIDO!' : 'GIRAR ROLETA LUXO'}
          </button>
        </>
      )}

      {result && (
        <div className="modalOverlay">
          <div className="modalContent" ref={modalRef}>
            <div style={{ fontSize: '40px' }}>💎</div>
            <h2 style={{ letterSpacing: '2px', marginTop: '10px' }}>TICKET PREMIADO</h2>
            <div className="ticket-info">
               <p>ID: <strong>#{result.ticketId}</strong></p>
               <p>{result.date}</p>
            </div>
            <h3 className="prizeTitle">{result.prize.label}</h3>
            <p style={{ opacity: 0.8 }}>Cupom de Resgate:</p>
            <span className="couponCode">{result.prize.coupon}</span>
            
            <div className="action-buttons">
               <button className="spinButton share" onClick={captureAndShare}>
                  COMPARTILHAR NO WHATSAPP
               </button>
               <p style={{ fontSize: '12px', marginTop: '15px', opacity: 0.6 }}>
                  Salve esta imagem e apresente ao atendente.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
