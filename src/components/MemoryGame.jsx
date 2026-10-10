import React, { useState, useEffect } from 'react';
import { ChevronLeft, RotateCcw, Brain, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound, speakEnglish } from '../utils/audio';
import { addBadge } from '../utils/badges';
import { updatePlayerStats } from '../utils/jsonStorage';

import memoryCardsData from '../../data/memory_cards.json';

const EASY_CARDS = memoryCardsData.easy_cards;
const HARD_CARDS = memoryCardsData.hard_cards;

const MemoryGame = ({ player = 'nhi', onBack }) => {
  const [level, setLevel] = useState(player === 'kiet' ? 'easy' : 'hard');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const initGame = (currentLevel = level) => {
    const source = currentLevel === 'easy' ? EASY_CARDS : HARD_CARDS;
    // Duplicate cards to form pairs
    const deck = [...source, ...source].map((item, index) => ({
      uniqueId: index,
      ...item
    })).sort(() => 0.5 - Math.random());

    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsWon(false);
    setIsBusy(false);
  };

  useEffect(() => {
    initGame(level);
  }, [level]);

  const handleCardClick = (index) => {
    if (isBusy || isWon) return;
    if (flipped.includes(index) || matched.includes(index)) return;

    playSound('correct');
    const targetCard = cards[index];

    // Pronounce name/word
    if (level === 'hard' && targetCard.name) {
      speakEnglish(targetCard.name);
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setIsBusy(true);
      setMoves(m => m + 1);

      const [firstIdx, secondIdx] = newFlipped;
      const card1 = cards[firstIdx];
      const card2 = cards[secondIdx];

      if (card1.id === card2.id) {
        // MATCH!
        playSound('badge');
        const newMatched = [...matched, firstIdx, secondIdx];
        setMatched(newMatched);
        setFlipped([]);
        setIsBusy(false);

        // Check if Game Completed
        if (newMatched.length === cards.length) {
          setIsWon(true);
          playSound('rocket');
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 }
          });

          const currentOwner = player || (level === 'easy' ? 'kiet' : 'nhi');
          addBadge(currentOwner, 'Bậc Thầy Trí Nhớ Vũ Trụ', '🧠');
          updatePlayerStats(currentOwner, 20);
        }
      } else {
        // MISMATCH
        setTimeout(() => {
          playSound('wrong');
          setFlipped([]);
          setIsBusy(false);
        }, 800);
      }
    }
  };

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .card-perspective {
          perspective: 1000px;
        }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          cursor: pointer;
        }
        .card-flipped {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .card-front {
          background: linear-gradient(135deg, rgba(40, 20, 70, 0.9), rgba(15, 5, 30, 0.9));
          border: 2px solid var(--neon-purple);
          box-shadow: 0 4px 15px rgba(157, 78, 221, 0.4);
        }
        .card-back {
          transform: rotateY(180deg);
          background: rgba(20, 10, 45, 0.95);
          border: 2px solid var(--neon-blue);
          box-shadow: 0 0 20px rgba(0, 210, 255, 0.6);
        }
      `}</style>

      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <ChevronLeft size={20} /> Trạm chính
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`glass-button ${level === 'easy' ? 'btn-primary' : ''}`}
            onClick={() => setLevel('easy')}
            style={{ padding: '8px 16px', fontSize: '0.95rem' }}
          >
            👶 Cấp Dễ (3 Tuổi)
          </button>
          <button 
            className={`glass-button ${level === 'hard' ? 'btn-secondary' : ''}`}
            onClick={() => setLevel('hard')}
            style={{ padding: '8px 16px', fontSize: '0.95rem' }}
          >
            🚀 Cấp Thử Thách (8 Tuổi)
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>🎯 Số Lần Lật: <strong>{moves}</strong></span>
          <button className="glass-button" onClick={() => initGame(level)} style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
            <RotateCcw size={16} /> Chơi Lại
          </button>
        </div>
      </div>

      {/* Main Game Container */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(15px, 4vw, 30px)', position: 'relative' }}>
        <h1 className="title-gradient" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: '20px', textAlign: 'center' }}>
          🧠 Lật Thẻ Trí Nhớ Vũ Trụ
        </h1>

        {!isWon ? (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: level === 'easy' ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', 
              gap: 'clamp(10px, 2vw, 20px)', 
              width: '100%', 
              maxWidth: level === 'easy' ? '500px' : '700px',
              margin: '0 auto'
            }}
          >
            {cards.map((card, index) => {
              const isCardFlipped = flipped.includes(index) || matched.includes(index);
              return (
                <div 
                  key={index} 
                  className="card-perspective" 
                  style={{ height: 'clamp(100px, 22vw, 150px)' }}
                  onClick={() => handleCardClick(index)}
                >
                  <div className={`card-inner ${isCardFlipped ? 'card-flipped' : ''}`}>
                    <div className="card-front">
                      <Brain size={40} color="var(--neon-purple)" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>Lật Thẻ</span>
                    </div>
                    <div className="card-back" style={{ borderColor: card.color || '#00d2ff' }}>
                      <span style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1 }}>{card.emoji}</span>
                      <span style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>
                        {card.name}
                      </span>
                      {card.mean && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--neon-blue)' }}>{card.mean}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '5rem', marginBottom: '10px' }}>🏆🎉</div>
            <h2 className="title-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '15px' }}>
              Xuất Sắc! Bé Đã Chiến Thắng!
            </h2>
            <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '30px' }}>
              Bé đã lật mở tất cả cặp thẻ chỉ sau <strong>{moves}</strong> lần thử!
            </p>
            <button className="glass-button btn-primary" onClick={() => initGame(level)} style={{ fontSize: '1.3rem', padding: '15px 40px' }}>
              <RotateCcw size={24} /> Chơi Lại Trận Mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
