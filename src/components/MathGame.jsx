import React, { useState, useEffect } from 'react';
import { ChevronLeft, Rocket, Battery, BatteryCharging, CheckCircle2, Languages, Calculator, Brain } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { addBadge } from '../utils/badges';
import { logAttempt, updatePlayerStats } from '../utils/jsonStorage';
import MemoryGame from './MemoryGame';

const MathGame = ({ onBack, player = 'nhi', playerName = 'Bảo Nhi', playerAvatar = '/image/baonhi.JPG', initialGame }) => {
  const [activeTab, setActiveTab] = useState(initialGame || 'math'); // 'math', 'english', or 'memory'
  const [question, setQuestion] = useState({});
  const [options, setOptions] = useState([]);
  const [fuel, setFuel] = useState(0);
  const [wrongShake, setWrongShake] = useState(null);
  const [isLaunched, setIsLaunched] = useState(false);

  const generateQuestion = () => {
    const types = ['+', '-', '*'];
    const type = types[Math.floor(Math.random() * types.length)];
    let num1, num2, ans;

    if (type === '+') {
      num1 = Math.floor(Math.random() * 40) + 10;
      num2 = Math.floor(Math.random() * 40) + 10;
      ans = num1 + num2;
    } else if (type === '-') {
      num1 = Math.floor(Math.random() * 40) + 20;
      num2 = Math.floor(Math.random() * num1);
      ans = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 9) + 2;
      num2 = Math.floor(Math.random() * 9) + 2;
      ans = num1 * num2;
    }

    setQuestion({ text: `${num1} ${type === '*' ? 'x' : type} ${num2} = ?`, answer: ans });

    let fake1 = ans + Math.floor(Math.random() * 5) + 1;
    let fake2 = ans - Math.floor(Math.random() * 5) - 1;
    if (fake2 < 0) fake2 = ans + 10;

    const newOptions = [ans, fake1, fake2].sort(() => 0.5 - Math.random());
    setOptions(newOptions);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  const handleAnswer = (selectedAns) => {
    if (isLaunched) return;
    const isCorrect = (selectedAns === question.answer);
    logAttempt(player, 'Giải Toán Tên Lửa', question.text, isCorrect, selectedAns, question.answer);

    if (selectedAns === question.answer) {
      playSound('correct');
      updatePlayerStats(player, 5); // Cộng 5 điểm mỗi câu toán đúng
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00d2ff', '#3a7bd5', '#ffffff']
      });

      const newFuel = fuel + 20;
      setFuel(newFuel);

      if (newFuel >= 100) {
        setIsLaunched(true);
        playSound('rocket');
        
        // Tặng huy hiệu phóng tên lửa
        setTimeout(() => {
           playSound('badge');
           addBadge(player, 'Phi Hành Gia Tập Sự', '🚀');
        }, 2000);

        setTimeout(() => {
          confetti({ particleCount: 300, spread: 120, origin: { y: 0.4 } });
        }, 500);
      } else {
        setTimeout(generateQuestion, 1000);
      }
    } else {
      playSound('wrong');
      setWrongShake(selectedAns);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  const resetGame = () => {
    setFuel(0);
    setIsLaunched(false);
    generateQuestion();
  };

  if (activeTab === 'english') {
    return <EnglishGame player={player} playerName={playerName} onBack={initialGame ? onBack : () => setActiveTab('math')} />;
  }

  if (activeTab === 'memory') {
    return <MemoryGame player={player} onBack={initialGame ? onBack : () => setActiveTab('math')} />;
  }

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .shake-anim { animation: shake 0.4s ease-in-out; }
        
        @keyframes launch {
          0% { transform: translateY(0) scale(1); }
          20% { transform: translateY(20px) scale(0.9); }
          100% { transform: translateY(-1000px) scale(1.5); }
        }
        .rocket-launch {
          animation: launch 2s cubic-bezier(0.5, 0, 0.2, 1) forwards;
        }

        .ans-btn {
          background: linear-gradient(135deg, rgba(30,15,50,0.9), rgba(20,10,40,0.9));
          border: 2px solid rgba(0, 210, 255, 0.4);
          color: white;
          border-radius: 20px;
          padding: clamp(10px, 3vw, 20px) clamp(20px, 5vw, 40px);
          font-size: clamp(2rem, 6vw, 3rem);
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          flex: 1;
          min-width: 80px;
        }
        .ans-btn:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 210, 255, 0.5);
          background: rgba(0, 210, 255, 0.2);
        }
        
        @media (max-width: 768px) {
          .game-container {
            flex-direction: column !important;
          }
          .rocket-area {
            width: 100% !important;
            height: 150px !important;
            padding-top: 20px !important;
            justify-content: center !important;
            align-items: center !important;
          }
          .rocket-icon {
            transform: scale(0.7) rotate(90deg) !important;
          }
          .rocket-launch {
            animation: launch-mobile 2s cubic-bezier(0.5, 0, 0.2, 1) forwards !important;
          }
          @keyframes launch-mobile {
            0% { transform: translateX(0) scale(0.7) rotate(90deg); }
            20% { transform: translateX(-20px) scale(0.6) rotate(90deg); }
            100% { transform: translateX(1000px) scale(1) rotate(90deg); }
          }
          .mobile-top-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
        }
      `}</style>
      
      <div className="mobile-top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
            <ChevronLeft size={20} /> Trạm chính
          </button>
          {!initialGame && (
            <>
              <button 
                className="glass-button btn-secondary" 
                onClick={() => setActiveTab('english')} 
                style={{ padding: '8px 16px', fontSize: '0.95rem', display: 'flex', gap: '6px', alignItems: 'center' }}
              >
                <Languages size={18} /> Tiếng Anh
              </button>
              <button 
                className="glass-button" 
                onClick={() => setActiveTab('memory')} 
                style={{ padding: '8px 16px', fontSize: '0.95rem', display: 'flex', gap: '6px', alignItems: 'center', background: 'var(--neon-purple)' }}
              >
                <Brain size={18} /> Lật Thẻ
              </button>
            </>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={playerAvatar} alt={playerName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--neon-blue)' }} />
          {fuel >= 100 ? <BatteryCharging color="#00ff00" size={30} /> : <Battery color="#00d2ff" size={30} />}
          <div style={{ width: 'clamp(100px, 30vw, 200px)', height: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${fuel}%`, 
              height: '100%', 
              background: fuel >= 100 ? '#00ff00' : 'linear-gradient(90deg, #00d2ff, #3a7bd5)',
              transition: 'width 0.5s ease-out'
            }} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{fuel}%</span>
        </div>
      </div>

      <div className="game-container" style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {!isLaunched ? (
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px, 5vw, 40px)', zIndex: 10, width: '100%' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: 'var(--text-muted)', marginBottom: 'clamp(15px, 4vw, 30px)', textAlign: 'center' }}>
              Giải toán để nạp nhiên liệu:
            </h2>
            
            <div style={{ fontSize: 'clamp(3.5rem, 10vw, 6rem)', fontWeight: '900', color: 'var(--neon-blue)', textShadow: '0 0 30px rgba(0,210,255,0.5)', marginBottom: 'clamp(30px, 8vw, 60px)', letterSpacing: '2px', textAlign: 'center' }}>
              {question.text}
            </div>

            <div style={{ display: 'flex', gap: 'clamp(10px, 3vw, 40px)', width: '100%', justifyContent: 'center' }}>
              {options.map((ans, idx) => (
                <button 
                  key={idx}
                  className={`ans-btn ${wrongShake === ans ? 'shake-anim' : ''}`}
                  style={{ borderColor: wrongShake === ans ? '#ff0055' : '' }}
                  onClick={() => handleAnswer(ans)}
                >
                  {ans}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', zIndex: 10, width: '100%', textAlign: 'center' }}>
            <CheckCircle2 size={80} color="#00ff00" style={{ marginBottom: '20px' }} />
            <h1 className="title-gradient" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '20px' }}>Tuyệt Vời!</h1>
            <p style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginBottom: '40px' }}>Tên lửa đã bay vào quỹ đạo.</p>
            <button className="glass-button btn-secondary" onClick={resetGame}>
              Nhiệm vụ mới
            </button>
          </div>
        )}

        <div className="rocket-area" style={{ width: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '50px' }}>
          <div className={`rocket-icon ${isLaunched ? 'rocket-launch' : 'floating'}`} style={{ transition: 'transform 0.5s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              filter: `drop-shadow(0 0 ${fuel/2}px rgba(0, 210, 255, ${fuel/100}))`,
              transform: `scale(${1 + fuel/500})`
            }}>
              <Rocket size={120} color="white" fill="#00d2ff" strokeWidth={1} />
            </div>
            <div style={{ 
              height: `${fuel}px`, 
              width: '30px', 
              background: 'linear-gradient(to bottom, #ff8c00, #ff0000, transparent)',
              borderRadius: '15px',
              opacity: fuel > 0 ? 0.8 : 0,
              transition: 'height 0.3s'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathGame;
