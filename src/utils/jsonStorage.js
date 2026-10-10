// Default empty structure
const STORAGE_KEY = 'game_space_data_v1';

// Lấy toàn bộ dữ liệu game (từ localStorage hoặc JSON khởi tạo)
export const getGameData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Lỗi đọc localStorage:", e);
  }

  // Nếu chưa có, trả về cấu trúc rỗng
  return {
    version: '1.0',
    lastSaved: new Date().toISOString(),
    players: {}
  };
};

// Lưu toàn bộ dữ liệu game
export const saveGameData = (data) => {
  try {
    const updatedData = {
      ...data,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return true;
  } catch (e) {
    console.error("Lỗi lưu dữ liệu:", e);
    return false;
  }
};

// Ghi nhật ký từng lượt làm bài của bé (Dành cho Báo cáo Bố Mẹ)
export const logAttempt = (playerId, gameName, questionText, isCorrect, userAns = '', correctAns = '') => {
  const currentData = getGameData();
  const player = currentData.players[playerId] || {
    player: { id: playerId, name: playerId === 'kiet' ? 'Tuấn Kiệt' : 'Bảo Nhi' },
    summary: { totalScore: 0 },
    stats: {},
    badges: [],
    logs: []
  };

  if (!player.logs) player.logs = [];

  const now = new Date();
  const timeString = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}`;

  const logItem = {
    id: Date.now().toString(),
    timestamp: timeString,
    gameName,
    questionText,
    isCorrect,
    userAns: String(userAns),
    correctAns: String(correctAns)
  };

  // Lưu tối đa 100 nhật ký gần nhất để tránh quá tải dung lượng
  player.logs.unshift(logItem);
  if (player.logs.length > 100) {
    player.logs = player.logs.slice(0, 100);
  }

  currentData.players[playerId] = player;
  saveGameData(currentData);

  // Đẩy lên Google Sheets
  const GOOGLE_APP_URL = 'https://script.google.com/macros/s/AKfycbwrFmv40bnFCUOfpwGw3OVp-6mUiNhXinuHgoDicwvP3QQgbtHS8Gu3dBWlEjyTln1RRA/exec';
  const actionText = `${questionText} | Chọn: ${userAns} (${isCorrect ? 'Đúng' : 'Sai'})`;
  const envValue = import.meta.env.DEV ? 'dev' : 'prod';
  
  fetch(GOOGLE_APP_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ env: envValue, playerId, gameName, action: actionText, score: 0 })
  }).catch(e => console.error('Lỗi đẩy Google Sheets:', e));
};

// Cập nhật điểm & huy hiệu cho bé
export const updatePlayerStats = (playerId, scoreDelta, newBadge = null) => {
  const currentData = getGameData();
  const player = currentData.players[playerId] || {
    player: { id: playerId, name: playerId === 'kiet' ? 'Tuấn Kiệt' : 'Bảo Nhi' },
    summary: { totalScore: 0 },
    stats: {},
    badges: [],
    logs: []
  };

  player.summary.totalScore = (player.summary.totalScore || 0) + scoreDelta;
  player.summary.lastPlayed = new Date().toISOString();

  if (newBadge) {
    if (!player.badges) player.badges = [];
    const exists = player.badges.some(b => b.name === newBadge.name);
    if (!exists) {
      player.badges.push({
        id: Date.now().toString(),
        name: newBadge.name,
        emoji: newBadge.emoji,
        earnedAt: new Date().toLocaleDateString('vi-VN')
      });
    }
  }

  currentData.players[playerId] = player;
  saveGameData(currentData);

  if (scoreDelta > 0) {
    const GOOGLE_APP_URL = 'https://script.google.com/macros/s/AKfycbwrFmv40bnFCUOfpwGw3OVp-6mUiNhXinuHgoDicwvP3QQgbtHS8Gu3dBWlEjyTln1RRA/exec';
    const envValue = import.meta.env.DEV ? 'dev' : 'prod';
    
    fetch(GOOGLE_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ env: envValue, playerId, gameName: 'Hệ Thống', action: `Nhận điểm thưởng`, score: scoreDelta })
    }).catch(e => console.error('Lỗi đẩy Google Sheets:', e));
  }

  return player;
};

// Xóa lịch sử nhật ký làm bài
export const clearPlayerLogs = (playerId) => {
  const currentData = getGameData();
  if (currentData.players[playerId]) {
    currentData.players[playerId].logs = [];
    saveGameData(currentData);
  }
};

// Cập nhật Avatar tùy chỉnh
export const updateCustomAvatar = (playerId, base64Str) => {
  const currentData = getGameData();
  if (currentData.players[playerId]) {
    currentData.players[playerId].customAvatar = base64Str;
    saveGameData(currentData);
  }
};

// 📥 XUẤT DỮ LIỆU THÀNH FILE .JSON TẢI VỀ MÁY
export const exportDataToJSONFile = () => {
  const data = getGameData();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `Bao_Cao_Hoc_Tap_Tuankiet_Baonhi_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 📤 NHẬP DỮ LIỆU TỪ FILE .JSON NGOÀI
export const importDataFromJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && parsed.players) {
      saveGameData(parsed);
      return true;
    }
  } catch (e) {
    console.error("File JSON không hợp lệ:", e);
  }
  return false;
};
