import { useEffect, useState } from 'react';
import axios from 'axios';

interface AppConfig {
  title: string;
  subtitle: string;
  wheelFontSize: number;
  fontFamily: string;
}

interface Prize {
  id: string;
  label: string;
  description: string;
  weight: number;
  coupon: string;
}

interface Winner {
  id: string;
  clientId: string;
  prizeLabel: string;
  ticketId: string;
  coupon: string;
  timestamp: any;
}

const API_URL = '/api';

const FONT_OPTIONS = [
  { label: 'Playfair Display (Serifada)', value: "'Playfair Display', serif" },
  { label: 'Verdana (Sem Serifa)', value: 'Verdana, sans-serif' },
  { label: 'Inter (Moderna)', value: 'Inter, sans-serif' },
  { label: 'Montserrat (Elegante)', value: 'Montserrat, sans-serif' },
  { label: 'Georgia (Clássica)', value: 'Georgia, serif' }
];

export function Admin() {
  const [activeTab, setActiveTab] = useState<'winners' | 'config' | 'settings'>('winners');
  const [winners, setWinners] = useState<Winner[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>({ title: '', subtitle: '', wheelFontSize: 4.5, fontFamily: "'Playfair Display', serif" });
  const [loading, setLoading] = useState(true);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/config`);
      setPrizes(res.data.prizes);
      setAppConfig(res.data.appConfig);
      if (activeTab === 'winners') {
        const winRes = await axios.get(`${API_URL}/winners`);
        setWinners(winRes.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const saveAll = async (newPrizes?: Prize[], newConfig?: AppConfig) => {
    try {
      await axios.post(`${API_URL}/config`, { prizes: newPrizes || prizes, appConfig: newConfig || appConfig });
      if (newPrizes) setPrizes(newPrizes);
      if (newConfig) setAppConfig(newConfig);
      setEditingPrize(null);
      alert('Alterações salvas!');
    } catch (err) { alert('Erro ao salvar.'); }
  };

  if (loading && !editingPrize) return <div className="container admin-container"><h2>CARREGANDO...</h2></div>;

  return (
    <div className="container admin-container">
      <h1 className="title" style={{ fontSize: '22px', marginBottom: '20px' }}>GERENCIAMENTO TANCREDI</h1>
      
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'winners' ? 'active' : ''}`} onClick={() => setActiveTab('winners')}>GANHADORES</button>
        <button className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>ITENS ROLETA</button>
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>AJUSTES MASTER</button>
      </div>

      <div className="admin-content">
        {activeTab === 'winners' && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>Data</th><th>ID/Ticket</th><th>Prêmio</th><th>Cupom</th></tr></thead>
              <tbody>
                {winners.map(w => (
                  <tr key={w.id}>
                    <td>{new Date(w.timestamp?._seconds * 1000).toLocaleDateString()}</td>
                    <td><small>{w.clientId}</small><br/><strong>#{w.ticketId}</strong></td>
                    <td><strong>{w.prizeLabel}</strong></td>
                    <td><code style={{background: '#333', padding: '3px'}}>{w.coupon}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'config' && (
          <div>
            <button className="spinButton" style={{ width: 'auto', padding: '10px 20px', fontSize: '12px' }} onClick={() => setEditingPrize({ id: Date.now().toString(), label: '', description: '', weight: 10, coupon: '' })}>+ NOVO ITEM</button>
            <table className="admin-table" style={{ marginTop: '20px' }}>
              <thead><tr><th>Rótulo</th><th>Peso</th><th>Ações</th></tr></thead>
              <tbody>
                {prizes.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.label}</strong></td>
                    <td>{p.weight}%</td>
                    <td>
                      <button onClick={() => setEditingPrize(p)} className="edit-btn">✎</button>
                      <button onClick={() => saveAll(prizes.filter(i => i.id !== p.id))} className="delete-btn">✖</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '15px' }}>
            <div className="form-group">
              <label>Título da Roleta</label>
              <input type="text" value={appConfig.title} onChange={e => setAppConfig({...appConfig, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Subtítulo</label>
              <input type="text" value={appConfig.subtitle} onChange={e => setAppConfig({...appConfig, subtitle: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Fonte das Opções da Roleta</label>
              <select value={appConfig.fontFamily} onChange={e => setAppConfig({...appConfig, fontFamily: e.target.value})}>
                {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tamanho da Fonte ({appConfig.wheelFontSize})</label>
              <input type="range" min="2" max="8" step="0.1" value={appConfig.wheelFontSize} onChange={e => setAppConfig({...appConfig, wheelFontSize: parseFloat(e.target.value)})} />
            </div>
            <button className="spinButton" style={{width: '100%'}} onClick={() => saveAll(prizes, appConfig)}>SALVAR CONFIGURAÇÕES</button>
          </div>
        )}
      </div>

      {editingPrize && (
        <div className="modalOverlay">
          <div className="modalContent admin-modal" style={{fontFamily: 'Verdana, sans-serif'}}>
            <h3 style={{ color: 'var(--gold)' }}>{editingPrize.label ? 'Editar Prêmio' : 'Novo Prêmio'}</h3>
            <div className="form-group">
              <label>Rótulo Roleta (Curto)</label>
              <input type="text" value={editingPrize.label} onChange={e => setEditingPrize({...editingPrize, label: e.target.value.toUpperCase()})} />
            </div>
            <div className="form-group">
              <label>Descrição Completa</label>
              <textarea value={editingPrize.description} onChange={e => setEditingPrize({...editingPrize, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Cupom de Resgate</label>
              <input type="text" value={editingPrize.coupon} onChange={e => setEditingPrize({...editingPrize, coupon: e.target.value.toUpperCase()})} />
            </div>
            <div className="form-group">
              <label>Peso Probabilidade (%)</label>
              <input type="number" value={editingPrize.weight} onChange={e => setEditingPrize({...editingPrize, weight: parseInt(e.target.value) || 0})} />
            </div>
            <div className="modal-actions">
              <button className="spinButton" style={{ background: '#333', color: '#fff' }} onClick={() => setEditingPrize(null)}>CANCELAR</button>
              <button className="spinButton" onClick={() => {
                const updated = prizes.find(i => i.id === editingPrize.id) ? prizes.map(i => i.id === editingPrize.id ? editingPrize : i) : [...prizes, editingPrize];
                saveAll(updated);
              }}>SALVAR</button>
            </div>
          </div>
        </div>
      )}

      <button className="spinButton" style={{ marginTop: '40px', padding: '10px 20px', fontSize: '12px' }} onClick={() => window.location.href = '/'}>VOLTAR PARA O SITE</button>
    </div>
  );
}
