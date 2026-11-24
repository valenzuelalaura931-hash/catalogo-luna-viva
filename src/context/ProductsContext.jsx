import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import initialProductsData from '../data/products.json';

const ProductsContext = createContext();

const SUPABASE_URL = "https://oytdvgeyvuxqafxmgtcp.supabase.co/rest/v1";
const SUPABASE_KEY = "sb_publishable__oG8sW5N2U7Bg018wfPL3w_3xWijWth";

// Clave para guardar únicamente los campos editados por la administradora (ultra liviano, nunca supera cuota de localStorage)
const STORAGE_KEY_OVERRIDES = "luna_viva_custom_overrides_v1";

// Mapa canónico de productos desde el JSON oficial (fotos y metadatos actualizados del build)
const canonicalMap = new Map();
initialProductsData.forEach(p => {
  canonicalMap.set(p.id, p);
});

// Función para aplicar personalizaciones de la administradora sobre la lista base de productos
function applyCustomOverrides(baseList) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Liberar espacio de cachés masivas antiguas que excedían el límite de 5MB de localStorage
      localStorage.removeItem('luna_viva_live_products_v1');
      localStorage.removeItem('luna_viva_live_products_v2');
      localStorage.removeItem('luna_viva_live_products_v3');
      localStorage.removeItem('luna_viva_live_products_v4');
      localStorage.removeItem('luna_viva_live_products_v5');

      const saved = localStorage.getItem(STORAGE_KEY_OVERRIDES);
      if (saved) {
        const overrides = JSON.parse(saved);
        if (overrides && typeof overrides === 'object') {
          return baseList.map(p => {
            const ovr = overrides[p.id];
            if (!ovr) return p;
            const nextStock = ovr.stock !== undefined ? Number(ovr.stock) : p.stock;
            return {
              ...p,
              name: ovr.name || p.name,
              price: ovr.price !== undefined ? Number(ovr.price) : p.price,
              stock: nextStock,
              available: nextStock > 0,
              isOut: nextStock <= 0,
              hidden: ovr.hidden !== undefined ? Boolean(ovr.hidden) : Boolean(p.hidden),
              description: ovr.description !== undefined ? ovr.description : p.description,
              benefits: ovr.benefits !== undefined ? ovr.benefits : p.benefits,
              howToUse: ovr.howToUse !== undefined ? ovr.howToUse : p.howToUse,
              mainImage: ovr.mainImage || p.mainImage,
              images: Array.isArray(ovr.images) && ovr.images.length > 0 ? ovr.images : p.images
            };
          });
        }
      }
    }
  } catch (e) {
    console.warn('Error aplicando personalizaciones locales:', e);
  }
  return baseList;
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(() => applyCustomOverrides(initialProductsData));

  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Lista de cambios pendientes guardados localmente para sincronizar cuando Supabase esté disponible
  const [pendingSync, setPendingSync] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('luna_viva_pending_sync');
        return saved ? JSON.parse(saved) : [];
      }
    } catch (e) {}
    return [];
  });

  // Estado que detecta si la cuota de Supabase está bloqueada (402)
  const [supabaseBlocked, setSupabaseBlocked] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = localStorage.getItem('luna_viva_supabase_blocked');
        return val === null ? true : val === 'true'; // Por defecto activo para evitar errores 402
      }
    } catch (e) {}
    return true;
  });

  const fetchRealtimeProducts = useCallback(async (isSilent = true) => {
    // Si la cuota de Supabase está bloqueada y es consulta en segundo plano, no hacer petición innecesaria
    if (isSilent && typeof window !== 'undefined' && localStorage.getItem('luna_viva_supabase_blocked') === 'true') {
      return;
    }

    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/products?select=*&limit=2000`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      if (res.status === 402) {
        setSupabaseBlocked(true);
        try { localStorage.setItem('luna_viva_supabase_blocked', 'true'); } catch (e) {}
        return;
      }

      if (res.ok) {
        setSupabaseBlocked(false);
        try { localStorage.setItem('luna_viva_supabase_blocked', 'false'); } catch (e) {}
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
                } catch (e) { }
              }

              // Overrides locales del usuario (prioridad absoluta para que nunca se pierdan cambios)
              let localOvr = null;
              try {
                if (typeof window !== 'undefined' && window.localStorage) {
                  const ovrRaw = localStorage.getItem(STORAGE_KEY_OVERRIDES);
                  if (ovrRaw) {
                    const parsedOvr = JSON.parse(ovrRaw);
                    localOvr = parsedOvr[prod.id] || null;
                  }
                }
              } catch (e) {}

              const isHidden = localOvr?.hidden !== undefined
                ? Boolean(localOvr.hidden)
                : (customMeta?.hidden !== undefined
                  ? Boolean(customMeta.hidden)
                  : Boolean(prod.hidden || canon?.hidden || false));

              const resolvedMainImage = localOvr?.mainImage || customMeta?.mainImage || prod.mainImage || canon?.mainImage;
              const resolvedImages = (localOvr?.images && Array.isArray(localOvr.images) && localOvr.images.length > 0)
                ? localOvr.images
                : ((customMeta?.images && Array.isArray(customMeta.images))
                  ? customMeta.images
                  : (prod.images && Array.isArray(prod.images) ? prod.images : ((canon?.images && canon.images.length > 0) ? canon.images : [canon?.mainImage || prod.mainImage])));

              const resolvedDesc = localOvr?.description !== undefined ? localOvr.description : (customMeta?.description || canon?.description || prod.description);
              const resolvedBenefits = localOvr?.benefits !== undefined ? localOvr.benefits : (customMeta?.benefits || canon?.benefits || prod.benefits);
              const resolvedHowToUse = localOvr?.howToUse !== undefined ? localOvr.howToUse : (customMeta?.howToUse || canon?.howToUse || prod.howToUse);

              return {
                ...prod,
                name: remote?.name || prod.name,
                brand: remote?.brand || prod.brand,
                category: remote?.category || prod.category,
                price: price,
                stock: stock,
                available: stock > 0,
                isOut: stock <= 0,
                hidden: isHidden,
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
                  } catch (e) { }
                }

                const isHidden = customMeta?.hidden !== undefined
                  ? Boolean(customMeta.hidden)
                  : Boolean(canon?.hidden || false);

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
                  hidden: isHidden,
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

            // Unificar fotos y galería entre tonos hermanos (misma marca y producto base)
            const imagesByGroup = new Map();
            const mainImgByGroup = new Map();
            // Las fotos de cada producto y sus variantes se preservan exactamente como fueron editadas o cargadas
            // sin sobrescrituras destructivas entre tonos.

            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('luna_viva_live_products_v5', JSON.stringify(updated));
              }
            } catch (e) { }

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
      const existingProduct = products.find(p => p.id === productId);
      const isHidden = fields.hidden !== undefined
        ? Boolean(fields.hidden)
        : Boolean(existingProduct?.hidden || false);

      const notesJson = JSON.stringify({
        description: fields.description !== undefined ? fields.description : (existingProduct?.description || ''),
        benefits: fields.benefits !== undefined ? fields.benefits : (existingProduct?.benefits || ''),
        howToUse: fields.howToUse !== undefined ? fields.howToUse : (existingProduct?.howToUse || ''),
        mainImage: fields.mainImage !== undefined ? fields.mainImage : (existingProduct?.mainImage || ''),
        images: Array.isArray(fields.images) ? fields.images : (existingProduct?.images || (fields.mainImage ? [fields.mainImage] : [])),
        hidden: isHidden
      });

      const patchPayload = {
        notes: notesJson,
        updated_at: new Date().toISOString()
      };
      if (fields.name) patchPayload.name = fields.name;
      if (fields.price !== undefined) patchPayload.price = Number(fields.price) || 0;
      if (fields.stock !== undefined) patchPayload.stock = Number(fields.stock) || 0;

      // 1. Guardar de forma ultra-ligera en luna_viva_custom_overrides_v1 (Pesa pocos bytes, NUNCA falla por cuota de localStorage)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = localStorage.getItem(STORAGE_KEY_OVERRIDES);
          const currentOverrides = raw ? JSON.parse(raw) : {};
          currentOverrides[productId] = {
            ...(currentOverrides[productId] || {}),
            name: fields.name || existingProduct?.name,
            description: fields.description !== undefined ? fields.description : existingProduct?.description,
            benefits: fields.benefits !== undefined ? fields.benefits : existingProduct?.benefits,
            howToUse: fields.howToUse !== undefined ? fields.howToUse : existingProduct?.howToUse,
            mainImage: fields.mainImage || existingProduct?.mainImage,
            images: Array.isArray(fields.images) ? fields.images : existingProduct?.images,
            hidden: isHidden,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(currentOverrides));
        }
      } catch (errStorage) {
        console.error('Error al persistir en almacenamiento local:', errStorage);
      }

      // 2. Actualizar estado local inmediatamente
      setProducts(prev => {
        return prev.map(p => {
          if (p.id === productId) {
            const nextStock = fields.stock !== undefined ? Number(fields.stock) : p.stock;
            return {
              ...p,
              name: fields.name || p.name,
              price: fields.price !== undefined ? Number(fields.price) : p.price,
              stock: nextStock,
              available: nextStock > 0,
              isOut: nextStock <= 0,
              hidden: isHidden,
              description: fields.description !== undefined ? fields.description : p.description,
              benefits: fields.benefits !== undefined ? fields.benefits : p.benefits,
              howToUse: fields.howToUse !== undefined ? fields.howToUse : p.howToUse,
              mainImage: fields.mainImage || p.mainImage,
              images: Array.isArray(fields.images) ? fields.images : p.images
            };
          }
          return p;
        });
      });

      // 2. Registrar en la cola de sincronización pendiente
      setPendingSync(prev => {
        const filtered = prev.filter(item => item.id !== productId);
        const nextList = [
          ...filtered,
          {
            id: productId,
            name: fields.name || existingProduct?.name || productId,
            payload: patchPayload,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('luna_viva_pending_sync', JSON.stringify(nextList));
          }
        } catch (e) {}
        return nextList;
      });

      // 3. Si Supabase tiene la cuota bloqueada (402), NO hacer la llamada a la red para no generar errores ni consumir nada
      if (supabaseBlocked) {
        return {
          success: true,
          isLocal: true,
          message: 'Guardado con éxito en tu catálogo (Modo Local). Listo para sincronizar cuando se reactive Supabase.'
        };
      }

      // Si no estaba marcado como bloqueado, intentar en segundo plano
      try {
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

        if (res.status === 402) {
          setSupabaseBlocked(true);
          try { localStorage.setItem('luna_viva_supabase_blocked', 'true'); } catch (e) {}
        } else if (res.ok) {
          // Si se guardó en Supabase con éxito, sacarlo de pendientes
          setPendingSync(prev => {
            const nextList = prev.filter(item => item.id !== productId);
            try { localStorage.setItem('luna_viva_pending_sync', JSON.stringify(nextList)); } catch (e) {}
            return nextList;
          });
        }
      } catch (e) {
        setSupabaseBlocked(true);
      }

      return {
        success: true,
        isLocal: true,
        message: 'Guardado con éxito en tu catálogo.'
      };
    } catch (err) {
      console.error('Error in updateProductDetails:', err);
      return { success: false, error: err.message };
    }
  };

  // Función para sincronizar todos los cambios locales pendientes hacia Supabase (para cuando se reactive la cuenta)
  const syncPendingWithSupabase = async () => {
    if (pendingSync.length === 0) {
      return { success: true, message: 'No hay cambios pendientes por sincronizar.' };
    }

    try {
      const testRes = await fetch(`${SUPABASE_URL}/products?limit=1`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      if (testRes.status === 402) {
        setSupabaseBlocked(true);
        return {
          success: false,
          error: 'Supabase aún tiene la cuota mensual de transferencia pausada (HTTP 402: exceed_egress_quota). Tus cambios siguen 100% seguros guardados en este navegador.'
        };
      }

      if (!testRes.ok) {
        return {
          success: false,
          error: `Error al conectar con Supabase (HTTP ${testRes.status}).`
        };
      }

      // Supabase está activo nuevamente: subir los pendientes
      let countSuccess = 0;
      const stillPending = [];

      for (const item of pendingSync) {
        try {
          const res = await fetch(`${SUPABASE_URL}/products?id=eq.${item.id}`, {
            method: 'PATCH',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(item.payload)
          });
          if (res.ok) {
            countSuccess++;
          } else {
            stillPending.push(item);
          }
        } catch (e) {
          stillPending.push(item);
        }
      }

      setPendingSync(stillPending);
      try {
        localStorage.setItem('luna_viva_pending_sync', JSON.stringify(stillPending));
      } catch (e) {}

      if (stillPending.length === 0) {
        setSupabaseBlocked(false);
        try { localStorage.setItem('luna_viva_supabase_blocked', 'false'); } catch (e) {}
        return {
          success: true,
          message: `¡Éxito! Se sincronizaron los ${countSuccess} productos pendientes en la nube de Supabase.`
        };
      } else {
        return {
          success: true,
          message: `Se sincronizaron ${countSuccess} productos. ${stillPending.length} continúan guardados localmente.`
        };
      }
    } catch (err) {
      return {
        success: false,
        error: 'No se pudo contactar al servidor de Supabase. Revisa tu conexión.'
      };
    }
  };

  // Función para descargar un archivo JSON con todo el catálogo actualizado (Respaldo total)
  const exportCatalogBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `catalogo_luna_viva_respaldo_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch (e) {
      console.error('Error al exportar respaldo JSON:', e);
      return false;
    }
  };

  return (
    <ProductsContext.Provider value={{
      products,
      loading,
      lastSync,
      refreshProducts: () => fetchRealtimeProducts(false),
      updateProductDetails,
      pendingSync,
      supabaseBlocked,
      syncPendingWithSupabase,
      exportCatalogBackup
    }}>
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

