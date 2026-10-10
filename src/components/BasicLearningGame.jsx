import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Palette, Bug, Volume2, BookOpen, Calculator, Brain } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { addBadge } from '../utils/badges';
import { updatePlayerStats, logAttempt } from '../utils/jsonStorage';
import MemoryGame from './MemoryGame';
import ANIMALS from '../../data/animals.json';
const COLORS = [
  { name: 'Đỏ', value: '#ff3333', shadow: 'rgba(255,51,51,0.6)' },
  { name: 'Xanh dương', value: '#3399ff', shadow: 'rgba(51,153,255,0.6)' },
  { name: 'Xanh lá', value: '#33cc33', shadow: 'rgba(51,204,51,0.6)' },
  { name: 'Vàng', value: '#ffcc00', shadow: 'rgba(255,204,0,0.6)' },
  { name: 'Hồng', value: '#ff66b2', shadow: 'rgba(255,102,178,0.6)' },
  { name: 'Tím', value: '#9d4edd', shadow: 'rgba(157,78,221,0.6)' },
  { name: 'Cam', value: '#ff9933', shadow: 'rgba(255,153,51,0.6)' }
];



const NUMBERS = Array.from({length: 11}, (_, i) => ({ 
  name: `Số ${i}`, 
  value: i.toString(), 
  color: `hsl(${Math.random() * 360}, 80%, 60%)` 
}));

const LETTERS = ['A', 'Ă', 'Â', 'B', 'C', 'D', 'Đ', 'E', 'Ê', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'Ô', 'Ơ', 'P', 'Q', 'R', 'S', 'T', 'U', 'Ư', 'V', 'X', 'Y'].map(l => ({ 
  name: `Chữ ${l}`, 
  value: l, 
  color: `hsl(${Math.random() * 360}, 80%, 60%)` 
}));

const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const speak = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang === 'vi-VN' || v.lang === 'vi_VN' || v.name.toLowerCase().includes('vietnamese'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

const BasicLearningGame = ({ onBack, player = 'kiet', playerName, playerAvatar = '/image/tuankiet.JPG', initialGame }) => {
  const [selectedGame, setSelectedGame] = useState(initialGame || null);
  const [options, setOptions] = useState([]);
  const [targetItem, setTargetItem] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongShake, setWrongShake] = useState(null);

  const generateLevel = (gameType) => {
    let data;
    if (gameType === 'colors') data = COLORS;
    else if (gameType === 'animals') data = ANIMALS;
    else if (gameType === 'numbers') data = NUMBERS;
    else if (gameType === 'letters') data = LETTERS;

    const newOptions = getRandomItems(data, 3);
    setOptions(newOptions);
    const target = newOptions[Math.floor(Math.random() * newOptions.length)];
    setTargetItem(target);

    let questionText = `${playerName} ơi, hãy tìm ${target.name} nhé!`;
    if (gameType === 'colors') {
      questionText = `${playerName} ơi, hãy tìm màu ${target.name} nhé!`;
    }
    
    setTimeout(() => speak(questionText), 500);
  };

  useEffect(() => {
    if (selectedGame && selectedGame !== 'memory') {
      generateLevel(selectedGame);
    } else {
      window.speechSynthesis.cancel();
    }
  }, [selectedGame]);

  const handleItemClick = (item) => {
    const isCorrect = (selectedGame === 'colors' || selectedGame === 'numbers' || selectedGame === 'letters')
      ? item.value === targetItem.value 
      : item.name === targetItem.name;

    const gameTitleMap = { colors: 'Màu Sắc', animals: 'Con Vật', letters: 'Chữ Cái', numbers: 'Số Đếm' };
    logAttempt(
      player, 
      gameTitleMap[selectedGame] || selectedGame, 
      `Tìm ${targetItem.name || targetItem.value}`, 
      isCorrect, 
      item.name || item.value, 
      targetItem.name || targetItem.value
    );

    if (isCorrect) {
      playSound('correct');
      updatePlayerStats(player, 1); // Cộng 1 điểm vào hệ thống để khớp với điểm hiển thị
      speak(`Giỏi quá! Hoan hô ${playerName}!`);
      
      const newScore = score + 1;
      setScore(newScore);
      
      if (newScore > 0 && newScore % 5 === 0) {
         setTimeout(() => {
           playSound('badge');
           let badgeName = '';
           let badgeEmoji = '';
           if (selectedGame === 'colors') { badgeName = `Chuyên gia Màu Cấp ${newScore/5}`; badgeEmoji = '🎨'; }
           if (selectedGame === 'animals') { badgeName = `Nhà Động Vật Cấp ${newScore/5}`; badgeEmoji = '🦁'; }
           if (selectedGame === 'numbers') { badgeName = `Thần Đồng Toán Học Cấp ${newScore/5}`; badgeEmoji = '🔢'; }
           if (selectedGame === 'letters') { badgeName = `Học Giả Nhí Cấp ${newScore/5}`; badgeEmoji = '🔠'; }
           
           const result = addBadge(player, badgeName, badgeEmoji);
           if (result) speak(`Chúc mừng ${playerName} nhận được huy hiệu: ${badgeName}`);
         }, 1500);
      }

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [item.color || '#ffffff', '#ffffff']
      });
      setTimeout(() => generateLevel(selectedGame), 2500);
    } else {
      playSound('wrong');
      speak(`Chưa đúng rồi, ${playerName} thử lại nhé!`);
      setWrongShake(item.value || item.name);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  const playQuestionAudio = () => {
    if (targetItem) {
      let questionText = `${playerName} ơi, hãy tìm ${targetItem.name} nhé!`;
      if (selectedGame === 'colors') questionText = `${playerName} ơi, hãy tìm màu ${targetItem.name} nhé!`;
      speak(questionText);
    }
  };

  if (selectedGame === 'memory') {
    return <MemoryGame player={player} onBack={initialGame ? onBack : () => setSelectedGame(null)} />;
  }

  if (!selectedGame) {
    return (
      <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px' }}>
          <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
            <ChevronLeft size={20} /> Trạm chính
          </button>
        </div>
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px, 5vw, 40px)' }}>
          <h1 className="title-gradient" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: '40px', textAlign: 'center' }}>{playerName} muốn học gì nào?</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%', maxWidth: '900px' }}>
            
            <div className="glass-panel floating" style={{ padding: '30px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelectedGame('colors')}>
              <div style={{ background: 'var(--neon-pink)', borderRadius: '50%', padding: '20px', marginBottom: '15px' }}>
                <Palette size={48} color="white" />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Màu Sắc</h2>
            </div>

            <div className="glass-panel floating-delayed" style={{ padding: '30px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelectedGame('animals')}>
              <div style={{ background: 'var(--neon-blue)', borderRadius: '50%', padding: '20px', marginBottom: '15px' }}>
                <Bug size={48} color="white" />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Con Vật</h2>
            </div>

            <div className="glass-panel floating" style={{ animationDelay: '0.4s', padding: '30px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelectedGame('letters')}>
              <div style={{ background: '#33cc33', borderRadius: '50%', padding: '20px', marginBottom: '15px' }}>
                <BookOpen size={48} color="white" />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Chữ Cái</h2>
            </div>

            <div className="glass-panel floating-delayed" style={{ animationDelay: '0.6s', padding: '30px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelectedGame('numbers')}>
              <div style={{ background: '#ffcc00', borderRadius: '50%', padding: '20px', marginBottom: '15px' }}>
                <Calculator size={48} color="white" />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Số Đếm</h2>
            </div>

            <div className="glass-panel floating" style={{ animationDelay: '0.8s', padding: '30px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => setSelectedGame('memory')}>
              <div style={{ background: 'var(--neon-purple)', borderRadius: '50%', padding: '20px', marginBottom: '15px' }}>
                <Brain size={48} color="white" />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Lật Thẻ</h2>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (!targetItem) return null;

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px) rotate(-5deg); }
          75% { transform: translateX(10px) rotate(5deg); }
        }
        .shake-anim { animation: shake 0.4s ease-in-out; }
        .item-btn {
          background: none;
          border: none;
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: clamp(20px, 4vw, 40px);
          background: rgba(40,20,60,0.8);
          border: 2px solid rgba(255,255,255,0.2);
          overflow: hidden;
          width: clamp(100px, 28vw, 300px);
          height: clamp(100px, 28vw, 300px);
        }
        .item-btn:hover {
          transform: scale(1.05);
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.5);
          box-shadow: 0 10px 40px rgba(0, 210, 255, 0.4);
        }
        .item-btn:active {
          transform: scale(0.95);
        }
        .real-img {
          width: 90%;
          height: 90%;
          object-fit: cover;
          border-radius: clamp(15px, 3vw, 30px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .speaker-btn {
          background: var(--neon-blue);
          border: none;
          border-radius: 50%;
          width: clamp(40px, 8vw, 60px);
          height: clamp(40px, 8vw, 60px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-left: 10px;
          vertical-align: middle;
          box-shadow: 0 0 20px rgba(0, 210, 255, 0.5);
          transition: transform 0.2s;
        }
        .speaker-btn:active {
          transform: scale(0.9);
        }
        .big-text {
          font-size: clamp(4rem, 15vw, 10rem);
          font-weight: 900;
          font-family: 'Outfit', sans-serif;
        }
        @media (max-width: 600px) {
          .mobile-stack {
            flex-direction: column !important;
            align-items: center !important;
            gap: 10px !important;
          }
          .mobile-score { font-size: 1.2rem !important; padding: 10px 20px !important; }
        }
      `}</style>
      
      <div className="mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="glass-button" onClick={initialGame ? onBack : () => setSelectedGame(null)} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <ChevronLeft size={20} /> Chọn trò khác
        </button>
        <div className="glass-panel mobile-score" style={{ padding: '8px 20px', fontSize: '1.3rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={playerAvatar} alt={playerName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--neon-pink)' }} />
          <span>🌟 Điểm: <span style={{ color: 'var(--neon-pink)', fontSize: '1.8rem', marginLeft: '5px' }}>{score}</span></span>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(15px, 4vw, 40px)' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: 'clamp(30px, 6vw, 80px)', textAlign: 'center', lineHeight: '1.4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span>{playerName} ơi, tìm <br/>
            <span style={{ 
              color: selectedGame === 'colors' ? targetItem.value : targetItem.color || '#00d2ff', 
              textShadow: `0 0 20px ${selectedGame === 'colors' ? targetItem.shadow : targetItem.color || 'rgba(0, 210, 255, 0.6)'}`,
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              textTransform: 'uppercase'
            }}>
              {selectedGame === 'colors' ? `Màu ${targetItem.name}` : targetItem.name}
            </span> nhé!
          </span>
          <button className="speaker-btn floating" onClick={playQuestionAudio} title="Nghe lại câu hỏi">
            <Volume2 color="white" size={24} />
          </button>
        </h1>

        <div style={{ display: 'flex', gap: 'clamp(15px, 3vw, 50px)', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          {options.map((item, index) => {
            const isWrong = wrongShake === (item.value || item.name);
            return (
              <button 
                key={index}
                className={`item-btn floating ${isWrong ? 'shake-anim' : ''}`}
                style={{ animationDelay: `${index * 0.3}s` }}
                onClick={() => handleItemClick(item)}
              >
                {selectedGame === 'colors' && (
                  <div style={{ filter: `drop-shadow(0 0 20px ${item.shadow})` }}>
                    <Star size="70%" fill={item.value} color={item.value} />
                  </div>
                )}
                {selectedGame === 'animals' && (
                  <img src={item.img} alt={item.name} className="real-img" />
                )}
                {(selectedGame === 'numbers' || selectedGame === 'letters') && (
                  <div className="big-text" style={{ color: item.color, textShadow: `0 0 30px ${item.color}` }}>
                    {item.value}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BasicLearningGame;
