import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const banners = [
  { src: '/img/banner-chocolate-rosado-lluvia.webp', alt: 'Suavidad y Reparación Extrema - Chocolate Rosado' },
  { src: '/img/banner candy bum.png', alt: 'Dulzura que envuelve tu piel - Candy Bum' },
];

export function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* Image container using grid to stack without forced aspect ratios */}
      <div style={{ display: 'grid', width: '100%' }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={banners[current].src}
            alt={banners[current].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              gridArea: '1 / 1 / 2 / 2',
              width: '100%',
              height: 'auto',
              display: 'block',
              imageRendering: 'high-quality'
            }}
          />
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 10
      }}>
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: current === idx ? '28px' : '10px',
              height: '10px',
              borderRadius: '5px',
              backgroundColor: current === idx ? '#EAA3C7' : 'rgba(255,255,255,0.6)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0
            }}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          /* Responsive adjustments if needed */
        }
      `}</style>
    </section>
  );
}
