import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function Categories() {
  const navigate = useNavigate();
  
  const categories = [
    { name: 'Maquillaje', img: '/img/maquillaje.svg', desc: 'Resalta tu belleza' },
    { name: 'Skincare', img: '/img/skincare.svg', desc: 'Cuida tu piel' },
    { name: 'Capilar', img: '/img/capilar.svg', desc: 'Cabello radiante' },
    { name: 'Accesorios', img: '/img/accesorios.svg', desc: 'Tus aliados diarios' },
    { name: 'Corporal', img: '/img/corporal.svg', desc: 'Bienestar total' }
  ];

  return (
    <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <h2 style={{ fontSize: 'var(--text-4xl)', color: 'var(--text-primary)' }}>Encuentra tu estilo</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Explora nuestras categorías</p>
        </div>

        <div className="categories-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 'var(--space-6)'
        }}>
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              style={{
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{
                height: '160px',
                margin: '0 auto',
                width: '160px',
                backgroundImage: `url('${cat.img}')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }} />
              <div style={{ padding: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>{cat.name}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{cat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .categories-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: var(--space-4) !important;
          }
        }
      `}</style>
    </section>
  );
}
