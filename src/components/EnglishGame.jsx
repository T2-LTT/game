import React, { useState, useEffect } from 'react';
import { ChevronLeft, Volume2, Sparkles, Award, RotateCcw, Check, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound, speakEnglish } from '../utils/audio';
import { addBadge } from '../utils/badges';
import { logAttempt, updatePlayerStats } from '../utils/jsonStorage';
import vocabData from '../../data/english_vocab.json';

const VOCAB_LIST = vocabData.words;

const EnglishGame = ({ onBack, player = 'nhi', playerName = 'Bảo Nhi', playerAvatar = '/image/baonhi.JPG' }) => {
  const [gameMode, setGameMode] = useState('quiz'); // 'quiz' or 'spell'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizOptions, setQuizOptions] = useState([]);
  const [wrongShake, setWrongShake] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // For Spelling mode
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);

  const currentVocab = VOCAB_LIST[currentIndex];

  const initQuizRound = (index) => {
    setIsSuccess(false);
    setSelectedLetters([]);
    const current = VOCAB_LIST[index];
    speakEnglish(current.word);

    // Prepare Quiz Options
    const otherWords = VOCAB_LIST.filter(v => v.word !== current.word);
    const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3);
    const allOpts = [current, ...shuffledOthers].sort(() => 0.5 - Math.random());
    setQuizOptions(allOpts);

    // Prepare Spelling Scrambled Letters
    const letters = current.word.split('').map((char, id) => ({ char, id }));
    const scrambled = [...letters].sort(() => 0.5 - Math.random());
    setScrambledLetters(scrambled);
  };

  useEffect(() => {
    initQuizRound(currentIndex);
  }, [currentIndex, gameMode]);

  const handleSpeech = () => {
    speakEnglish(currentVocab.word);
  };

  const handleNextWord = () => {
    const nextIdx = (currentIndex + 1) % VOCAB_LIST.length;
    setCurrentIndex(nextIdx);
  };

  // Multiple Choice Handler
  const handleSelectQuizOption = (opt) => {
    if (isSuccess) return;
    const isCorrect = (opt.word === currentVocab.word);

    logAttempt(
      player, 
      'Mật Mã Tiếng Anh (Chọn từ)', 
      `Từ "${currentVocab.mean}" trong tiếng Anh là gì?`, 
      isCorrect, 
      opt.word, 
      currentVocab.word
    );

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      playSound('wrong');
      setWrongShake(opt.word);
      setTimeout(() => setWrongShake(null), 500);
    }
  };

  // Spelling Letter Click
  const handleTapScrambledLetter = (letterItem) => {
    if (isSuccess) return;
    playSound('correct');
    const newSelected = [...selectedLetters, letterItem];
    setSelectedLetters(newSelected);

    const currentSpelled = newSelected.map(l => l.char).join('');
    if (currentSpelled === currentVocab.word) {
      handleCorrectAnswer();
    } else if (currentSpelled.length === currentVocab.word.length) {
      // Wrong full word
      playSound('wrong');
      setWrongShake('spelling');
      setTimeout(() => {
        setWrongShake(null);
        setSelectedLetters([]);
      }, 600);
    }
  };

  const handleRemoveSelectedLetter = (indexToRemove) => {
    if (isSuccess) return;
    const updated = selectedLetters.filter((_, idx) => idx !== indexToRemove);
    setSelectedLetters(updated);
  };

  const handleCorrectAnswer = () => {
    playSound('correct');
    updatePlayerStats(player, 10); // Cộng 10 điểm
    setIsSuccess(true);
    speakEnglish(currentVocab.word);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    const newScore = score + 10;
    setScore(newScore);

    if (newScore >= 50) {
      playSound('badge');
      addBadge(player, 'Hiệp Sĩ Tiếng Anh Vũ Trụ', '🇬🇧');
    }

    setTimeout(() => {
      handleNextWord();
    }, 1500);
  };

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <ChevronLeft size={20} /> Trạm chính
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`glass-button ${gameMode === 'quiz' ? 'btn-primary' : ''}`}
            onClick={() => setGameMode('quiz')}
            style={{ padding: '8px 16px', fontSize: '0.95rem' }}
          >
            🧩 Chọn Từ Đúng
          </button>
          <button 
            className={`glass-button ${gameMode === 'spell' ? 'btn-secondary' : ''}`}
            onClick={() => setGameMode('spell')}
            style={{ padding: '8px 16px', fontSize: '0.95rem' }}
          >
            🔤 Ghép Chữ Cái
          </button>
        </div>

        <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ff0080', fontWeight: 'bold' }}>
          <img src={playerAvatar} alt={playerName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--neon-blue)' }} />
          <Award size={22} color="gold" /> Điểm: {score}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px, 4vw, 40px)', position: 'relative' }}>
        
        {/* Vocab Display Banner */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', lineHeight: 1, marginBottom: '10px' }}>
            {currentVocab.emoji}
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: 'var(--neon-pink)', marginBottom: '5px' }}>
            {currentVocab.mean}
          </h2>
          <button 
            onClick={handleSpeech} 
            className="glass-button" 
            style={{ padding: '8px 20px', fontSize: '1.1rem', marginTop: '10px', background: 'rgba(0, 210, 255, 0.2)', borderColor: '#00d2ff' }}
          >
            <Volume2 size={24} color="#00d2ff" /> Nghe phát âm Tiếng Anh
          </button>
        </div>

        {/* MODE 1: MULTIPLE CHOICE QUIZ */}
        {gameMode === 'quiz' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', width: '100%', maxWidth: '600px' }}>
            {quizOptions.map((opt, idx) => (
              <button
                key={idx}
                className="glass-button"
                style={{
                  padding: '20px',
                  fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                  background: isSuccess && opt.word === currentVocab.word ? 'linear-gradient(45deg, #10b981, #059669)' : wrongShake === opt.word ? '#ef4444' : '',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px'
                }}
                onClick={() => handleSelectQuizOption(opt)}
              >
                <span>{opt.word}</span>
              </button>
            ))}
          </div>
        )}

        {/* MODE 2: SPELLING / WORD PUZZLE */}
        {gameMode === 'spell' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
            {/* Word Answer Slots */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {Array.from({ length: currentVocab.word.length }).map((_, idx) => {
                const selected = selectedLetters[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => selected && handleRemoveSelectedLetter(idx)}
                    className="glass-panel"
                    style={{
                      width: 'clamp(45px, 10vw, 65px)',
                      height: 'clamp(45px, 10vw, 65px)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
                      fontWeight: '900',
                      color: 'var(--neon-blue)',
                      border: '2px solid var(--neon-blue)',
                      cursor: selected ? 'pointer' : 'default',
                      background: selected ? 'rgba(0, 210, 255, 0.2)' : 'rgba(0,0,0,0.3)'
                    }}
                  >
                    {selected ? selected.char : ''}
                  </div>
                );
              })}
            </div>

            {/* Scrambled Letter Tiles to Pick */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {scrambledLetters.map((item) => {
                const isUsed = selectedLetters.some(s => s.id === item.id);
                return (
                  <button
                    key={item.id}
                    disabled={isUsed}
                    className="glass-button"
                    style={{
                      width: 'clamp(50px, 11vw, 70px)',
                      height: 'clamp(50px, 11vw, 70px)',
                      padding: 0,
                      fontSize: 'clamp(1.5rem, 5vw, 2.2rem)',
                      opacity: isUsed ? 0.2 : 1,
                      cursor: isUsed ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => handleTapScrambledLetter(item)}
                  >
                    {item.char}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Skip / Next Word Button */}
        <button 
          onClick={handleNextWord} 
          style={{ position: 'absolute', bottom: '15px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          Từ tiếp theo ➔
        </button>

      </div>
    </div>
  );
};

export default EnglishGame;
