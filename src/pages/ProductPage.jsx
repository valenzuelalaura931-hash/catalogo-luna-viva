import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MessageCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

export function ProductPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('description');
  const { addToCart } = useCart();
  const { products } = useProducts();

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

  // Productos relacionados (misma categoría, excluyendo el actual)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const phoneNumber = "573218839425"; // Número oficial
  const waMessage = product.stock <= 0
    ? encodeURIComponent(`¡Hola Luna Viva! Me gustaría consultar cuándo vuelve a estar disponible: ${product.name} (SKU: ${product.sku})`)
    : encodeURIComponent(`¡Hola Luna Viva! Me gustaría comprar el producto: ${product.name} (SKU: ${product.sku})`);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: 'var(--space-10) 0' }}>
      <div className="container">
        
        {/* Botón de retroceso */}
        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Volver a la Tienda
        </Link>

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
          
          {/* Imagen (Izquierda) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="product-image-container"
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: 'var(--rosa-suave)',
              height: '450px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img 
              src={product.mainImage} 
              alt={product.name} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </motion.div>

          {/* Información (Derecha) */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                  🔴 AGOTADO EN BOUTIQUE
                </span>
              ) : product.stock <= 2 ? (
                <span style={{
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '700',
                  fontSize: 'var(--text-xs)'
                }}>
                  ⚡ ¡Solo quedan {product.stock} unidades!
                </span>
              ) : (
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '600',
                  fontSize: 'var(--text-xs)'
                }}>
                  ✓ Disponible ({product.stock} en stock)
                </span>
              )}
            </div>

            {/* Tabs de Información */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div className="product-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--rosa-suave)', marginBottom: 'var(--space-4)', overflowX: 'auto' }}>
                <button 
                  onClick={() => setActiveTab('description')}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    borderBottom: activeTab === 'description' ? '2px solid var(--accent)' : 'none',
                    fontWeight: activeTab === 'description' ? '600' : '400',
                    color: activeTab === 'description' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Descripción
                </button>
                <button 
                  onClick={() => setActiveTab('benefits')}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    borderBottom: activeTab === 'benefits' ? '2px solid var(--accent)' : 'none',
                    fontWeight: activeTab === 'benefits' ? '600' : '400',
                    color: activeTab === 'benefits' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Beneficios
                </button>
                <button 
                  onClick={() => setActiveTab('usage')}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    borderBottom: activeTab === 'usage' ? '2px solid var(--accent)' : 'none',
                    fontWeight: activeTab === 'usage' ? '600' : '400',
                    color: activeTab === 'usage' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: 'var(--text-sm)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Modo de uso
                </button>
              </div>

              <div style={{ minHeight: '80px', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.6 }}>
                {activeTab === 'description' && <p>{product.description}</p>}
                {activeTab === 'benefits' && <p>{product.benefits}</p>}
                {activeTab === 'usage' && <p>{product.howToUse}</p>}
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
              <a 
                href={`https://wa.me/${phoneNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flexGrow: 1 }}
              >
                <Button variant="primary" size="lg" fullWidth style={{
                  display: 'flex',
                  gap: '8px',
                  backgroundColor: product.stock <= 0 ? '#4b5563' : '#25D366',
                  color: 'white'
                }}>
                  <MessageCircle size={20} /> {product.stock <= 0 ? 'Consultar reposición por WhatsApp' : 'Comprar por WhatsApp'}
                </Button>
              </a>
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
        @media (max-width: 768px) {
          .product-detail {
            grid-template-columns: 1fr !important;
            padding: var(--space-4) !important;
          }
          .product-image-container {
            height: 300px !important;
          }
          .product-title {
            font-size: var(--text-2xl) !important;
          }
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
