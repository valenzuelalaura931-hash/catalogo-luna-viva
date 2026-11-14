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
    // Coleccionar todas las fotos de cada variante en la galería del card
    if (product.mainImage && !group.images.includes(product.mainImage)) {
      group.images.push(product.mainImage);
    }
    if (Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && !group.images.includes(img)) {
          group.images.push(img);
        }
      });
    }

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

    result.push({
      ...group,
      hasMultipleTones,
      totalStock,
      defaultVariant,
      available: totalStock > 0,
      isOut: totalStock <= 0
    });
  }

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

  const variants = siblings.map(p => {
    const { toneName } = parseProductVariant(p);
    return {
      ...p,
      toneName: toneName || 'Tono'
    };
  });

  variants.sort((a, b) => {
    return (a.toneName || '').localeCompare(b.toneName || '', undefined, { numeric: true, sensitivity: 'base' });
  });

  return {
    baseName,
    brand: currentProduct.brand,
    variants
  };
}

