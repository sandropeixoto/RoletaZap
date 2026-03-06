import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Winner {
  id: string;
  prize: string;
  coupon: string;
  timestamp: any;
  redeemed: boolean;
}

const API_URL = 'http://localhost:3001/api';

export function Admin() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const response = await axios.get(`${API_URL}/winners`);
        setWinners(response.data);
      } catch (err) {
        console.error('Erro ao buscar ganhadores:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 className="title">Painel Administrativo</h1>
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--primary)' }}>
            <th style={{ padding: '10px' }}>ID/Tel</th>
            <th style={{ padding: '10px' }}>Prêmio</th>
            <th style={{ padding: '10px' }}>Cupom</th>
            <th style={{ padding: '10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {winners.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: '20px' }}>Nenhum ganhador ainda.</td></tr>
          ) : (
            winners.map((w) => (
              <tr key={w.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{w.id}</td>
                <td style={{ padding: '10px' }}>{w.prize}</td>
                <td style={{ padding: '10px' }}>{w.coupon}</td>
                <td style={{ padding: '10px' }}>{w.redeemed ? '✅' : '⏳'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button 
        className="spinButton" 
        onClick={() => window.location.href = '/'}
        style={{ marginTop: '30px' }}
      >
        VOLTAR PARA ROLETA
      </button>
    </div>
  );
}
