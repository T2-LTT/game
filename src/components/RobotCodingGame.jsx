import React, { useState, useEffect } from 'react';
import { ChevronLeft, Play, RefreshCw, Trash2, ArrowUp, RotateCcw, RotateCw, Gem, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound, speakVietnamese } from '../utils/audio';
import { logAttempt, updatePlayerStats } from '../utils/jsonStorage';

// Các màn chơi mê cung lập trình (Grid 5x5)
// 0: Đường đi, 1: Vật cản (đá), 2: Kim cương, 3: Đích đến
const LEVELS = [
  {
    id: 1,
    name: 'Màn 1: Tập Đi Thẳng',
    start: { x: 0, y: 2, dir: 1 }, // dir: 0=Up, 1=Right, 2=Down, 3=Left
    grid: [
      [0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1],
      [0, 2, 0, 3, 0],
      [1, 1, 0, 1, 1],
      [0, 0, 0, 0, 0]
    ]
  },
  {
    id: 2,
    name: 'Màn 2: Rẽ Trái Rẽ Phải',
    start: { x: 0, y: 0, dir: 1 },
    grid: [
      [0, 0, 2, 1, 0],
      [1, 0, 1, 1, 0],
      [0, 0, 0, 2, 0],
      [0, 1, 1, 0, 1],
      [0, 0, 0, 3, 0]
    ]
  },
  {
    id: 3,
    name: 'Màn 3: Thu Thập Năng Lượng',
    start: { x: 0, y: 4, dir: 0 },
    grid: [
      [0, 2, 1, 2, 3],
      [0, 1, 1, 0, 0],
      [0, 0, 2, 0, 1],
      [1, 0, 1, 0, 0],
      [0, 0, 0, 0, 0]
    ]
  }
];

const DIR_OFFSETS = [
  { dx: 0, dy: -1 }, // 0: Up
  { dx: 1, dy: 0 },  // 1: Right
  { dx: 0, dy: 1 },  // 2: Down
  { dx: -1, dy: 0 }  // 3: Left
];

const DIR_EMOJIS = ['⬆️', '➡️', '⬇️', '⬅️'];

const RobotCodingGame = ({ onBack, player = 'nhi', playerName = 'Bảo Nhi' }) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const [commands, setCommands] = useState([]);
  const [robotState, setRobotState] = useState({ x: 0, y: 0, dir: 1 });
  const [collectedCount, setCollectedCount] = useState(0);
  const [totalDiamonds, setTotalDiamonds] = useState(0);
  const [gridData, setGridData] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [score, setScore] = useState(0);
  const [isLevelCleared, setIsLevelCleared] = useState(false);

  const currentLevel = LEVELS[levelIndex];

  // Khởi tạo màn chơi
  const loadLevel = (lvlIdx) => {
    const lvl = LEVELS[lvlIdx];
    setLevelIndex(lvlIdx);
    setCommands([]);
    setRobotState({ ...lvl.start });
    setIsRunning(false);
    setActiveStep(-1);
    setIsLevelCleared(false);
    setCollectedCount(0);

    // Đếm số lượng kim cương
    let count = 0;
    const initialGrid = lvl.grid.map(row => row.map(cell => {
      if (cell === 2) count++;
      return cell;
    }));
    setTotalDiamonds(count);
    setGridData(initialGrid);

    speakVietnamese(`${lvl.name}! Bé hãy lập trình các bước để Robot nhặt kim cương và về đích nhé!`);
  };

  useEffect(() => {
    loadLevel(0);
  }, []);

  const addCommand = (cmd) => {
    if (isRunning || commands.length >= 14) return;
    playSound('correct');
    setCommands(prev => [...prev, cmd]);
  };

  const removeLastCommand = () => {
    if (isRunning) return;
    setCommands(prev => prev.slice(0, -1));
  };

  const clearAllCommands = () => {
    if (isRunning) return;
    setCommands([]);
    setRobotState({ ...currentLevel.start });
    setGridData(currentLevel.grid.map(r => [...r]));
    setCollectedCount(0);
  };

  // Thực thi chương trình lệnh (Run code)
  const runProgram = async () => {
    if (commands.length === 0 || isRunning) return;

    setIsRunning(true);
    let curX = currentLevel.start.x;
    let curY = currentLevel.start.y;
    let curDir = currentLevel.start.dir;
    let collected = 0;
    const gridCopy = currentLevel.grid.map(r => [...r]);

    setRobotState({ x: curX, y: curY, dir: curDir });
    setGridData(gridCopy);
    setCollectedCount(0);

    for (let i = 0; i < commands.length; i++) {
      setActiveStep(i);
      const cmd = commands[i];
      playSound('pop');

      await new Promise(r => setTimeout(r, 600));

      if (cmd === 'FORWARD') {
        const nextX = curX + DIR_OFFSETS[curDir].dx;
        const nextY = curY + DIR_OFFSETS[curDir].dy;

        // Kiểm tra ra khỏi bản đồ
        if (nextX < 0 || nextX >= 5 || nextY < 0 || nextY >= 5) {
          playSound('wrong');
          speakVietnamese('Robot đụng tường viền rồi! Bé kiểm tra lại lệnh nhé!');
          setIsRunning(false);
          return;
        }

        // Kiểm tra đụng đá (vật cản)
        if (gridCopy[nextY][nextX] === 1) {
          playSound('wrong');
          speakVietnamese('Ối! Robot đụng phải tảng đá rồi! Bé sửa lại lệnh nhé!');
          setIsRunning(false);
          return;
        }

        curX = nextX;
        curY = nextY;
        setRobotState({ x: curX, y: curY, dir: curDir });

        // Tự động nhặt kim cương nếu đi qua
        if (gridCopy[curY][curX] === 2) {
          gridCopy[curY][curX] = 0;
          collected++;
          setCollectedCount(collected);
          playSound('magic');
        }
      } else if (cmd === 'LEFT') {
        curDir = (curDir + 3) % 4; // Rẽ trái
        setRobotState({ x: curX, y: curY, dir: curDir });
      } else if (cmd === 'RIGHT') {
        curDir = (curDir + 1) % 4; // Rẽ phải
        setRobotState({ x: curX, y: curY, dir: curDir });
      }
    }

    // Kiểm tra đã về đích chưa
    if (gridCopy[curY][curX] === 3) {
      if (collected >= totalDiamonds) {
        // Hoàn thành xuất sắc!
        setIsLevelCleared(true);
        playSound('badge');
        confetti({ particleCount: 90, spread: 80 });
        const points = 25;
        setScore(s => s + points);
        logAttempt(player, 'robot_coding', true, points);
        updatePlayerStats(player, 'robot_coding', points);
        speakVietnamese(`Hoan hô lập trình viên nhí ${playerName}! Chương trình đã chạy hoàn hảo!`);
      } else {
        playSound('wrong');
        speakVietnamese('Robot về đích nhưng chưa nhặt hết kim cương rồi! Thử lại nha bé!');
      }
    } else {
      speakVietnamese('Robot chưa về tới đích trạm sạc! Bé thêm lệnh cho Robot đi tiếp nhé!');
    }

    setIsRunning(false);
    setActiveStep(-1);
  };

  const handleNextLevel = () => {
    if (levelIndex < LEVELS.length - 1) {
      loadLevel(levelIndex + 1);
    } else {
      loadLevel(0); // Quay lại màn 1
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '15px', minHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
      {/* THANH ĐIỀU HƯỚNG */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <button 
          onClick={onBack}
          className="glass-button"
          style={{ padding: '8px 18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ChevronLeft size={20} /> Trở về
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', padding: '6px 16px', borderRadius: '20px', color: '#ffcc00', fontWeight: 'bold' }}>
            ⭐ {score} điểm
          </div>
          <div style={{ background: 'rgba(0, 210, 255, 0.15)', border: '1px solid #00d2ff', padding: '6px 16px', borderRadius: '20px', color: '#00d2ff', fontWeight: 'bold' }}>
            💎 {collectedCount}/{totalDiamonds} Kim Cương
          </div>
        </div>
      </div>

      {/* TIÊU ĐỀ */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 className="title-gradient" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', marginBottom: '5px' }}>
          🤖 Mê Cung Lập Trình Robot
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {currentLevel.name} - Xếp chuỗi thẻ lệnh để chú Robot tự hành về đích!
        </p>
      </div>

      {/* KHU VỰC BẢN ĐỒ & KHAY LẬP TRÌNH */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', flexGrow: 1 }}>
        {/* BẢN ĐỒ LƯỚI 5x5 */}
        <div className="glass-panel" style={{ padding: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', maxWidth: '360px', width: '100%', aspectRatio: '1/1' }}>
            {gridData.map((row, rIdx) => 
              row.map((cell, cIdx) => {
                const isRobot = robotState.x === cIdx && robotState.y === rIdx;

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    style={{
                      borderRadius: '12px',
                      background: cell === 1 
                        ? '#332940' 
                        : cell === 3 
                        ? 'rgba(16, 185, 129, 0.3)' 
                        : 'rgba(255, 255, 255, 0.05)',
                      border: cell === 3 ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                      position: 'relative',
                      boxShadow: cell === 3 ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none'
                    }}
                  >
                    {/* Vật phẩm trên ô */}
                    {cell === 1 && '🪨'}
                    {cell === 2 && '💎'}
                    {cell === 3 && !isRobot && '🔋'}

                    {/* Robot di chuyển */}
                    {isRobot && (
                      <div style={{
                        position: 'absolute',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <span>🤖</span>
                        <span style={{ fontSize: '0.9rem', marginTop: '-6px' }}>
                          {DIR_EMOJIS[robotState.dir]}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* KHAY LẬP TRÌNH & NÚT THẺ LỆNH */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '1rem', color: '#00d2ff', fontWeight: 'bold', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📝 Khay Lệnh Đã Xếp ({commands.length}/14):</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={removeLastCommand} 
                disabled={isRunning || commands.length === 0}
                className="glass-button" 
                style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                title="Xóa lệnh vừa thêm"
              >
                ⌫ Xóa
              </button>
              <button 
                onClick={clearAllCommands} 
                disabled={isRunning || commands.length === 0}
                className="glass-button" 
                style={{ padding: '4px 10px', fontSize: '0.85rem', color: '#ff0055' }}
                title="Xóa toàn bộ"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* HIỂN THỊ CÁC THẺ LỆNH TRONG KHAY */}
          <div style={{ 
            flexGrow: 1, 
            minHeight: '110px',
            background: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: '16px', 
            padding: '10px', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            alignContent: 'flex-start',
            border: '1px dashed rgba(255, 255, 255, 0.2)',
            marginBottom: '15px'
          }}>
            {commands.length === 0 && (
              <div style={{ margin: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem' }}>
                Bấm các thẻ lệnh bên dưới để xếp hàng đợi...
              </div>
            )}
            {commands.map((cmd, idx) => (
              <div
                key={idx}
                style={{
                  background: activeStep === idx ? 'linear-gradient(135deg, #ff0080, #ffcc00)' : 'linear-gradient(135deg, #0ea5e9, #9d4edd)',
                  border: activeStep === idx ? '2px solid white' : '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transform: activeStep === idx ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: activeStep === idx ? '0 0 15px #ffcc00' : 'none'
                }}
              >
                <span>{idx + 1}.</span>
                {cmd === 'FORWARD' && '⬆️ Tiến'}
                {cmd === 'LEFT' && '🔄 Rẽ Trái'}
                {cmd === 'RIGHT' && '↪️ Rẽ Phải'}
              </div>
            ))}
          </div>

          {/* CÁC NÚT BỔ SUNG LỆNH */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '15px' }}>
            <button
              onClick={() => addCommand('FORWARD')}
              disabled={isRunning}
              className="glass-button"
              style={{ padding: '12px 6px', fontSize: '1rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <ArrowUp size={20} color="#10b981" />
              <span>Tiến 1 Bước</span>
            </button>
            <button
              onClick={() => addCommand('LEFT')}
              disabled={isRunning}
              className="glass-button"
              style={{ padding: '12px 6px', fontSize: '1rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <RotateCcw size={20} color="#00d2ff" />
              <span>Rẽ Trái</span>
            </button>
            <button
              onClick={() => addCommand('RIGHT')}
              disabled={isRunning}
              className="glass-button"
              style={{ padding: '12px 6px', fontSize: '1rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <RotateCw size={20} color="#ff0080" />
              <span>Rẽ Phải</span>
            </button>
          </div>

          {/* NÚT THỰC THI CHƯƠNG TRÌNH */}
          <button
            onClick={runProgram}
            disabled={isRunning || commands.length === 0}
            className="glass-button btn-primary"
            style={{ width: '100%', fontSize: '1.25rem', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Play size={22} /> {isRunning ? 'Đang Thực Thi...' : '▶️ Chạy Chương Trình'}
          </button>
        </div>
      </div>

      {/* POPUP THÀNH CÔNG VỀ ĐÍCH */}
      {isLevelCleared && (
        <div className="glass-panel" style={{ margin: 'auto', padding: '30px', textAlign: 'center', maxWidth: '450px', width: '100%', zIndex: 100 }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '10px' }}>🎉</div>
          <h2 className="title-gradient" style={{ fontSize: '2.2rem', marginBottom: '10px' }}>
            LẬP TRÌNH THÀNH CÔNG!
          </h2>
          <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '15px' }}>
            Kỹ sư nhí <strong>{playerName}</strong> đã điều khiển Robot vượt qua mê cung xuất sắc!
          </p>
          <div style={{ background: 'rgba(255, 204, 0, 0.15)', border: '1px solid #ffcc00', padding: '12px', borderRadius: '15px', color: '#ffcc00', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '20px' }}>
            +25 Điểm STEM ⭐
          </div>

          <button 
            className="glass-button btn-primary"
            onClick={handleNextLevel}
            style={{ width: '100%', fontSize: '1.25rem', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Sparkles size={20} /> Màn Tiếp Theo
          </button>
        </div>
      )}
    </div>
  );
};

export default RobotCodingGame;
