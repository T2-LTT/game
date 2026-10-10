import React from 'react';

const StarBackground = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'radial-gradient(circle at 15% 50%, #0a0521 0%, #050212 100%)',
      }}
    >
      {/* Lightweight CSS stars for weak devices */}
      <div style={{
        position: 'absolute', top: '10%', left: '20%', width: '2px', height: '2px', background: 'white', borderRadius: '50%', opacity: 0.8
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '80%', width: '3px', height: '3px', background: 'white', borderRadius: '50%', opacity: 0.6
      }} />
      <div style={{
        position: 'absolute', top: '70%', left: '40%', width: '1.5px', height: '1.5px', background: 'white', borderRadius: '50%', opacity: 0.9
      }} />
      <div style={{
        position: 'absolute', top: '80%', left: '10%', width: '2px', height: '2px', background: 'white', borderRadius: '50%', opacity: 0.5
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '60%', width: '2px', height: '2px', background: 'white', borderRadius: '50%', opacity: 0.7
      }} />
    </div>
  );
};

export default StarBackground;
