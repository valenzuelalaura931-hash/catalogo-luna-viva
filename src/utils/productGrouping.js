/**
 * LUNA VIVA BEAUTY - UTILIDAD DE AGRUPACIÓN DE PRODUCTOS POR TONOS / VARIANTES
 * Agrupa productos con la misma marca y nombre base en una sola tarjeta para el catálogo
 */

/**
 * Formatea limpiamente nombres de extractos / variantes
 */
export function formatExtractName(raw) {
  if (!raw) return '';
  let str = raw.trim().replace(/^(?:de|con)\s+/i, '').trim();
  const lower = str.toLowerCase();
  if (lower.includes('hialur') && lower.includes('rosa')) return 'Rosas y Ácido Hialurónico';
  if (lower.includes('hialur')) return 'Ácido Hialurónico';
  if (lower.includes('vitamina c')) return 'Vitamina C';
  if (lower.includes('arandano') || lower.includes('arándano')) return 'Arándanos';
  if (lower.includes('durazno') || lower.includes('peach')) return 'Durazno';
  if (lower.includes('aloe') || lower.includes('sabila')) return 'Aloe Vera';
  if (lower.includes('arroz') || lower.includes('rice')) return 'Arroz';
  if (lower.includes('pepino')) return 'Pepino';
  if (lower.includes('aguacate') || lower.includes('avocado')) return 'Aguacate';
  if (lower.includes('colageno') || lower.includes('colágeno')) return 'Colágeno';

  return str.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

/**
 * Parsea el nombre del producto para separar el nombre base de la variante/tono
 */
export function parseProductVariant(product) {
  if (!product || !product.name) return { baseName: '', toneName: null, isTone: true };
  const name = product.name.trim();
  const brand = (product.brand || '').trim().toLowerCase();

  // 1. Detección especial para Mascarillas en Velo (Bioaqua u otras marcas):
  // "Mascarilla en velo de acido hialuronico" -> base: "Mascarilla en velo", tone: "Ácido Hialurónico"
  // "Mascarilla en velo de vitamina C" -> base: "Mascarilla en velo", tone: "Vitamina C"
  const veloMatch = name.match(/^(mascarilla\s*(?:facial)?\s*en\s*velo)(?:\s*(?:de|con|-|:)\s*(.+))?$/i);
  if (veloMatch) {
    const rawVariant = veloMatch[2] ? veloMatch[2].trim() : '';
    return {
      baseName: "Mascarilla en velo",
      toneName: formatExtractName(rawVariant) || 'Original',
      isTone: false
    };
  }

  // Si es marca Bioaqua y comienza por "Mascarilla de..." o "Mascarilla con..." (excluyendo 3 pasos, labios, etc.)
  if (brand.includes('bioaqua') && /^mascarilla\s*(?:de|con)\s*(.+)$/i.test(name)) {
    const bMatch = name.match(/^mascarilla\s*(?:de|con)\s*(.+)$/i);
    const rawVariant = bMatch ? bMatch[1].trim() : '';
    const low = rawVariant.toLowerCase();
    if (!low.includes('3 pasos') && !low.includes('labios') && !low.includes('puntos negros')) {
      return {
        baseName: "Mascarilla en velo",
        toneName: formatExtractName(rawVariant) || 'Original',
        isTone: false
      };
    }
  }

  // 2. Tonos de maquillaje estándar:
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
      toneName: toneName,
      isTone: true
    };
  }

  return {
    baseName: name,
    toneName: null,
    isTone: true
  };
}

/**
 * Agrupa una lista de productos en tarjetas únicas con variantes de tono / extracto
 */
export function groupProducts(productsList, includeHidden = false) {
  if (!Array.isArray(productsList)) return [];

  const filteredList = includeHidden ? productsList : productsList.filter(p => !p.hidden);

  const groupsMap = new Map();

  for (const product of filteredList) {
    const { baseName, toneName, isTone } = parseProductVariant(product);
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
        isTone: isTone !== false,
        variants: []
      });
    }

    const group = groupsMap.get(groupKey);

    group.variants.push({
      ...product,
      toneName: toneName || (group.variants.length > 0 ? (isTone ? `Tono ${group.variants.length + 1}` : `Variante ${group.variants.length + 1}`) : 'Único'),
      hasExplicitTone: Boolean(toneName),
      isTone: isTone !== false
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

    // Unificar descripción para todo el producto (única para todos los tonos/variantes)
    const isCustomDesc = (d) => Boolean(d && typeof d === 'string' && !d.includes('de la marca') && d.length > 20);
    let unifiedDesc = group.variants.find(v => isCustomDesc(v.description))?.description
      || defaultVariant?.description
      || group.description;

    let unifiedBenefits = group.variants.find(v => v.benefits && v.benefits.length > 15)?.benefits
      || defaultVariant?.benefits
      || group.benefits;

    let unifiedHowToUse = group.variants.find(v => v.howToUse && v.howToUse.length > 15)?.howToUse
      || defaultVariant?.howToUse
      || group.howToUse;

    if (group.name.toLowerCase().includes('mascarilla en velo') && (!unifiedDesc || unifiedDesc.includes('de la marca'))) {
      unifiedDesc = "Mascarilla facial en velo hidratante de la marca Bioaqua. Formulada con extractos naturales para nutrir, hidratar a profundidad y revitalizar la piel del rostro. Selecciona tu extracto favorito según las necesidades de tu piel: Ácido Hialurónico, Vitamina C, Arándanos, Durazno, Aloe Vera, Arroz o Rosas.";
      unifiedBenefits = "Hidratación profunda, luminosidad instantánea y frescura para tu piel. Producto 100% original.";
      unifiedHowToUse = "Limpia y seca tu rostro. Aplica el velo ajustándolo a las facciones de tu rostro. Deja actuar de 15 a 20 minutos. Retira la mascarilla y masajea suavemente el sérum restante hasta su total absorción.";
    }

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
 * Encuentra todas las variantes de tono o extracto de un producto específico por su ID
 */
export function findProductVariants(productsList, targetProductId) {
  if (!Array.isArray(productsList) || !targetProductId) return null;
  const currentProduct = productsList.find(p => p.id === targetProductId);
  if (!currentProduct) return null;

  const { baseName, isTone } = parseProductVariant(currentProduct);
  const brand = (currentProduct.brand || 'Luna Viva').trim().toLowerCase();
  const baseLower = baseName.toLowerCase();

  const siblings = productsList.filter(p => {
    // Si una variante está oculta y no es el producto actual que se está inspeccionando, omitirla
    if (p.hidden && p.id !== targetProductId) return false;
    const pBrand = (p.brand || 'Luna Viva').trim().toLowerCase();
    const { baseName: pBase } = parseProductVariant(p);
    return pBrand === brand && pBase.toLowerCase() === baseLower;
  });

  if (siblings.length <= 1) return null;

  // Determinar descripción unificada para todas las variantes hermanas
  const isCustomDesc = (d) => Boolean(d && typeof d === 'string' && !d.includes('de la marca') && d.length > 20);
  let unifiedDesc = siblings.find(s => isCustomDesc(s.description))?.description || currentProduct.description;
  let unifiedBenefits = siblings.find(s => s.benefits && s.benefits.length > 15)?.benefits || currentProduct.benefits;
  let unifiedHowToUse = siblings.find(s => s.howToUse && s.howToUse.length > 15)?.howToUse || currentProduct.howToUse;

  if (baseName.toLowerCase().includes('mascarilla en velo') && (!unifiedDesc || unifiedDesc.includes('de la marca'))) {
    unifiedDesc = "Mascarilla facial en velo hidratante de la marca Bioaqua. Formulada con extractos naturales para nutrir, hidratar a profundidad y revitalizar la piel del rostro. Selecciona tu extracto favorito según las necesidades de tu piel: Ácido Hialurónico, Vitamina C, Arándanos, Durazno, Aloe Vera, Arroz o Rosas.";
    unifiedBenefits = "Hidratación profunda, luminosidad instantánea y frescura para tu piel. Producto 100% original.";
    unifiedHowToUse = "Limpia y seca tu rostro. Aplica el velo ajustándolo a las facciones de tu rostro. Deja actuar de 15 a 20 minutos. Retira la mascarilla y masajea suavemente el sérum restante hasta su total absorción.";
  }

  // Determinar galería de fotos respetando las fotos editadas del producto actual
  let bestGallery = [];
  if (Array.isArray(currentProduct.images) && currentProduct.images.length > 0) {
    bestGallery = currentProduct.images;
  } else {
    const sortedByImages = [...siblings].sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0));
    if (sortedByImages[0]?.images && Array.isArray(sortedByImages[0].images) && sortedByImages[0].images.length > 0) {
      bestGallery = sortedByImages[0].images;
    } else if (currentProduct.mainImage) {
      bestGallery = [currentProduct.mainImage];
    }
  }

  const cleanUnifiedImages = [];
  bestGallery.forEach(img => {
    if (img && !cleanUnifiedImages.includes(img)) cleanUnifiedImages.push(img);
  });

  const variants = siblings.map(p => {
    const { toneName, isTone: pIsTone } = parseProductVariant(p);
    return {
      ...p,
      description: unifiedDesc,
      benefits: unifiedBenefits,
      howToUse: unifiedHowToUse,
      images: cleanUnifiedImages,
      mainImage: cleanUnifiedImages[0] || p.mainImage,
      toneName: toneName || (pIsTone ? 'Tono' : 'Variante'),
      isTone: pIsTone !== false
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
    isTone: isTone !== false,
    variants
  };
}
