import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/shop/ProductCard';
import { FilterSidebar } from '../components/shop/FilterSidebar';
import { Button } from '../components/ui/Button';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export function ShopPage() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const brandParam = searchParams.get('brand');
  const searchParam = searchParams.get('search');

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'Todas');
  const [selectedBrand, setSelectedBrand] = useState(brandParam || 'Todas');
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(24);

  // Sincronizar los estados si cambian los parámetros en la URL
  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (brandParam) setSelectedBrand(brandParam);
    if (searchParam !== null) setSearchQuery(searchParam);
  }, [categoryParam, brandParam, searchParam]);

  // Reiniciar paginación al cambiar filtros
  useEffect(() => {
    setVisibleLimit(24);
  }, [selectedCategory, selectedBrand, searchQuery]);

  // Extraer categorías y marcas únicas de los datos
  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);
  const brands = [...new Set(products.map(p => p.brand))].filter(Boolean).sort();

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'Todas' ||
      product.category === selectedCategory ||
      (selectedCategory === 'Accesorios' && (product.category === 'Accesorios de Maquillaje' || product.category === 'Accesorios')) ||
      (selectedCategory === 'Accesorios de Maquillaje' && (product.category === 'Accesorios' || product.category === 'Accesorios de Maquillaje')) ||
      (selectedCategory === 'Cabello' && product.category === 'Capilar');
    const matchesBrand = selectedBrand === 'Todas' || product.brand === selectedBrand;
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesBrand && matchesSearch;
  });

  const visibleProducts = filteredProducts.slice(0, visibleLimit);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: 'var(--space-10) 0' }}>
      <div className="container">

        {/* Header de la tienda */}
        <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
          <h1 className="shop-title" style={{ fontSize: 'var(--text-5xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            Todo para tu momento Luna
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Explora nuestra selección de maquillaje, skincare y accesorios.
          </p>
        </div>

        {/* Categorías (Limpio, sin fondo rosa) */}
        <div style={{
          marginBottom: 'var(--space-8)',
          textAlign: 'center',
          padding: 'var(--space-2) 0'
        }}>
          <h2 style={{
            fontSize: '28px',
            color: '#3B3537',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: '600',
            margin: '0 0 var(--space-5) 0',
            fontFamily: 'serif'
          }}>
            {selectedCategory === 'Todas' ? 'TODOS LOS PRODUCTOS' : selectedCategory.toUpperCase()}
          </h2>

          {/* Selector de Categorías (Pills limpias) */}
          <div className="category-chips-scroll" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            padding: '4px 0'
          }}>
            {['Todas', 'Maquillaje', 'Skincare', 'Capilar', 'Accesorios', 'Corporal'].map((cat) => {
              const isSelected = selectedCategory === cat || 
                (cat === 'Accesorios' && (selectedCategory === 'Accesorios de Maquillaje' || selectedCategory === 'Accesorios')) ||
                (cat === 'Capilar' && selectedCategory === 'Cabello');
              return (
                <button
                  key={cat}
                  onClick={() => {
                    const targetCategory = cat === 'Accesorios' ? 'Accesorios' : cat;
                    setSelectedCategory(targetCategory);
                    setSearchParams(targetCategory === 'Todas' ? {} : { category: targetCategory });
                  }}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '24px',
                    fontSize: '13px',
                    fontWeight: isSelected ? '600' : '500',
                    border: isSelected ? '1px solid #3B3537' : '1px solid #E5E0E2',
                    backgroundColor: isSelected ? '#3B3537' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#555555',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buscador removed as per user request */}

        {/* Mobile: Filter toggle button */}
        <div className="mobile-only" style={{
          justifyContent: 'center',
          marginBottom: 'var(--space-6)'
        }}>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              border: '1px solid var(--rosa-suave)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'white',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            <SlidersHorizontal size={16} />
            {showMobileFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {/* Mobile: Collapsible filter panel */}
        {showMobileFilters && (
          <div className="mobile-only" style={{
            marginBottom: 'var(--space-6)',
            display: 'block !important'
          }}>
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              categories={categories}
              brands={brands}
            />
          </div>
        )}

        {/* Layout Principal: Sidebar + Grid */}
        <div className="shop-layout" style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 'var(--space-8)'
        }}>
          {/* Desktop sidebar */}
          <div className="desktop-only" style={{ display: 'block' }}>
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              categories={categories}
              brands={brands}
            />
          </div>

          {/* Grid de productos */}
          <div>
            {visibleProducts.length > 0 ? (
              <>
                <div className="products-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 'var(--space-6)'
                }}>
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {filteredProducts.length > visibleLimit && (
                  <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
                    <Button variant="primary" onClick={() => setVisibleLimit(prev => prev + 24)}>
                      Mostrar más productos ({visibleLimit} de {filteredProducts.length})
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: 'var(--space-16)',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>No se encontraron productos</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Intenta ajustar los filtros o el término de búsqueda.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .shop-layout {
            grid-template-columns: 1fr !important;
          }
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
          }
          .category-chips-scroll {
            justify-content: flex-start !important;
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            padding: 8px 6px !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .category-chips-scroll::-webkit-scrollbar {
            display: none;
          }
          .category-chips-scroll button {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
