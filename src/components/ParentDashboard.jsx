import React, { useState } from 'react';
import { ChevronLeft, Lock, Unlock, BarChart2, CheckCircle, XCircle, Clock, Download, Trash2, Award, Filter, Image } from 'lucide-react';
import { getGameData, clearPlayerLogs, exportDataToJSONFile, updateCustomAvatar } from '../utils/jsonStorage';
import playersData from '../../data/players.json';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ParentDashboard = ({ onBack }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinAnswer, setPinAnswer] = useState('');
  const [activePlayer, setActivePlayer] = useState('nhi'); // 'kiet' or 'nhi'
  const [activeTab, setActiveTab] = useState('wrong'); // 'wrong' or 'all'

  // Kiểm tra mật khẩu là Ngày Tháng Năm hiện tại
  const checkCurrentDatePassword = (input) => {
    const cleanInput = input.replace(/[^0-9]/g, '');
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const dayShort = String(now.getDate());
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const yearFull = String(now.getFullYear());
    const yearShort = yearFull.slice(-2);

    const validPasswords = [
      `${day}${month}${yearFull}`,     // 08102026
      `${dayShort}${month}${yearFull}`, // 8102026
      `${day}${month}${yearShort}`,    // 081026
      `${day}${month}`,                // 0810
      `${dayShort}${month}`,           // 810
    ];

    return validPasswords.includes(cleanInput);
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (checkCurrentDatePassword(pinAnswer)) {
      setIsUnlocked(true);
    } else {
      alert('Mật khẩu chưa chính xác, vui lòng liên hệ IT.Thi đẹp trai');
      setPinAnswer('');
    }
  };

  const gameData = getGameData();
  const playerInfo = gameData.players[activePlayer] || { logs: [], badges: [], summary: {} };
  const logs = playerInfo.logs || [];

  const totalAttempts = logs.length;
  const correctAttempts = logs.filter(l => l.isCorrect).length;
  const wrongAttempts = logs.filter(l => !l.isCorrect);
  const accuracyRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // Process data for the chart
  const chartDataMap = {};
  logs.forEach(l => {
    const gn = l.gameName || 'Khác';
    if (!chartDataMap[gn]) {
      chartDataMap[gn] = { name: gn, Dung: 0, Sai: 0 };
    }
    if (l.isCorrect) chartDataMap[gn].Dung += 1;
    else chartDataMap[gn].Sai += 1;
  });
  const chartData = Object.values(chartDataMap);

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử làm bài của bé không?')) {
      clearPlayerLogs(activePlayer);
      window.location.reload();
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Có thể thu nhỏ ảnh ở đây nếu cần, nhưng tạm thời lưu trực tiếp Base64
        updateCustomAvatar(activePlayer, reader.result);
        alert('Đã cập nhật ảnh đại diện cục bộ thành công!');
        window.location.reload();
      };
      reader.readAsDataURL(file);
    }
  };

  // If locked, show Parent Challenge Gate
  if (!isUnlocked) {
    const today = new Date();
    const dayStr = String(today.getDate()).padStart(2, '0');
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const yearStr = today.getFullYear();

    return (
      <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
          <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
            <ChevronLeft size={20} /> Trạm chính
          </button>
        </div>

        <div className="glass-panel" style={{ padding: 'clamp(30px, 5vw, 50px) 30px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255, 204, 0, 0.2)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock size={40} color="#ffcc00" />
          </div>
          <h2 className="title-gradient" style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Khu Vực Bố Mẹ Quản Lý</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Vui lòng nhập mật khẩu bảo mật để mở khóa báo cáo:
          </p>

          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="Nhập mật khẩu bí mật..." 
              value={pinAnswer}
              onChange={(e) => setPinAnswer(e.target.value)}
              style={{ 
                padding: '14px 20px', 
                borderRadius: '16px', 
                border: '2px solid var(--neon-purple)', 
                background: 'rgba(0,0,0,0.5)', 
                color: 'white', 
                fontSize: '1.3rem', 
                textAlign: 'center',
                outline: 'none'
              }}
              autoFocus
            />
            <button className="glass-button btn-primary" type="submit" style={{ padding: '14px', fontSize: '1.1rem' }}>
              <Unlock size={20} /> Mở Khóa Báo Cáo
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <ChevronLeft size={20} /> Trạm chính
        </button>

        {/* Player Filter Selector */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {playersData.map(player => (
            <button 
              key={player.id}
              className={`glass-button ${activePlayer === player.id ? 'btn-primary' : ''}`}
              onClick={() => setActivePlayer(player.id)}
              style={{ padding: '8px 16px', fontSize: '0.95rem', display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              <img src={player.avatar} alt={player.name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
              {player.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="glass-button" onClick={exportDataToJSONFile} style={{ padding: '8px 14px', fontSize: '0.9rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Download size={16} /> Xuất JSON Báo Cáo
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: 'clamp(20px, 4vw, 35px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
          <h1 className="title-gradient" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            📊 Báo Cáo Tiến Độ: {playersData.find(p => p.id === activePlayer)?.name || activePlayer}
          </h1>
          <div>
            <input type="file" id="avatarUpload" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            <label htmlFor="avatarUpload" className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 15px', background: 'rgba(255, 0, 255, 0.2)', border: '1px solid var(--neon-pink)', fontSize: '0.9rem' }}>
              <Image size={18} color="var(--neon-pink)" /> Đổi Avatar
            </label>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', background: 'rgba(0, 210, 255, 0.1)' }}>
            <div style={{ color: 'var(--neon-blue)', fontSize: '2.2rem', fontWeight: '900' }}>{totalAttempts}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>Tổng Câu Đã Làm</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)' }}>
            <div style={{ color: '#10b981', fontSize: '2.2rem', fontWeight: '900' }}>{accuracyRate}%</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>Tỷ Lệ Đúng</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', background: 'rgba(255, 0, 128, 0.1)' }}>
            <div style={{ color: 'var(--neon-pink)', fontSize: '2.2rem', fontWeight: '900' }}>{wrongAttempts.length}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>Số Câu Làm Sai</div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', background: 'rgba(255, 204, 0, 0.1)' }}>
            <div style={{ color: '#ffcc00', fontSize: '2.2rem', fontWeight: '900' }}>{playerInfo.summary?.totalScore || 0}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>Tổng Điểm Thưởng</div>
          </div>
        </div>

        {/* Learning Progress Chart */}
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '15px' }}>📈 Biểu Đồ Tỉ Lệ Đúng/Sai Theo Từng Trò Chơi</h2>
          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(20,20,40,0.9)', border: '1px solid var(--neon-blue)', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Dung" name="Số câu Đúng" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Sai" name="Số câu Sai" fill="#ff0055" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Bé chưa chơi game nào. Hãy cho bé làm một bài tập để biểu đồ xuất hiện nhé!
            </div>
          )}
        </div>

        {/* Tab Controls for Wrong Logs vs All Logs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={`glass-button ${activeTab === 'wrong' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('wrong')}
              style={{ padding: '6px 16px', fontSize: '0.9rem', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <XCircle size={16} color="#ff0055" /> Các Câu Bé Làm Sai ({wrongAttempts.length})
            </button>
            <button 
              className={`glass-button ${activeTab === 'all' ? 'btn-secondary' : ''}`}
              onClick={() => setActiveTab('all')}
              style={{ padding: '6px 16px', fontSize: '0.9rem', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Clock size={16} /> Lịch Sử Toàn Bộ ({totalAttempts})
            </button>
          </div>

          {logs.length > 0 && (
            <button 
              onClick={handleClearHistory} 
              style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}
            >
              <Trash2 size={16} /> Xóa Nhật Ký
            </button>
          )}
        </div>

        {/* LOGS TABLE / LIST */}
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '450px' }}>
          {(activeTab === 'wrong' ? wrongAttempts : logs).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              {activeTab === 'wrong' ? '🎉 Tuyệt vời! Bé chưa làm sai câu nào gần đây.' : 'Chưa có lịch sử làm bài nào.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(activeTab === 'wrong' ? wrongAttempts : logs).map((log) => (
                <div 
                  key={log.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '12px 20px', 
                    display: 'flex', 
                    justify: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap', 
                    gap: '10px',
                    borderLeft: log.isCorrect ? '5px solid #10b981' : '5px solid #ff0055',
                    background: log.isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 0, 85, 0.08)'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '8px', color: 'var(--neon-blue)' }}>
                        🎮 {log.gameName}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {log.timestamp}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>
                      ❓ Câu hỏi: {log.questionText}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    {!log.isCorrect ? (
                      <div>
                        <div style={{ color: '#ff4444', fontWeight: 'bold', fontSize: '0.95rem' }}>
                          ❌ Bé chọn: <span style={{ textDecoration: 'line-through' }}>{log.userAns}</span>
                        </div>
                        <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.95rem' }}>
                          ✅ Đúng là: {log.correctAns}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <CheckCircle size={18} /> Chính Xác ({log.userAns})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
