import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function PageLoader() {
  const { pathname } = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loader on route change
    setIsLoading(true);
    
    // Hide loader after a short delay to simulate loading and show the animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 230, 240, 0.85)', // Fondo rosado transparentoso
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <motion.img
            src="/img/Logo luna sin fondo.png"
            alt="Luna Viva Logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.1, 1], 
              opacity: 1 
            }}
            transition={{ 
              duration: 0.5,
              ease: "easeOut"
            }}
            style={{
              width: '150px',
              height: 'auto',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
