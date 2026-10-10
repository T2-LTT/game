import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Music, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { updatePlayerStats, logAttempt } from '../utils/jsonStorage';
import { addBadge } from '../utils/badges';

// Tần số các nốt nhạc cơ bản (Quãng C4)
const NOTES = [
  { note: 'C4', label: 'Đồ', freq: 261.63, isBlack: false, color: '#ff3333' },
  { note: 'C#4', label: '', freq: 277.18, isBlack: true, color: '#000000' },
  { note: 'D4', label: 'Rê', freq: 293.66, isBlack: false, color: '#ff9933' },
  { note: 'D#4', label: '', freq: 311.13, isBlack: true, color: '#000000' },
  { note: 'E4', label: 'Mi', freq: 329.63, isBlack: false, color: '#ffff00' },
  { note: 'F4', label: 'Fa', freq: 349.23, isBlack: false, color: '#33cc33' },
  { note: 'F#4', label: '', freq: 369.99, isBlack: true, color: '#000000' },
  { note: 'G4', label: 'Son', freq: 392.00, isBlack: false, color: '#00d2ff' },
  { note: 'G#4', label: '', freq: 415.30, isBlack: true, color: '#000000' },
  { note: 'A4', label: 'La', freq: 440.00, isBlack: false, color: '#9d4edd' },
  { note: 'A#4', label: '', freq: 466.16, isBlack: true, color: '#000000' },
  { note: 'B4', label: 'Si', freq: 493.88, isBlack: false, color: '#ff66b2' },
  { note: 'C5', label: 'Đố', freq: 523.25, isBlack: false, color: '#ff3333' },
];

const PianoGame = ({ onBack, player, playerName, playerAvatar }) => {
  const [activeKeys, setActiveKeys] = useState({});
  const [notesPlayed, setNotesPlayed] = useState(0);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    // Khởi tạo AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtxRef.current = new AudioContext();

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const playNote = (noteObj) => {
    if (!audioCtxRef.current) return;
    
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    // Tạo âm thanh (synthesizer đơn giản)
    const oscillator = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();

    oscillator.type = 'triangle'; // triangle nghe khá giống tiếng chuông/đàn
    oscillator.frequency.value = noteObj.freq;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);

    // Fade out để nghe mượt mà không bị "bụp"
    gainNode.gain.setValueAtTime(0.5, audioCtxRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 1.0);

    oscillator.start(audioCtxRef.current.currentTime);
    oscillator.stop(audioCtxRef.current.currentTime + 1.0);

    // Hiệu ứng phím sáng lên
    setActiveKeys(prev => ({ ...prev, [noteObj.note]: true }));
    setTimeout(() => {
      setActiveKeys(prev => ({ ...prev, [noteObj.note]: false }));
    }, 200);

    // Hiệu ứng pháo hoa nhẹ cho các nốt có màu
    if (!noteObj.isBlack) {
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { y: 0.8 },
        colors: [noteObj.color]
      });
    }

    // Cộng điểm sau mỗi 20 nốt nhạc
    const newCount = notesPlayed + 1;
    setNotesPlayed(newCount);
    if (newCount > 0 && newCount % 20 === 0) {
      playSound('correct');
      updatePlayerStats(player, 5); // Tặng 5 điểm
      addBadge(player, 'Nhạc Sĩ Nhí Vũ Trụ', '🎹');
      logAttempt(player, 'Đánh Đàn', 'Chơi đàn Piano', true, 'Hoàn thành 20 nốt', 'Thưởng điểm');
    }
  };

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <ChevronLeft size={20} /> Trạm chính
        </button>

        <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={playerAvatar} alt={playerName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--neon-purple)' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Ban Nhạc Nhí</span>
        </div>
      </div>

      {/* Main Piano Area */}
      <div className="glass-panel" style={{ flex: 1, padding: 'clamp(20px, 5vw, 50px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <Music size={60} color="var(--neon-purple)" style={{ marginBottom: '10px' }} />
          <h1 className="title-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>Bé Tập Đánh Đàn</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '10px' }}>Chạm vào các phím để tạo ra âm thanh diệu kỳ!</p>
          <div style={{ marginTop: '15px', color: '#00ff00' }}>
            <Star size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> Đã chơi {notesPlayed} nốt
          </div>
        </div>

        {/* Piano Keyboard */}
        <div style={{ position: 'relative', display: 'flex', height: 'clamp(200px, 40vh, 350px)', width: '100%', maxWidth: '800px', background: '#333', padding: '10px', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          {NOTES.map((item, index) => {
            if (item.isBlack) return null; // Vẽ phím trắng trước

            // Tìm xem có phím đen nào ở ngay bên phải phím trắng này không
            const nextItem = NOTES[index + 1];
            const hasBlackKey = nextItem && nextItem.isBlack;

            return (
              <div key={item.note} style={{ flex: 1, position: 'relative', border: '1px solid #ccc', borderRadius: '0 0 10px 10px', overflow: 'visible' }}>
                {/* Phím Trắng */}
                <button
                  onMouseDown={() => playNote(item)}
                  onTouchStart={(e) => { e.preventDefault(); playNote(item); }}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: activeKeys[item.note] ? item.color : 'white',
                    border: 'none',
                    borderRadius: '0 0 8px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    paddingBottom: '20px',
                    transition: 'background 0.1s',
                    boxShadow: activeKeys[item.note] ? `inset 0 -10px 20px rgba(0,0,0,0.2)` : 'inset 0 -5px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <span style={{ color: activeKeys[item.note] ? 'white' : '#333', fontWeight: 'bold', fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>{item.label}</span>
                </button>

                {/* Phím Đen (chèn lên giữa phím trắng này và phím trắng tiếp theo) */}
                {hasBlackKey && (
                  <button
                    onMouseDown={() => playNote(nextItem)}
                    onTouchStart={(e) => { e.preventDefault(); playNote(nextItem); }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: '-25%', // Nằm giữa 2 phím trắng
                      width: '50%',
                      height: '60%',
                      background: activeKeys[nextItem.note] ? '#444' : 'black',
                      border: 'none',
                      borderRadius: '0 0 5px 5px',
                      cursor: 'pointer',
                      zIndex: 10,
                      boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default PianoGame;
