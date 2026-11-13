import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhatsAppButton() {
  // Número de prueba temporal
  const phoneNumber = "573218839425";
  const message = encodeURIComponent("¡Hola! Me gustaría recibir asesoría sobre sus productos.");

  return (
    <motion.a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        right: 'var(--space-6)',
        width: '115px',
        zIndex: 1000,
        cursor: 'pointer'
      }}
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
  );
}
