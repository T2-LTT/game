import React, { useRef } from 'react';
import { ChevronLeft, Download, Upload, FileJson } from 'lucide-react';
import { getBadges } from '../utils/badges';
import { exportDataToJSONFile, importDataFromJSON } from '../utils/jsonStorage';

const BadgesPanel = ({ onBack }) => {
  const fileInputRef = useRef(null);
  const badges = getBadges();
  
  const kietBadges = badges.filter(b => b.owner === 'kiet');
  const nhiBadges = badges.filter(b => b.owner === 'nhi');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = importDataFromJSON(event.target.result);
        if (success) {
          alert('🎉 Khôi phục dữ liệu JSON thành công!');
          window.location.reload();
        } else {
          alert('❌ File JSON không hợp lệ. Vui lòng kiểm tra lại!');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <ChevronLeft size={20} /> Trạm chính
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="glass-button btn-secondary" 
            onClick={exportDataToJSONFile}
            style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', gap: '6px', alignItems: 'center' }}
            title="Tải về file JSON sao lưu thành tích"
          >
            <Download size={18} /> Xuất JSON
          </button>
          <button 
            className="glass-button" 
            onClick={() => fileInputRef.current.click()}
            style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', gap: '6px', alignItems: 'center' }}
            title="Tải lên file JSON để phục hồi thành tích"
          >
            <Upload size={18} /> Nhập JSON
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".json" 
            style={{ display: 'none' }} 
          />
        </div>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, padding: 'clamp(20px, 5vw, 40px)' }}>
        <h1 className="title-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', textAlign: 'center', marginBottom: '40px' }}>
          🏆 Tủ Kính Huy Hiệu
        </h1>
        
        {badges.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: '1.5rem', color: 'var(--text-muted)' }}>Chưa có huy hiệu nào. Hãy chơi game để thu thập nhé!</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>
            {/* Tủ Tuấn Kiệt */}
            <div style={{ flex: 1, minWidth: '280px', background: 'rgba(255,102,178,0.1)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                <img src="/image/tuankiet.JPG" alt="Bé Tuấn Kiệt" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--neon-pink)', boxShadow: '0 0 15px rgba(255,0,128,0.6)' }} />
                <h2 style={{ color: 'var(--neon-pink)', fontSize: '1.8rem', margin: 0 }}>Tân Binh Tuấn Kiệt</h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                {kietBadges.map(b => (
                  <div key={b.id} className="floating" style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '1px solid var(--neon-pink)', width: '120px' }}>
                    <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px rgba(255,102,178,0.5))' }}>{b.emoji}</div>
                    <div style={{ fontSize: '1rem', marginTop: '10px', fontWeight: 'bold' }}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tủ Bảo Nhi */}
            <div style={{ flex: 1, minWidth: '280px', background: 'rgba(0,210,255,0.1)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                <img src="/image/baonhi.JPG" alt="Bé Bảo Nhi" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--neon-blue)', boxShadow: '0 0 15px rgba(0,210,255,0.6)' }} />
                <h2 style={{ color: 'var(--neon-blue)', fontSize: '1.8rem', margin: 0 }}>Chỉ Huy Bảo Nhi</h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                {nhiBadges.map(b => (
                  <div key={b.id} className="floating" style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '1px solid var(--neon-blue)', width: '120px' }}>
                    <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px rgba(0,210,255,0.5))' }}>{b.emoji}</div>
                    <div style={{ fontSize: '1rem', marginTop: '10px', fontWeight: 'bold' }}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesPanel;
