import React from 'react';
import { motion } from 'framer-motion';

export function EmotionalSection() {
  return (
    <section style={{ 
      padding: 'var(--space-16) 0', 
      backgroundColor: 'transparent',
      color: 'var(--carbon)',
      textAlign: 'center'
    }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ 
            fontSize: 'var(--text-3xl)', 
            margin: 0,
            fontStyle: 'italic',
            fontWeight: '400',
            lineHeight: '1.5',
            color: 'var(--carbon)'
          }}
        >
          "No necesitas maquillaje para ser hermosa. Pero si decides usarlo, que sea para celebrar quién eres."
        </motion.h2>
      </div>
    </section>
  );
}
