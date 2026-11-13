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
      <Link to={`/product/${product.id}`} style={{ display: 'block', height: '240px', overflow: 'hidden', position: 'relative' }}>
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
              fontSize: '12px',
              fontWeight: '700',
              padding: '6px 14px',
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
      <div style={{
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
      }}>
        <span style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '4px'
        }}>
          {product.brand}
        </span>
        
        <h3 style={{
          fontSize: 'var(--text-base)',
          fontWeight: '500',
          margin: '0 0 var(--space-2)',
          lineHeight: '1.4',
          height: '44px',
          overflow: 'hidden'
        }}>
          <Link to={`/product/${product.id}`} style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </Link>
        </h3>

        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontWeight: '600',
              fontSize: 'var(--text-lg)',
              color: product.stock <= 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
              textDecoration: product.stock <= 0 ? 'line-through' : 'none'
            }}>
              {product.price ? `$ ${product.price.toLocaleString('es-CO')}` : '[PRECIO POR DEFINIR]'}
            </span>
            {product.stock <= 0 ? (
              <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '700' }}>
                Agotado
              </span>
            ) : product.stock === 1 ? (
              <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: '700' }}>
                ¡Última!
              </span>
            ) : null}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                <Button variant="primary" size="sm" fullWidth style={{ display: 'flex', gap: '4px', backgroundColor: '#25D366', color: 'white' }}>
                  <MessageCircle size={14} /> Asesoría
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
