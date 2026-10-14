import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Volume2, Play, RefreshCw, Sparkles, Star, Trophy, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound, speakVietnamese } from '../utils/audio';
import { logAttempt, updatePlayerStats } from '../utils/jsonStorage';

// Bảng màu bóng bay sắc nét, rực rỡ
const BALLOON_COLORS = [
  { name: 'Đỏ', hex: '#ef4444', gradient: 'radial-gradient(circle at 35% 35%, #fca5a5 0%, #ef4444 60%, #991b1b 100%)' },
  { name: 'Vàng', hex: '#eab308', gradient: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 60%, #854d0e 100%)' },
  { name: 'Xanh Dương', hex: '#3b82f6', gradient: 'radial-gradient(circle at 35% 35%, #93c5fd 0%, #3b82f6 60%, #1e40af 100%)' },
  { name: 'Xanh Lá', hex: '#22c55e', gradient: 'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 60%, #166534 100%)' },
  { name: 'Hồng', hex: '#ec4899', gradient: 'radial-gradient(circle at 35% 35%, #f472b6 0%, #ec4899 60%, #9d174d 100%)' },
  { name: 'Tím', hex: '#a855f7', gradient: 'radial-gradient(circle at 35% 35%, #d8b4fe 0%, #a855f7 60%, #6b21a8 100%)' },
  { name: 'Cam', hex: '#f97316', gradient: 'radial-gradient(circle at 35% 35%, #fdba74 0%, #f97316 60%, #9a3412 100%)' }
];

// Bảng 29 chữ cái Tiếng Việt chuẩn
const VI_LETTERS = [
  'A', 'Ă', 'Â', 'B', 'C', 'D', 'Đ', 'E', 'Ê', 'G', 'H', 'I',
  'K', 'L', 'M', 'N', 'O', 'Ô', 'Ơ', 'P', 'Q', 'R', 'S', 'T',
  'U', 'Ư', 'V', 'X', 'Y'
];

// Các bộ câu hỏi theo chủ đề
const GAME_MODES = [
  {
    id: 'colors',
    title: 'Màu Sắc',
    icon: '🎨',
    desc: 'Cho bé 2-3 tuổi',
    items: BALLOON_COLORS.map(c => ({
      id: c.name,
      label: c.name,
      display: `Màu ${c.name}`,
      speech: `Màu ${c.name}`,
      colorHex: c.hex,
      icon: '🎈'
    }))
  },
  {
    id: 'numbers',
    title: 'Số Đếm',
    icon: '🔢',
    desc: 'Cho bé 3-5 tuổi',
    items: Array.from({ length: 10 }, (_, i) => {
      const n = (i + 1).toString();
      return {
        id: n,
        label: n,
        display: `Số ${n}`,
        speech: `Số ${n}`,
        icon: n
      };
    })
  },
  {
    id: 'letters',
    title: 'Chữ Cái',
    icon: '🔤',
    desc: 'Cho bé 4-6 tuổi',
    items: VI_LETTERS.map(l => ({
      id: l,
      label: l,
      display: `Chữ ${l}`,
      speech: `Chữ ${l}`,
      icon: l
    }))
  },
  {
    id: 'math',
    title: 'Toán Đố Vui',
    icon: '🚀',
    desc: 'Cho bé 6-8 tuổi',
    items: [
      { id: '2', label: '2', question: '1 + 1', display: '1 + 1 = ?', speech: 'Một cộng một bằng mấy?', icon: '➕' },
      { id: '3', label: '3', question: '1 + 2', display: '1 + 2 = ?', speech: 'Một cộng hai bằng mấy?', icon: '➕' },
      { id: '4', label: '4', question: '2 + 2', display: '2 + 2 = ?', speech: 'Hai cộng hai bằng mấy?', icon: '➕' },
      { id: '5', label: '5', question: '3 + 2', display: '3 + 2 = ?', speech: 'Ba cộng hai bằng mấy?', icon: '➕' },
      { id: '6', label: '6', question: '5 + 1', display: '5 + 1 = ?', speech: 'Năm cộng một bằng mấy?', icon: '➕' },
      { id: '7', label: '7', question: '4 + 3', display: '4 + 3 = ?', speech: 'Bốn cộng ba bằng mấy?', icon: '➕' },
      { id: '8', label: '8', question: '5 + 3', display: '5 + 3 = ?', speech: 'Năm cộng ba bằng mấy?', icon: '➕' },
      { id: '9', label: '9', question: '6 + 3', display: '6 + 3 = ?', speech: 'Sáu cộng ba bằng mấy?', icon: '➕' },
      { id: '10', label: '10', question: '5 + 5', display: '5 + 5 = ?', speech: 'Năm cộng năm bằng mấy?', icon: '➕' }
    ]
  }
];

const BalloonPopGame = ({ onBack, player = 'kiet', playerName = 'Bé' }) => {
  const [currentModeId, setCurrentModeId] = useState('colors');
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [targetItem, setTargetItem] = useState(null);
  const [balloons, setBalloons] = useState([]);
  const [poppedIds, setPoppedIds] = useState(new Set());
  const [slowMoUntil, setSlowMoUntil] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const nextBalloonId = useRef(0);
  const containerRef = useRef(null);

  const activeMode = GAME_MODES.find(m => m.id === currentModeId) || GAME_MODES[0];

  // Khởi tạo hoặc đổi câu hỏi mục tiêu
  const pickNewTarget = (mode = activeMode) => {
    const randomTarget = mode.items[Math.floor(Math.random() * mode.items.length)];
    setTargetItem(randomTarget);
    
    // Phát âm thanh và giọng nói hướng dẫn chuẩn xác
    const promptText = mode.id === 'math'
      ? `${randomTarget.speech} Bé tìm quả bóng mang số đáp án nhé!`
      : `Bé hãy tìm và làm nổ quả bóng: ${randomTarget.display}!`;
    speakVietnamese(promptText);
  };

  // Bắt đầu game
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    setBalloons([]);
    setPoppedIds(new Set());
    setSlowMoUntil(0);
    pickNewTarget(activeMode);
  };

  // Đếm ngược thời gian
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          playSound('badge');
          speakVietnamese(`Hết giờ rồi! ${playerName} đạt được ${score} điểm!`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, score, playerName]);

  // Luồng sinh bóng bay liên tục
  useEffect(() => {
    if (!isPlaying || !targetItem) return;

    const interval = setInterval(() => {
      setBalloons(prev => {
        // Giữ số lượng bóng vừa phải trên màn hình (tối đa 7 bóng để máy mượt)
        const activeBalloons = prev.filter(b => Date.now() - b.spawnTime < (b.duration * 1000));
        if (activeBalloons.length >= 7) return activeBalloons;

        // Cơ hội 40% sinh ra đúng bóng mục tiêu nếu trên màn hình chưa có
        const hasTargetAlready = activeBalloons.some(b => b.item.id === targetItem.id);
        const shouldSpawnTarget = !hasTargetAlready || Math.random() < 0.4;
        
        let chosenItem;
        if (shouldSpawnTarget) {
          chosenItem = targetItem;
        } else {
          const others = activeMode.items.filter(i => i.id !== targetItem.id);
          chosenItem = others[Math.floor(Math.random() * others.length)] || targetItem;
        }

        const isRainbow = Math.random() < 0.1; // 10% cơ hội bóng cầu vồng may mắn
        const isClock = !isRainbow && Math.random() < 0.08; // 8% cơ hội bóng đóng băng thời gian

        // Màu của quả bóng: Nếu là chế độ Màu Sắc, màu vỏ bóng PHẢI TRÙNG 100% với màu câu hỏi!
        const colorObj = currentModeId === 'colors'
          ? (BALLOON_COLORS.find(c => c.name === chosenItem.id) || BALLOON_COLORS[0])
          : BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];

        const leftPercent = Math.random() * 75 + 10; // 10% - 85% chiều ngang
        const isSlowed = Date.now() < slowMoUntil;
        const duration = isSlowed ? (Math.random() * 3 + 7) : (Math.random() * 2 + 5);

        const newBalloon = {
          id: nextBalloonId.current++,
          item: chosenItem,
          color: colorObj,
          left: leftPercent,
          duration,
          spawnTime: Date.now(),
          isRainbow,
          isClock
        };

        return [...activeBalloons, newBalloon];
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isPlaying, targetItem, activeMode, currentModeId, slowMoUntil]);

  // Xử lý khi bé bấm vào quả bóng
  const handleBalloonClick = (balloon) => {
    if (poppedIds.has(balloon.id)) return;

    // Tiếng nổ bong bóng siêu nảy
    playSound('pop');

    // Đánh dấu bóng đã nổ để chạy hiệu ứng biến mất
    setPoppedIds(prev => new Set(prev).add(balloon.id));

    // Trường hợp 1: Bóng Cầu Vồng (Rainbow)
    if (balloon.isRainbow) {
      playSound('magic');
      confetti({ particleCount: 50, spread: 60 });
      setScore(s => s + 20);
      speakVietnamese('Bóng Cầu Vồng siêu cấp! Cộng 20 điểm!');
      return;
    }

    // Trường hợp 2: Bóng Đồng Hồ (Làm chậm)
    if (balloon.isClock) {
      playSound('magic');
      setSlowMoUntil(Date.now() + 6000);
      speakVietnamese('Đóng băng thời gian! Bóng bay chậm lại!');
      return;
    }

    // Trường hợp 3: Kiểm tra đúng mục tiêu
    const isCorrect = balloon.item.id === targetItem.id;
    if (isCorrect) {
      playSound('correct');
      const newScore = score + 10;
      setScore(newScore);
      logAttempt(player, 'balloon_pop', true, 10);
      updatePlayerStats(player, 'balloon_pop', 10);

      // Lời khen
      if (currentModeId === 'math') {
        speakVietnamese(`Chính xác! ${targetItem.question} bằng ${targetItem.label}!`);
      } else {
        const praises = ['Giỏi quá!', 'Chính xác!', 'Bé thông minh lắm!', 'Tuyệt vời!'];
        const randomPraise = praises[Math.floor(Math.random() * praises.length)];
        speakVietnamese(`${randomPraise}! ${balloon.item.display}!`);
      }

      // Chuyển sang câu hỏi tiếp theo
      setTimeout(() => {
        pickNewTarget(activeMode);
      }, 700);
    } else {
      // Chạm nhầm bóng khác
      speakVietnamese(`Chưa đúng rồi! Bé tìm ${targetItem.display} nhé!`);
    }
  };

  const handleModeChange = (modeId) => {
    setCurrentModeId(modeId);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '15px', height: '92vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(105vh) scale(0.9); }
          50% { transform: translateY(50vh) scale(1.02) translateX(15px); }
          100% { transform: translateY(-20vh) scale(1) translateX(-15px); }
        }
        @keyframes popAnimation {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.8; filter: brightness(2); }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* THANH ĐIỀU HƯỚNG */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', zIndex: 50 }}>
        <button 
          onClick={onBack}
          className="glass-button"
          style={{ padding: '8px 18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ChevronLeft size={20} /> Trở về
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', padding: '6px 16px', borderRadius: '20px', color: '#ffcc00', fontWeight: 'bold', fontSize: '1.1rem' }}>
            ⭐ {score} điểm
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', padding: '6px 16px', borderRadius: '20px', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={18} /> {timeLeft}s
          </div>
        </div>
      </div>

      {/* CHỌN CHẾ ĐỘ CHƠI (Khi chưa bấm Bắt đầu) */}
      {!isPlaying && timeLeft === 60 && (
        <div className="glass-panel" style={{ margin: 'auto', padding: '30px', textAlign: 'center', maxWidth: '500px', width: '100%', zIndex: 60 }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '10px' }}>🎈</div>
          <h1 className="title-gradient" style={{ fontSize: '2.4rem', marginBottom: '10px' }}>
            Bong Bóng Học Tập
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '25px' }}>
            Nghe giọng loa đọc nhiệm vụ và chạm thật nhanh vào quả bóng đúng nhé!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '25px' }}>
            {GAME_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className="glass-button"
                style={{
                  padding: '12px 10px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  background: currentModeId === mode.id ? 'linear-gradient(135deg, #0ea5e9, #ec4899)' : 'rgba(255,255,255,0.06)',
                  borderColor: currentModeId === mode.id ? '#00d2ff' : 'rgba(255,255,255,0.15)',
                  transform: 'none'
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>{mode.icon}</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{mode.title}</span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{mode.desc}</span>
              </button>
            ))}
          </div>

          <button 
            className="glass-button btn-primary"
            onClick={startGame}
            style={{ width: '100%', fontSize: '1.4rem', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <Play size={24} /> Bắt Đầu Chơi Nào!
          </button>
        </div>
      )}

      {/* MÀN HÌNH TỔNG KẾT KHI HẾT GIỜ */}
      {!isPlaying && timeLeft === 0 && (
        <div className="glass-panel" style={{ margin: 'auto', padding: '35px', textAlign: 'center', maxWidth: '450px', width: '100%', zIndex: 60 }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '10px' }}>🏆</div>
          <h2 className="title-gradient" style={{ fontSize: '2.4rem', marginBottom: '10px' }}>
            HẾT GIỜ RỒI!
          </h2>
          <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>
            Bé {playerName} đã làm nổ thật nhiều bong bóng rực rỡ!
          </p>
          <div style={{ background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', padding: '15px', borderRadius: '20px', color: '#ffcc00', fontWeight: 'bold', fontSize: '1.8rem', marginBottom: '25px' }}>
            ⭐ {score} Điểm
          </div>

          <button 
            className="glass-button btn-primary"
            onClick={startGame}
            style={{ width: '100%', fontSize: '1.3rem', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <RefreshCw size={22} /> Chơi Lại Lần Nữa
          </button>
        </div>
      )}

      {/* KHU VỰC THỬ THÁCH MỤC TIÊU (HIỂN THỊ TRÊN CÙNG KHI ĐANG CHƠI) */}
      {isPlaying && targetItem && (
        <div 
          className="glass-panel"
          style={{
            padding: '12px 20px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '2px solid #00d2ff',
            boxShadow: '0 0 25px rgba(0, 210, 255, 0.3)',
            zIndex: 40
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {currentModeId === 'colors' && targetItem.colorHex ? (
              <div 
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  background: targetItem.colorHex,
                  border: '3px solid white',
                  boxShadow: `0 0 15px ${targetItem.colorHex}, inset 0 0 5px rgba(255,255,255,0.8)`
                }} 
              />
            ) : currentModeId === 'letters' || currentModeId === 'numbers' ? (
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0ea5e9, #9d4edd)',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: '900',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(0, 210, 255, 0.4)'
                }}
              >
                {targetItem.icon}
              </div>
            ) : (
              <div style={{ fontSize: '2.6rem' }}>{targetItem.icon}</div>
            )}
            <div>
              <div style={{ fontSize: '0.85rem', color: '#00d2ff', fontWeight: 'bold' }}>Nhiệm Vụ Của Bé:</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffcc00' }}>
                {currentModeId === 'math' ? `Tính: ${targetItem.display}` : `Tìm bóng: ${targetItem.display}`}
              </div>
            </div>
          </div>

          {/* Nút Loa Đọc Lại */}
          <button 
            onClick={() => {
              const promptText = currentModeId === 'math'
                ? `${targetItem.speech} Bé tìm quả bóng mang số đáp án nhé!`
                : `Bé hãy tìm và làm nổ quả bóng: ${targetItem.display}!`;
              speakVietnamese(promptText);
            }}
            className="glass-button"
            style={{ padding: '10px 16px', borderRadius: '50%', background: 'rgba(0, 210, 255, 0.25)', borderColor: '#00d2ff' }}
            title="Bấm để nghe lại"
          >
            <Volume2 size={24} color="#00d2ff" />
          </button>
        </div>
      )}

      {/* SÂN CHƠI BẦU TRỜI: CÁC QUẢ BÓNG BAY LÊN */}
      {isPlaying && (
        <div 
          ref={containerRef}
          style={{
            flexGrow: 1,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            background: 'linear-gradient(180deg, rgba(15, 12, 41, 0.4) 0%, rgba(20, 10, 45, 0.7) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {balloons.map((balloon) => {
            const isPopped = poppedIds.has(balloon.id);

            return (
              <div
                key={balloon.id}
                onPointerDown={() => handleBalloonClick(balloon)}
                style={{
                  position: 'absolute',
                  left: `${balloon.left}%`,
                  bottom: '-120px',
                  width: '95px',
                  height: '120px',
                  cursor: 'pointer',
                  zIndex: 20,
                  touchAction: 'none',
                  animation: isPopped ? 'popAnimation 0.3s forwards' : `floatUp ${balloon.duration}s linear forwards`,
                  willChange: 'transform, opacity'
                }}
              >
                {/* Thân Quả Bóng */}
                <div 
                  style={{
                    width: '95px',
                    height: '110px',
                    borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
                    background: balloon.isRainbow 
                      ? 'linear-gradient(135deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff)'
                      : balloon.isClock 
                      ? 'radial-gradient(circle at 35% 35%, #e0f2fe 0%, #0284c7 60%, #0369a1 100%)'
                      : balloon.color.gradient,
                    boxShadow: balloon.isRainbow 
                      ? '0 0 25px rgba(255, 255, 255, 0.8)' 
                      : `0 8px 25px ${balloon.color.hex}66`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '900',
                    position: 'relative',
                    userSelect: 'none'
                  }}
                >
                  {/* Điểm bóng sáng trên đầu quả bóng */}
                  <div style={{ position: 'absolute', top: '12px', left: '20px', width: '18px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', transform: 'rotate(-30deg)' }} />

                  {/* Nội dung bên trong quả bóng */}
                  {balloon.isRainbow ? (
                    <span style={{ fontSize: '2.4rem' }}>🌈</span>
                  ) : balloon.isClock ? (
                    <span style={{ fontSize: '2.4rem' }}>⏱️</span>
                  ) : (
                    <>
                      {currentModeId === 'colors' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 4px' }}>
                          <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>⭐</span>
                          <span style={{ fontSize: '1.05rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginTop: '2px', textAlign: 'center' }}>
                            {balloon.item.label}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '2.2rem', fontWeight: '900', textShadow: '0 2px 5px rgba(0,0,0,0.6)' }}>
                          {balloon.item.label}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Nút thắt & Sợi dây bóng */}
                <div style={{ width: '10px', height: '6px', background: balloon.color.hex, margin: '-2px auto 0', borderRadius: '2px' }} />
                <div style={{ width: '2px', height: '35px', background: 'rgba(255, 255, 255, 0.4)', margin: '0 auto' }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BalloonPopGame;
