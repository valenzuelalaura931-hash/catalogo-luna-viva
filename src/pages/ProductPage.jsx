import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MessageCircle, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { findProductVariants, parseProductVariant } from '../utils/productGrouping';

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = (e) => {
    if (e) e.preventDefault();
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 2) {
      navigate(-1);
    } else {
      const savedQuery = sessionStorage.getItem('lv_shop_filters_query');
      navigate(savedQuery ? `/shop?${savedQuery}` : '/shop');
    }
  };
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { isAdmin, openAuthModal } = useAuth();

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div style={{ padding: 'var(--space-16) 0', textAlign: 'center', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
        <div className="container">
          <h2>Producto no encontrado</h2>
          <p style={{ marginBottom: 'var(--space-6)' }}>Lo sentimos, el producto que buscas no existe.</p>
          <Link to="/shop">
            <Button variant="primary">Volver a la tienda</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Variantes de tono para este producto
  const productVariantsInfo = useMemo(() => {
    return findProductVariants(products, id);
  }, [products, id]);

  const { baseName: cleanBaseTitle, toneName: currentToneName } = parseProductVariant(product);

  // Galería de fotos del producto: mostrar estrictamente las fotos de este producto
  const allImages = useMemo(() => {
    const list = [];
    const isValidImg = (url) => {
      if (!url || typeof url !== 'string') return false;
      // Proteger para que el banner placeholder nunca se cuele como foto de producto
      if (url.includes('banner candy bum')) return false;
      return true;
    };

    if (isValidImg(product.mainImage) && !list.includes(product.mainImage)) {
      list.push(product.mainImage);
    }
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (isValidImg(img) && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : [isValidImg(product.mainImage) ? product.mainImage : '/img/Logo luna sin fondo.png'];
  }, [product.mainImage, product.images]);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const touchStartX = useRef(null);

  // Sincronizar foto activa si cambia el producto
  useEffect(() => {
    if (product.mainImage) {
      const idx = allImages.indexOf(product.mainImage);
      setCurrentImgIndex(idx >= 0 ? idx : 0);
    } else {
      setCurrentImgIndex(0);
    }
  }, [product.id, product.mainImage, allImages]);

  const activeImage = allImages[currentImgIndex] || allImages[0] || product.mainImage;
  const hasMultipleImages = allImages.length > 1;

  const handlePrevImg = (e) => {
    if (e) e.stopPropagation();
    setCurrentImgIndex(prev => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImg = (e) => {
    if (e) e.stopPropagation();
    setCurrentImgIndex(prev => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNextImg();
      else handlePrevImg();
    }
    touchStartX.current = null;
  };


  // Productos relacionados (misma categoría, excluyendo el actual y sus variantes hermanas)
  const relatedProducts = useMemo(() => {
    const siblingIds = productVariantsInfo ? new Set(productVariantsInfo.variants.map(v => v.id)) : new Set([product.id]);
    return products
      .filter(p => p.category === product.category && !siblingIds.has(p.id))
      .slice(0, 4);
  }, [products, product, productVariantsInfo]);

  const phoneNumber = "573218839425"; // Número oficial
  const toneSuffix = currentToneName ? ` (Tono: ${currentToneName})` : '';
  const waMessage = product.stock <= 0
    ? encodeURIComponent(`¡Hola Luna Viva! Me gustaría consultar cuándo vuelve a estar disponible: ${product.name}${toneSuffix} (SKU: ${product.sku})`)
    : encodeURIComponent(`¡Hola Luna Viva! Me gustaría comprar el producto: ${product.name}${toneSuffix} (SKU: ${product.sku})`);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: 'var(--space-10) 0' }}>
      <div className="container">

        {/* Botón de retroceso inteligente (mantiene filtros, búsqueda y scroll) */}
        <button
          type="button"
          onClick={handleGoBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-8)',
            fontSize: 'var(--text-sm)',
            fontWeight: '500',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          title="Regresar conservando tu búsqueda y filtros"
        >
          <ArrowLeft size={16} /> Volver a la Tienda
        </button>

        {/* Ficha del Producto */}
        <div className="product-detail" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-8)',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 'var(--space-16)'
        }}>

          {/* Galería de Fotos Interactiva (Izquierda) */}
          <div className="product-gallery-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="product-image-container"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'transparent',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              <img
                key={activeImage}
                src={activeImage}
                alt={`${product.name} - Foto ${currentImgIndex + 1}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '650px',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-lg)',
                  display: 'block',
                  transition: 'opacity 0.25s ease'
                }}
                onError={(e) => { e.target.src = '/img/Logo luna sin fondo.png'; }}
              />

              {/* Flechas de Navegación */}
              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    className="gallery-nav-arrow gallery-prev"
                    onClick={handlePrevImg}
                    aria-label="Foto anterior"
                    title="Foto anterior"
                  >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    className="gallery-nav-arrow gallery-next"
                    onClick={handleNextImg}
                    aria-label="Foto siguiente"
                    title="Foto siguiente"
                  >
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </button>


                </>
              )}
            </motion.div>

            {/* Tira de Miniaturas (Thumbnails) */}
            {hasMultipleImages && (
              <div
                className="gallery-thumbnails-strip"
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  padding: '4px 2px',
                  scrollbarWidth: 'thin'
                }}
              >
                {allImages.map((imgUrl, idx) => {
                  const isActive = idx === currentImgIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImgIndex(idx)}
                      style={{
                        flex: '0 0 66px',
                        height: '66px',
                        padding: '0',
                        borderRadius: '8px',
                        border: isActive ? '2.5px solid #8A5B66' : '1px solid rgba(0,0,0,0.12)',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        transform: isActive ? 'scale(1.04)' : 'scale(1)',
                        boxShadow: isActive ? '0 2px 8px rgba(138,91,102,0.25)' : 'none'
                      }}
                      title={`Ver foto ${idx + 1}`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Miniatura ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => { e.target.src = '/img/Logo luna sin fondo.png'; }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Información (Derecha) */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Banner de acceso de administración rápida si ya está autenticada */}
            {isAdmin && (
              <div style={{
                backgroundColor: '#FFF0F5',
                border: '1px solid #EAA3C7',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>👑</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#8A5B66' }}>Modo Administradora</span>
                </div>
                <Link
                  to={`/admin?edit=${product.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#FEDDE6',
                    color: '#1A1A1A',
                    fontWeight: '700',
                    fontSize: '12px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                  }}
                >
                  ✏️ Editar este producto
                </Link>
              </div>
            )}
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
              {product.brand}
            </span>
            <h1 className="product-title" style={{ fontSize: 'var(--text-4xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)', lineHeight: 1.2 }}>
              {product.name}
            </h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              SKU: {product.sku}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-3xl)', fontWeight: '700', color: product.stock <= 0 ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: product.stock <= 0 ? 'line-through' : 'none' }}>
                {product.price ? `$ ${product.price.toLocaleString('es-CO')}` : '[PRECIO POR DEFINIR]'}
              </span>
              {product.stock <= 0 ? (
                <span style={{
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '700',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: '0.04em'
                }}>
                  🔴 AGOTADO
                </span>
              ) : product.stock === 1 ? (
                <span style={{
                  backgroundColor: '#ffedd5',
                  color: '#c2410c',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '700',
                  fontSize: 'var(--text-xs)'
                }}>
                  ⚡ ¡Última unidad disponible!
                </span>
              ) : null}
            </div>

            {/* Selector de Tonos en Ficha de Producto */}
            {productVariantsInfo && productVariantsInfo.variants.length > 1 && (
              <div style={{
                marginBottom: 'var(--space-6)',
                backgroundColor: '#FFF5F8',
                padding: '14px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #F3E5EB'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Tono seleccionado: <strong style={{ color: '#8A5B66' }}>{currentToneName || 'Original'}</strong>
                  </label>
                  <span style={{ fontSize: '11px', color: '#888' }}>
                    {productVariantsInfo.variants.filter(v => (v.stock || 0) > 0).length} de {productVariantsInfo.variants.length} disponibles
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {productVariantsInfo.variants.map((v) => {
                    const isSelected = v.id === product.id;
                    const isOut = (Number(v.stock) || 0) <= 0;
                    return (
                      <Link
                        key={v.id}
                        to={`/product/${v.id}`}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: isSelected ? '700' : '500',
                          border: isSelected ? '2px solid #8A5B66' : '1px solid #E5E0E2',
                          backgroundColor: isSelected ? '#8A5B66' : isOut ? '#F5F5F5' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : isOut ? '#999999' : '#444444',
                          textDecoration: isOut && !isSelected ? 'line-through' : 'none',
                          opacity: isOut && !isSelected ? 0.65 : 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {v.toneName}
                        {isOut && <span style={{ fontSize: '9px', color: isSelected ? '#FFF' : '#C00' }}>(Agotado)</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Descripción del Producto */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ borderBottom: '1px solid var(--rosa-suave)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-2)' }}>
                <span
                  style={{
                    borderBottom: '2px solid var(--accent)',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-sm)',
                    paddingBottom: 'var(--space-2)',
                    display: 'inline-block'
                  }}
                >
                  Descripción
                </span>
              </div>

              <div style={{ minHeight: '60px', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                <p>{product.description}</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="product-ctas" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                size="lg"
                disabled={product.stock <= 0}
                onClick={() => product.stock > 0 && addToCart(product)}
                style={{
                  flexGrow: 1,
                  display: 'flex',
                  gap: '8px',
                  opacity: product.stock <= 0 ? 0.45 : 1,
                  cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <ShoppingBag size={20} /> {product.stock <= 0 ? 'Agotado' : 'Añadir a la Bolsa'}
              </Button>
              {product.stock > 0 && (
                <a
                  href={`https://wa.me/${phoneNumber}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flexGrow: 1 }}
                >
                  <Button variant="primary" size="lg" fullWidth style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <MessageCircle size={20} /> Comprar por WhatsApp
                  </Button>
                </a>
              )}
            </div>

          </div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-8)', textAlign: 'center' }}>
              También te puede gustar
            </h2>
            <div className="related-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 'var(--space-6)'
            }}>
              {relatedProducts.map((p) => (
                <div key={p.id} style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ height: '200px', backgroundImage: `url('${p.mainImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{p.brand}</span>
                    <h3 style={{ fontSize: 'var(--text-base)', margin: 'var(--space-1) 0 var(--space-2)' }}>{p.name}</h3>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600' }}>{p.price ? `$ ${p.price.toLocaleString('es-CO')}` : '[PRECIO]'}</span>
                      <Link to={`/product/${p.id}`}>
                        <Button variant="secondary" size="sm">Ver</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style>{`
        /* Flechas de navegación circulares en la página de producto (segunda foto) */
        .gallery-nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #E5E7EB;
          color: #1F2937;
          border: none;
          display: flex !important;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.16);
          transition: all 0.2s ease;
          opacity: 0.92;
          z-index: 10;
        }
        .gallery-nav-arrow:hover {
          background: #D1D5DB;
          color: #111827;
          opacity: 1;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
        }
        .gallery-prev { left: 14px; }
        .gallery-next { right: 14px; }

        .gallery-thumbnails-strip::-webkit-scrollbar {
          height: 6px;
        }
        .gallery-thumbnails-strip::-webkit-scrollbar-thumb {
          background: #e2c0ce;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .product-detail {
            grid-template-columns: 1fr !important;
            padding: var(--space-4) !important;
          }
          .product-image-container {
            height: auto !important;
          }
          .product-title {
            font-size: var(--text-2xl) !important;
          }
          .gallery-nav-arrow {
            width: 32px !important;
            height: 32px !important;
          }
          .gallery-prev { left: 8px !important; }
          .gallery-next { right: 8px !important; }
          .product-ctas {
            flex-direction: column !important;
          }
          .related-grid {
            display: flex !important;
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: var(--space-4) !important;
            padding-bottom: var(--space-4);
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .related-grid::-webkit-scrollbar {
            display: none;
          }
          .related-grid > div {
            min-width: 160px;
            flex: 0 0 auto;
            scroll-snap-align: start;
          }
        }
      `}</style>
    </div>
  );
}
