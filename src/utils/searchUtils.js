/**
 * LUNA VIVA BEAUTY - UTILIDAD INTELIGENTE DE BÚSQUEDA Y TÉRMINOS RELACIONADOS
 * Permite buscar productos por nombre, marca, categoría, descripción, tonos/variantes,
 * ignorando acentos/tildes y expandiendo con términos relacionados/sinónimos habituales.
 */

export function normalizeText(str) {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Diccionario de sinónimos y términos relacionados de belleza / cosmética
const SYNONYMS = {
  'bloqueador': ['bloqueador', 'protector solar', 'solar', 'sunscreen', 'fps', 'spf'],
  'protector': ['protector', 'solar', 'bloqueador'],
  'solar': ['solar', 'bloqueador', 'protector'],
  'suero': ['suero', 'serum', 'sueros'],
  'serum': ['serum', 'suero', 'serums'],
  'pestanias': ['pestanina', 'pestanias', 'rimel', 'mascara', 'pestanas'],
  'pestanina': ['pestanina', 'pestanias', 'rimel', 'mascara', 'pestañina'],
  'pestañas': ['pestanina', 'pestanias', 'rimel', 'mascara'],
  'pestanas': ['pestanina', 'pestanias', 'rimel', 'mascara'],
  'rimel': ['rimel', 'pestanina', 'pestanias', 'mascara'],
  'mascara': ['mascara', 'pestanina', 'rimel'],
  'mascarilla': ['mascarilla', 'velo', 'facial', 'parches', 'mascarillas'],
  'mascarillas': ['mascarilla', 'velo', 'facial', 'mascarillas'],
  'labial': ['labial', 'labios', 'gloss', 'tinta', 'lip', 'balsamo', 'brillo labial', 'labiales'],
  'labiales': ['labial', 'labios', 'gloss', 'tinta', 'lip', 'balsamo', 'labiales'],
  'labios': ['labial', 'labios', 'gloss', 'tinta', 'lip', 'balsamo'],
  'gloss': ['gloss', 'labial', 'brillo labial', 'lip'],
  'tinta': ['tinta', 'labial', 'lip tint', 'lip'],
  'blush': ['blush', 'rubor', 'mejillas'],
  'rubor': ['rubor', 'blush', 'mejillas', 'rubores'],
  'rubores': ['rubor', 'blush', 'mejillas', 'rubores'],
  'concealer': ['concealer', 'corrector', 'ojeras'],
  'corrector': ['corrector', 'concealer', 'ojeras', 'correctores'],
  'correctores': ['corrector', 'concealer', 'ojeras', 'correctores'],
  'polvo': ['polvo', 'polvos', 'suelto', 'compacto', 'banana', 'translucido', 'sellador'],
  'polvos': ['polvo', 'polvos', 'suelto', 'compacto', 'sellador'],
  'fijador': ['fijador', 'fijadores', 'spray', 'fixer', 'mist', 'sellador'],
  'tonico': ['tonico', 'tónico', 'locion', 'tonificante', 'mist', 'agua de rosas'],
  'crema': ['crema', 'hidratante', 'humectante', 'locion', 'cremas'],
  'hidratante': ['hidratante', 'humectante', 'crema', 'serum', 'acido hialuronico'],
  'limpiador': ['limpiador', 'espuma', 'jabon', 'micelar', 'gel', 'desmaquillante'],
  'desmaquillante': ['desmaquillante', 'micelar', 'bifasico', 'balsamo', 'limpiador'],
  'champu': ['shampoo', 'champu', 'capilar'],
  'shampoo': ['shampoo', 'champu', 'capilar'],
  'cabello': ['cabello', 'capilar', 'shampoo', 'termo', 'gotas', 'keratina', 'oleo'],
  'capilar': ['capilar', 'cabello', 'shampoo', 'termo', 'gotas'],
  'brochas': ['brochas', 'brocha', 'pincel', 'pinceles', 'esponja', 'aplicador'],
  'brocha': ['brochas', 'brocha', 'pincel', 'esponja'],
  'esponja': ['esponja', 'beauty blender', 'aplicador', 'brocha'],
  'centella': ['centella', 'centella asiatica'],
  'arroz': ['arroz', 'rice'],
  'vitamina c': ['vitamina c', 'antioxidante'],
  'acido hialuronico': ['acido hialuronico', 'hialuronico', 'hidratante']
};

export function getWordVariants(word) {
  const norm = normalizeText(word);
  if (!norm) return [];
  const variants = [norm];

  // Plural / singular
  if (norm.endsWith('es') && norm.length > 4) {
    variants.push(norm.slice(0, -2));
  } else if (norm.endsWith('s') && norm.length > 3) {
    variants.push(norm.slice(0, -1));
  } else {
    variants.push(norm + 's');
    variants.push(norm + 'es');
  }

  // Sinónimos
  if (SYNONYMS[norm]) {
    SYNONYMS[norm].forEach(syn => {
      const nSyn = normalizeText(syn);
      if (!variants.includes(nSyn)) variants.push(nSyn);
    });
  }

  return Array.from(new Set(variants));
}

/**
 * Evalúa si un producto o grupo de productos coincide con la búsqueda
 * Retorna { matches: boolean, score: number }
 */
export function matchProductSearch(item, rawQuery) {
  const normQ = normalizeText(rawQuery);
  if (!normQ) return { matches: true, score: 0 };

  const tokens = normQ.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { matches: true, score: 0 };

  const name = normalizeText(item.name);
  const brand = normalizeText(item.brand);
  const category = normalizeText(item.category);
  const subcategory = normalizeText(item.subcategory);
  const description = normalizeText(item.description);
  const benefits = normalizeText(item.benefits);

  // Variantes / tonos
  let variantsText = '';
  if (Array.isArray(item.variants)) {
    variantsText = item.variants
      .map(v => `${normalizeText(v.name)} ${normalizeText(v.toneName)} ${normalizeText(v.sku)}`)
      .join(' ');
  }

  const corpus = `${name} ${brand} ${category} ${subcategory} ${variantsText} ${description} ${benefits}`;

  // 1. Coincidencia exacta completa en nombre (máxima relevancia)
  if (name.includes(normQ)) {
    return { matches: true, score: 100 };
  }

  // 2. Coincidencia completa en el corpus
  if (corpus.includes(normQ)) {
    return { matches: true, score: 80 };
  }

  // 3. Coincidencia por tokens y sinónimos (todas las palabras buscadas deben encontrar al menos un término afín)
  let totalScore = 0;
  for (const token of tokens) {
    const variants = getWordVariants(token);
    let tokenMatched = false;

    for (const v of variants) {
      if (name.includes(v)) {
        totalScore += 40;
        tokenMatched = true;
        break;
      } else if (brand.includes(v)) {
        totalScore += 30;
        tokenMatched = true;
        break;
      } else if (category.includes(v) || subcategory.includes(v)) {
        totalScore += 20;
        tokenMatched = true;
        break;
      } else if (variantsText.includes(v)) {
        totalScore += 20;
        tokenMatched = true;
        break;
      } else if (description.includes(v) || benefits.includes(v)) {
        totalScore += 10;
        tokenMatched = true;
        break;
      }
    }

    if (!tokenMatched) {
      return { matches: false, score: 0 };
    }
  }

  return { matches: true, score: totalScore };
}
