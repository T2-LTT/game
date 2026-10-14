import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Check, RefreshCw, Trash2, Volume2, Sparkles, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound, speakVietnamese } from '../utils/audio';
import { logAttempt, updatePlayerStats } from '../utils/jsonStorage';

const STORE_ITEMS = [
  { id: 'apple', name: 'Quả Táo', price: 5000, emoji: '🍎' },
  { id: 'milk', name: 'Sữa Tươi', price: 10000, emoji: '🥛' },
  { id: 'bread', name: 'Bánh Mì', price: 8000, emoji: '🥖' },
  { id: 'cookie', name: 'Bánh Quy', price: 15000, emoji: '🍪' },
  { id: 'icecream', name: 'Kem Ốc Quế', price: 7000, emoji: '🍦' },
  { id: 'notebook', name: 'Vở Học Sinh', price: 6000, emoji: '📒' },
  { id: 'colors', name: 'Hộp Màu Vẽ', price: 20000, emoji: '🎨' },
  { id: 'juice', name: 'Nước Cam', price: 12000, emoji: '🧃' }
];

const CURRENCY_BILLS = [
  { val: 1000, label: '1.000đ', color: '#b5a38a' },
  { val: 2000, label: '2.000đ', color: '#9c8e79' },
  { val: 5000, label: '5.000đ', color: '#4a859c' },
  { val: 10000, label: '10.000đ', color: '#a07855' },
  { val: 20000, label: '20.000đ', color: '#398b93' },
  { val: 50000, label: '50.000đ', color: '#b85d85' }
];

const CUSTOMERS = [
  { name: 'Bạn Thỏ Trắng', avatar: '🐰' },
  { name: 'Bạn Mèo Con', avatar: '🐱' },
  { name: 'Chú Cún Con', avatar: '🐶' },
  { name: 'Bạn Gấu Nhỏ', avatar: '🐻' },
  { name: 'Bạn Khỉ Tinh Nghịch', avatar: '🐵' }
];

const SupermarketCashierGame = ({ onBack, player = 'nhi', playerName = 'Bảo Nhi' }) => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [givenBills, setGivenBills] = useState([]);
  const [score, setScore] = useState(0);
  const [servedCount, setServedCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const totalRounds = 5;

  // Tạo đơn hàng mới
  const generateNewOrder = () => {
    setGivenBills([]);
    setIsSuccess(false);

    // Chọn 2 món hàng ngẫu nhiên
    const shuffledItems = [...STORE_ITEMS].sort(() => Math.random() - 0.5);
    const cart = [shuffledItems[0], shuffledItems[1]];
    const totalPrice = cart[0].price + cart[1].price;

    // Chọn số tiền khách đưa (lớn hơn hoặc bằng tổng tiền)
    const possiblePays = [20000, 30000, 50000, 100000].filter(p => p > totalPrice);
    const paidAmount = possiblePays[Math.floor(Math.random() * possiblePays.length)] || (totalPrice + 10000);
    const changeNeeded = paidAmount - totalPrice;

    const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];

    const order = { cart, totalPrice, paidAmount, changeNeeded, customer };
    setCurrentOrder(order);

    speakVietnamese(`${customer.name} mua hết ${totalPrice.toLocaleString()} đồng, đưa ${paidAmount.toLocaleString()} đồng. Bé hãy thối lại ${changeNeeded.toLocaleString()} đồng nhé!`);
  };

  useEffect(() => {
    generateNewOrder();
  }, []);

  const totalGivenChange = givenBills.reduce((acc, cur) => acc + cur, 0);

  const handleAddBill = (val) => {
    playSound('pop');
    setGivenBills(prev => [...prev, val]);
  };

  const handleRemoveLastBill = () => {
    setGivenBills(prev => prev.slice(0, -1));
  };

  const handleClearBills = () => {
    setGivenBills([]);
  };

  const handleConfirmChange = () => {
    if (!currentOrder) return;

    if (totalGivenChange === currentOrder.changeNeeded) {
      // Đúng số tiền thối!
      playSound('badge');
      setIsSuccess(true);
      const points = 20;
      setScore(s => s + points);
      setServedCount(c => c + 1);

      logAttempt(player, 'supermarket_cashier', true, points);
      updatePlayerStats(player, 'supermarket_cashier', points);

      confetti({ particleCount: 70, spread: 60 });
      speakVietnamese(`Chính xác! Thối đúng ${currentOrder.changeNeeded.toLocaleString()} đồng! Cảm ơn thu ngân ${playerName}!`);

      setTimeout(() => {
        generateNewOrder();
      }, 2000);
    } else {
      playSound('wrong');
      if (totalGivenChange < currentOrder.changeNeeded) {
        speakVietnamese(`Chưa đủ rồi bé ơi! Đang thối ${totalGivenChange.toLocaleString()} đồng, cần thối ${currentOrder.changeNeeded.toLocaleString()} đồng cơ!`);
      } else {
        speakVietnamese(`Bị thừa tiền rồi! Đang thối ${totalGivenChange.toLocaleString()} đồng, chỉ cần thối ${currentOrder.changeNeeded.toLocaleString()} đồng thôi!`);
      }
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
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', padding: '6px 16px', borderRadius: '20px', color: '#10b981', fontWeight: 'bold' }}>
            🛒 Phục vụ: {servedCount} khách
          </div>
        </div>
      </div>

      {/* TIÊU ĐỀ */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 className="title-gradient" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', marginBottom: '5px' }}>
          🛒 Bé Làm Thu Ngân Siêu Thị
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Tính tiền giỏ hàng và chọn các tờ tiền mặt để thối lại chính xác cho khách nhé!
        </p>
      </div>

      {currentOrder && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', flexGrow: 1 }}>
          {/* CỘT TRÁI: GIỎ HÀNG & HÓA ĐƠN */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            {/* Khách hàng */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '3rem' }}>{currentOrder.customer.avatar}</span>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffcc00' }}>
                  {currentOrder.customer.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Khách hàng đang chờ tính tiền...</div>
              </div>
            </div>

            {/* Danh sách món hàng */}
            <div style={{ fontSize: '1rem', color: '#00d2ff', fontWeight: 'bold', marginBottom: '10px' }}>
              📦 Các Món Đã Mua:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
              {currentOrder.cart.map((item, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>{item.emoji}</span>
                    <span>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#ffcc00' }}>
                    {item.price.toLocaleString()}đ
                  </span>
                </div>
              ))}
            </div>

            {/* Chi tiết thanh toán */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '16px', marginTop: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '1.1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tổng Hóa Đơn:</span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>{currentOrder.totalPrice.toLocaleString()}đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '1.1rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Khách Đưa Tiền:</span>
                <span style={{ fontWeight: 'bold', color: '#00d2ff' }}>{currentOrder.paidAmount.toLocaleString()}đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.2)', fontSize: '1.25rem', color: '#ff0080', fontWeight: '900' }}>
                <span>Cần Thối Lại:</span>
                <span>{currentOrder.changeNeeded.toLocaleString()}đ</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: KHAY TIỀN THỐI & CÁC TỜ TIỀN */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '1rem', color: '#ffcc00', fontWeight: 'bold' }}>
                💰 Tiền Bé Đang Thối:
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleRemoveLastBill} className="glass-button" style={{ padding: '4px 10px', fontSize: '0.85rem' }}>
                  ⌫ Xóa
                </button>
                <button onClick={handleClearBills} className="glass-button" style={{ padding: '4px 10px', fontSize: '0.85rem', color: '#ff0055' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* KHAY ĐỰNG TIỀN THỐI */}
            <div style={{
              flexGrow: 1, minHeight: '100px', background: 'rgba(0,0,0,0.3)',
              borderRadius: '16px', padding: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px',
              border: totalGivenChange === currentOrder.changeNeeded ? '2px solid #10b981' : '1px dashed rgba(255,255,255,0.2)',
              marginBottom: '15px', alignContent: 'flex-start'
            }}>
              {givenBills.length === 0 && (
                <div style={{ margin: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem' }}>
                  Chạm các tờ tiền bên dưới để xếp tiền thối...
                </div>
              )}
              {givenBills.map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    color: 'white',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  💵 {val.toLocaleString()}đ
                </div>
              ))}
            </div>

            {/* TỔNG TIỀN ĐANG CHỌN */}
            <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              Tổng tiền đang thối:{' '}
              <span style={{ color: totalGivenChange === currentOrder.changeNeeded ? '#10b981' : totalGivenChange > currentOrder.changeNeeded ? '#ef4444' : '#ffcc00' }}>
                {totalGivenChange.toLocaleString()}đ
              </span>
            </div>

            {/* BẢNG CÁC TỜ TIỀN MỆNH GIÁ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '15px' }}>
              {CURRENCY_BILLS.map(bill => (
                <button
                  key={bill.val}
                  onClick={() => handleAddBill(bill.val)}
                  className="glass-button"
                  style={{
                    padding: '12px 6px',
                    fontSize: '1rem',
                    borderRadius: '14px',
                    background: bill.color,
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                >
                  {bill.label}
                </button>
              ))}
            </div>

            {/* NÚT HOÀN TẤT */}
            <button
              onClick={handleConfirmChange}
              className="glass-button btn-primary"
              style={{ width: '100%', fontSize: '1.25rem', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Check size={22} /> Hoàn Tất & Giao Hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupermarketCashierGame;
