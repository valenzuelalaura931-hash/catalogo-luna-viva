import React from 'react';

export function FilterSidebar({ 
  selectedCategory, 
  setSelectedCategory, 
  selectedBrand, 
  setSelectedBrand,
  categories,
  brands
}) {
  return (
    <aside style={{
      padding: 'var(--space-6)',
      backgroundColor: 'white',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      height: 'fit-content',
      position: 'sticky',
      top: 'calc(var(--header-height) + var(--space-4))'
    }}>
      <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--rosa-suave)', paddingBottom: 'var(--space-2)' }}>
        Filtros
      </h3>

      {/* Categorías */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>Categorías</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input 
              type="radio" 
              name="category" 
              checked={selectedCategory === 'Todas'} 
              onChange={() => setSelectedCategory('Todas')}
              style={{ accentColor: 'var(--accent)' }}
            />
            Todas
          </label>
          {categories.map((cat, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              <input 
                type="radio" 
                name="category" 
                checked={selectedCategory === cat || (cat === 'Accesorios de Maquillaje' && selectedCategory === 'Accesorios')} 
                onChange={() => setSelectedCategory(cat)}
                style={{ accentColor: 'var(--accent)' }}
              />
              {cat === 'Accesorios de Maquillaje' ? 'Accesorios' : cat}
            </label>
          ))}
        </div>
      </div>

      {/* Marcas */}
      <div>
        <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>Marcas</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
            <input 
              type="radio" 
              name="brand" 
              checked={selectedBrand === 'Todas'} 
              onChange={() => setSelectedBrand('Todas')}
              style={{ accentColor: 'var(--accent)' }}
            />
            Todas
          </label>
          {brands.map((brand, i) => (
            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
              <input 
                type="radio" 
                name="brand" 
                checked={selectedBrand === brand} 
                onChange={() => setSelectedBrand(brand)}
                style={{ accentColor: 'var(--accent)' }}
              />
              {brand}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
