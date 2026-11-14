import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProductCard({ product }) {
  // Manejo de variantes de tono si el producto está agrupado
  const [selectedVariant, setSelectedVariant] = useState(() => {
    return product.defaultVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : product);
  });

  // Sincronizar si cambia la prop
  useEffect(() => {
    setSelectedVariant(product.defaultVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : product));
  }, [product]);

  const currentStock = Number(selectedVariant?.stock) || 0;
  const currentPrice = Number(selectedVariant?.price) || Number(product.price) || 0;
  const currentImage = selectedVariant?.mainImage || product.mainImage;
  const currentId = selectedVariant?.id || product.id;
  const hasMultipleTones = Boolean(product.hasMultipleTones && product.variants && product.variants.length > 1);

  // Mensaje de WhatsApp dinámico con el tono seleccionado
  const phoneNumber = "573218839425";
  const toneText = hasMultipleTones && selectedVariant?.toneName ? ` - Tono: ${selectedVariant.toneName}` : '';
  const waMessage = encodeURIComponent(
    `¡Hola! Me interesa obtener información del producto: ${product.name}${toneText} (${product.brand})`
  );

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
      {/* Badges de Estado */}
      <div style={{
        position: 'absolute',
        top: 'var(--space-2)',
        left: 'var(--space-2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 10
      }}>
        {currentStock <= 0 ? (
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
        ) : currentStock === 1 ? (
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
        ) : hasMultipleTones ? (
          <span style={{
            backgroundColor: '#8A5B66',
            color: 'white',
            fontSize: '9.5px',
            fontWeight: '600',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            letterSpacing: '0.03em'
          }}>
            {product.variants.length} Tonos
          </span>
        ) : null}

        {product.lunaRecommends && currentStock > 0 && (
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
      </div>

      {/* Imagen del Producto */}
      <Link to={`/product/${currentId}`} className="product-card-img-link">
        <div style={{
          height: '100%',
          backgroundImage: `url('${currentImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform var(--duration-normal) var(--ease-smooth)',
          filter: currentStock <= 0 ? 'grayscale(80%) opacity(0.65)' : 'none'
        }} />
        {currentStock <= 0 && (
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
          <Link to={`/product/${currentId}`} style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </Link>
        </h3>

        {/* Selector de Tonos dentro del Card */}
        {hasMultipleTones && (
          <div style={{ marginBottom: '8px', marginTop: '2px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', color: '#777', fontWeight: '500' }}>
                Tono: <strong style={{ color: '#8A5B66' }}>{selectedVariant?.toneName}</strong>
              </span>
              <span style={{ fontSize: '9.5px', color: '#999' }}>
                {product.variants.filter(v => (v.stock || 0) > 0).length} de {product.variants.length} disponibles
              </span>
            </div>
            
            <div className="product-card-tones-scroll" style={{
              display: 'flex',
              gap: '4px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const isOutOfStock = (Number(v.stock) || 0) <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                    title={`${v.toneName} ${isOutOfStock ? '(Agotado)' : ''}`}
                    style={{
                      padding: '3px 7px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: isSelected ? '700' : '500',
                      border: isSelected ? '1.5px solid #8A5B66' : '1px solid #E5E0E2',
                      backgroundColor: isSelected ? '#8A5B66' : isOutOfStock ? '#F7F7F7' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : isOutOfStock ? '#999999' : '#444444',
                      textDecoration: isOutOfStock && !isSelected ? 'line-through' : 'none',
                      opacity: isOutOfStock && !isSelected ? 0.6 : 1,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {v.toneName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
              color: currentStock <= 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
              textDecoration: currentStock <= 0 ? 'line-through' : 'none'
            }}>
              {currentPrice ? `$ ${currentPrice.toLocaleString('es-CO')}` : '[PRECIO POR DEFINIR]'}
            </span>
            {currentStock <= 0 ? (
              <span style={{ fontSize: '10px', color: '#e11d48', fontWeight: '700' }}>
                Agotado
              </span>
            ) : currentStock === 1 ? (
              <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: '700' }}>
                ¡Última!
              </span>
            ) : null}
          </div>

          <div className="product-card-actions">
            <Link to={`/product/${currentId}`} style={{ width: '100%' }}>
              <Button variant="secondary" size="sm" fullWidth>Detalles</Button>
            </Link>
            {currentStock <= 0 ? (
              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(`¡Hola Luna Viva! Me gustaría consultar cuándo vuelve a estar disponible: ${product.name}${toneText} (${product.brand})`)}`}
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
          height: 40px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
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
        .product-card-tones-scroll::-webkit-scrollbar {
          display: none;
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
