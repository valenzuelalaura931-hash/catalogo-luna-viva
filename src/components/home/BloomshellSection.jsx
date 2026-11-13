import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export function BloomshellSection() {
  const navigate = useNavigate();

  return (
    <section style={{ backgroundColor: 'var(--rosa-blush)', padding: 'var(--space-16) 0', overflow: 'hidden' }}>
      <div className="container bloom-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-10)',
        alignItems: 'center'
      }}>
        <motion.div
          className="bloom-text"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{ fontSize: 'var(--text-5xl)', color: 'var(--carbon)', marginBottom: 'var(--space-4)', lineHeight: 1 }}>
            Pink Mood <br/>
            <span style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>Bloomshell</span>
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)', marginBottom: 'var(--space-6)', opacity: 0.9 }}>
            Descubre nuestra línea exclusiva de Bloomshell. Colores vibrantes, fórmulas duraderas y un estilo inconfundible para que brilles con luz propia.
          </p>
          <Button variant="primary" size="lg" onClick={() => navigate('/shop?brand=Bloomshell')}>Ver Colección Bloomshell</Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bloom-image"
          style={{
            position: 'relative',
            height: '400px',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("/img/BloomCapuchicBloomshell_1.webp")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bloom-grid {
            display: flex !important;
            flex-direction: column;
            text-align: center;
          }
          .bloom-image {
            height: 280px !important;
            order: 1;
            width: 100%;
          }
          .bloom-text {
            order: 2;
          }
        }
      `}</style>
    </section>
  );
}
