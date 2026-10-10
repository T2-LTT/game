// Default empty structure
const STORAGE_KEY = 'game_space_data_v1';
const SYNC_QUEUE_KEY = 'game_sync_queue';
const GOOGLE_APP_URL = 'https://script.google.com/macros/s/AKfycbwrFmv40bnFCUOfpwGw3OVp-6mUiNhXinuHgoDicwvP3QQgbtHS8Gu3dBWlEjyTln1RRA/exec';

// Hàm tạo GUID chuẩn YYYYMMDDHHMMSS-RND
export const generateGUID = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${timestamp}-${randomStr}`;
};

// Hàm đẩy vào hàng đợi đồng bộ
export const pushToSyncQueue = (payload) => {
  try {
    const rawQueue = localStorage.getItem(SYNC_QUEUE_KEY);
    const queue = rawQueue ? JSON.parse(rawQueue) : [];
    
    // Luôn nhét GUID vào payload nếu chưa có
    if (!payload.guid) {
      payload.guid = generateGUID();
    }
    
    queue.push({
      ...payload,
      status: 'pending',
      queuedAt: new Date().toISOString()
    });
    
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    
    // Báo cho UI biết có dữ liệu đang chờ đồng bộ
    window.dispatchEvent(new Event('sync_queue_updated'));
    
    // Thử đồng bộ ngay nếu đang có mạng
    if (navigator.onLine) {
      processSyncQueue();
    }
  } catch (e) {
    console.error("Lỗi thêm vào hàng đợi:", e);
  }
};

// Cờ kiểm tra đang đồng bộ tránh trùng lặp
let isSyncing = false;

// Hàm xử lý hàng đợi
export const processSyncQueue = async () => {
  if (!navigator.onLine || isSyncing) return;
  
  const rawQueue = localStorage.getItem(SYNC_QUEUE_KEY);
  if (!rawQueue) return;
  
  const queue = JSON.parse(rawQueue);
  if (queue.length === 0) return;
  
  isSyncing = true;
  window.dispatchEvent(new Event('sync_started')); // Báo cho UI biết đang bắt đầu đồng bộ
  
  console.log(`Bắt đầu đồng bộ ${queue.length} bản ghi lên Google Sheets...`);
  
  try {
    const envValue = import.meta.env.DEV ? 'dev' : 'prod';
    
    // Gửi bulk_sync
    const response = await fetch(GOOGLE_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // Lưu ý: no-cors không đọc được response trả về
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ 
        type: 'bulk_sync', 
        env: envValue,
        data: queue 
      })
    });
    
    // Vì mode no-cors luôn successful nếu mạng OK, ta giả định là đã gửi thành công
    console.log("Đã gửi đồng bộ thành công!");
    localStorage.removeItem(SYNC_QUEUE_KEY); // Xóa hàng đợi
    window.dispatchEvent(new Event('sync_queue_updated')); // Báo cho UI cập nhật
  } catch (e) {
    console.error('Lỗi khi đồng bộ hàng đợi:', e);
  } finally {
    isSyncing = false;
    window.dispatchEvent(new Event('sync_finished')); // Báo cho UI biết đã đồng bộ xong
  }
};

// Kích hoạt worker chạy ngầm
export const startSyncWorker = () => {
  // Lắng nghe sự kiện có mạng lại
  window.addEventListener('online', () => {
    console.log("Đã có kết nối mạng, tiến hành đồng bộ dữ liệu...");
    processSyncQueue();
  });
  
  // Chạy ngầm định kỳ mỗi 30 giây để bắt những trường hợp kẹt
  setInterval(() => {
    processSyncQueue();
  }, 30000);
};

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
    id: generateGUID(),
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

  // Đẩy vào hàng đợi thay vì gọi fetch trực tiếp
  const envValue = import.meta.env.DEV ? 'dev' : 'prod';
  pushToSyncQueue({
    env: envValue, 
    playerId, 
    gameName, 
    action: 'Nhật ký làm bài', 
    score: 0,
    question: questionText,
    userAns: String(userAns),
    correctAns: String(correctAns),
    isCorrect: isCorrect
  });
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
    const envValue = import.meta.env.DEV ? 'dev' : 'prod';
    pushToSyncQueue({ 
      env: envValue, 
      playerId, 
      gameName: 'Hệ Thống', 
      action: `Nhận điểm thưởng`, 
      score: scoreDelta 
    });
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
