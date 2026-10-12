import React, { useMemo } from 'react';

const StarBackground = () => {
  // Generate random stars once
  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      delay: `${Math.random() * 3}s`,
      duration: `${Math.random() * 2 + 2}s`
    }));
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 10px white; }
          }
          @keyframes floatCloud {
            0% { transform: translateX(100vw); }
            100% { transform: translateX(-100vw); }
          }
        `}
      </style>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none',
          background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
          overflow: 'hidden'
        }}
      >
        {/* The Moon */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #fffbdd 0%, #fff7b0 50%, #ffef66 100%)',
          boxShadow: '0 0 40px 10px rgba(255, 247, 176, 0.4), inset -10px -10px 20px rgba(200, 180, 0, 0.2)',
          zIndex: 1
        }}>
          {/* Craters on the moon */}
          <div style={{ position: 'absolute', top: '20%', left: '30%', width: '15px', height: '15px', borderRadius: '50%', background: 'rgba(200, 180, 0, 0.2)' }} />
          <div style={{ position: 'absolute', top: '60%', left: '20%', width: '25px', height: '20px', borderRadius: '50%', background: 'rgba(200, 180, 0, 0.15)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '60%', width: '10px', height: '12px', borderRadius: '50%', background: 'rgba(200, 180, 0, 0.25)' }} />
        </div>

        {/* The Stars */}
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              background: '#ffffff',
              borderRadius: '50%',
              animation: `twinkle ${star.duration} infinite ease-in-out`,
              animationDelay: star.delay
            }}
          />
        ))}

        {/* Some subtle clouds floating */}
        <div style={{
          position: 'absolute', top: '20%', width: '300px', height: '50px', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          animation: 'floatCloud 40s infinite linear'
        }} />
        <div style={{
          position: 'absolute', top: '60%', width: '500px', height: '80px', 
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
          animation: 'floatCloud 60s infinite linear reverse'
        }} />
      </div>
    </>
  );
};

export default StarBackground;
