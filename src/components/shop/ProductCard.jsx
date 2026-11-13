import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Sparkles, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProductCard({ product }) {
  // Generar el mensaje de WhatsApp para este producto
  const phoneNumber = "573218839425"; // Número oficial
  const waMessage = encodeURIComponent(`¡Hola! Me interesa obtener información del producto: ${product.name} (${product.brand})`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
      style={{
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Badges */}
      <div style={{
        position: 'absolute',
        top: 'var(--space-2)',
        left: 'var(--space-2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 10
      }}>
        {product.stock <= 0 ? (
          <span style={{
            backgroundColor: '#e11d48',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            letterSpacing: '0.04em'
          }}>
            🔴 AGOTADO
          </span>
        ) : product.stock === 1 ? (
          <span style={{
            backgroundColor: '#ea580c',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            ⚡ ¡Última unidad!
          </span>
        ) : null}

        {product.lunaRecommends && product.stock > 0 && (
          <span style={{
            backgroundColor: 'var(--dorado-luna)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            🌙 Recomienda
          </span>
        )}
        {product.isNew && product.stock > 0 && (
          <span style={{
            backgroundColor: 'var(--rosa-blush)',
            color: 'var(--text-primary)',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            Nuevo
          </span>
        )}
      </div>

      {/* Imagen */}
      <Link to={`/product/${product.id}`} className="product-card-img-link">
        <div style={{
          height: '100%',
          backgroundImage: `url('${product.mainImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform var(--duration-normal) var(--ease-smooth)',
          filter: product.stock <= 0 ? 'grayscale(80%) opacity(0.65)' : 'none'
        }} />
        {product.stock <= 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.15)'
          }}>
            <span style={{
              backgroundColor: 'rgba(225, 29, 72, 0.9)',
              color: 'white',
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              Agotado
            </span>
          </div>
        )}
      </Link>

      {/* Contenido */}
      <div className="product-card-content">
        <span style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '3px'
        }}>
          {product.brand}
        </span>

        <h3 className="product-card-title">
          <Link to={`/product/${product.id}`} style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </Link>
        </h3>

        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span className="product-card-price" style={{
              color: product.stock <= 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
              textDecoration: product.stock <= 0 ? 'line-through' : 'none'
            }}>
              {product.price ? `$ ${product.price.toLocaleString('es-CO')}` : '[PRECIO POR DEFINIR]'}
            </span>
            {product.stock <= 0 ? (
              <span style={{ fontSize: '10px', color: '#e11d48', fontWeight: '700' }}>
                Agotado
              </span>
            ) : product.stock === 1 ? (
              <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: '700' }}>
                ¡Última!
              </span>
            ) : null}
          </div>

          <div className="product-card-actions">
            <Link to={`/product/${product.id}`} style={{ width: '100%' }}>
              <Button variant="secondary" size="sm" fullWidth>Detalles</Button>
            </Link>
            {product.stock <= 0 ? (
              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(`¡Hola Luna Viva! Me gustaría consultar cuándo vuelve a estar disponible: ${product.name} (${product.brand})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '100%' }}
              >
                <Button variant="outline" size="sm" fullWidth style={{ fontSize: '11px', color: '#666', border: '1px solid #ddd' }}>
                  Avisarme
                </Button>
              </a>
            ) : (
              <a
                href={`https://wa.me/${phoneNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '100%' }}
              >
                <Button variant="primary" size="sm" fullWidth style={{ display: 'flex', gap: '3px', backgroundColor: '#25D366', color: 'white' }}>
                  <MessageCircle size={13} /> Asesoría
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .product-card-img-link {
          display: block;
          height: 230px;
          overflow: hidden;
          position: relative;
        }
        .product-card-content {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .product-card-title {
          font-size: var(--text-base);
          font-weight: 500;
          margin: 0 0 var(--space-2);
          line-height: 1.4;
          height: 44px;
          overflow: hidden;
        }
        .product-card-price {
          font-weight: 600;
          font-size: var(--text-lg);
        }
        .product-card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        @media (max-width: 768px) {
          .product-card-img-link {
            height: 165px !important;
          }
          .product-card-content {
            padding: 10px 8px !important;
          }
          .product-card-title {
            font-size: 13px !important;
            height: 34px !important;
            line-height: 1.3 !important;
          }
          .product-card-price {
            font-size: 14px !important;
          }
          .product-card-actions {
            gap: 4px !important;
          }
          .product-card-actions button {
            padding: 6px 2px !important;
            font-size: 11px !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
