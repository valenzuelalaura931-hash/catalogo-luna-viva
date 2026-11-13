import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhatsAppButton() {
  // Número de prueba temporal
  const phoneNumber = "573218839425";
  const message = encodeURIComponent("¡Hola! Me gustaría recibir asesoría sobre sus productos.");

  return (
    <>
      <motion.a
        href={`https://wa.me/${phoneNumber}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="floating-whatsapp-btn"
      >
        <img
          src="/img/whatsapp.png"
          alt="Asesoría por WhatsApp"
          style={{
            width: '100%',
            height: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
          }}
        />
      </motion.a>
      <style>{`
        .floating-whatsapp-btn {
          position: fixed;
          bottom: 24px;
          right: 20px;
          width: 85px;
          z-index: 1000;
          cursor: pointer;
        }
        @media (max-width: 768px) {
          .floating-whatsapp-btn {
            width: 62px !important;
            bottom: 16px !important;
            right: 12px !important;
          }
        }
      `}</style>
    </>
  );
}
