import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, Volume2, RefreshCw, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound, speakVietnamese, speakEnglish } from '../utils/audio';
import { logAttempt, updatePlayerStats } from '../utils/jsonStorage';

// Dữ liệu các chủ đề phong phú
const THEMES = [
  {
    id: 'animals',
    name: 'Động Vật',
    icon: '🦁',
    items: [
      { id: 'dog', emoji: '🐶', nameVi: 'Chú Chó', nameEn: 'Dog', sound: 'Gâu gâu!' },
      { id: 'cat', emoji: '🐱', nameVi: 'Mèo Con', nameEn: 'Cat', sound: 'Meo meo!' },
      { id: 'elephant', emoji: '🐘', nameVi: 'Chú Voi', nameEn: 'Elephant', sound: 'Ụ ẹ!' },
      { id: 'lion', emoji: '🦁', nameVi: 'Sư Tử', nameEn: 'Lion', sound: 'Gầm gừ!' },
      { id: 'monkey', emoji: '🐒', nameVi: 'Chú Khỉ', nameEn: 'Monkey', sound: 'Khẹc khẹc!' },
      { id: 'dolphin', emoji: '🐬', nameVi: 'Cá Heo', nameEn: 'Dolphin', sound: 'Tung tăng!' },
      { id: 'rabbit', emoji: '🐰', nameVi: 'Thỏ Trắng', nameEn: 'Rabbit', sound: 'Nhảy nhót!' },
      { id: 'panda', emoji: '🐼', nameVi: 'Gấu Trúc', nameEn: 'Panda', sound: 'Măm măm!' },
      { id: 'cow', emoji: '🐮', nameVi: 'Bò Sữa', nameEn: 'Cow', sound: 'Ùm bò!' },
      { id: 'duck', emoji: '🦆', nameVi: 'Vịt Con', nameEn: 'Duck', sound: 'Cạp cạp!' },
      { id: 'frog', emoji: '🐸', nameVi: 'Chú Ếch', nameEn: 'Frog', sound: 'Ộp ộp!' }
    ]
  },
  {
    id: 'vehicles',
    name: 'Xe Cộ',
    icon: '🚀',
    items: [
      { id: 'car', emoji: '🚗', nameVi: 'Ô Tô', nameEn: 'Car', sound: 'Bíp bíp!' },
      { id: 'plane', emoji: '✈️', nameVi: 'Máy Bay', nameEn: 'Airplane', sound: 'Vù vù!' },
      { id: 'train', emoji: '🚂', nameVi: 'Tàu Hỏa', nameEn: 'Train', sound: 'Tu tu xình xịch!' },
      { id: 'boat', emoji: '⛵', nameVi: 'Thuyền Buồm', nameEn: 'Sailboat', sound: 'Lướt sóng!' },
      { id: 'bike', emoji: '🚲', nameVi: 'Xe Đạp', nameEn: 'Bicycle', sound: 'Kính coong!' },
      { id: 'rocket', emoji: '🚀', nameVi: 'Tên Lửa', nameEn: 'Rocket', sound: 'Bay lên vũ trụ!' },
      { id: 'heli', emoji: '🚁', nameVi: 'Trực Thăng', nameEn: 'Helicopter', sound: 'Phành phạch!' },
      { id: 'tractor', emoji: '🚜', nameVi: 'Máy Cày', nameEn: 'Tractor', sound: 'Xình xịch!' }
    ]
  },
  {
    id: 'fruits',
    name: 'Hoa Quả',
    icon: '🍎',
    items: [
      { id: 'apple', emoji: '🍎', nameVi: 'Quả Táo', nameEn: 'Apple', sound: 'Giòn ngọt!' },
      { id: 'banana', emoji: '🍌', nameVi: 'Quả Chuối', nameEn: 'Banana', sound: 'Thơm ngon!' },
      { id: 'watermelon', emoji: '🍉', nameVi: 'Dưa Hấu', nameEn: 'Watermelon', sound: 'Mát lành!' },
      { id: 'strawberry', emoji: '🍓', nameVi: 'Quả Dâu', nameEn: 'Strawberry', sound: 'Chua ngọt!' },
      { id: 'orange', emoji: '🍊', nameVi: 'Trái Cam', nameEn: 'Orange', sound: 'Mọng nước!' },
      { id: 'grapes', emoji: '🍇', nameVi: 'Chùm Nho', nameEn: 'Grapes', sound: 'Ngọt lịm!' },
      { id: 'pineapple', emoji: '🍍', nameVi: 'Quả Dứa', nameEn: 'Pineapple', sound: 'Thơm phức!' },
      { id: 'avocado', emoji: '🥑', nameVi: 'Quả Bơ', nameEn: 'Avocado', sound: 'Béo ngậy!' }
    ]
  }
];

const ShadowMatchingGame = ({ onBack, player = 'kiet', playerName = 'Bé' }) => {
  const [currentThemeId, setCurrentThemeId] = useState('animals');
  const [roundItems, setRoundItems] = useState([]);
  const [shuffledShadows, setShuffledShadows] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [selectedColorItem, setSelectedColorItem] = useState(null);
  const [wrongTargetId, setWrongTargetId] = useState(null);
  const [score, setScore] = useState(0);
  const [roundCount, setRoundCount] = useState(1);
  const [isRoundCompleted, setIsRoundCompleted] = useState(false);

  const activeTheme = useMemo(() => {
    return THEMES.find(t => t.id === currentThemeId) || THEMES[0];
  }, [currentThemeId]);

  // Khởi tạo một vòng chơi mới
  const startNewRound = (themeId = currentThemeId) => {
    const theme = THEMES.find(t => t.id === themeId) || activeTheme;
    const pool = [...theme.items].sort(() => Math.random() - 0.5);
    const selected = pool.slice(0, 3); // 3 cặp cho mỗi round (rất vừa sức cho trẻ 2-4 tuổi)
    
    setRoundItems(selected);
    // Xáo trộn bóng ở hàng trên
    setShuffledShadows([...selected].sort(() => Math.random() - 0.5));
    setMatchedIds(new Set());
    setSelectedColorItem(null);
    setWrongTargetId(null);
    setIsRoundCompleted(false);
  };

  useEffect(() => {
    startNewRound(currentThemeId);
  }, [currentThemeId]);

  // Xử lý khi ghép một item vào một slot bóng
  const handleMatchAttempt = (sourceItem, targetItem) => {
    if (!sourceItem || !targetItem) return;

    if (sourceItem.id === targetItem.id) {
      // Đúng bóng!
      playSound('magic');
      const newMatched = new Set(matchedIds);
      newMatched.add(sourceItem.id);
      setMatchedIds(newMatched);
      setSelectedColorItem(null);

      // Đọc tên tiếng Việt
      speakVietnamese(`Đúng rồi! Đây là ${sourceItem.nameVi}!`);

      // Cộng điểm
      const newScore = score + 10;
      setScore(newScore);
      logAttempt(player, 'shadow_matching', true, 10);
      updatePlayerStats(player, 'shadow_matching', 10);

      // Kiểm tra hoàn thành vòng chơi
      if (newMatched.size === roundItems.length) {
        setIsRoundCompleted(true);
        setTimeout(() => {
          playSound('badge');
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
          speakVietnamese(`Hoan hô ${playerName}! Bé đã ghép đúng hết rồi!`);
        }, 600);
      }
    } else {
      // Ghép sai bóng
      playSound('wrong');
      setWrongTargetId(targetItem.id);
      setTimeout(() => setWrongTargetId(null), 800);
      speakVietnamese(`Chưa đúng rồi, bé thử cái bóng khác nhé!`);
    }
  };

  // Xử lý chọn hình màu (Cho chế độ Chạm-Chạm cực nhạy cho bé 2 tuổi)
  const handleSelectColorCard = (item) => {
    if (matchedIds.has(item.id)) return;
    playSound('correct');
    setSelectedColorItem(item);
    speakVietnamese(item.nameVi);
  };

  // Xử lý chạm vào ô bóng
  const handleShadowClick = (targetItem) => {
    if (matchedIds.has(targetItem.id)) {
      // Nếu đã ghép rồi thì phát âm lại tên
      speakVietnamese(targetItem.nameVi);
      return;
    }
    if (selectedColorItem) {
      handleMatchAttempt(selectedColorItem, targetItem);
    } else {
      speakVietnamese('Bé hãy chọn một hình màu ở dưới trước nhé!');
    }
  };

  // Hỗ trợ Drag & Drop trên máy tính
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item.id);
    setSelectedColorItem(item);
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    const sourceItem = roundItems.find(i => i.id === sourceId);
    if (sourceItem) {
      handleMatchAttempt(sourceItem, targetItem);
    }
  };

  const handleNextRound = () => {
    setRoundCount(prev => prev + 1);
    startNewRound();
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '15px', minHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
      {/* Thanh Điều Hướng */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <button 
          onClick={onBack}
          className="glass-button"
          style={{ padding: '8px 18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ChevronLeft size={20} /> Trở về
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', padding: '6px 16px', borderRadius: '20px', color: '#ffcc00', fontWeight: 'bold', fontSize: '1.1rem' }}>
            ⭐ {score} điểm
          </div>
          <div style={{ background: 'rgba(0, 210, 255, 0.15)', border: '1px solid #00d2ff', padding: '6px 16px', borderRadius: '20px', color: '#00d2ff', fontWeight: 'bold' }}>
            Màn {roundCount}
          </div>
        </div>
      </div>

      {/* Tiêu đề & Chọn Chủ Đề */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className="title-gradient" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span>👥</span> Ghép Bóng Tìm Hình
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '12px' }}>
          Chạm hình màu bên dưới rồi chạm vào đúng cái bóng đen nhé!
        </p>

        {/* Nút Đổi Chủ Đề */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setCurrentThemeId(t.id)}
              className="glass-button"
              style={{
                padding: '6px 16px',
                fontSize: '0.95rem',
                borderRadius: '20px',
                background: currentThemeId === t.id ? 'linear-gradient(45deg, #0ea5e9, #9d4edd)' : 'rgba(255,255,255,0.06)',
                borderColor: currentThemeId === t.id ? '#00d2ff' : 'rgba(255,255,255,0.15)',
                transform: 'none'
              }}
            >
              <span style={{ marginRight: '6px' }}>{t.icon}</span> {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* KHU VỰC CHÍNH: HÀNG BÓNG ĐEN (TARGET SLOTS) */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '25px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: '1rem', color: '#00d2ff', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} /> Chiếc bóng bí ẩn của ai đây?
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          {shuffledShadows.map((item) => {
            const isMatched = matchedIds.has(item.id);
            const isWrong = wrongTargetId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleShadowClick(item)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, item)}
                style={{
                  height: '170px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '24px',
                  background: isMatched 
                    ? 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(20, 10, 45, 0.6) 80%)'
                    : isWrong
                    ? 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(20, 10, 45, 0.6) 80%)'
                    : 'rgba(0, 0, 0, 0.35)',
                  border: isMatched 
                    ? '3px solid #10b981' 
                    : isWrong 
                    ? '3px dashed #ef4444' 
                    : '2px dashed rgba(255, 255, 255, 0.25)',
                  cursor: isMatched ? 'default' : 'pointer',
                  position: 'relative',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: isMatched ? 'scale(1.02)' : isWrong ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: isMatched ? '0 0 25px rgba(16, 185, 129, 0.4)' : 'none'
                }}
              >
                {/* Hình bóng đen (hoặc hiển thị màu sắc nếu đã giải đúng) */}
                <div 
                  style={{
                    fontSize: 'clamp(4rem, 9vw, 5.5rem)',
                    filter: isMatched ? 'none' : 'brightness(0) opacity(0.85)',
                    transition: 'filter 0.5s ease, transform 0.5s ease',
                    transform: isMatched ? 'scale(1.1) rotate(0deg)' : 'scale(1)',
                    userSelect: 'none'
                  }}
                >
                  {item.emoji}
                </div>

                {/* Nhãn Tên khi đã giải đúng */}
                {isMatched && (
                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      <CheckCircle2 size={16} /> {item.nameVi}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {item.nameEn}
                    </div>
                  </div>
                )}

                {/* Dấu hỏi khi chưa giải */}
                {!isMatched && (
                  <span style={{ position: 'absolute', bottom: '10px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>
                    ❓ Ai đây ta?
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* KHU VỰC THẺ MÀU (SOURCE ITEMS) */}
      <div className="glass-panel" style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: '1rem', color: '#ffcc00', fontWeight: 'bold', marginBottom: '12px' }}>
          👇 Chọn một hình màu xinh xắn:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          {roundItems.map((item) => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selectedColorItem?.id === item.id;

            return (
              <div
                key={item.id}
                draggable={!isMatched}
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => handleSelectColorCard(item)}
                style={{
                  height: '150px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '24px',
                  background: isMatched
                    ? 'rgba(255, 255, 255, 0.03)'
                    : isSelected
                    ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(157, 78, 221, 0.4))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                  border: isSelected 
                    ? '3px solid #00d2ff' 
                    : isMatched 
                    ? '1px dashed rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(255, 255, 255, 0.18)',
                  cursor: isMatched ? 'default' : 'pointer',
                  opacity: isMatched ? 0.35 : 1,
                  transform: isSelected ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  boxShadow: isSelected ? '0 10px 30px rgba(0, 210, 255, 0.4)' : '0 4px 15px rgba(0,0,0,0.3)',
                  touchAction: 'manipulation'
                }}
              >
                <div style={{ fontSize: 'clamp(3.8rem, 8vw, 4.8rem)', userSelect: 'none' }}>
                  {item.emoji}
                </div>
                <div style={{ marginTop: '6px', fontWeight: 'bold', fontSize: '1rem', color: isSelected ? '#00d2ff' : 'white' }}>
                  {item.nameVi}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP THÀNH CÔNG VÒNG CHƠI */}
      {isRoundCompleted && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(5, 2, 18, 0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', padding: '30px', textAlign: 'center', animation: 'float 4s ease-in-out infinite' }}>
            <div style={{ fontSize: '4.5rem', marginBottom: '10px' }}>🎉</div>
            <h2 className="title-gradient" style={{ fontSize: '2.2rem', marginBottom: '10px' }}>
              BÉ XUẤT SẮC QUÁ!
            </h2>
            <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '20px' }}>
              {playerName} đã tìm đúng tất cả chiếc bóng của các bạn nhỏ!
            </p>
            <div style={{ background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', padding: '10px', borderRadius: '15px', color: '#ffcc00', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '25px' }}>
              +30 Điểm Thưởng ⭐
            </div>

            <button 
              className="glass-button btn-primary"
              onClick={handleNextRound}
              style={{ width: '100%', fontSize: '1.3rem', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Màn Tiếp Theo <ArrowRight size={22} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShadowMatchingGame;
