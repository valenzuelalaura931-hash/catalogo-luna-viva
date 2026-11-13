import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import initialProductsData from '../data/products.json';

const ProductsContext = createContext();

const SUPABASE_URL = "https://oytdvgeyvuxqafxmgtcp.supabase.co/rest/v1";
const SUPABASE_KEY = "sb_publishable__oG8sW5N2U7Bg018wfPL3w_3xWijWth";

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('luna_viva_live_products_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialProductsData;
  });

  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const fetchRealtimeProducts = useCallback(async (isSilent = true) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/products?select=*&limit=2000`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      if (res.ok) {
        const remoteList = await res.json();
        if (Array.isArray(remoteList) && remoteList.length > 0) {
          const remoteMap = new Map();
          remoteList.forEach(p => remoteMap.set(p.id, p));

          setProducts(prevProducts => {
            // Actualizar stock y precio en tiempo real de cada producto conocido
            const updated = prevProducts.map(prod => {
              const remote = remoteMap.get(prod.id);
              if (!remote) return prod;
              const stock = Number(remote.stock) || 0;
              const price = Number(remote.price) || prod.price;
              return {
                ...prod,
                name: remote.name || prod.name,
                brand: remote.brand || prod.brand,
                category: remote.category || prod.category,
                price: price,
                stock: stock,
                available: stock > 0,
                isOut: stock <= 0
              };
            });

            // Si hay productos nuevos en Supabase que no estaban en initialProductsData, agregarlos
            remoteList.forEach(r => {
              if (!prevProducts.some(p => p.id === r.id)) {
                const stock = Number(r.stock) || 0;
                updated.push({
                  id: r.id,
                  sku: r.id,
                  barcode: r.barcode || '',
                  name: r.name,
                  brand: r.brand,
                  category: r.category || 'Maquillaje',
                  subcategory: r.category || 'Maquillaje',
                  price: Number(r.price) || 0,
                  stock: stock,
                  available: stock > 0,
                  isOut: stock <= 0,
                  description: `${r.name} de la marca ${r.brand}. Producto 100% original en Luna Viva Boutique.`,
                  benefits: 'Fórmula certificada de alta fijación y calidad.',
                  howToUse: 'Aplicar según tu rutina de belleza.',
                  mainImage: '/img/Logo luna.png',
                  images: ['/img/Logo luna.png'],
                  lunaRecommends: false,
                  isNew: true,
                  isBestseller: false
                });
              }
            });

            try {
              localStorage.setItem('luna_viva_live_products_v1', JSON.stringify(updated));
            } catch (e) {}

            return updated;
          });

          setLastSync(new Date());
        }
      }
    } catch (err) {
      console.warn('[Catálogo Luna Viva] Error actualizando stock:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealtimeProducts(false);

    // Consulta periódica cada 20 segundos para reflejar ventas y salidas en tiempo real
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchRealtimeProducts(true);
      }
    }, 20000);

    const onFocus = () => {
      if (document.visibilityState === 'visible') fetchRealtimeProducts(true);
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
    };
  }, [fetchRealtimeProducts]);

  return (
    <ProductsContext.Provider value={{ products, loading, lastSync, refreshProducts: () => fetchRealtimeProducts(false) }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts debe usarse dentro de un ProductsProvider');
  }
  return context;
}

