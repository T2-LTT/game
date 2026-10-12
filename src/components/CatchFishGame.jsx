import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, RefreshCw } from 'lucide-react';
import { playSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { logAttempt, updatePlayerStats } from '../utils/jsonStorage';
import { addBadge } from '../utils/badges';

const speak = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    window.speechSynthesis.speak(utterance);
  }
};

const FISH_TYPES = ['🐟', '🐠', '🐡']; // Điểm +1
const JELLYFISH = '🦑'; // Trừ 1 điểm

const CatchFishGame = ({ onBack, player = 'kiet', playerName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [entities, setEntities] = useState([]);
  const [speed, setSpeed] = useState('slow'); // 'slow', 'normal', 'fast'
  
  const nextId = useRef(0);

  useEffect(() => {
    let spawnInterval;
    let timerInterval;

    if (isPlaying && timeLeft > 0) {
      spawnInterval = setInterval(() => {
        // Sinh ra 1-2 con vật mới
        const count = Math.random() > 0.7 ? 2 : 1;
        const newEntities = [];
        
        for(let i = 0; i < count; i++) {
          const isJellyfish = Math.random() > 0.75; // 25% cơ hội sinh sứa
          const type = isJellyfish ? JELLYFISH : FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
          const direction = Math.random() > 0.5 ? 1 : -1; // 1: trái sang phải, -1: phải sang trái
          
          let durationBase = speed === 'slow' ? 3 : speed === 'normal' ? 2 : 1;
          const duration = Math.random() * 3 + durationBase; // Slow: 3-6s, Normal: 2-5s, Fast: 1-4s
          
          const top = Math.random() * 70 + 10; // 10% - 80% chiều cao
          
          newEntities.push({
            id: nextId.current++,
            type,
            isJellyfish,
            direction,
            duration,
            top
          });
        }
        
        setEntities(prev => [...prev, ...newEntities]);
        
        // Tự động dọn dẹp (xóa) những con vật cũ để tránh phình to mảng
        setEntities(prev => prev.filter(e => e.id > nextId.current - 15)); 
      }, speed === 'slow' ? 1200 : speed === 'normal' ? 800 : 500);

      timerInterval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setEntities([]);
      logAttempt(player, 'Bắt Cá', 'Chơi bắt cá', score > 0, `Bắt được ${score} con cá`, '');
      updatePlayerStats(player, score); // Cộng điểm
      playSound('correct');
      speak(`Hết giờ! Bạn bắt được ${score} con cá!`);
      if (score >= 10) {
        addBadge(player, 'Siêu Cần Thủ Vũ Trụ', '🎣');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
    };
  }, [isPlaying, timeLeft, score]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(45);
    setIsPlaying(true);
    setEntities([]);
    nextId.current = 0;
    speak("Sẵn sàng, bắt đầu bắt cá!");
  };

  const catchEntity = (id, isJellyfish) => {
    if (!isPlaying) return;

    if (isJellyfish) {
      playSound('wrong');
      setScore(s => Math.max(0, s - 1)); // Trừ 1 điểm, không âm
    } else {
      playSound('correct');
      setScore(s => s + 1);
    }
    
    // Xóa con vật vừa click
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <style>
        {`
          @keyframes swimRight {
            0% { transform: translateX(-10vw) scaleX(-1); }
            100% { transform: translateX(110vw) scaleX(-1); }
          }
          @keyframes swimLeft {
            0% { transform: translateX(110vw) scaleX(1); }
            100% { transform: translateX(-10vw) scaleX(1); }
          }
          .ocean-bg {
            background: linear-gradient(180deg, #00d2ff 0%, #3a7bd5 100%);
            border-radius: 20px;
            box-shadow: inset 0 0 50px rgba(0,0,0,0.3);
            position: relative;
            overflow: hidden;
          }
          /* Bong bóng nước */
          @keyframes bubble {
            0% { transform: translateY(100%) scale(0); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(-20vh) scale(1.5); opacity: 0; }
          }
        `}
      </style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="glass-button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={20} /> Quay lại
        </button>
        <div className="glass-panel" style={{ padding: '10px 20px', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', gap: '20px' }}>
          <span style={{ color: '#ffcc00' }}>⏳ {timeLeft}s</span>
          <span style={{ color: 'var(--neon-pink)' }}>⭐ {score}</span>
        </div>
      </div>

      <div className="ocean-bg" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        
        {/* Aquarium bubbles background */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.4 }}>
          {Array.from({length: 10}).map((_, i) => (
             <div key={i} style={{
               position: 'absolute',
               bottom: '0',
               left: `${Math.random() * 100}%`,
               width: `${Math.random() * 20 + 10}px`,
               height: `${Math.random() * 20 + 10}px`,
               background: 'rgba(255,255,255,0.5)',
               borderRadius: '50%',
               animation: `bubble ${Math.random() * 3 + 2}s infinite linear`,
               animationDelay: `${Math.random() * 2}s`
             }} />
          ))}
        </div>

        <h1 className="title-gradient text-glow" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '30px', textAlign: 'center', zIndex: 10, textShadow: '0 0 10px white' }}>
          Bắt Cá Biển Sâu
        </h1>

        {!isPlaying && timeLeft === 45 && (
          <div style={{ zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
             <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '10px', fontWeight: 'bold' }}>
               Cá 🐟: +1 điểm | Sứa 🪼: Trừ 1 điểm
             </p>
             
             <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '15px' }}>
              <button 
                className={`glass-button ${speed === 'slow' ? 'btn-primary' : ''}`} 
                onClick={() => setSpeed('slow')}
                style={{ padding: '8px 16px' }}
              >
                Chậm 🐢
              </button>
              <button 
                className={`glass-button ${speed === 'normal' ? 'btn-primary' : ''}`} 
                onClick={() => setSpeed('normal')}
                style={{ padding: '8px 16px' }}
              >
                Vừa 🚶
              </button>
              <button 
                className={`glass-button ${speed === 'fast' ? 'btn-primary' : ''}`} 
                onClick={() => setSpeed('fast')}
                style={{ padding: '8px 16px' }}
              >
                Nhanh ⚡
              </button>
            </div>

            <button className="glass-button btn-primary" onClick={startGame} style={{ fontSize: '1.5rem', padding: '15px 40px', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}>
              <Play size={24} /> Bắt đầu chơi
            </button>
          </div>
        )}

        {!isPlaying && timeLeft === 0 && (
          <div style={{ zIndex: 10, textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#ffcc00', textShadow: '0 0 5px black' }}>Hết giờ!</h2>
            <p style={{ fontSize: '1.5rem', marginBottom: '30px', color: 'white', fontWeight: 'bold' }}>Bạn bắt được <strong style={{color: '#ffcc00', fontSize: '2.5rem', textShadow: '0 0 10px red'}}>{score}</strong> con cá 🐟</p>
            <button className="glass-button btn-primary" onClick={startGame} style={{ fontSize: '1.5rem', padding: '15px 40px', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto' }}>
              <RefreshCw size={24} /> Chơi lại
            </button>
          </div>
        )}

        {/* Cửa sổ render cá */}
        {isPlaying && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
            {entities.map((entity) => {
              const animName = entity.direction === 1 ? 'swimRight' : 'swimLeft';
              return (
                <div 
                  key={entity.id}
                  onPointerDown={() => catchEntity(entity.id, entity.isJellyfish)}
                  style={{
                    position: 'absolute',
                    top: `${entity.top}%`,
                    left: 0,
                    fontSize: 'clamp(3rem, 10vw, 5rem)',
                    cursor: 'crosshair',
                    userSelect: 'none',
                    animation: `${animName} ${entity.duration}s linear forwards`,
                    filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.5))',
                    touchAction: 'none' // Tối ưu bấm trên màn hình cảm ứng
                  }}
                >
                  {entity.type}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatchFishGame;
