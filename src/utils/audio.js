let audioCtx = null;
let bgmAudio = null;
let isAudioUnlocked = false;

// Danh sách URL nhạc nền dự phòng đảm bảo luôn chạy
const BGM_URLS = [
  '/audio/bgm.mp3'
];

let currentBgmIndex = 0;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (!bgmAudio) {
    bgmAudio = new Audio(BGM_URLS[0]);
    bgmAudio.loop = true;
    bgmAudio.volume = 0.25; // Âm lượng vừa phải cho bé
    
    // Nếu URL chính lỗi, chuyển sang URL dự phòng
    bgmAudio.onerror = () => {
      currentBgmIndex++;
      if (currentBgmIndex < BGM_URLS.length) {
        console.warn(`Lỗi tải BGM, chuyển sang URL dự phòng ${currentBgmIndex}...`);
        bgmAudio.src = BGM_URLS[currentBgmIndex];
        bgmAudio.play().catch(e => console.log('Đợi người dùng tương tác để bật nhạc'));
      }
    };
  }
};

// Mở khóa âm thanh khi người dùng chạm màn hình lần đầu trên điện thoại
export const unlockAudioOnFirstTouch = () => {
  if (isAudioUnlocked) return;
  
  const unlock = () => {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isAudioUnlocked = true;
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('click', unlock);
  };

  window.addEventListener('touchstart', unlock, { once: true });
  window.addEventListener('click', unlock, { once: true });
};

// Bật / Tắt Nhạc Nền
export const toggleBGM = () => {
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  if (bgmAudio.paused) {
    const playPromise = bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.log("Cần tương tác người dùng để phát nhạc:", e);
      });
    }
    return true;
  } else {
    bgmAudio.pause();
    return false;
  }
};

// Kiểm tra trạng thái BGM
export const isBGMPlaying = () => {
  return bgmAudio && !bgmAudio.paused;
};

// Phát Âm Thanh Hiệu Ứng (SFX) Zero-Latency
export const playSound = (type) => {
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  const t = audioCtx.currentTime;
  
  if (type === 'correct') {
    // Tiếng "Ting!" ngọt ngào
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, t);
    oscillator.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
    gainNode.gain.setValueAtTime(0.4, t);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    oscillator.start(t);
    oscillator.stop(t + 0.4);
  } else if (type === 'wrong') {
    // Tiếng "Tèo teo" nhẹ nhàng
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(160, t);
    oscillator.frequency.exponentialRampToValueAtTime(100, t + 0.3);
    gainNode.gain.setValueAtTime(0.25, t);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    oscillator.start(t);
    oscillator.stop(t + 0.3);
  } else if (type === 'rocket') {
    // Tiếng rền tên lửa phóng
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(50, t);
    oscillator.frequency.exponentialRampToValueAtTime(220, t + 1.8);
    gainNode.gain.setValueAtTime(0.3, t);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 1.8);
    oscillator.start(t);
    oscillator.stop(t + 1.8);
  } else if (type === 'badge') {
    // Tiếng Ting-Ting nhận huy hiệu
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, t);
    oscillator.frequency.setValueAtTime(554, t + 0.1);
    oscillator.frequency.setValueAtTime(659, t + 0.2);
    gainNode.gain.setValueAtTime(0.4, t);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
    oscillator.start(t);
    oscillator.stop(t + 0.6);
  } else if (type === 'pop') {
    // Tiếng "Bốp!" nổ bong bóng siêu nảy
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, t);
    oscillator.frequency.exponentialRampToValueAtTime(70, t + 0.09);
    gainNode.gain.setValueAtTime(0.6, t);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
    oscillator.start(t);
    oscillator.stop(t + 0.09);
  } else if (type === 'magic') {
    // Tiếng biến hình lấp lánh khi ghép đúng bóng
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(523.25, t); // C5
    oscillator.frequency.setValueAtTime(659.25, t + 0.08); // E5
    oscillator.frequency.setValueAtTime(783.99, t + 0.16); // G5
    oscillator.frequency.setValueAtTime(1046.50, t + 0.24); // C6
    gainNode.gain.setValueAtTime(0.35, t);
    gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    oscillator.start(t);
    oscillator.stop(t + 0.5);
  }
};

// Đọc giọng phát âm Tiếng Anh chuẩn (TTS)
export const speakEnglish = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.includes('en') || v.lang.includes('en-US'));
    if (enVoice) utterance.voice = enVoice;
    window.speechSynthesis.speak(utterance);
  }
};

// Đọc giọng Tiếng Việt ấm áp, vui tươi cho bé (TTS)
export const speakVietnamese = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9;
    utterance.pitch = 1.1; // Giọng tươi vui cho trẻ
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('vi-VN'));
    if (viVoice) utterance.voice = viVoice;
    window.speechSynthesis.speak(utterance);
  }
};
