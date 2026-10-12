import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getBadges } from '../utils/badges';

const BadgesPanel = ({ onBack, players = [], player }) => {
  const badges = getBadges();
  const [selectedPlayerId, setSelectedPlayerId] = useState(player || (players.length > 0 ? players[0].id : null));
  
  // Group badges by owner
  const badgesByOwner = badges.reduce((acc, b) => {
    if (!acc[b.owner]) acc[b.owner] = [];
    acc[b.owner].push(b);
    return acc;
  }, {});

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <ChevronLeft size={20} /> Trạm chính
        </button>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, padding: 'clamp(20px, 5vw, 40px)' }}>
        <h1 className="title-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', textAlign: 'center', marginBottom: '40px' }}>
          🏆 Tủ Kính Huy Hiệu
        </h1>
        
        {badges.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--text-muted)' }}>Chưa có huy hiệu nào. Hãy chơi game để thu thập nhé!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
            {/* Player Tabs */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {players.filter(p => badgesByOwner[p.id] && badgesByOwner[p.id].length > 0).map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayerId(p.id)}
                  style={{
                    background: selectedPlayerId === p.id ? p.color : 'rgba(255,255,255,0.1)',
                    color: selectedPlayerId === p.id ? '#fff' : 'var(--text-main)',
                    border: `2px solid ${p.color}`,
                    borderRadius: '25px',
                    padding: '8px 20px',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedPlayerId === p.id ? `0 0 15px ${p.color}` : 'none'
                  }}
                >
                  <img src={p.avatar} alt={p.name} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
                  {p.name}
                </button>
              ))}
            </div>

            {/* Selected Player Badges */}
            {selectedPlayerId && players.find(p => p.id === selectedPlayerId) && (
              <div style={{ width: '100%', maxWidth: '900px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '30px', border: `1px solid ${players.find(p => p.id === selectedPlayerId).color || 'var(--glass-border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
                  <img 
                    src={players.find(p => p.id === selectedPlayerId).avatar} 
                    alt={players.find(p => p.id === selectedPlayerId).name} 
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `4px solid ${players.find(p => p.id === selectedPlayerId).color}`, boxShadow: `0 0 20px ${players.find(p => p.id === selectedPlayerId).color}` }} 
                  />
                  <h2 style={{ color: players.find(p => p.id === selectedPlayerId).color, fontSize: '2.5rem', margin: 0 }}>
                    {players.find(p => p.id === selectedPlayerId).name}
                  </h2>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                  {(badgesByOwner[selectedPlayerId] || []).map(b => (
                    <div key={b.id} className="floating" style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '20px', textAlign: 'center', border: `2px solid ${players.find(p => p.id === selectedPlayerId).color}`, width: '140px' }}>
                      <div style={{ fontSize: '4rem', filter: `drop-shadow(0 0 15px ${players.find(p => p.id === selectedPlayerId).color})` }}>{b.emoji}</div>
                      <div style={{ fontSize: '1.1rem', marginTop: '15px', fontWeight: 'bold' }}>{b.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesPanel;
