import React, { useState, useEffect } from 'react';
import { ChevronLeft, Compass, Globe, Award, Trophy, Volume2, RefreshCw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound, speakVietnamese } from '../utils/audio';
import { logAttempt, updatePlayerStats } from '../utils/jsonStorage';

// Dữ liệu 16 Quốc kỳ & Kỳ quan thế giới với mã cờ chuẩn
const FLAGS_DATA = [
  { code: 'vn', country: 'Việt Nam', capital: 'Hà Nội', landmark: 'Vịnh Hạ Long' },
  { code: 'jp', country: 'Nhật Bản', capital: 'Tokyo', landmark: 'Núi Phú Sĩ' },
  { code: 'kr', country: 'Hàn Quốc', capital: 'Seoul', landmark: 'Đảo Jeju' },
  { code: 'us', country: 'Hoa Kỳ (Mỹ)', capital: 'Washington D.C', landmark: 'Tượng Nữ Thần Tự Do' },
  { code: 'fr', country: 'Pháp', capital: 'Paris', landmark: 'Tháp Eiffel' },
  { code: 'gb', country: 'Vương Quốc Anh', capital: 'London', landmark: 'Tháp Đồng Hồ Big Ben' },
  { code: 'it', country: 'Ý (Italia)', capital: 'Roma', landmark: 'Đấu Trường La Mã' },
  { code: 'eg', country: 'Ai Cập', capital: 'Cairo', landmark: 'Kim Tự Tháp Giza' },
  { code: 'au', country: 'Úc (Australia)', capital: 'Canberra', landmark: 'Nhà Hát Con Sò Sydney' },
  { code: 'cn', country: 'Trung Quốc', capital: 'Bắc Kinh', landmark: 'Vạn Lý Trường Thành' },
  { code: 'br', country: 'Brazil', capital: 'Brasília', landmark: 'Tượng Chúa Cứu Thế' },
  { code: 'ca', country: 'Canada', capital: 'Ottawa', landmark: 'Thác Nước Niagara' },
  { code: 'de', country: 'Đức', capital: 'Berlin', landmark: 'Cổng Thành Brandenburg' },
  { code: 'es', country: 'Tây Ban Nha', capital: 'Madrid', landmark: 'Nhà Thờ Sagrada Família' },
  { code: 'ru', country: 'Nga', capital: 'Moskva', landmark: 'Quảng Trường Đỏ' },
  { code: 'th', country: 'Thái Lan', capital: 'Bangkok', landmark: 'Cung Điện Hoàng Gia' }
];

const WorldExplorerGame = ({ onBack, player = 'nhi', playerName = 'Bảo Nhi' }) => {
  const [mode, setMode] = useState('flags'); // 'flags' hoặc 'landmarks'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [stamps, setStamps] = useState([]);
  const [score, setScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [wrongTarget, setWrongTarget] = useState(null);

  // Sinh câu hỏi đố vui
  const generateQuestion = (currentMode = mode) => {
    setWrongTarget(null);
    const target = FLAGS_DATA[Math.floor(Math.random() * FLAGS_DATA.length)];

    // 3 đáp án nhiễu
    const wrongOptions = FLAGS_DATA
      .filter(item => item.country !== target.country)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(item => item.country);

    const allOptions = [target.country, ...wrongOptions].sort(() => Math.random() - 0.5);

    const q = { target, options: allOptions, mode: currentMode };
    setCurrentQuestion(q);

    if (currentMode === 'flags') {
      speakVietnamese(`Lá cờ này là của đất nước nào?`);
    } else {
      speakVietnamese(`${target.landmark} thuộc quốc gia nào bé ơi?`);
    }
  };

  useEffect(() => {
    generateQuestion('flags');
  }, []);

  const handleSelectAnswer = (chosenCountry) => {
    if (!currentQuestion) return;

    if (chosenCountry === currentQuestion.target.country) {
      // Đúng!
      playSound('magic');
      const points = 15;
      setScore(s => s + points);
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);

      logAttempt(player, 'world_explorer', true, points);
      updatePlayerStats(player, 'world_explorer', points);

      // Thưởng tem Visa hộ chiếu sau mỗi 3 câu đúng
      if (newStreak % 3 === 0) {
        playSound('badge');
        confetti({ particleCount: 80, spread: 70 });
        if (!stamps.some(s => s.code === currentQuestion.target.code)) {
          setStamps(prev => [...prev, currentQuestion.target]);
        }
        speakVietnamese(`Tuyệt vời! ${playerName} được đóng dấu tem Visa của ${chosenCountry}!`);
      } else {
        speakVietnamese(`Chính xác! ${chosenCountry}, thủ đô là ${currentQuestion.target.capital}!`);
      }

      setTimeout(() => {
        generateQuestion();
      }, 1500);
    } else {
      playSound('wrong');
      setWrongTarget(chosenCountry);
      setCorrectStreak(0);
      speakVietnamese(`Chưa đúng rồi! Đây là đất nước ${currentQuestion.target.country} cơ!`);
    }
  };

  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    generateQuestion(newMode);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '15px', minHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
      {/* THANH ĐIỀU HƯỚNG */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button 
          onClick={onBack}
          className="glass-button"
          style={{ padding: '8px 18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ChevronLeft size={20} /> Trở về
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', padding: '6px 16px', borderRadius: '20px', color: '#ffcc00', fontWeight: 'bold' }}>
            ⭐ {score} điểm
          </div>
          <div style={{ background: 'rgba(14, 165, 233, 0.2)', border: '1px solid #0ea5e9', padding: '6px 16px', borderRadius: '20px', color: '#0ea5e9', fontWeight: 'bold' }}>
            🛂 {stamps.length} Con Dấu Visa
          </div>
        </div>
      </div>

      {/* CHUYỂN ĐỔI CHẾ ĐỘ */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 className="title-gradient" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', marginBottom: '10px' }}>
          🌍 Nhà Thám Hiểm Thế Giới
        </h1>

        <div style={{ display: 'inline-flex', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '20px' }}>
          <button
            onClick={() => handleSwitchMode('flags')}
            className="glass-button"
            style={{
              padding: '8px 20px',
              fontSize: '1rem',
              borderRadius: '16px',
              background: mode === 'flags' ? 'linear-gradient(135deg, #0ea5e9, #9d4edd)' : 'transparent',
              borderColor: mode === 'flags' ? '#00d2ff' : 'transparent',
              transform: 'none'
            }}
          >
            🚩 Đố Cờ Quốc Gia
          </button>
          <button
            onClick={() => handleSwitchMode('landmarks')}
            className="glass-button"
            style={{
              padding: '8px 20px',
              fontSize: '1rem',
              borderRadius: '16px',
              background: mode === 'landmarks' ? 'linear-gradient(135deg, #0ea5e9, #9d4edd)' : 'transparent',
              borderColor: mode === 'landmarks' ? '#00d2ff' : 'transparent',
              transform: 'none'
            }}
          >
            🏛️ Kỳ Quan Thế Giới
          </button>
        </div>
      </div>

      {/* KHUNG CÂU HỎI THÁM HIỂM */}
      {currentQuestion && (
        <div className="glass-panel" style={{ padding: '25px', textAlign: 'center', marginBottom: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {mode === 'flags' ? (
            <div>
              {/* HÌNH ẢNH LÁ CỜ ĐÍCH THỰC (ĐỘ PHÂN GIẢI CAO, CHUẨN XÁC) */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <div 
                  style={{
                    width: 'clamp(200px, 45vw, 290px)',
                    aspectRatio: '3/2',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '4px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 210, 255, 0.3)',
                    background: '#1a162b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img 
                    src={`/flags/${currentQuestion.target.code}.png`} 
                    alt={`Quốc kỳ ${currentQuestion.target.country}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.src = `https://flagcdn.com/w320/${currentQuestion.target.code}.png`;
                    }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '1.25rem', color: '#ffcc00', fontWeight: 'bold', marginBottom: '20px' }}>
                Đây là quốc kỳ chính xác của đất nước nào?
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>🏛️</div>
              <div style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '900', color: '#00d2ff', marginBottom: '10px' }}>
                {currentQuestion.target.landmark}
              </div>
              <div style={{ fontSize: '1.2rem', color: '#ffcc00', fontWeight: 'bold', marginBottom: '20px' }}>
                Kỳ quan nổi tiếng này nằm ở quốc gia nào?
              </div>
            </div>
          )}

          {/* 4 ĐÁP ÁN LỰA CHỌN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            {currentQuestion.options.map((option, idx) => {
              const isWrong = wrongTarget === option;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(option)}
                  className="glass-button"
                  style={{
                    padding: '18px 10px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    borderRadius: '18px',
                    background: isWrong ? 'rgba(239, 68, 68, 0.4)' : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                    border: isWrong ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer'
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SỔ THU THẬP TEM VISA HỘ CHIẾU PHI HÀNH GIA */}
      <div className="glass-panel" style={{ padding: '15px' }}>
        <div style={{ fontSize: '0.95rem', color: '#00d2ff', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={18} /> Sổ Hộ Chiếu Du Lịch Của {playerName} ({stamps.length} tem Visa):
        </div>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
          {stamps.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', padding: '10px 0' }}>
              Trả lời đúng liên tiếp 3 câu để thu thập tem Visa của các quốc gia nhé!
            </div>
          )}
          {stamps.map((item, idx) => (
            <div
              key={idx}
              style={{
                flexShrink: 0,
                background: 'rgba(255, 0, 128, 0.15)',
                border: '1.5px dashed #ff0080',
                padding: '6px 12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
              }}
            >
              <img 
                src={`/flags/${item.code}.png`} 
                alt={item.country} 
                style={{ width: '28px', height: '18px', borderRadius: '3px', objectFit: 'cover' }}
                onError={(e) => { e.target.src = `https://flagcdn.com/w80/${item.code}.png`; }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{item.country}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{item.capital}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorldExplorerGame;
