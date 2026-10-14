import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, RefreshCw, Zap, Trophy, Volume2, ArrowLeft, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound, speakVietnamese } from '../utils/audio';
import { logAttempt, updatePlayerStats } from '../utils/jsonStorage';

// Tạo câu hỏi bảng cửu chương
const generateQuestion = (selectedTable) => {
  let a, b;
  if (selectedTable === 'all') {
    a = Math.floor(Math.random() * 8) + 2; // 2 -> 9
    b = Math.floor(Math.random() * 9) + 1; // 1 -> 9
  } else {
    a = parseInt(selectedTable, 10);
    b = Math.floor(Math.random() * 9) + 1;
  }
  const answer = a * b;

  // Tạo 2 đáp án nhiễu hợp lý
  const wrongOptions = new Set();
  while (wrongOptions.size < 2) {
    const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.5 ? 1 : a);
    const candidate = answer + offset;
    if (candidate > 0 && candidate !== answer && candidate <= 100) {
      wrongOptions.add(candidate);
    }
  }

  const options = [answer, ...Array.from(wrongOptions)].sort(() => Math.random() - 0.5);
  return { a, b, answer, options };
};

const TABLES = ['all', '2', '3', '4', '5', '6', '7', '8', '9'];

const MultiplicationRacingGame = ({ onBack, player = 'nhi', playerName = 'Bảo Nhi' }) => {
  const [selectedTable, setSelectedTable] = useState('all');
  const [gameState, setGameState] = useState('menu'); // 'menu', 'racing', 'finished'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [carLane, setCarLane] = useState(1); // 0: Trái, 1: Giữa, 2: Phải
  const [score, setScore] = useState(0);
  const [lap, setLap] = useState(1);
  const [speed, setSpeed] = useState(100);
  const [isNitro, setIsNitro] = useState(false);
  const [wrongEffect, setWrongEffect] = useState(false);
  const totalLaps = 10;

  const roadOffsetRef = useRef(0);
  const [roadOffset, setRoadOffset] = useState(0);

  // Hiệu ứng cuộn đường đua
  useEffect(() => {
    if (gameState !== 'racing') return;
    const interval = setInterval(() => {
      const step = isNitro ? 18 : Math.floor(speed / 10);
      roadOffsetRef.current = (roadOffsetRef.current + step) % 100;
      setRoadOffset(roadOffsetRef.current);
    }, 40);
    return () => clearInterval(interval);
  }, [gameState, speed, isNitro]);

  const startRace = () => {
    setGameState('racing');
    setScore(0);
    setLap(1);
    setSpeed(120);
    setIsNitro(false);
    setCarLane(1);
    const q = generateQuestion(selectedTable);
    setCurrentQuestion(q);
    speakVietnamese(`${q.a} nhân ${q.b} bằng bao nhiêu?`);
  };

  const handleAnswer = (option, laneIndex) => {
    setCarLane(laneIndex);

    if (option === currentQuestion.answer) {
      // Đúng -> Kích hoạt Nitro
      playSound('rocket');
      setIsNitro(true);
      setSpeed(prev => Math.min(prev + 15, 240));
      setScore(prev => prev + 15);
      logAttempt(player, 'multiplication_racing', true, 15);
      updatePlayerStats(player, 'multiplication_racing', 15);

      speakVietnamese(`Đúng rồi! ${currentQuestion.a} nhân ${currentQuestion.b} bằng ${currentQuestion.answer}!`);

      if (lap >= totalLaps) {
        // Cán đích
        setTimeout(() => {
          setGameState('finished');
          playSound('badge');
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
          speakVietnamese(`Chúc mừng tay đua siêu đẳng ${playerName} đã về đích xuất sắc!`);
        }, 800);
      } else {
        setTimeout(() => {
          setIsNitro(false);
          setLap(prev => prev + 1);
          const nextQ = generateQuestion(selectedTable);
          setCurrentQuestion(nextQ);
          speakVietnamese(`${nextQ.a} nhân ${nextQ.b}?`);
        }, 900);
      }
    } else {
      // Sai -> Giảm tốc nhẹ
      playSound('wrong');
      setWrongEffect(true);
      setSpeed(prev => Math.max(prev - 20, 70));
      setTimeout(() => setWrongEffect(false), 600);
      speakVietnamese(`Chưa đúng rồi! ${currentQuestion.a} nhân ${currentQuestion.b} không phải là ${option}! Bé chọn lại nào!`);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '15px', minHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes roadStripes {
          from { background-position-y: 0px; }
          to { background-position-y: 100px; }
        }
        @keyframes nitroFire {
          0%, 100% { height: 25px; opacity: 0.8; }
          50% { height: 45px; opacity: 1; filter: drop-shadow(0 0 15px #00d2ff); }
        }
      `}</style>

      {/* THANH ĐIỀU HƯỚNG */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button 
          onClick={onBack}
          className="glass-button"
          style={{ padding: '8px 18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ChevronLeft size={20} /> Trở về
        </button>

        {gameState === 'racing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', padding: '6px 16px', borderRadius: '20px', color: '#ffcc00', fontWeight: 'bold' }}>
              ⭐ {score} điểm
            </div>
            <div style={{ background: 'rgba(0, 210, 255, 0.15)', border: '1px solid #00d2ff', padding: '6px 16px', borderRadius: '20px', color: '#00d2ff', fontWeight: 'bold' }}>
              Vòng {lap} / {totalLaps}
            </div>
            <div style={{ background: isNitro ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.2)', border: `1px solid ${isNitro ? '#ef4444' : '#10b981'}`, padding: '6px 16px', borderRadius: '20px', color: isNitro ? '#ff0055' : '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={18} /> {speed} km/h {isNitro && '🔥 NITRO'}
            </div>
          </div>
        )}
      </div>

      {/* MÀN HÌNH CHỌN BẢNG CỬU CHƯƠNG */}
      {gameState === 'menu' && (
        <div className="glass-panel" style={{ margin: 'auto', padding: '30px', textAlign: 'center', maxWidth: '520px', width: '100%' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '10px' }}>🏎️</div>
          <h1 className="title-gradient" style={{ fontSize: '2.3rem', marginBottom: '10px' }}>
            Đua Xe Cửu Chương
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '25px' }}>
            Chọn đúng kết quả phép nhân để phóng Nitro vượt mặt đối thủ!
          </p>

          <div style={{ marginBottom: '25px' }}>
            <div style={{ fontSize: '1rem', color: '#00d2ff', fontWeight: 'bold', marginBottom: '12px' }}>
              Chọn Bảng Nhân Muốn Thách Đấu:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {TABLES.map(table => (
                <button
                  key={table}
                  onClick={() => setSelectedTable(table)}
                  className="glass-button"
                  style={{
                    padding: '10px 5px',
                    fontSize: '1.05rem',
                    borderRadius: '12px',
                    background: selectedTable === table ? 'linear-gradient(135deg, #0ea5e9, #ec4899)' : 'rgba(255,255,255,0.06)',
                    borderColor: selectedTable === table ? '#00d2ff' : 'rgba(255,255,255,0.15)',
                    transform: 'none'
                  }}
                >
                  {table === 'all' ? 'Tất cả' : `Bảng ${table}`}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="glass-button btn-primary"
            onClick={startRace}
            style={{ width: '100%', fontSize: '1.4rem', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <Play size={24} /> Khởi Động Đua Ngay!
          </button>
        </div>
      )}

      {/* MÀN HÌNH CÁN ĐÍCH VỀ NHẤT */}
      {gameState === 'finished' && (
        <div className="glass-panel" style={{ margin: 'auto', padding: '35px', textAlign: 'center', maxWidth: '480px', width: '100%' }}>
          <div style={{ fontSize: '5rem', marginBottom: '10px' }}>🏆</div>
          <h2 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
            VỀ ĐÍCH HẠNG NHẤT!
          </h2>
          <p style={{ color: 'white', fontSize: '1.25rem', marginBottom: '15px' }}>
            Tay đua cừ khôi <strong>{playerName}</strong> đã chinh phục trọn vẹn 10 vòng đua!
          </p>
          <div style={{ background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', padding: '15px', borderRadius: '20px', color: '#ffcc00', fontWeight: 'bold', fontSize: '1.8rem', marginBottom: '25px' }}>
            ⭐ {score} Điểm Vô Địch
          </div>

          <button 
            className="glass-button btn-primary"
            onClick={startRace}
            style={{ width: '100%', fontSize: '1.3rem', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <RefreshCw size={22} /> Đua Lại Trận Mới
          </button>
        </div>
      )}

      {/* GIAO DIỆN ĐƯỜNG ĐUA TRỰC TIẾP */}
      {gameState === 'racing' && currentQuestion && (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* BẢNG PHÉP TÍNH PHÍA TRÊN */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '15px 20px', 
              textAlign: 'center', 
              marginBottom: '15px', 
              border: '2px solid #00d2ff',
              boxShadow: isNitro ? '0 0 30px rgba(255, 0, 128, 0.6)' : '0 0 20px rgba(0, 210, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px'
            }}
          >
            <div style={{ fontSize: 'clamp(2.2rem, 6vw, 3.2rem)', fontWeight: '900', color: '#ffcc00', letterSpacing: '2px' }}>
              {currentQuestion.a} × {currentQuestion.b} = ?
            </div>

            <button 
              onClick={() => speakVietnamese(`${currentQuestion.a} nhân ${currentQuestion.b} bằng bao nhiêu?`)}
              className="glass-button"
              style={{ padding: '10px 14px', borderRadius: '50%', background: 'rgba(0,210,255,0.2)' }}
              title="Nghe lại câu hỏi"
            >
              <Volume2 size={24} color="#00d2ff" />
            </button>
          </div>

          {/* ĐƯỜNG ĐUA 3 LÀN */}
          <div 
            style={{ 
              flexGrow: 1, 
              position: 'relative', 
              borderRadius: '24px', 
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #090518 0%, #150d30 100%)',
              border: wrongEffect ? '3px solid #ef4444' : '2px solid rgba(255,255,255,0.15)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Vạch kẻ đường 3 làn (Trái - Giữa - Phải) */}
            <div style={{ position: 'absolute', top: 0, left: '33.33%', width: '3px', height: '100%', borderLeft: '3px dashed rgba(255,255,255,0.25)' }} />
            <div style={{ position: 'absolute', top: 0, left: '66.66%', width: '3px', height: '100%', borderLeft: '3px dashed rgba(255,255,255,0.25)' }} />

            {/* 3 CỔNG ĐÁP ÁN NĂNG LƯỢNG PHÍA TRÊN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '15px', zIndex: 10 }}>
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option, idx)}
                  className="glass-button"
                  style={{
                    padding: '20px 10px',
                    borderRadius: '20px',
                    fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                    fontWeight: '900',
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(157, 78, 221, 0.4))',
                    border: '2px solid #00d2ff',
                    color: '#ffffff',
                    boxShadow: '0 8px 25px rgba(0, 210, 255, 0.4)',
                    cursor: 'pointer',
                    transform: carLane === idx ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* KHU VỰC XE ĐUA CỦA BÉ PHÍA DƯỚI */}
            <div style={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'flex-end', paddingBottom: '30px' }}>
              <div 
                style={{ 
                  position: 'absolute',
                  bottom: '20px',
                  left: `${carLane * 33.33 + 16.66}%`,
                  transform: 'translateX(-50%)',
                  transition: 'left 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 20
                }}
              >
                {/* Xe đua siêu ngầu */}
                <div style={{ fontSize: 'clamp(4rem, 9vw, 5.5rem)', transform: 'rotate(-90deg)', filter: isNitro ? 'drop-shadow(0 0 25px #00d2ff)' : 'none' }}>
                  🏎️
                </div>

                {/* Ngọn lửa Nitro phía sau xe */}
                {isNitro && (
                  <div 
                    style={{ 
                      width: '18px', 
                      background: 'linear-gradient(to bottom, #ff0080, #00d2ff)', 
                      borderRadius: '10px',
                      animation: 'nitroFire 0.15s infinite',
                      marginTop: '-10px'
                    }} 
                  />
                )}

                {/* Tên bé trên nóc xe */}
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#00d2ff', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '10px', marginTop: '5px' }}>
                  {playerName}
                </span>
              </div>
            </div>

            {/* NÚT ĐIỀU KHIỂN CHUYỂN LÀN NHANH DÀNH CHO MOBILE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '12px', background: 'rgba(0,0,0,0.4)', zIndex: 10 }}>
              <button 
                onClick={() => handleAnswer(currentQuestion.options[0], 0)} 
                className="glass-button" 
                style={{ padding: '12px', fontSize: '1rem', borderRadius: '15px' }}
              >
                <ArrowLeft size={18} /> Cổng Trái
              </button>
              <button 
                onClick={() => handleAnswer(currentQuestion.options[1], 1)} 
                className="glass-button" 
                style={{ padding: '12px', fontSize: '1rem', borderRadius: '15px' }}
              >
                Cổng Giữa
              </button>
              <button 
                onClick={() => handleAnswer(currentQuestion.options[2], 2)} 
                className="glass-button" 
                style={{ padding: '12px', fontSize: '1rem', borderRadius: '15px' }}
              >
                Cổng Phải <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplicationRacingGame;
