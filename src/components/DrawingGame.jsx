import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, Eraser, Trash2, Download, CheckCircle2, PaintBucket, PenTool } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audio';
import { updatePlayerStats, logAttempt } from '../utils/jsonStorage';
import { addBadge } from '../utils/badges';

const COLORS = [
  '#ff0000', // Đỏ
  '#ff9900', // Cam
  '#ffff00', // Vàng
  '#33cc33', // Xanh lá
  '#00d2ff', // Xanh dương
  '#9d4edd', // Tím
  '#ff66b2', // Hồng
  '#ffffff', // Trắng
  '#000000', // Đen
];

const BRUSH_SIZES = [5, 10, 20, 40];

const DrawingGame = ({ onBack, player, playerName, playerAvatar }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[4]); // Mặc định xanh dương
  const [brushSize, setBrushSize] = useState(10);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [scoreEarned, setScoreEarned] = useState(false);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set actual size in memory (scaled to account for retina displays)
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Đổ nền trắng (để khi lưu ảnh không bị nền đen)
    ctx.fillStyle = '#1a1a2e'; // Nền tối giống glass
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleResize = () => {
    // Để đơn giản, khi resize ta có thể xóa canvas hoặc chỉ vẽ lại trên canvas mới
    // Ở đây ta giữ nguyên để không mất hình, nhưng size sẽ bị lệch nếu đổi hướng màn hình.
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Hỗ trợ cả chuột và cảm ứng
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault(); // Ngăn cuộn trang trên mobile
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#1a1a2e' : color;
    ctx.lineWidth = brushSize;
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.closePath();
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    if (window.confirm('Bé có chắc muốn xóa hết để vẽ lại từ đầu không?')) {
      initCanvas();
      setHasDrawn(false);
    }
  };

  const fillCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(true);
    setIsEraser(false);
  };

  const saveArtwork = () => {
    if (!hasDrawn) {
      alert('Bé hãy vẽ một bức tranh thật đẹp trước khi lưu nhé!');
      return;
    }

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    
    // Tải xuống
    const link = document.createElement('a');
    link.download = `Tranh-cua-${playerName}.png`;
    link.href = dataUrl;
    link.click();

    playSound('correct');
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    if (!scoreEarned) {
      updatePlayerStats(player, 5); // Tặng 5 điểm sáng tạo
      const result = addBadge(player, 'Họa Sĩ Nhí Vũ Trụ', '🎨');
      if (result) speak(`Chúc mừng ${playerName} nhận được huy hiệu Họa Sĩ Nhí Vũ Trụ`);
      logAttempt(player, 'Vẽ Tranh', 'Sáng tạo một bức tranh mới', true, 'Tác phẩm hoàn thành', 'Tuyệt vời');
      setScoreEarned(true);
    }
  };

  return (
    <div style={{ padding: 'clamp(10px, 3vw, 20px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="glass-button" onClick={onBack} style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <ChevronLeft size={20} /> Trạm chính
        </button>

        <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={playerAvatar} alt={playerName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--neon-blue)' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Xưởng Họa Sĩ Nhí</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '20px', flexDirection: 'row', flexWrap: 'wrap' }}>
        
        {/* Tools Panel */}
        <div className="glass-panel" style={{ width: 'clamp(80px, 15vw, 150px)', padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'center' }}>Màu Sắc</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setIsEraser(false); }}
                  style={{
                    backgroundColor: c,
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '50%',
                    border: color === c && !isEraser ? '3px solid white' : '2px solid rgba(255,255,255,0.2)',
                    transform: color === c && !isEraser ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: color === c && !isEraser ? `0 0 15px ${c}` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px', textAlign: 'center' }}>Nét Vẽ</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              {BRUSH_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setBrushSize(size)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    background: brushSize === size ? 'rgba(255,255,255,0.2)' : 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ width: `${size}px`, height: `${size}px`, backgroundColor: 'white', borderRadius: '50%' }} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className={`glass-button ${isEraser ? 'btn-primary' : ''}`}
              onClick={() => setIsEraser(true)}
              style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}
              title="Cục tẩy"
            >
              <Eraser size={24} />
            </button>
            <button 
              className="glass-button"
              onClick={fillCanvas}
              style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}
              title="Đổ màu nền"
            >
              <PaintBucket size={24} />
            </button>
            <button 
              className="glass-button"
              onClick={clearCanvas}
              style={{ padding: '10px', display: 'flex', justifyContent: 'center', color: '#ff4444' }}
              title="Xóa toàn bộ"
            >
              <Trash2 size={24} />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
          className="glass-panel" 
          ref={containerRef}
          style={{ 
            flex: 1, 
            position: 'relative', 
            overflow: 'hidden', 
            minHeight: '60vh', 
            cursor: isEraser ? 'crosshair' : 'url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.58 7.58"></path><circle cx="11" cy="11" r="2"></circle></svg>) 0 24, auto' 
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          />

          <button
            className="glass-button btn-primary floating"
            onClick={saveArtwork}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1.1rem',
              boxShadow: '0 0 20px rgba(0, 210, 255, 0.5)'
            }}
          >
            <Download size={24} /> Lưu Tranh
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingGame;
