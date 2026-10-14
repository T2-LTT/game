import React, { useState, useEffect } from 'react';
import BasicLearningGame from './components/BasicLearningGame';
import MathGame from './components/MathGame';
import EnglishGame from './components/EnglishGame';
import BadgesPanel from './components/BadgesPanel';
import SpotDifferenceGame from './components/SpotDifferenceGame';
import CatchFishGame from './components/CatchFishGame';
import ParentDashboard from './components/ParentDashboard';
import WhackAMole from './components/WhackAMole';
import DrawingGame from './components/DrawingGame';
import PianoGame from './components/PianoGame';
import StoryTime from './components/StoryTime';
import ShadowMatchingGame from './components/ShadowMatchingGame';
import BalloonPopGame from './components/BalloonPopGame';
import MultiplicationRacingGame from './components/MultiplicationRacingGame';
import WordChainGame from './components/WordChainGame';
import RobotCodingGame from './components/RobotCodingGame';
import SupermarketCashierGame from './components/SupermarketCashierGame';
import WorldExplorerGame from './components/WorldExplorerGame';
import * as Icons from 'lucide-react';
import { toggleBGM, unlockAudioOnFirstTouch, isBGMPlaying } from './utils/audio';
import playersData from '../data/players.json';
import gamesData from '../data/games.json';
import { getGameData, saveGameData, startSyncWorker } from './utils/jsonStorage';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('selectPlayer'); // selectPlayer, playerMenu, game, parent, badges
  const [activePlayer, setActivePlayer] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [playerScores, setPlayerScores] = useState({});
  const [playersList, setPlayersList] = useState(playersData); // Danh sách người chơi
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  
  // Trạng thái đồng bộ Offline-First
  const [syncState, setSyncState] = useState({ isOnline: navigator.onLine, isSyncing: false, pending: 0 });

  const GOOGLE_APP_URL = 'https://script.google.com/macros/s/AKfycbwrFmv40bnFCUOfpwGw3OVp-6mUiNhXinuHgoDicwvP3QQgbtHS8Gu3dBWlEjyTln1RRA/exec';

  useEffect(() => {
    unlockAudioOnFirstTouch();
    startSyncWorker(); // Kích hoạt Sync Worker chạy ngầm
    
    // Quản lý trạng thái đồng bộ
    const updateSyncState = () => {
      const q = localStorage.getItem('game_sync_queue');
      const pending = q ? JSON.parse(q).length : 0;
      setSyncState(prev => ({ ...prev, pending, isOnline: navigator.onLine }));
    };

    window.addEventListener('online', updateSyncState);
    window.addEventListener('offline', updateSyncState);
    window.addEventListener('sync_queue_updated', updateSyncState);
    window.addEventListener('sync_started', () => setSyncState(prev => ({ ...prev, isSyncing: true })));
    window.addEventListener('sync_finished', () => {
      updateSyncState();
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    });
    updateSyncState();
    
    const envParam = import.meta.env.DEV ? '?env=dev' : '';
    
    // Tải danh sách người chơi, điểm số VÀ huy hiệu từ Google Sheets
    Promise.all([
      fetch(`${GOOGLE_APP_URL}?action=getPlayers`).then(res => res.json()),
      fetch(`${GOOGLE_APP_URL}${envParam}`).then(res => res.json()),
      fetch(`${GOOGLE_APP_URL}?action=getBadges`).then(res => res.json())
    ])
    .then(([playersDataArray, logsDataArray, remoteBadgesArray]) => {
      if (Array.isArray(playersDataArray) && playersDataArray.length > 0) {
        const localData = getGameData();
        const validPlayers = playersDataArray.filter(p => p.id && p.name).map(p => {
          if (localData.players[p.id] && localData.players[p.id].customAvatar) {
            return { ...p, avatar: localData.players[p.id].customAvatar };
          }
          return p;
        });
        if (validPlayers.length > 0) setPlayersList(validPlayers);
      }
      if (Array.isArray(logsDataArray) && logsDataArray.length > 0) {
        // Cộng dồn điểm số từ Google Sheets
        const onlineScores = {};
        for (let i = 1; i < logsDataArray.length; i++) {
          const row = logsDataArray[i];
          const pid = row[1]; // ID Bé
          const score = parseInt(row[4], 10) || 0; // Điểm
          if (pid) {
            onlineScores[pid] = (onlineScores[pid] || 0) + score;
          }
        }
        
        // Merge với local storage để lấy số lớn nhất và lưu lại
        const localData = getGameData();
        const mergedScores = {};
        const allPlayers = (Array.isArray(playersDataArray) && playersDataArray.length > 0) ? playersDataArray : playersList;
        let needsSave = false;

        // Phân loại logs từ Google Sheets theo ID nhân vật
        const remoteLogsByPlayer = {};
        for (let i = 1; i < logsDataArray.length; i++) {
          const row = logsDataArray[i];
          const pid = row[1];
          if (!pid) continue;
          
          if (!remoteLogsByPlayer[pid]) remoteLogsByPlayer[pid] = [];
          
          remoteLogsByPlayer[pid].push({
            timestamp: row[0],
            playerId: pid,
            gameName: row[2],
            action: row[3],
            score: parseInt(row[4], 10) || 0,
            question: row[5],
            userAnswer: row[6],
            correctAnswer: row[7],
            isCorrect: row[8] === 'Đúng',
            guid: row[9] || `${row[0]}-${pid}` // Fallback cho log cũ không có guid
          });
        }

        allPlayers.forEach(p => {
          if (!localData.players[p.id]) {
            localData.players[p.id] = { summary: { totalScore: 0 }, logs: [] };
          }
          if (!localData.players[p.id].logs) {
            localData.players[p.id].logs = [];
          }

          // Trộn Logs từ mây về máy
          const localLogs = localData.players[p.id].logs;
          const localGuids = new Set(localLogs.map(l => l.guid).filter(Boolean));
          const remoteLogs = remoteLogsByPlayer[p.id] || [];
          
          remoteLogs.forEach(rLog => {
            if (rLog.guid && !localGuids.has(rLog.guid) && rLog.action === 'Nhật ký làm bài') {
              localLogs.push(rLog);
              localGuids.add(rLog.guid);
              needsSave = true;
            }
          });

          const localScore = localData.players[p.id]?.summary?.totalScore || 0;
          const remoteScore = onlineScores[p.id] || 0;
          const maxScore = Math.max(localScore, remoteScore);
          mergedScores[p.id] = maxScore;
          
          if (localScore < remoteScore) {
            localData.players[p.id].summary.totalScore = remoteScore;
            needsSave = true;
          }
        });

        if (needsSave) saveGameData(localData);
        
        setPlayerScores(mergedScores);
      }
      
      // Đồng bộ Huy hiệu hai chiều (Phase 5)
      if (Array.isArray(remoteBadgesArray) && remoteBadgesArray.length > 0) {
        const localBadgesStr = localStorage.getItem('game_badges');
        const localBadges = localBadgesStr ? JSON.parse(localBadgesStr) : [];
        let badgesChanged = false;
        
        // Dùng Dictionary kiểm tra trùng lặp cho nhanh
        const localBadgeMap = {};
        localBadges.forEach(b => {
          localBadgeMap[`${b.owner}_${b.name}`] = true;
        });
        
        remoteBadgesArray.forEach(remoteB => {
          const key = `${remoteB.owner}_${remoteB.name}`;
          if (!localBadgeMap[key] && remoteB.owner && remoteB.name) {
            localBadges.push({
              id: remoteB.id || Date.now().toString(),
              owner: remoteB.owner,
              name: remoteB.name,
              emoji: remoteB.emoji || '🏅',
              date: remoteB.date || new Date().toLocaleDateString('vi-VN')
            });
            localBadgeMap[key] = true;
            badgesChanged = true;
          }
        });
        
        if (badgesChanged) {
          localStorage.setItem('game_badges', JSON.stringify(localBadges));
          console.log("Đã đồng bộ huy hiệu từ Đám mây về máy!");
        }
      }
    })
    .catch(e => console.log('Không thể tải từ Sheets, dùng data mặc định.', e))
    .finally(() => setIsLoadingPlayers(false));
  }, []);

  useEffect(() => {
    if (currentScreen === 'selectPlayer') {
      const data = getGameData();
      const scores = {};
      Object.keys(data.players || {}).forEach(pid => {
        scores[pid] = data.players[pid]?.summary?.totalScore || 0;
      });
      setPlayerScores(scores);
    }
  }, [currentScreen]);

  const currentYear = new Date().getFullYear();

  const getPlayerTitle = (score) => {
    if (score < 50) return 'Tân Binh';
    if (score < 100) return 'Thám Hiểm Gia';
    if (score < 200) return 'Phi Công';
    if (score < 500) return 'Chỉ Huy';
    return 'Đại Sứ Vũ Trụ';
  };

  const handleToggleMusic = () => {
    const isPlaying = toggleBGM();
    setIsMusicPlaying(isPlaying);
  };

  const openPlayerMenu = (player) => {
    setActivePlayer(player);
    setCurrentScreen('playerMenu');
  };

  const openGame = (game) => {
    setActiveGame(game);
    setCurrentScreen('game');
  };

  // Màn hình 1: Chọn Nhân Vật
  return (
    <>
      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* MÀN HÌNH 1: CHỌN NGƯỜI CHƠI */}
        {currentScreen === 'selectPlayer' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', zIndex: 100 }}>
              <button className="glass-button" onClick={handleToggleMusic} style={{ padding: '10px', borderRadius: '50%' }} title="Bật/Tắt Nhạc Nền">
                {isMusicPlaying ? <Icons.Music size={24} /> : <Icons.Music3 size={24} color="gray" />}
              </button>
              <button className="glass-button" onClick={() => setCurrentScreen('parent')} style={{ padding: '10px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981' }} title="Báo Cáo Bố Mẹ">
                <Icons.BarChart2 size={24} color="#10b981" />
              </button>
            </div>

            <div className="floating" style={{ marginBottom: '40px', textAlign: 'center', width: '100%', marginTop: '40px' }}>
              <h1 className="title-gradient text-glow" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', marginBottom: '10px', textTransform: 'uppercase' }}>
                Hành Trình Vũ Trụ
              </h1>
              <p style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', color: 'var(--text-muted)' }}>
                Ai sẽ bắt đầu chuyến bay hôm nay?
              </p>
            </div>

            {isLoadingPlayers ? (
              <div style={{ color: 'white', fontSize: '1.2rem', marginTop: '20px' }}>Đang đồng bộ dữ liệu từ Google Sheets...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', width: '100%', maxWidth: '800px' }}>
                {[...playersList].sort((a, b) => {
                  const scoreA = playerScores[a.id] || 0;
                  const scoreB = playerScores[b.id] || 0;
                  if (scoreA !== scoreB) return scoreB - scoreA;
                  return a.yearOfBirth - b.yearOfBirth;
                }).map((player, idx) => {
                  const age = currentYear - player.yearOfBirth;
                  return (
                    <div 
                      key={player.id || `player-${idx}`}
                      className={`glass-panel ${idx % 2 === 0 ? 'floating' : 'floating-delayed'}`} 
                      style={{ padding: 'clamp(20px, 5vw, 40px) 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: `4px solid ${player.color}`, cursor: 'pointer' }}
                      onClick={() => openPlayerMenu(player)}
                    >
                      <img src={player.avatar || '/image/baonhi.JPG'} alt={player.name || 'Người chơi'} style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: `4px solid ${player.color || '#fff'}`, boxShadow: `0 0 25px ${player.color || '#fff'}`, marginBottom: '20px' }} />
                      <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '5px' }}>{getPlayerTitle(playerScores[player.id] || 0)} {player.name}</h2>
                      <h3 style={{ fontSize: '1.2rem', color: player.color, marginBottom: '15px' }}>({age} Tuổi) - {playerScores[player.id] || 0} Điểm</h3>
                      <button className="glass-button" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <Icons.Play size={20} /> Bắt đầu
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* MÀN HÌNH 2: CHỌN GAME THEO TUỔI */}
        {currentScreen === 'playerMenu' && activePlayer && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '20px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
              <button className="glass-button" onClick={() => setCurrentScreen('selectPlayer')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.ChevronLeft size={20} /> Đổi người chơi
              </button>
            </div>
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px' }}>
              <button className="glass-button" onClick={() => setCurrentScreen('badges')} style={{ padding: '10px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Icons.Trophy size={24} color="gold" /> Tủ Huy Hiệu
              </button>
            </div>

            <div style={{ marginTop: '80px', textAlign: 'center', marginBottom: '40px' }}>
              <img src={activePlayer.avatar || '/image/baonhi.JPG'} alt={activePlayer.name || 'Người chơi'} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${activePlayer.color || '#fff'}` }} />
              <h1 className="title-gradient" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', marginTop: '10px' }}>
                Xin chào {activePlayer.name}!
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Hôm nay bé muốn chơi gì nào?</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', width: '100%', maxWidth: '900px' }}>
              {[...gamesData]
                .filter(g => (currentYear - activePlayer.yearOfBirth) >= g.minAge)
                .sort((a, b) => (a.ageOrder || 0) - (b.ageOrder || 0))
                .map((game, idx) => {
                  const IconComponent = Icons[game.icon] || Icons.Gamepad2;
                  return (
                    <div 
                      key={game.id || `game-${idx}`}
                      className="glass-panel floating" 
                      style={{ animationDelay: `${idx * 0.08}s`, padding: '25px 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} 
                      onClick={() => openGame(game)}
                    >
                      <div style={{ background: game.color, borderRadius: '50%', padding: '20px', marginBottom: '12px' }}>
                        {IconComponent && <IconComponent size={48} color="white" />}
                      </div>
                      <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{game.name}</h2>
                      {game.ageLabel && (
                        <span style={{ 
                          fontSize: '0.85rem', 
                          background: 'rgba(255, 255, 255, 0.1)', 
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          padding: '3px 12px', 
                          borderRadius: '12px', 
                          color: '#00d2ff',
                          fontWeight: 'bold'
                        }}>
                          {game.ageLabel}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* MÀN HÌNH 3: VÀO GAME */}
        {currentScreen === 'game' && activeGame && activePlayer && (() => {
          const props = {
            player: activePlayer.id,
            playerName: activePlayer.name,
            playerAvatar: activePlayer.avatar || '/image/baonhi.JPG',
            playerColor: activePlayer.color || 'var(--neon-pink)',
            initialGame: activeGame.id,
            onBack: () => setCurrentScreen('playerMenu')
          };
          switch (activeGame.component) {
            case 'BasicLearningGame': return <BasicLearningGame {...props} />;
            case 'MathGame': return <MathGame {...props} />;
            case 'EnglishGame': return <EnglishGame {...props} />;
            case 'SpotDifferenceGame': return <SpotDifferenceGame {...props} />;
            case 'WhackAMole': return <WhackAMole {...props} />;
            case 'CatchFishGame': return <CatchFishGame {...props} />;
            case 'DrawingGame': return <DrawingGame {...props} />;
            case 'PianoGame': return <PianoGame {...props} />;
            case 'StoryTime': return <StoryTime {...props} />;
            case 'ShadowMatchingGame': return <ShadowMatchingGame {...props} />;
            case 'BalloonPopGame': return <BalloonPopGame {...props} />;
            case 'MultiplicationRacingGame': return <MultiplicationRacingGame {...props} />;
            case 'WordChainGame': return <WordChainGame {...props} />;
            case 'RobotCodingGame': return <RobotCodingGame {...props} />;
            case 'SupermarketCashierGame': return <SupermarketCashierGame {...props} />;
            case 'WorldExplorerGame': return <WorldExplorerGame {...props} />;
            default: return null;
          }
        })()}
        
        {/* MÀN HÌNH 4: BÁO CÁO PHỤ HUYNH */}
        {currentScreen === 'parent' && <ParentDashboard onBack={() => setCurrentScreen('selectPlayer')} playersData={playersList} />}
        
        {/* MÀN HÌNH 5: BỘ SƯU TẬP HUY HIỆU */}
        {currentScreen === 'badges' && <BadgesPanel player={activePlayer?.id} players={playersList} onBack={() => setCurrentScreen(activePlayer ? 'playerMenu' : 'selectPlayer')} />}
      </div>
      
      {/* TÍNH NĂNG MỚI: ĐÈN BÁO ĐỒNG BỘ ĐÁM MÂY (PHASE 4) */}
      <div 
        title={
          !syncState.isOnline ? `Ngoại tuyến (Chờ ${syncState.pending})` : 
          syncState.isSyncing ? "Đang đẩy lên mây..." : 
          syncState.pending > 0 ? `Đợi đồng bộ (${syncState.pending})` : 
          "Đã lưu trên mây"
        }
        style={{
          position: 'fixed', bottom: '15px', left: '15px', zIndex: 9999,
          background: 'rgba(10, 15, 30, 0.7)', padding: '10px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          width: '40px', height: '40px'
        }}
      >
        {syncState.isOnline ? (
          syncState.isSyncing ? (
            <Icons.RefreshCw size={20} color="#00d2ff" style={{ animation: 'spin 1s linear infinite' }} />
          ) : syncState.pending > 0 ? (
            <div style={{ position: 'relative' }}>
              <Icons.Cloud size={20} color="#ffcc00" />
              <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: '#ff0055', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '10px', fontWeight: 'bold' }}>{syncState.pending}</span>
            </div>
          ) : (
            <Icons.Cloud size={20} color="#10b981" />
          )
        ) : (
          <div style={{ position: 'relative' }}>
            <Icons.WifiOff size={20} color="#ff0055" />
            {syncState.pending > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: '#ffcc00', color: '#000', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '10px', fontWeight: 'bold' }}>{syncState.pending}</span>}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default App;
