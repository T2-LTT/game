import React, { useState, useEffect } from 'react';
import { ChevronLeft, Volume2, Sparkles, Trophy, RefreshCw, Flame, Award, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound, speakVietnamese } from '../utils/audio';
import { logAttempt, updatePlayerStats } from '../utils/jsonStorage';
import wordsData from '../../data/vietnamese_words.json';

// Thuật toán DFS tìm chuỗi nối từ hợp lệ 100% độ dài targetLength
const findValidChain = (words, targetLength = 7) => {
  const adj = new Map();
  for (const w of words) {
    const key = w.first.toLowerCase();
    if (!adj.has(key)) adj.set(key, []);
    adj.get(key).push(w);
  }

  const shuffled = [...words].sort(() => Math.random() - 0.5);

  for (const start of shuffled) {
    const path = [start];
    const visited = new Set([`${start.first} ${start.second}`.toLowerCase()]);

    const dfs = (cur) => {
      if (path.length === targetLength) return true;
      const candidates = (adj.get(cur.second.toLowerCase()) || [])
        .filter(next => !visited.has(`${next.first} ${next.second}`.toLowerCase()))
        .sort(() => Math.random() - 0.5);

      for (const next of candidates) {
        path.push(next);
        const key = `${next.first} ${next.second}`.toLowerCase();
        visited.add(key);

        if (dfs(next)) return true;

        visited.delete(key);
        path.pop();
      }
      return false;
    };

    if (dfs(start)) {
      return path;
    }
  }

  return words.slice(0, targetLength);
};

const WordChainGame = ({ onBack, player = 'nhi', playerName = 'Bảo Nhi' }) => {
  const [targetChain, setTargetChain] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const targetChainLength = 7;

  // Bắt đầu một ván chơi với chuỗi từ nối tiếp bảo đảm khớp 100%
  const startNewGame = () => {
    const chain = findValidChain(wordsData, targetChainLength);
    setTargetChain(chain);
    setStepIndex(0);
    setCombo(0);
    setScore(0);
    setIsVictory(false);
    setShowHint(false);

    prepareOptionsForStep(chain, 0);

    const starterWord = `${chain[0].first} ${chain[0].second}`;
    speakVietnamese(`Bắt đầu với từ: ${starterWord}! Bé tìm từ bắt đầu bằng chữ ${chain[0].second} nhé!`);
  };

  // Chuẩn bị 3 đáp án cho bước hiện tại
  const prepareOptionsForStep = (chain, currentStep) => {
    if (currentStep >= chain.length - 1) return;

    const currentWordObj = chain[currentStep];
    const nextCorrectObj = chain[currentStep + 1];
    const requiredFirst = currentWordObj.second.toLowerCase();

    const correctText = `${nextCorrectObj.first} ${nextCorrectObj.second}`;

    // Tìm 2 đáp án nhiễu không bắt đầu bằng chữ requiredFirst
    const wrongCandidates = wordsData.filter(
      w => w.first.toLowerCase() !== requiredFirst && `${w.first} ${w.second}` !== correctText
    );
    const shuffledWrong = [...wrongCandidates].sort(() => Math.random() - 0.5).slice(0, 2);

    const fullOptions = [
      { text: correctText, obj: nextCorrectObj, isCorrect: true },
      ...shuffledWrong.map(w => ({ text: `${w.first} ${w.second}`, obj: w, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    setOptions(fullOptions);
    setShowHint(false);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const currentWord = targetChain[stepIndex];
  const displayedChain = targetChain.slice(0, stepIndex + 1).map(w => `${w.first} ${w.second}`);

  const handleSelectOption = (option) => {
    if (!currentWord) return;

    if (option.isCorrect) {
      playSound('magic');
      const nextStep = stepIndex + 1;
      setStepIndex(nextStep);

      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = 10 + newCombo * 5;
      const newScore = score + points;
      setScore(newScore);

      logAttempt(player, 'word_chain', true, points);
      updatePlayerStats(player, 'word_chain', points);

      speakVietnamese(`Nối đúng rồi! ${option.text}!`);

      if (nextStep >= targetChainLength - 1) {
        setIsVictory(true);
        setTimeout(() => {
          playSound('badge');
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
          speakVietnamese(`Xuất sắc! ${playerName} đã hoàn thành chuỗi ${targetChainLength} từ ghép hoàn hảo!`);
        }, 600);
      } else {
        setTimeout(() => {
          prepareOptionsForStep(targetChain, nextStep);
          const nextTarget = targetChain[nextStep];
          speakVietnamese(`Bé tìm tiếp từ bắt đầu bằng chữ ${nextTarget.second} nào!`);
        }, 800);
      }
    } else {
      playSound('wrong');
      setCombo(0);
      speakVietnamese(`Chưa đúng rồi! Từ này không bắt đầu bằng chữ ${currentWord.second}! Bé thử lại nhé!`);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '15px', minHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
      {/* THANH ĐIỀU HƯỚNG */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
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
          {combo > 1 && (
            <div style={{ background: 'rgba(255, 0, 128, 0.2)', border: '1px solid #ff0080', padding: '6px 16px', borderRadius: '20px', color: '#ff0080', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Flame size={18} /> Combo x{combo}
            </div>
          )}
        </div>
      </div>

      {/* TIÊU ĐỀ & TIẾN TRÌNH */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className="title-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 2.7rem)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span>👑</span> Vua Nối Từ Tiếng Việt
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Tìm từ ghép bắt đầu bằng chữ cuối cùng để nối dài chuỗi từ vựng!
        </p>
      </div>

      {/* CHUỖI XÍCH TỪ HIỆN TẠI (WORD CHAIN DISPLAY) */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '0.95rem', color: '#00d2ff', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} /> Chuỗi từ của bạn ({displayedChain.length}/{targetChainLength} từ):
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {displayedChain.map((word, idx) => (
            <React.Fragment key={idx}>
              <div 
                style={{ 
                  background: idx === displayedChain.length - 1 ? 'linear-gradient(135deg, #0ea5e9, #9d4edd)' : 'rgba(255, 255, 255, 0.08)',
                  border: idx === displayedChain.length - 1 ? '2px solid #00d2ff' : '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '8px 16px',
                  borderRadius: '16px',
                  fontWeight: 'bold',
                  fontSize: '1.15rem',
                  color: 'white',
                  boxShadow: idx === displayedChain.length - 1 ? '0 0 20px rgba(0, 210, 255, 0.5)' : 'none'
                }}
              >
                {word}
              </div>
              {idx < displayedChain.length - 1 && (
                <span style={{ color: '#ffcc00', fontWeight: 'bold', fontSize: '1.2rem' }}>➔</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* KHU VỰC THỬ THÁCH NỐI TIẾP */}
      {currentWord && !isVictory && (
        <div className="glass-panel" style={{ padding: '25px', textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Nối tiếp từ chữ:
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '25px' }}>
            <span style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '900', color: '#ffcc00', background: 'rgba(255, 204, 0, 0.1)', padding: '8px 24px', borderRadius: '20px', border: '2px solid #ffcc00' }}>
              {currentWord.second} ... ?
            </span>
            <button 
              onClick={() => speakVietnamese(`Bé tìm từ ghép bắt đầu bằng chữ ${currentWord.second} nhé!`)}
              className="glass-button"
              style={{ padding: '10px 14px', borderRadius: '50%' }}
              title="Nghe lại"
            >
              <Volume2 size={24} color="#00d2ff" />
            </button>
          </div>

          {/* CÁC THẺ BÀI LỰA CHỌN */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                className="glass-button"
                style={{
                  padding: '20px',
                  borderRadius: '20px',
                  fontSize: '1.4rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                  border: showHint && option.isCorrect ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.2)',
                  boxShadow: showHint && option.isCorrect ? '0 0 25px rgba(16, 185, 129, 0.5)' : 'none',
                  cursor: 'pointer'
                }}
              >
                {option.text}
              </button>
            ))}
          </div>

          {/* NÚT GỢI Ý */}
          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => setShowHint(true)}
              className="glass-button"
              style={{ padding: '8px 18px', fontSize: '0.9rem', color: '#ffcc00', borderColor: '#ffcc00' }}
            >
              <HelpCircle size={18} /> Gợi ý đáp án
            </button>
          </div>
        </div>
      )}

      {/* POPUP CHIẾN THẮNG: VUA NỐI TỪ NHÍ */}
      {isVictory && (
        <div className="glass-panel" style={{ margin: 'auto', padding: '35px', textAlign: 'center', maxWidth: '480px', width: '100%' }}>
          <div style={{ fontSize: '5rem', marginBottom: '10px' }}>👑</div>
          <h2 className="title-gradient" style={{ fontSize: '2.4rem', marginBottom: '10px' }}>
            VUA NỐI TỪ TIẾNG VIỆT!
          </h2>
          <p style={{ color: 'white', fontSize: '1.25rem', marginBottom: '15px' }}>
            Hoan hô <strong>{playerName}</strong> đã hoàn thành chuỗi {targetChainLength} từ ghép xuất sắc!
          </p>
          <div style={{ background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', padding: '15px', borderRadius: '20px', color: '#ffcc00', fontWeight: 'bold', fontSize: '1.8rem', marginBottom: '25px' }}>
            ⭐ {score} Điểm Thưởng
          </div>

          <button 
            className="glass-button btn-primary"
            onClick={startNewGame}
            style={{ width: '100%', fontSize: '1.3rem', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <RefreshCw size={22} /> Chơi Trận Nối Từ Mới
          </button>
        </div>
      )}
    </div>
  );
};

export default WordChainGame;
