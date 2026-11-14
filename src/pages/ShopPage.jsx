import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { ProductCard } from '../components/shop/ProductCard';
import { FilterSidebar } from '../components/shop/FilterSidebar';
import { Button } from '../components/ui/Button';
import { SlidersHorizontal, X } from 'lucide-react';
import { groupProducts } from '../utils/productGrouping';

export function ShopPage() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  // Función para obtener filtros iniciales de la URL o recuperarlos de sessionStorage
  const getInitialFilters = () => {
    const urlCat = searchParams.get('category');
    const urlBrand = searchParams.get('brand');
    const urlSearch = searchParams.get('search');
    const urlLimit = searchParams.get('limit');

    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem('lv_shop_filters') || 'null');
    } catch (e) {}

    const hasUrlParams = urlCat !== null || urlBrand !== null || urlSearch !== null || urlLimit !== null;

    if (hasUrlParams) {
      return {
        category: urlCat || 'Todas',
        brand: urlBrand || 'Todas',
        search: urlSearch || '',
        limit: urlLimit ? parseInt(urlLimit, 10) : 24
      };
    }

    if (saved) {
      return {
        category: saved.category || 'Todas',
        brand: saved.brand || 'Todas',
        search: saved.search || '',
        limit: saved.limit || 24
      };
    }

    return { category: 'Todas', brand: 'Todas', search: '', limit: 24 };
  };

  const initial = useMemo(getInitialFilters, []);
  const [selectedCategory, setSelectedCategory] = useState(initial.category);
  const [selectedBrand, setSelectedBrand] = useState(initial.brand);
  const [searchQuery, setSearchQuery] = useState(initial.search);
  const [visibleLimit, setVisibleLimit] = useState(initial.limit);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const scrollRestoredRef = useRef(false);

  // Sincronizar si cambian los parámetros en la URL (ej: clics en header nav)
  useEffect(() => {
    const urlCat = searchParams.get('category');
    const urlBrand = searchParams.get('brand');
    const urlSearch = searchParams.get('search');
    const urlLimit = searchParams.get('limit');

    if (urlCat !== null && urlCat !== selectedCategory) {
      setSelectedCategory(urlCat);
    }
    if (urlBrand !== null && urlBrand !== selectedBrand) {
      setSelectedBrand(urlBrand);
    }
    if (urlSearch !== null && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
    if (urlLimit && parseInt(urlLimit, 10) !== visibleLimit) {
      setVisibleLimit(parseInt(urlLimit, 10));
    }
  }, [searchParams]);

  // Actualizador centralizado de filtros que sincroniza URL y sessionStorage
  const updateFilters = (newCat, newBrand, newSearch, newLimit) => {
    const nextCat = newCat !== undefined ? newCat : selectedCategory;
    const nextBrand = newBrand !== undefined ? newBrand : selectedBrand;
    const nextSearch = newSearch !== undefined ? newSearch : searchQuery;
    const nextLimit = newLimit !== undefined ? newLimit : visibleLimit;

    setSelectedCategory(nextCat);
    setSelectedBrand(nextBrand);
    setSearchQuery(nextSearch);
    if (newLimit !== undefined) {
      setVisibleLimit(nextLimit);
    } else if (newCat !== undefined || newBrand !== undefined || newSearch !== undefined) {
      setVisibleLimit(24);
    }

    const params = new URLSearchParams();
    if (nextCat && nextCat !== 'Todas') params.set('category', nextCat);
    if (nextBrand && nextBrand !== 'Todas') params.set('brand', nextBrand);
    if (nextSearch && nextSearch.trim()) params.set('search', nextSearch.trim());
    if (nextLimit && nextLimit > 24) params.set('limit', nextLimit.toString());

    setSearchParams(params, { replace: true });

    try {
      sessionStorage.setItem('lv_shop_filters', JSON.stringify({
        category: nextCat,
        brand: nextBrand,
        search: nextSearch,
        limit: nextLimit
      }));
      sessionStorage.setItem('lv_shop_filters_query', params.toString());
    } catch (e) {}
  };

  const handleCategoryChange = (cat) => {
    updateFilters(cat, undefined, undefined);
  };

  const handleBrandChange = (brand) => {
    updateFilters(undefined, brand, undefined);
  };

  const handleClearAll = () => {
    try {
      sessionStorage.removeItem('lv_shop_filters');
      sessionStorage.removeItem('lv_shop_filters_query');
    } catch (e) {}
    updateFilters('Todas', 'Todas', '', 24);
  };

  // Agrupar productos que tengan el mismo nombre y pertenezcan a la misma marca en un solo card con tonos
  const groupedProducts = useMemo(() => {
    return groupProducts(products);
  }, [products]);

  // Extraer categorías y marcas únicas de los datos agrupados
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))].filter(Boolean);
  }, [products]);

  const brands = useMemo(() => {
    return [...new Set(products.map(p => p.brand))].filter(Boolean).sort();
  }, [products]);

  // Filtrar productos agrupados
  const filteredProducts = useMemo(() => {
    return groupedProducts.filter(group => {
      const matchesCategory = selectedCategory === 'Todas' ||
        group.category === selectedCategory ||
        (selectedCategory === 'Accesorios' && (group.category === 'Accesorios de Maquillaje' || group.category === 'Accesorios')) ||
        (selectedCategory === 'Accesorios de Maquillaje' && (group.category === 'Accesorios' || group.category === 'Accesorios de Maquillaje')) ||
        (selectedCategory === 'Cabello' && group.category === 'Capilar');
      const matchesBrand = selectedBrand === 'Todas' || group.brand === selectedBrand;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        group.name.toLowerCase().includes(q) ||
        group.brand.toLowerCase().includes(q) ||
        group.variants.some(v => (v.name && v.name.toLowerCase().includes(q)) || (v.toneName && v.toneName.toLowerCase().includes(q)));
      return matchesCategory && matchesBrand && matchesSearch;
    });
  }, [groupedProducts, selectedCategory, selectedBrand, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleLimit);

  // Restauración de scroll al regresar a la tienda
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('lv_shop_scroll');
    if (savedScroll && !scrollRestoredRef.current) {
      const scrollY = parseInt(savedScroll, 10);
      if (!isNaN(scrollY) && scrollY > 0) {
        scrollRestoredRef.current = true;
        const t1 = setTimeout(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' });
        }, 50);
        const t2 = setTimeout(() => {
          window.scrollTo({ top: scrollY, behavior: 'instant' });
          sessionStorage.removeItem('lv_shop_scroll');
        }, 220);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }
  }, [visibleProducts.length]);

  // Guardar posición al salir
  useEffect(() => {
    const saveCurrentScroll = () => {
      if (window.scrollY > 0) {
        try {
          sessionStorage.setItem('lv_shop_scroll', window.scrollY.toString());
        } catch (e) {}
      }
    };
    window.addEventListener('scroll', saveCurrentScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', saveCurrentScroll);
      saveCurrentScroll();
    };
  }, []);

  const hasActiveFilters = selectedCategory !== 'Todas' || selectedBrand !== 'Todas' || Boolean(searchQuery);

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

        {/* Categorías (Pills limpias) */}
        <div style={{
          marginBottom: 'var(--space-6)',
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

          {/* Selector de Categorías (Pills) */}
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
                    handleCategoryChange(targetCategory);
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
              setSelectedCategory={handleCategoryChange}
              selectedBrand={selectedBrand}
              setSelectedBrand={handleBrandChange}
              categories={categories}
              brands={brands}
              onClearFilters={handleClearAll}
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
              setSelectedCategory={handleCategoryChange}
              selectedBrand={selectedBrand}
              setSelectedBrand={handleBrandChange}
              categories={categories}
              brands={brands}
              onClearFilters={handleClearAll}
            />
          </div>

          {/* Grid de productos */}
          <div>
            {/* Barra de Filtros Activos (Fácil de ver y limpiar) */}
            {hasActiveFilters && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '18px',
                padding: '10px 14px',
                backgroundColor: '#FFF8FA',
                borderRadius: '10px',
                border: '1px solid #F3E5EB'
              }}>
                <span style={{ fontSize: '12px', color: '#8A5B66', fontWeight: '700' }}>Filtros activos:</span>
                
                {selectedCategory !== 'Todas' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    border: '1px solid #E5E0E2',
                    color: '#333'
                  }}>
                    Categoría: <strong>{selectedCategory}</strong>
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('Todas')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '12px', padding: 0 }}
                      title="Quitar filtro de categoría"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {selectedBrand !== 'Todas' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    border: '1px solid #E5E0E2',
                    color: '#333'
                  }}>
                    Marca: <strong>{selectedBrand}</strong>
                    <button
                      type="button"
                      onClick={() => handleBrandChange('Todas')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '12px', padding: 0 }}
                      title="Quitar filtro de marca"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    border: '1px solid #E5E0E2',
                    color: '#333'
                  }}>
                    Búsqueda: <strong>"{searchQuery}"</strong>
                    <button
                      type="button"
                      onClick={() => updateFilters(undefined, undefined, '')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '12px', padding: 0 }}
                      title="Quitar búsqueda"
                    >
                      ✕
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D9537F',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginLeft: 'auto'
                  }}
                >
                  Limpiar todo
                </button>
              </div>
            )}

            {visibleProducts.length > 0 ? (
              <>
                <div className="products-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 'var(--space-6)'
                }}>
                  {visibleProducts.map((product) => (
                    <ProductCard key={product.groupKey || product.id} product={product} />
                  ))}
                </div>
                {filteredProducts.length > visibleLimit && (
                  <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
                    <Button variant="primary" onClick={() => updateFilters(undefined, undefined, undefined, visibleLimit + 24)}>
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
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>Intenta ajustar los filtros o el término de búsqueda.</p>
                <Button variant="secondary" onClick={handleClearAll}>
                  Ver todos los productos
                </Button>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .shop-title {
            font-size: 1.65rem !important;
            line-height: 1.25 !important;
            padding: 0 8px;
          }
          .shop-layout {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .category-chips-scroll {
            justify-content: flex-start !important;
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            padding: 8px 4px !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .category-chips-scroll::-webkit-scrollbar {
            display: none;
          }
          .category-chips-scroll button {
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
        }
        @media (max-width: 340px) {
          .products-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
