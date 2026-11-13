import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useProducts } from '../../context/ProductsContext';

export function FeaturedProducts() {
  const navigate = useNavigate();
  const { products: allProducts } = useProducts();
  // Get 4 bestsellers in stock
  const products = allProducts.filter(p => p.stock > 0 && p.isBestseller).slice(0, 4);

  return (
    <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--rosa-suave)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <h2 style={{ fontSize: 'var(--text-4xl)', color: 'var(--text-primary)' }}>Favoritos de Luna</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Los productos más amados por nuestra comunidad</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 'var(--space-6)'
        }}>
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                height: '250px',
                backgroundImage: `url('${p.mainImage}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <div style={{ padding: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.brand}</span>
                <h3 style={{ fontSize: 'var(--text-lg)', margin: 'var(--space-1) 0 var(--space-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{p.price ? `$${p.price.toLocaleString()}` : 'Próximamente'}</span>
                  <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/product/${p.id}`); }}>Ver más</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
          <Button variant="outline" size="lg" onClick={() => navigate('/shop')}>Ver todo el catálogo</Button>
        </div>
      </div>
    </section>
  );
}
