import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
// Button removed as per user request
// no icons needed
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

  const currentStock = product.totalStock !== undefined ? Number(product.totalStock) : (Number(selectedVariant?.stock) || 0);
  const currentPrice = Number(selectedVariant?.price) || Number(product.price) || 0;
  const currentImage = selectedVariant?.mainImage || product.mainImage;
  const currentId = selectedVariant?.id || product.id;
  const hasMultipleTones = Boolean(product.hasMultipleTones && product.variants && product.variants.length > 1);

  // Recopilar todas las fotos del card (fotos del tono actual + fotos generales + fotos de otras variantes)
  const allImages = React.useMemo(() => {
    const list = [];
    const target = selectedVariant || product;
    const isValidImg = (url) => {
      if (!url || typeof url !== 'string') return false;
      if (url.includes('banner candy bum')) return false;
      return true;
    };
    if (Array.isArray(target?.images) && target.images.length > 0) {
      target.images.forEach(img => {
        if (isValidImg(img) && !list.includes(img)) list.push(img);
      });
    } else if (isValidImg(target?.mainImage)) {
      list.push(target.mainImage);
    }
    return list.length > 0 ? list : [product?.mainImage || '/img/Logo luna sin fondo.png'];
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
      <div className="product-card-img-wrapper" style={{
        position: 'relative',
        height: '230px',
        overflow: 'hidden',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)'
      }}>
        <Link to={`/product/${currentId}`} state={{ from: location.pathname + location.search }} onClick={handleProductClick} className="product-card-img-link" style={{ height: '100%', display: 'block' }}>
          <div
            key={activeImage}
            style={{
              height: '100%',
              backgroundImage: `url('${activeImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderTopLeftRadius: 'var(--radius-lg)',
              borderTopRightRadius: 'var(--radius-lg)',
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


        </div>
      </div>

      <style>{`
        .product-card-img-link {
          display: block;
          height: 100%;
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
        }
      `}</style>
    </motion.div>
  );
}
