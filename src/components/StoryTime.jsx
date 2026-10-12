import React, { useState, useEffect } from 'react';
import { ChevronLeft, PlayCircle, PauseCircle, BookOpen, Heart, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { addBadge } from '../utils/badges';
import { updatePlayerStats, logAttempt } from '../utils/jsonStorage';
import localStories from '../data/stories.json';

const StoryTime = ({ onBack, player, playerName }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(-1);
  const [shuffledStories, setShuffledStories] = useState([]);

  // Shuffle and display all stories
  const refreshStories = () => {
    const shuffled = [...localStories].sort(() => Math.random() - 0.5);
    setShuffledStories(shuffled);
  };

  useEffect(() => {
    refreshStories();
  }, []);

  // Stop reading if component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleReadStory = (story) => {
    window.speechSynthesis.cancel(); // Dừng nếu đang đọc
    setIsReading(true);
    setCurrentSentence(0);
    
    let index = 0;
    
    const speakSentence = (sentenceIndex) => {
      if (sentenceIndex >= story.content.length) {
        setIsReading(false);
        setCurrentSentence(-1);
        
        // Hoàn thành truyện -> Thưởng điểm
        if (player) {
          playSound('correct');
          updatePlayerStats(player, 10);
          logAttempt(player, 'Nghe Truyện Cổ Tích', story.title, true, 'Hoàn thành', 'Hoàn thành');
          
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: [story.color, '#ffffff', '#ffcc00']
          });
          
          setTimeout(() => {
            playSound('badge');
            addBadge(player, 'Bé Yêu Văn Học', '📖');
          }, 1500);
        }
        return;
      }
      
      setCurrentSentence(sentenceIndex);
      const utterance = new SpeechSynthesisUtterance(story.content[sentenceIndex]);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.9; // Đọc chậm rãi truyền cảm
      utterance.pitch = 1.2; // Giọng hơi cao một chút cho giống người kể chuyện
      
      utterance.onend = () => {
        speakSentence(sentenceIndex + 1);
      };
      
      window.speechSynthesis.speak(utterance);
    };
    
    speakSentence(0);
  };

  const handleStopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setCurrentSentence(-1);
  };

  if (selectedStory) {
    return (
      <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            className="glass-button" 
            onClick={() => {
              handleStopReading();
              setSelectedStory(null);
            }} 
            style={{ padding: '8px 16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ChevronLeft size={20} /> Chọn truyện khác
          </button>
        </div>

        <div className="glass-panel" style={{ flex: 1, padding: 'clamp(20px, 5vw, 50px)', maxWidth: '800px', margin: '0 auto', width: '100%', background: 'rgba(255, 255, 255, 0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '5rem', filter: `drop-shadow(0 0 20px ${selectedStory.color})` }}>
              {selectedStory.emoji}
            </div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginTop: '10px' }}>
              {selectedStory.title}
            </h1>
            
            {!isReading ? (
              <button 
                className="glass-button btn-primary" 
                onClick={() => handleReadStory(selectedStory)}
                style={{ marginTop: '20px', padding: '12px 30px', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '10px', background: selectedStory.color, color: '#333' }}
              >
                <PlayCircle size={24} /> Kể cho bé nghe
              </button>
            ) : (
              <button 
                className="glass-button" 
                onClick={handleStopReading}
                style={{ marginTop: '20px', padding: '12px 30px', fontSize: '1.2rem', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 0, 85, 0.8)' }}
              >
                <PauseCircle size={24} /> Tạm dừng
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {selectedStory.content.map((sentence, index) => (
              <p 
                key={index} 
                style={{ 
                  fontSize: '1.5rem', 
                  lineHeight: '1.8', 
                  padding: '20px', 
                  borderRadius: '15px',
                  background: currentSentence === index ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0,0,0,0.2)',
                  color: currentSentence === index ? '#fff' : 'rgba(255,255,255,0.7)',
                  borderLeft: currentSentence === index ? `5px solid ${selectedStory.color}` : '5px solid transparent',
                  transition: 'all 0.3s ease',
                  transform: currentSentence === index ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                {sentence}
              </p>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
             <Heart color="var(--neon-pink)" size={40} style={{ animation: 'pulse 2s infinite' }} />
             <p style={{ color: 'var(--neon-pink)', fontSize: '1.2rem', marginTop: '10px', fontStyle: 'italic' }}>
               "Gia đình là nơi yêu thương không bao giờ kết thúc"
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={20} /> Trạm chính
        </button>
        <button className="glass-button btn-secondary" onClick={refreshStories} style={{ padding: '8px 16px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffcc00' }}>
          <RefreshCw size={20} /> Lấy danh sách mới
        </button>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, padding: 'clamp(20px, 5vw, 40px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <BookOpen size={60} color="#ffcc00" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 10px rgba(255,204,0,0.5))' }} />
          <h1 className="title-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginTop: '10px' }}>
            Góc Kể Truyện Cổ Tích
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.2rem', marginTop: '10px' }}>
            Những mẩu truyện nhỏ gieo mầm yêu thương gia đình
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
          {shuffledStories.map(story => (
            <div 
              key={story.id}
              className="floating"
              onClick={() => setSelectedStory(story)}
              style={{
                width: '300px',
                padding: '30px',
                borderRadius: '25px',
                background: `linear-gradient(145deg, rgba(255,255,255,0.1), ${story.color}22)`,
                border: `2px solid ${story.color}55`,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                boxShadow: `0 10px 30px ${story.color}33`
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.05)';
                e.currentTarget.style.boxShadow = `0 20px 40px ${story.color}66`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${story.color}33`;
              }}
            >
              <div style={{ fontSize: '5rem', marginBottom: '20px', filter: `drop-shadow(0 0 15px ${story.color})` }}>
                {story.emoji}
              </div>
              <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '15px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{story.title}</h2>
              <button 
                style={{ 
                  background: story.color, 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '20px', 
                  color: '#333', 
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: 'pointer'
                }}
              >
                Đọc Truyện
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryTime;
