/**
 * LUNA VIVA BEAUTY - UTILIDAD DE AGRUPACIÓN DE PRODUCTOS POR TONOS / VARIANTES
 * Agrupa productos con la misma marca y nombre base en una sola tarjeta para el catálogo
 */

/**
 * Parsea el nombre del producto para separar el nombre base de la variante/tono
 */
export function parseProductVariant(product) {
  if (!product || !product.name) return { baseName: '', toneName: null };
  const name = product.name.trim();

  // Coincide con patrones como:
  // "Base my foundation tono 02" -> base: "Base my foundation", tone: "02"
  // "Polvo suelto mineral tono banana" -> base: "Polvo suelto mineral", tone: "banana"
  // "Corrector XL - tono 03" -> base: "Corrector XL", tone: "03"
  // "Rubor liquido tono 1 lily" -> base: "Rubor liquido", tone: "1 lily"
  // Usa \btono\b para NO coincidir con "Polvo 4 tonos"
  const match = name.match(/[-–—/]?\s*\btono\b\s*[:#]?\s*(.+)$/i);
  if (match) {
    const baseName = name.slice(0, match.index).replace(/[-–—/:]+$/, '').trim();
    const toneName = match[1].trim();
    return {
      baseName: baseName || name,
      toneName: toneName
    };
  }

  return {
    baseName: name,
    toneName: null
  };
}

/**
 * Agrupa una lista de productos en tarjetas únicas con variantes de tono
 */
export function groupProducts(productsList) {
  if (!Array.isArray(productsList)) return [];

  const groupsMap = new Map();

  for (const product of productsList) {
    const { baseName, toneName } = parseProductVariant(product);
    const brand = (product.brand || 'Luna Viva').trim();
    const groupKey = `${brand.toLowerCase()}___${baseName.toLowerCase()}`;

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        id: product.id,
        groupKey,
        name: baseName,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory,
        price: product.price,
        mainImage: product.mainImage,
        images: product.images || [product.mainImage],
        description: product.description,
        benefits: product.benefits,
        howToUse: product.howToUse,
        lunaRecommends: product.lunaRecommends,
        isNew: product.isNew,
        isBestseller: product.isBestseller,
        variants: []
      });
    }

    const group = groupsMap.get(groupKey);

    group.variants.push({
      ...product,
      toneName: toneName || (group.variants.length > 0 ? `Tono ${group.variants.length + 1}` : 'Único'),
      hasExplicitTone: Boolean(toneName)
    });
  }

  const result = [];
  for (const group of groupsMap.values()) {
    const hasMultipleTones = group.variants.length > 1;

    // Ordenar tonos naturalmente (00, 01, 02, 03, 4,5, 10...)
    group.variants.sort((a, b) => {
      return (a.toneName || '').localeCompare(b.toneName || '', undefined, { numeric: true, sensitivity: 'base' });
    });

    // Variante predeterminada: la primera con stock > 0, o la primera
    const defaultVariant = group.variants.find(v => (Number(v.stock) || 0) > 0) || group.variants[0];
    const totalStock = group.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);

    // Colección de fotos limpia y sin duplicados para el card basada en la variante activa
    const authoritativeImages = (Array.isArray(defaultVariant?.images) && defaultVariant.images.length > 0)
      ? defaultVariant.images
      : (Array.isArray(group.images) && group.images.length > 0 ? group.images : [defaultVariant?.mainImage || group.mainImage].filter(Boolean));

    const cleanGroupImages = [];
    authoritativeImages.forEach(img => {
      if (img && !cleanGroupImages.includes(img)) cleanGroupImages.push(img);
    });

    // Agregar fotos de portada de otras variantes solo si son únicas y no repetidas
    group.variants.forEach(v => {
      if (v.mainImage && !cleanGroupImages.includes(v.mainImage)) {
        cleanGroupImages.push(v.mainImage);
      }
    });

    group.images = cleanGroupImages.length > 0 ? cleanGroupImages : [group.mainImage || '/img/Logo luna sin fondo.png'];

    // Unificar descripción para todo el producto (única para todos los tonos)
    const isCustomDesc = (d) => Boolean(d && typeof d === 'string' && !d.includes('de la marca') && d.length > 20);
    const unifiedDesc = group.variants.find(v => isCustomDesc(v.description))?.description
      || defaultVariant?.description
      || group.description;

    const unifiedBenefits = group.variants.find(v => v.benefits && v.benefits.length > 15)?.benefits
      || defaultVariant?.benefits
      || group.benefits;

    const unifiedHowToUse = group.variants.find(v => v.howToUse && v.howToUse.length > 15)?.howToUse
      || defaultVariant?.howToUse
      || group.howToUse;

    group.description = unifiedDesc;
    group.benefits = unifiedBenefits;
    group.howToUse = unifiedHowToUse;

    // Asignar descripción y fotos unificadas a cada variante para que no cambien al navegar entre tonos
    group.variants.forEach(v => {
      v.description = unifiedDesc;
      v.benefits = unifiedBenefits;
      v.howToUse = unifiedHowToUse;
      v.images = group.images;
      v.mainImage = group.images[0] || group.mainImage;
    });

    result.push({
      ...group,
      hasMultipleTones,
      totalStock,
      defaultVariant,
      available: totalStock > 0,
      isOut: totalStock <= 0
    });
  }

  // Ordenar para que los productos disponibles queden primero y los agotados de último
  result.sort((a, b) => {
    const aAvailable = (Number(a.totalStock) || 0) > 0;
    const bAvailable = (Number(b.totalStock) || 0) > 0;
    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;
    return 0;
  });

  return result;
}

/**
 * Encuentra todas las variantes de tono de un producto específico por su ID
 */
export function findProductVariants(productsList, targetProductId) {
  if (!Array.isArray(productsList) || !targetProductId) return null;
  const currentProduct = productsList.find(p => p.id === targetProductId);
  if (!currentProduct) return null;

  const { baseName } = parseProductVariant(currentProduct);
  const brand = (currentProduct.brand || 'Luna Viva').trim().toLowerCase();
  const baseLower = baseName.toLowerCase();

  const siblings = productsList.filter(p => {
    const pBrand = (p.brand || 'Luna Viva').trim().toLowerCase();
    const { baseName: pBase } = parseProductVariant(p);
    return pBrand === brand && pBase.toLowerCase() === baseLower;
  });

  if (siblings.length <= 1) return null;

  // Determinar descripción unificada para todas las variantes hermanas
  const isCustomDesc = (d) => Boolean(d && typeof d === 'string' && !d.includes('de la marca') && d.length > 20);
  const unifiedDesc = siblings.find(s => isCustomDesc(s.description))?.description || currentProduct.description;
  const unifiedBenefits = siblings.find(s => s.benefits && s.benefits.length > 15)?.benefits || currentProduct.benefits;
  const unifiedHowToUse = siblings.find(s => s.howToUse && s.howToUse.length > 15)?.howToUse || currentProduct.howToUse;

  // Determinar galería de fotos unificada (idéntica para todos los tonos)
  let bestGallery = [];
  const sortedByImages = [...siblings].sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0));
  if (sortedByImages[0]?.images && Array.isArray(sortedByImages[0].images) && sortedByImages[0].images.length > 0) {
    bestGallery = sortedByImages[0].images;
  } else if (currentProduct.mainImage) {
    bestGallery = [currentProduct.mainImage];
  }

  const cleanUnifiedImages = [];
  bestGallery.forEach(img => {
    if (img && !cleanUnifiedImages.includes(img)) cleanUnifiedImages.push(img);
  });

  const variants = siblings.map(p => {
    const { toneName } = parseProductVariant(p);
    return {
      ...p,
      description: unifiedDesc,
      benefits: unifiedBenefits,
      howToUse: unifiedHowToUse,
      images: cleanUnifiedImages,
      mainImage: cleanUnifiedImages[0] || p.mainImage,
      toneName: toneName || 'Tono'
    };
  });

  variants.sort((a, b) => {
    return (a.toneName || '').localeCompare(b.toneName || '', undefined, { numeric: true, sensitivity: 'base' });
  });

  return {
    baseName,
    brand: currentProduct.brand,
    description: unifiedDesc,
    benefits: unifiedBenefits,
    howToUse: unifiedHowToUse,
    images: cleanUnifiedImages,
    mainImage: cleanUnifiedImages[0] || currentProduct.mainImage,
    variants
  };
}

