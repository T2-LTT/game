import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, Lightbulb, CheckCircle2, Award, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { logAttempt } from '../utils/jsonStorage';
import { playSound } from '../utils/audio';
import { addBadge } from '../utils/badges';
import { updatePlayerStats } from '../utils/jsonStorage';
import scenesData from '../../data/spot_difference_scenes.json';

const SCENES = scenesData.scenes;

const SpotDifferenceGame = ({ player = 'nhi', onBack }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [foundIds, setFoundIds] = useState([]);
  const [hintActiveId, setHintActiveId] = useState(null);
  const [isWon, setIsWon] = useState(false);

  const currentScene = SCENES[sceneIndex];

  useEffect(() => {
    setFoundIds([]);
    setHintActiveId(null);
    setIsWon(false);
  }, [sceneIndex]);

  const handleSpotClick = (diffId) => {
    if (foundIds.includes(diffId)) return;

    playSound('correct');
    const updated = [...foundIds, diffId];
    setFoundIds(updated);
    setHintActiveId(null);

    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 }
    });

    if (updated.length === currentScene.differences.length) {
      logAttempt(player, 'Tìm Khác Biệt', `Hoàn thành màn: ${currentScene.title}`, true, 'Tìm đủ điểm', 'Tìm đủ điểm');
      setIsWon(true);
      playSound('rocket');
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 }
      });

      addBadge(player, 'Thần Đồng Tinh Mắt Vũ Trụ', '🔍');
      updatePlayerStats(player, 25);
    }
  };

  const handleUseHint = () => {
    const unfound = currentScene.differences.filter(d => !foundIds.includes(d.id));
    if (unfound.length > 0) {
      playSound('badge');
      const randomHint = unfound[Math.floor(Math.random() * unfound.length)];
      setHintActiveId(randomHint.id);
      alert(`💡 GỢI Ý: ${randomHint.hint}`);
    }
  };

  const nextScene = () => {
    const nextIdx = (sceneIndex + 1) % SCENES.length;
    setSceneIndex(nextIdx);
  };

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <ChevronLeft size={20} /> Trạm chính
        </button>

        <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--neon-pink)' }}>
            🔍 Đã tìm: {foundIds.length} / {currentScene.differences.length}
          </span>
          <button 
            className="glass-button" 
            onClick={handleUseHint}
            style={{ padding: '6px 14px', fontSize: '0.9rem', background: 'rgba(255, 204, 0, 0.2)', borderColor: '#ffcc00' }}
          >
            <Lightbulb size={18} color="#ffcc00" /> Gợi Ý
          </button>
        </div>
      </div>

      {/* Main Scene Area */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(15px, 3vw, 30px)' }}>
        <h1 className="title-gradient" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: '10px', textAlign: 'center' }}>
          🔍 Tìm Điểm Khác Biệt: {currentScene.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
          So sánh 2 bức tranh dưới đây và bấm vào những điểm khác nhau!
        </p>

        {!isWon ? (
          <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '1000px', flexWrap: 'wrap', justifyContent: 'center' }}>
            
            {/* PANEL A: ORIGINAL SCENE */}
            <div style={{ flex: 1, minWidth: '300px', maxWidth: '480px', height: '350px', background: currentScene.bg, borderRadius: '24px', border: '2px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '10px', left: '15px', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                🖼️ Tranh Gốc
              </div>

              {currentScene.itemsLeft.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    position: 'absolute', 
                    top: item.top, 
                    left: item.left, 
                    fontSize: item.size,
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none'
                  }}
                >
                  {item.emoji}
                </div>
              ))}
            </div>

            {/* PANEL B: MODIFIED SCENE WITH CLICK TARGETS */}
            <div style={{ flex: 1, minWidth: '300px', maxWidth: '480px', height: '350px', background: currentScene.bg, borderRadius: '24px', border: '2px solid var(--neon-blue)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '10px', left: '15px', background: 'rgba(0,210,255,0.3)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>
                🔍 Tranh Tìm Khác Biệt
              </div>

              {/* Items on Right */}
              {currentScene.itemsRight.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    position: 'absolute', 
                    top: item.top, 
                    left: item.left, 
                    fontSize: item.size,
                    transform: 'translate(-50%, -50%)',
                    userSelect: 'none'
                  }}
                >
                  {item.emoji}
                </div>
              ))}

              {/* Clickable Difference Hotspots */}
              {currentScene.differences.map((diff) => {
                const isFound = foundIds.includes(diff.id);
                const isHinted = hintActiveId === diff.id;
                return (
                  <div
                    key={diff.id}
                    onClick={() => handleSpotClick(diff.id)}
                    style={{
                      position: 'absolute',
                      top: `${diff.y}%`,
                      left: `${diff.x}%`,
                      width: '65px',
                      height: '65px',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      border: isFound ? '4px solid #00ff00' : isHinted ? '4px solid #ffcc00' : 'none',
                      background: isFound ? 'rgba(0, 255, 0, 0.2)' : isHinted ? 'rgba(255, 204, 0, 0.3)' : 'transparent',
                      boxShadow: isFound ? '0 0 20px #00ff00' : isHinted ? '0 0 25px #ffcc00' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      transition: 'all 0.3s'
                    }}
                  >
                    {isFound && <CheckCircle2 size={32} color="#00ff00" />}
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '5rem', marginBottom: '10px' }}>🎉🏆</div>
            <h2 className="title-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '15px' }}>
              Tinh Mắt Quá! Bé Đã Tìm Thấy Tất Cả!
            </h2>
            <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginBottom: '30px' }}>
              Bé đã xuất sắc hoàn thành màn chơi <strong>{currentScene.title}</strong>!
            </p>
            <button className="glass-button btn-primary" onClick={nextScene} style={{ fontSize: '1.3rem', padding: '15px 40px' }}>
              <Search size={24} /> Màn Chơi Tiếp Theo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotDifferenceGame;
