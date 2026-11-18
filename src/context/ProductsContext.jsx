import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import initialProductsData from '../data/products.json';

const ProductsContext = createContext();

const SUPABASE_URL = "https://oytdvgeyvuxqafxmgtcp.supabase.co/rest/v1";
const SUPABASE_KEY = "sb_publishable__oG8sW5N2U7Bg018wfPL3w_3xWijWth";

// Mapa canónico de productos desde el JSON oficial (fotos y metadatos actualizados del build)
const canonicalMap = new Map();
initialProductsData.forEach(p => {
  canonicalMap.set(p.id, p);
});

// Función para asegurar que el producto use metadatos base si le faltan, pero respetando las fotos editadas
function enrichWithCanonical(p) {
  const canon = canonicalMap.get(p.id);
  if (!canon) return p;
  return {
    ...canon,
    ...p,
    mainImage: p.mainImage || canon.mainImage,
    images: Array.isArray(p.images) ? p.images : (canon.images || [canon.mainImage]),
    description: p.description || canon.description,
    benefits: p.benefits || canon.benefits,
    howToUse: p.howToUse || canon.howToUse
  };
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Purgar versiones antiguas de caché para que ningún cliente quede con fotos viejas
        localStorage.removeItem('luna_viva_live_products_v1');
        localStorage.removeItem('luna_viva_live_products_v2');
        localStorage.removeItem('luna_viva_live_products_v3');
        localStorage.removeItem('luna_viva_live_products_v4');
        const cached = localStorage.getItem('luna_viva_live_products_v5');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(enrichWithCanonical);
          }
        }
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
            // Actualizar stock, precio y metadatos editados en tiempo real
            const updated = prevProducts.map(prod => {
              const remote = remoteMap.get(prod.id);
              const canon = canonicalMap.get(prod.id);
              const stock = remote ? (Number(remote.stock) || 0) : prod.stock;
              const price = remote ? (Number(remote.price) || prod.price) : prod.price;

              let customMeta = null;
              if (remote?.notes && remote.notes.trim().startsWith('{')) {
                try {
                  customMeta = JSON.parse(remote.notes);
                } catch (e) {}
              }

              const resolvedMainImage = customMeta?.mainImage || prod.mainImage || canon?.mainImage;
              const resolvedImages = (customMeta?.images && Array.isArray(customMeta.images))
                ? customMeta.images
                : (prod.images && Array.isArray(prod.images) ? prod.images : ((canon?.images && canon.images.length > 0) ? canon.images : [canon?.mainImage || prod.mainImage]));

              const resolvedDesc = customMeta?.description || canon?.description || prod.description;
              const resolvedBenefits = customMeta?.benefits || canon?.benefits || prod.benefits;
              const resolvedHowToUse = customMeta?.howToUse || canon?.howToUse || prod.howToUse;

              return {
                ...prod,
                name: remote?.name || prod.name,
                brand: remote?.brand || prod.brand,
                category: remote?.category || prod.category,
                price: price,
                stock: stock,
                available: stock > 0,
                isOut: stock <= 0,
                mainImage: resolvedMainImage,
                images: resolvedImages,
                description: resolvedDesc,
                benefits: resolvedBenefits,
                howToUse: resolvedHowToUse
              };
            });

            // Si hay productos nuevos en Supabase que no estaban en initialProductsData, agregarlos
            remoteList.forEach(r => {
              if (!prevProducts.some(p => p.id === r.id)) {
                const canon = canonicalMap.get(r.id);
                const stock = Number(r.stock) || 0;
                
                let customMeta = null;
                if (r?.notes && r.notes.trim().startsWith('{')) {
                  try {
                    customMeta = JSON.parse(r.notes);
                  } catch (e) {}
                }

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
                  description: customMeta?.description || canon?.description || `${r.name} de la marca ${r.brand}. Producto 100% original en Luna Viva Boutique.`,
                  benefits: customMeta?.benefits || canon?.benefits || 'Fórmula certificada de alta fijación y calidad.',
                  howToUse: customMeta?.howToUse || canon?.howToUse || 'Aplicar según tu rutina de belleza.',
                  mainImage: customMeta?.mainImage || canon?.mainImage || '/img/Logo luna.png',
                  images: (customMeta?.images && Array.isArray(customMeta.images))
                    ? customMeta.images
                    : ((canon?.images && canon.images.length > 0) ? canon.images : ['/img/Logo luna.png']),
                  lunaRecommends: canon?.lunaRecommends ?? false,
                  isNew: canon?.isNew ?? true,
                  isBestseller: canon?.isBestseller ?? false
                });
              }
            });

            // Unificar descripciones entre tonos hermanos (misma marca y producto base)
            const descByGroup = new Map();
            const toneRegex = /[-–—/]?\s*\btono\b\s*[:#]?\s*(.+)$/i;
            const isRealDesc = (d) => Boolean(d && typeof d === 'string' && !d.includes('de la marca') && d.length > 20);

            updated.forEach(p => {
              if (isRealDesc(p.description)) {
                const match = (p.name || '').match(toneRegex);
                const baseName = match ? p.name.slice(0, match.index).trim() : (p.name || '').trim();
                const key = `${(p.brand || '').toLowerCase().trim()}___${baseName.toLowerCase()}`;
                if (!descByGroup.has(key)) descByGroup.set(key, p.description);
              }
            });

            if (descByGroup.size > 0) {
              updated.forEach(p => {
                const match = (p.name || '').match(toneRegex);
                const baseName = match ? p.name.slice(0, match.index).trim() : (p.name || '').trim();
                const key = `${(p.brand || '').toLowerCase().trim()}___${baseName.toLowerCase()}`;
                if (descByGroup.has(key)) {
                  p.description = descByGroup.get(key);
                }
              });
            }

            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('luna_viva_live_products_v5', JSON.stringify(updated));
              }
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

  const updateProductDetails = async (productId, fields) => {
    try {
      const notesJson = JSON.stringify({
        description: fields.description || '',
        benefits: fields.benefits || '',
        howToUse: fields.howToUse || '',
        mainImage: fields.mainImage || '',
        images: Array.isArray(fields.images) ? fields.images : (fields.mainImage ? [fields.mainImage] : [])
      });

      const patchPayload = {
        notes: notesJson,
        updated_at: new Date().toISOString()
      };
      if (fields.name) patchPayload.name = fields.name;
      if (fields.price !== undefined) patchPayload.price = Number(fields.price) || 0;
      if (fields.stock !== undefined) patchPayload.stock = Number(fields.stock) || 0;

      const res = await fetch(`${SUPABASE_URL}/products?id=eq.${productId}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(patchPayload)
      });

      if (!res.ok) {
        throw new Error('Error al actualizar en la base de datos Supabase.');
      }

      // Actualizar estado local inmediatamente
      setProducts(prev => {
        const next = prev.map(p => {
          if (p.id === productId) {
            const nextStock = fields.stock !== undefined ? Number(fields.stock) : p.stock;
            return {
              ...p,
              name: fields.name || p.name,
              price: fields.price !== undefined ? Number(fields.price) : p.price,
              stock: nextStock,
              available: nextStock > 0,
              isOut: nextStock <= 0,
              description: fields.description !== undefined ? fields.description : p.description,
              benefits: fields.benefits !== undefined ? fields.benefits : p.benefits,
              howToUse: fields.howToUse !== undefined ? fields.howToUse : p.howToUse,
              mainImage: fields.mainImage || p.mainImage,
              images: Array.isArray(fields.images) ? fields.images : p.images
            };
          }
          return p;
        });

        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('luna_viva_live_products_v5', JSON.stringify(next));
          }
        } catch (e) {}

        return next;
      });

      return { success: true };
    } catch (err) {
      console.error('Error in updateProductDetails:', err);
      return { success: false, error: err.message };
    }
  };

  return (
    <ProductsContext.Provider value={{ products, loading, lastSync, refreshProducts: () => fetchRealtimeProducts(false), updateProductDetails }}>
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

