import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import './App.css';
import { Admin } from './Admin';

interface AppConfig {
  title: string;
  subtitle: string;
  wheelFontSize: number;
  fontFamily: string;
}

interface PrizeConfig {
  id: string;
  label: string;
  description: string;
  weight: number;
  coupon: string;
}

interface Result {
  prize: PrizeConfig;
  ticketId: string;
  date: string;
}

const API_URL = '/api';

const SECTOR_COLORS = [
  '#1A0F0A', // Café Profundo
  '#2C1B12', // Café Torrado
  '#3D2B1F', // Café Moído
  '#4E342E', // Café Suave
  '#6F4E37'  // Café com Leite/Âmbar
];

function App() {
  const [prizes, setPrizes] = useState<PrizeConfig[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await axios.get(`${API_URL}/config`);
        setPrizes(response.data.prizes);
        setAppConfig(response.data.appConfig);
      } catch (err) {
        setError('Falha ao carregar a roleta.');
      } finally {
        setLoading(false);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('u') || params.get('id');
    const adminMode = params.get('admin') === 'true';
    const debugMode = params.get('debug') === 'true';
    setIsAdmin(adminMode);
    
    if (!adminMode) {
      const alreadyPlayed = localStorage.getItem('tancredi_played');
      if (alreadyPlayed && !debugMode) {
         setError('Sua roleta já foi girada! Aproveite seu prêmio exclusivo.');
      }
      setClientId(idFromUrl || 'ANON');
      loadConfig();
    } else {
      setLoading(false);
    }
  }, []);

  const handleSpin = async () => {
    if (spinning || result || prizes.length === 0) return;
    try {
      setSpinning(true);
      setError(null);
      const response = await axios.post(`${API_URL}/spin`, { clientId });
      const data = response.data;
      const prizeIndex = prizes.findIndex(p => p.id === data.prize.id);
      const anglePerSector = 360 / prizes.length;
      const totalRotation = rotation + (360 * 10) + (360 - (prizeIndex * anglePerSector) - (anglePerSector / 2));
      setRotation(totalRotation);
      setTimeout(() => {
        setSpinning(false);
        setResult(data);
        localStorage.setItem('tancredi_played', 'true');
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#D4AF37', '#F9F295', '#1A0F0A'] });
      }, 5000);
    } catch (err: any) {
      setSpinning(false);
      setError('Erro ao processar sorteio.');
    }
  };

  const captureAndShare = async () => {
    if (!modalRef.current) return;
    try {
      const canvas = await html2canvas(modalRef.current, { backgroundColor: '#1A0F0A', scale: 2, useCORS: true });
      const image = canvas.toDataURL('image/png');
      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], 'premio-tancredi.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: `Meu Prêmio - ${appConfig?.title}`, text: `Olha o que ganhei na ${appConfig?.title}!` });
      } else {
        const link = document.createElement('a');
        link.download = `premio-tancredi.png`;
        link.href = image;
        link.click();
      }
    } catch (err) { alert('Tire um print para salvar seu prêmio!'); }
  };

  if (isAdmin) return <Admin />;
  if (loading) return <div className="container"><h2>CARREGANDO...</h2></div>;

  return (
    <div className="container">
      <header className="header">
        <div className="logo">☕</div>
        <h1 className="title">{appConfig?.title || 'Distribuidora Tancredi'}</h1>
        {appConfig?.subtitle ? (
          <p className="subtitle">{appConfig.subtitle}</p>
        ) : (
          <div className="no-subtitle-spacer" />
        )}
      </header>

      {error && !spinning && !result ? (
        <div className="error-card">
          <h2 style={{ color: '#D4AF37' }}>{error}</h2>
          <button className="spinButton" onClick={() => window.location.reload()}>VOLTAR</button>
        </div>
      ) : (
        <>
          <div className="rouletteWrapper">
            <div className="pointer" />
            <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
              <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                {prizes.map((p, i) => {
                  const angle = 360 / prizes.length;
                  const startAngle = i * angle;
                  const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * (startAngle + angle - 90)) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * (startAngle + angle - 90)) / 180);
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                  return (
                    <g key={p.id}>
                      <path d={pathData} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} stroke="#D4AF37" strokeWidth="0.3"/>
                      <text 
                        x="50" y="15" 
                        transform={`rotate(${startAngle + angle / 2} 50 50)`} 
                        fill="#D4AF37" 
                        fontSize={appConfig?.wheelFontSize || 4} 
                        fontWeight="900" 
                        textAnchor="middle"
                        style={{ fontFamily: appConfig?.fontFamily || 'inherit' }}
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="centerLogo"><span>☕</span></div>
            </div>
          </div>
          <button className={`spinButton ${!spinning && !result ? 'pulse-animation' : ''}`} onClick={handleSpin} disabled={spinning || !!result}>
            {spinning ? 'SORTEANDO...' : result ? 'PRÊMIO GANHO' : 'GIRAR'}
          </button>
        </>
      )}

      {result && (
        <div className="modalOverlay">
          <div className="modalContent" ref={modalRef} style={{ fontFamily: appConfig?.fontFamily || 'inherit' }}>
            <div style={{ fontSize: '45px' }}>⭐</div>
            <h2 style={{ letterSpacing: '2px', marginTop: '10px' }}>TICKET DE PREMIAÇÃO</h2>
            <div className="ticket-info">
               <p>ID ÚNICO: <strong>#{result.ticketId}</strong></p>
               <p>{result.date}</p>
            </div>
            <h3 className="prizeTitle" style={{ fontSize: '28px', color: 'var(--gold-bright)' }}>{result.prize.label}</h3>
            <p className="prizeDescription">{result.prize.description}</p>
            <p style={{ opacity: 0.8, fontSize: '12px', marginTop: '20px' }}>CÓDIGO DE RESGATE:</p>
            <span className="couponCode">{result.prize.coupon}</span>
            <div className="action-buttons">
               <button className="spinButton share" onClick={captureAndShare}>COMPARTILHAR PARA O TANCREDI</button>
               <p style={{ fontSize: '11px', marginTop: '20px', opacity: 0.6 }}>Apresente este ticket na {appConfig?.title}.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
