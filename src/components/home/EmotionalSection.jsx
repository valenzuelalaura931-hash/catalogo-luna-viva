import React from 'react';
import { motion } from 'framer-motion';

export function EmotionalSection() {
  return (
    <section style={{ 
      padding: 'var(--space-20) 0', 
      backgroundColor: 'var(--rosa-luna)',
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
            fontSize: 'var(--text-4xl)', 
            marginBottom: 'var(--space-6)',
            fontStyle: 'italic',
            fontWeight: '400',
            lineHeight: '1.4',
            color: 'var(--carbon)'
          }}
        >
          "No necesitas maquillaje para ser hermosa. Pero si decides usarlo, que sea para celebrar quién eres."
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            width: '60px',
            height: '2px',
            backgroundColor: 'var(--accent)',
            margin: '0 auto var(--space-6)'
          }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{ fontSize: 'var(--text-lg)', color: 'var(--cafe-rosado)' }}
        >
          — Amanda & Laura, Fundadoras de Luna Viva Beauty
        </motion.p>
      </div>
    </section>
  );
}
