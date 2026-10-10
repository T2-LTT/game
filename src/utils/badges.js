export const getBadges = () => {
  const data = localStorage.getItem('game_badges');
  return data ? JSON.parse(data) : [];
};

export const addBadge = (owner, name, emoji) => {
  const badges = getBadges();
  // Kiểm tra nếu bé chưa có huy hiệu này
  if (!badges.find(b => b.owner === owner && b.name === name)) {
    const newBadge = { 
      id: Date.now(), 
      owner, 
      name, 
      emoji, 
      date: new Date().toLocaleDateString('vi-VN') 
    };
    badges.push(newBadge);
    localStorage.setItem('game_badges', JSON.stringify(badges));
    
    // Đẩy lên Google Sheets
    const GOOGLE_APP_URL = 'https://script.google.com/macros/s/AKfycbwrFmv40bnFCUOfpwGw3OVp-6mUiNhXinuHgoDicwvP3QQgbtHS8Gu3dBWlEjyTln1RRA/exec';
    fetch(GOOGLE_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ 
        type: 'badge',
        playerId: owner, 
        badgeName: name, 
        emoji: emoji 
      })
    }).catch(e => console.error('Lỗi đẩy Huy Hiệu lên Google Sheets:', e));

    return newBadge;
  }
  return null;
};
