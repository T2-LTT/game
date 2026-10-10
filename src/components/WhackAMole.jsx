import React, { useState, useEffect } from 'react';
import { ChevronLeft, Play, RefreshCw, Star } from 'lucide-react';
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

const WhackAMole = ({ onBack, player = 'kiet', playerName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeHole, setActiveHole] = useState(null);
  const [hitHole, setHitHole] = useState(null);

  useEffect(() => {
    let moleInterval;
    let timerInterval;

    if (isPlaying && timeLeft > 0) {
      moleInterval = setInterval(() => {
        const randomHole = Math.floor(Math.random() * 9);
        setActiveHole(randomHole);
        setHitHole(null); // Reset hit state
      }, 800);

      timerInterval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setActiveHole(null);
      logAttempt(player, 'Đập Chuột', 'Chơi đập chuột', score > 0, `Đập được ${score} con chuột`, '');
      updatePlayerStats(player, score); // Cộng điểm theo số chuột
      playSound('correct');
      speak(`Hết giờ! Bạn đập được ${score} con chuột!`);
      if (score >= 10) {
        addBadge(player, 'Tay Lưới Nhanh Nhẹn Vũ Trụ', '🐹');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }

    return () => {
      clearInterval(moleInterval);
      clearInterval(timerInterval);
    };
  }, [isPlaying, timeLeft, score]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setActiveHole(null);
    setHitHole(null);
    speak("Sẵn sàng, bắt đầu đập chuột!");
  };

  const whack = (index) => {
    if (!isPlaying) return;

    if (index === activeHole) {
      playSound('correct');
      setScore(s => s + 1);
      setHitHole(index);
      setActiveHole(null); // Hide immediately
    } else {
      playSound('wrong');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="glass-button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={20} /> Quay lại
        </button>
        <div className="glass-panel" style={{ padding: '10px 20px', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', gap: '20px' }}>
          <span style={{ color: '#00d2ff' }}>⏳ {timeLeft}s</span>
          <span style={{ color: 'var(--neon-pink)' }}>⭐ {score}</span>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <h1 className="title-gradient text-glow" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '30px', textAlign: 'center' }}>
          Game Đập Chuột
        </h1>

        {!isPlaying && timeLeft === 30 && (
          <button className="glass-button btn-primary" onClick={startGame} style={{ fontSize: '1.5rem', padding: '15px 40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Play size={24} /> Bắt đầu chơi
          </button>
        )}

        {!isPlaying && timeLeft === 0 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: 'var(--neon-pink)' }}>Hết giờ!</h2>
            <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Bạn đã đập được <strong style={{color: '#ffcc00', fontSize: '2rem'}}>{score}</strong> chú chuột 🐹</p>
            <button className="glass-button btn-primary" onClick={startGame} style={{ fontSize: '1.5rem', padding: '15px 40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={24} /> Chơi lại
            </button>
          </div>
        )}

        {isPlaying && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 'clamp(10px, 3vw, 30px)', 
            width: '100%', 
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {Array.from({ length: 9 }).map((_, index) => (
              <div 
                key={index}
                onClick={() => whack(index)}
                style={{
                  aspectRatio: '1',
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '20px',
                  border: '4px solid rgba(255,255,255,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5)'
                }}
              >
                {/* Lỗ chuột */}
                <div style={{
                  position: 'absolute',
                  bottom: '10%',
                  left: '10%',
                  width: '80%',
                  height: '40%',
                  background: 'rgba(0,0,0,0.8)',
                  borderRadius: '50%'
                }} />
                
                {/* Con chuột */}
                <div style={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 'clamp(3rem, 10vw, 6rem)',
                  transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                  transformOrigin: 'bottom',
                  opacity: (activeHole === index || hitHole === index) ? 1 : 0,
                  marginTop: (activeHole === index || hitHole === index) ? '0' : '100px', // Slide down when hidden
                  pointerEvents: 'none',
                  filter: hitHole === index ? 'grayscale(1) brightness(2)' : 'none'
                }}>
                  {hitHole === index ? '💥' : '🐹'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhackAMole;
