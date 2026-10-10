import { pushToSyncQueue, generateGUID } from './jsonStorage';

export const getBadges = () => {
  const data = localStorage.getItem('game_badges');
  return data ? JSON.parse(data) : [];
};

export const addBadge = (owner, name, emoji) => {
  const badges = getBadges();
  // Kiểm tra nếu bé chưa có huy hiệu này
  if (!badges.find(b => b.owner === owner && b.name === name)) {
    const newBadge = { 
      id: generateGUID(), 
      owner, 
      name, 
      emoji, 
      date: new Date().toLocaleDateString('vi-VN') 
    };
    badges.push(newBadge);
    localStorage.setItem('game_badges', JSON.stringify(badges));
    
    // Đẩy vào hàng đợi đồng bộ
    pushToSyncQueue({ 
      type: 'badge',
      playerId: owner, 
      badgeName: name, 
      emoji: emoji 
    });

    return newBadge;
  }
  return null;
};
