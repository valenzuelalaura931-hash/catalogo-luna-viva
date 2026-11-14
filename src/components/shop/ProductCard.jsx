import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function ProductCard({ product }) {
  const location = useLocation();

  const handleProductClick = () => {
    try {
      if (window.scrollY > 0) {
        sessionStorage.setItem('lv_shop_scroll', window.scrollY.toString());
      }
    } catch (e) {}
  };

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

  // Recopilar todas las fotos del card (fotos del tono actual + fotos generales + fotos de otras variantes)
  const allImages = React.useMemo(() => {
    const list = [];
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      selectedVariant.images.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (selectedVariant?.mainImage && !list.includes(selectedVariant.mainImage)) {
      list.unshift(selectedVariant.mainImage);
    }
    if (product?.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (product?.mainImage && !list.includes(product.mainImage)) {
      list.push(product.mainImage);
    }
    if (product?.variants && product.variants.length > 1) {
      product.variants.forEach(v => {
        if (v.mainImage && !list.includes(v.mainImage)) {
          list.push(v.mainImage);
        }
        if (v.images && v.images.length > 0) {
          v.images.forEach(img => {
            if (img && !list.includes(img)) list.push(img);
          });
        }
      });
    }
    return list.length > 0 ? list : [product.mainImage || '/img/Logo luna sin fondo.png'];
  }, [product, selectedVariant]);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Sincronizar foto al cambiar variante
  useEffect(() => {
    if (selectedVariant?.mainImage) {
      const idx = allImages.indexOf(selectedVariant.mainImage);
      if (idx !== -1) setCurrentImgIndex(idx);
      else setCurrentImgIndex(0);
    } else {
      setCurrentImgIndex(0);
    }
  }, [selectedVariant, allImages]);

  const hasMultipleImages = allImages.length > 1;
  const activeImage = allImages[currentImgIndex] || allImages[0];

  const handlePrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

    const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNextImage(e);
      else handlePrevImage(e);
    }
    touchStartX.current = null;
  };

  const handleDotClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex(idx);
  };

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

      {/* Imagen del Producto con Slider Multi-Foto */}
      <div className="product-card-img-wrapper" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
        <Link to={`/product/${currentId}`} state={{ from: location.pathname + location.search }} onClick={handleProductClick} className="product-card-img-link" style={{ height: '100%', display: 'block' }}>
          <div
            key={activeImage}
            style={{
              height: '100%',
              backgroundImage: `url('${activeImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.3s ease',
              filter: currentStock <= 0 ? 'grayscale(80%) opacity(0.65)' : 'none'
            }}
          />
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

        {/* Flechas de Navegación de Fotos */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              className="card-photo-nav-arrow card-photo-prev"
              onClick={handlePrevImage}
              aria-label="Foto anterior"
              title="Foto anterior"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="card-photo-nav-arrow card-photo-next"
              onClick={handleNextImage}
              aria-label="Foto siguiente"
              title="Foto siguiente"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>

            {/* Contador de fotos (ej: 1/4) */}
            <div className="card-photo-counter-badge">
              📷 {currentImgIndex + 1}/{allImages.length}
            </div>

            {/* Indicador de Puntos (Dots) */}
            <div className="card-photo-dots-row">
              {allImages.slice(0, 6).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`card-photo-dot-item ${idx === currentImgIndex ? 'active' : ''}`}
                  onClick={(e) => handleDotClick(e, idx)}
                  aria-label={`Foto ${idx + 1}`}
                />
              ))}
              {allImages.length > 6 && (
                <span style={{ color: 'white', fontSize: '9px', fontWeight: 'bold' }}>+</span>
              )}
            </div>
          </>
        )}
      </div>

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
          <Link to={`/product/${currentId}`} state={{ from: location.pathname + location.search }} onClick={handleProductClick} style={{ color: 'var(--text-primary)' }}>
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
            <Link to={`/product/${currentId}`} state={{ from: location.pathname + location.search }} onClick={handleProductClick} style={{ width: '100%' }}>
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
          height: 100%;
          overflow: hidden;
          position: relative;
        }
        .card-photo-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #E5E7EB;
          color: #1F2937;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.88;
          transition: all 0.2s ease;
          z-index: 5;
        }
        .product-card-img-wrapper:hover .card-photo-nav-arrow {
          opacity: 1;
        }
        .card-photo-nav-arrow:hover {
          background: #D1D5DB;
          color: #111827;
          opacity: 1;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
        }
        .card-photo-prev {
          left: 8px;
        }
        .card-photo-next {
          right: 8px;
        }
        .card-photo-counter-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 10px;
          font-weight: 600;
          backdrop-filter: blur(4px);
          z-index: 4;
        }
        .card-photo-dots-row {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.45);
          padding: 3px 8px;
          border-radius: 12px;
          backdrop-filter: blur(4px);
          z-index: 4;
        }
        .card-photo-dot-item {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .card-photo-dot-item.active {
          background: white;
          transform: scale(1.35);
          width: 8px;
        }
        @media (max-width: 768px) {
          .card-photo-nav-arrow {
            opacity: 0.85 !important;
            width: 26px !important;
            height: 26px !important;
            font-size: 18px !important;
          }
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
