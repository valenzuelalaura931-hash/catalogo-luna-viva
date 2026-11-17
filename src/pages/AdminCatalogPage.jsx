import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Image as ImageIcon,
  Check,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Star,
  RefreshCw,
  Eye,
  Lock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export function AdminCatalogPage() {
  const { isAdmin, currentUser, loginAdmin, logout } = useAuth();
  const { products, updateProductDetails, refreshProducts } = useProducts();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Estados de login administrativo si no está autenticada
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Producto en edición
  const preselectId = searchParams.get('edit');
  const [editingProduct, setEditingProduct] = useState(() => {
    if (preselectId && products) {
      return products.find(p => p.id === preselectId) || null;
    }
    return null;
  });

  // Campos del formulario de edición
  const [editDescription, setEditDescription] = useState(() => editingProduct?.description || '');
  const [editMainImage, setEditMainImage] = useState(() => editingProduct?.mainImage || '');
  const [editImages, setEditImages] = useState(() => {
    if (!editingProduct) return [];
    const imgs = [];
    if (editingProduct.mainImage) imgs.push(editingProduct.mainImage);
    if (Array.isArray(editingProduct.images)) {
      editingProduct.images.forEach(img => {
        if (img && !imgs.includes(img)) imgs.push(img);
      });
    }
    return imgs;
  });
  const [newImageUrl, setNewImageUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);

  // Marcas y categorías únicas
  const brands = useMemo(() => {
    return ['Todas', ...new Set(products.map(p => p.brand).filter(Boolean))].sort();
  }, [products]);

  const categories = useMemo(() => {
    return ['Todas', ...new Set(products.map(p => p.category).filter(Boolean))].sort();
  }, [products]);

  // Lista de productos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'Todas' || p.brand === selectedBrand;
      const q = searchQuery.toLowerCase().trim();
      const matchQ = !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));
      return matchCat && matchBrand && matchQ;
    });
  }, [products, selectedCategory, selectedBrand, searchQuery]);

  // Abrir editor para un producto y cargar TODAS sus fotos existentes y descripción
  const handleStartEdit = (prod) => {
    if (!prod) return;
    setEditingProduct(prod);
    setEditDescription(prod.description || '');

    const isValid = (u) => Boolean(u && typeof u === 'string' && !u.includes('banner candy bum'));

    // 1. Determinar foto principal existente
    const rawMain = prod.mainImage || (Array.isArray(prod.images) && prod.images[0]) || '';
    const mainImg = isValid(rawMain) ? rawMain : '';
    setEditMainImage(mainImg);

    // 2. Recopilar todas las fotos existentes del producto para la galería
    const collected = [];
    if (mainImg) collected.push(mainImg);
    if (Array.isArray(prod.images)) {
      prod.images.forEach(img => {
        if (isValid(img) && !collected.includes(img)) collected.push(img);
      });
    }
    setEditImages(collected);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasInitializedPreselectRef = useRef(null);

  // Sincronizar automáticamente si se pasa ?edit=LV-XXXX
  useEffect(() => {
    if (preselectId && products && products.length > 0) {
      if (hasInitializedPreselectRef.current !== preselectId) {
        const found = products.find(p => p.id === preselectId);
        if (found) {
          hasInitializedPreselectRef.current = preselectId;
          handleStartEdit(found);
        }
      }
    }
  }, [preselectId, products]);

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  // Comprimir imagen seleccionada a WebP ligero
  const processImageFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject('No se seleccionó ningún archivo');
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 900;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', 0.82);
          resolve(dataUrl);
        };
        img.onerror = () => reject('Error al procesar la imagen');
        img.src = event.target.result;
      };
      reader.onerror = () => reject('Error al leer el archivo');
      reader.readAsDataURL(file);
    });
  };

  // Subir foto principal
  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Comprimiendo y cargando foto...', 'info');
      const dataUrl = await processImageFile(file);
      setEditMainImage(dataUrl);
      if (!editImages.includes(dataUrl)) {
        setEditImages([dataUrl, ...editImages]);
      }
      showToast('Foto cargada en vista previa. Recuerda guardar cambios.', 'success');
    } catch (err) {
      showToast('No se pudo cargar la imagen.', 'error');
    }
  };

  // Subir foto a la galería
  const handleGalleryImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Cargando foto adicional...', 'info');
      const dataUrl = await processImageFile(file);
      if (!editImages.includes(dataUrl)) {
        setEditImages([...editImages, dataUrl]);
      }
      showToast('Foto agregada a la galería. Recuerda guardar cambios.', 'success');
    } catch (err) {
      showToast('No se pudo cargar la foto.', 'error');
    }
  };

  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (!editImages.includes(url)) {
      setEditImages([...editImages, url]);
      if (!editMainImage) setEditMainImage(url);
    }
    setNewImageUrl('');
    showToast('Imagen agregada a la galería.', 'success');
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    const imgToRemove = editImages[indexToRemove];
    const filtered = editImages.filter((_, idx) => idx !== indexToRemove);
    setEditImages(filtered);
    if (imgToRemove === editMainImage) {
      setEditMainImage(filtered.length > 0 ? filtered[0] : '');
    }
    showToast('✓ Foto eliminada de la galería. Recuerda hacer clic en "Guardar en Catálogo" para confirmar.', 'info');
  };

  const handleRemoveMainImage = () => {
    const current = editMainImage;
    setEditMainImage('');
    setEditImages(prev => prev.filter(img => img !== current));
    showToast('✓ Foto de portada removida. Recuerda hacer clic en "Guardar en Catálogo" para confirmar.', 'info');
  };

  const handleSetAsMainImage = (imgUrl) => {
    setEditMainImage(imgUrl);
    if (!editImages.includes(imgUrl)) {
      setEditImages([imgUrl, ...editImages]);
    }
    showToast('✓ Establecida como foto de portada principal.', 'success');
  };

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Guardar cambios en Supabase (Solo descripción y fotos)
  const handleSaveProduct = async (e) => {
    if (e) e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);

    try {
      const res = await updateProductDetails(editingProduct.id, {
        description: editDescription.trim(),
        mainImage: editMainImage.trim(),
        images: editImages.filter(Boolean)
      });

      if (res.success) {
        showToast('✓ ¡Descripción y fotos actualizadas con éxito!', 'success');
        setEditingProduct(null);
      } else {
        showToast(res.error || 'Error al guardar cambios.', 'error');
      }
    } catch (err) {
      showToast('Ocurrió un error al guardar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setPinError('');
    setLoginLoading(true);
    const res = await loginAdmin(pinInput);
    setLoginLoading(false);
    if (!res.success) {
      setPinError(res.error || 'PIN incorrecto.');
    }
  };

  // Si no está autenticada como Administradora, mostrar pantalla de PIN
  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '85vh',
        backgroundColor: '#FFF5F8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px 28px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.08)',
          textAlign: 'center',
          border: '1px solid #FEDDE6'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#FEDDE6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            margin: '0 auto 16px'
          }}>
            👑
          </div>
          <h2 style={{ fontSize: '22px', color: '#3B3537', margin: '0 0 6px', fontWeight: '700' }}>
            Panel de Administradora
          </h2>
          <p style={{ fontSize: '13px', color: '#777', margin: '0 0 24px', lineHeight: 1.4 }}>
            Ingresa tu PIN administrativo para acceder a la edición de fotos y descripciones del catálogo.
          </p>

          {pinError && (
            <div style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12.5px',
              marginBottom: '16px'
            }}>
              {pinError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color="#8A5B66" style={{ position: 'absolute', left: '14px' }} />
              <input
                type="password"
                required
                autoFocus
                placeholder="Ingresa tu PIN (5924)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px 14px 13px 42px',
                  borderRadius: '12px',
                  border: '1.5px solid #FEDDE6',
                  fontSize: '16px',
                  fontWeight: '600',
                  outline: 'none',
                  letterSpacing: '0.2em',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                backgroundColor: '#8A5B66',
                color: 'white',
                padding: '13px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '700',
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(138,91,102,0.3)',
                transition: 'background 0.2s'
              }}
            >
              {loginLoading ? 'Verificando...' : 'Ingresar al Editor'}
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <Link to="/shop" style={{ fontSize: '13px', color: '#777', textDecoration: 'none' }}>
              ← Volver a la Tienda Pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FFF5F8', minHeight: '100vh', padding: '24px 0 60px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          backgroundColor: toastType === 'error' ? '#EF4444' : '#10B981',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '14px',
          fontSize: '13.5px',
          fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastType === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="container">
        {/* Barra superior de Administradora */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '18px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          border: '1px solid #FEDDE6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              backgroundColor: '#FEDDE6',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              👑
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#3B3537', margin: 0 }}>
                Editor de Catálogo — Luna Viva
              </h1>
              <span style={{ fontSize: '12px', color: '#8A5B66', fontWeight: '500' }}>
                Sesión activa: Laura (Administradora)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#F9EEF2',
                color: '#3B3537',
                fontSize: '12.5px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <Eye size={15} /> Ver Catálogo Público
            </Link>
            <button
              onClick={logout}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #E5E0E2',
                backgroundColor: '#FFFFFF',
                color: '#777',
                fontSize: '12.5px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* SI HAY UN PRODUCTO EN EDICIÓN: PANEL DETALLADO */}
        {editingProduct ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '28px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1.5px solid #FEDDE6',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '22px',
              paddingBottom: '16px',
              borderBottom: '1px solid #F5EBF0'
            }}>
              <div>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8A5B66',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 0,
                    marginBottom: '6px'
                  }}
                >
                  <ArrowLeft size={16} /> Volver a la lista de productos
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#3B3537', margin: 0 }}>
                  Editando: {editingProduct.name}
                </h2>
                <span style={{ fontSize: '12px', color: '#777' }}>
                  SKU: {editingProduct.id} • Marca: {editingProduct.brand} • Categoría: {editingProduct.category}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    backgroundColor: '#fff',
                    color: '#666',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={saving}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#8A5B66',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(138,91,102,0.3)'
                  }}
                >
                  <Save size={16} /> {saving ? 'Guardando...' : 'Guardar en Catálogo'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
              {/* Columna Izquierda: Información del Inventario (Solo lectura) y Descripciones */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Info sincronizada desde el Inventario (Solo lectura) */}
                <div style={{
                  backgroundColor: '#FAF5F7',
                  border: '1px solid #F3E5EB',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', color: '#8A5B66', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                      🔒 Sincronizado desde el Inventario
                    </span>
                    <strong style={{ fontSize: '14px', color: '#1A1A1A', marginTop: '2px' }}>
                      {editingProduct.name}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Precio</span>
                      <strong style={{ fontSize: '14px', color: '#1A1A1A' }}>
                        ${editingProduct.price ? editingProduct.price.toLocaleString('es-CO') : 0}
                      </strong>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: '#888', display: 'block' }}>Stock</span>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: editingProduct.stock > 0 ? '#DCFCE7' : '#FEE2E2',
                        color: editingProduct.stock > 0 ? '#166534' : '#991B1B'
                      }}>
                        {editingProduct.stock} unid.
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#3B3537', marginBottom: '6px', display: 'block' }}>
                    Descripción del Producto
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Escribe la descripción detallada, características y recomendaciones del producto..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #E5E0E2',
                      fontSize: '13.5px',
                      outline: 'none',
                      lineHeight: 1.5,
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#888', marginTop: '4px', display: 'block' }}>
                    Esta descripción es la que verán tus clientes en la ficha del producto.
                  </span>
                </div>
              </div>

              {/* Columna Derecha: Gestor de Fotos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Foto Principal */}
                <div style={{
                  backgroundColor: '#FFF5F8',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid #FEDDE6'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#3B3537' }}>
                      Foto Principal (Portada)
                    </label>
                    <span style={{ fontSize: '11px', color: '#8A5B66', fontWeight: '600' }}>
                      Se mostrará en la tienda
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    minHeight: '200px',
                    maxHeight: '480px',
                    borderRadius: '12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #E5E0E2',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    position: 'relative'
                  }}>
                    {editMainImage ? (
                      <>
                        <img
                          src={editMainImage}
                          alt="Foto principal"
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '480px',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                          onError={(e) => { e.target.src = '/img/Logo luna sin fondo.png'; }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveMainImage}
                          title="Quitar foto de portada"
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: '#E11D48',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                            zIndex: 3
                          }}
                        >
                          <Trash2 size={13} /> Quitar Portada
                        </button>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>
                        <ImageIcon size={36} color="#ccc" style={{ marginBottom: '6px' }} />
                        <p style={{ margin: 0 }}>Sin foto principal</p>
                      </div>
                    )}
                  </div>

                  {/* Botón para subir archivo desde celular o PC */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#8A5B66',
                        color: 'white',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Upload size={15} /> Subir Foto
                    </button>
                  </div>

                  {/* O pegar URL directa */}
                  <div>
                    <label style={{ fontSize: '11px', color: '#777', marginBottom: '4px', display: 'block' }}>
                      O pegar URL directa de la foto:
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={editMainImage}
                      onChange={(e) => setEditMainImage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Galería de Fotos Adicionales */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid #E5E0E2'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#3B3537', display: 'block' }}>
                        Galería de Fotos ({editImages.length})
                      </label>
                      <span style={{ fontSize: '11px', color: '#888' }}>
                        Haz clic en ✕ para borrar una foto o en ⭐ para hacerla foto de portada
                      </span>
                    </div>
                  </div>

                  {/* Miniaturas de la galería */}
                  {editImages.length === 0 ? (
                    <div style={{
                      backgroundColor: '#FAF5F7',
                      border: '1px dashed #EAA3C7',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'center',
                      color: '#8A5B66',
                      fontSize: '12px',
                      marginBottom: '14px'
                    }}>
                      No hay fotos en la galería todavía. Puedes subir fotos desde tu celular/PC abajo.
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                      gap: '12px',
                      marginBottom: '14px'
                    }}>
                      {editImages.map((imgUrl, idx) => {
                        const isMain = imgUrl === editMainImage;
                        return (
                          <div
                            key={idx}
                            style={{
                              position: 'relative',
                              height: '95px',
                              borderRadius: '10px',
                              border: isMain ? '2px solid #8A5B66' : '1px solid #E5E0E2',
                              overflow: 'hidden',
                              backgroundColor: '#fff',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                            }}
                          >
                            <img
                              src={imgUrl}
                              alt={`Foto ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                              onError={(e) => { e.target.src = '/img/Logo luna sin fondo.png'; }}
                            />
                            {/* Botón eliminar claramente visible en rojo */}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              title="Eliminar esta foto"
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                backgroundColor: '#E11D48',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                                zIndex: 3
                              }}
                            >
                              <Trash2 size={13} />
                            </button>

                            {/* Badge o Botón hacer principal */}
                            {isMain ? (
                              <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: 'rgba(138, 91, 102, 0.95)',
                                color: '#FFF',
                                fontSize: '9px',
                                fontWeight: '700',
                                textAlign: 'center',
                                padding: '3px 0',
                                letterSpacing: '0.04em'
                              }}>
                                ⭐ PORTADA
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetAsMainImage(imgUrl)}
                                title="Usar como foto principal de portada"
                                style={{
                                  position: 'absolute',
                                  bottom: '4px',
                                  left: '4px',
                                  backgroundColor: '#FFFFFF',
                                  color: '#B58B3A',
                                  border: '1px solid #E5E0E2',
                                  borderRadius: '4px',
                                  padding: '2px 6px',
                                  fontSize: '10px',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                                  zIndex: 2
                                }}
                              >
                                <Star size={10} fill="#B58B3A" /> Portada
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Input para agregar más fotos */}
                  <input
                    type="file"
                    ref={galleryFileInputRef}
                    accept="image/*"
                    onChange={handleGalleryImageUpload}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #FEDDE6',
                        backgroundColor: '#FFF5F8',
                        color: '#8A5B66',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Plus size={14} /> Subir Foto Adicional
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="O pegar URL de foto..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#3B3537',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Botón Guardar Inferior */}
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: '#8A5B66',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 18px rgba(138,91,102,0.3)',
                    marginTop: 'auto'
                  }}
                >
                  <Save size={18} /> {saving ? 'Guardando cambios...' : 'Guardar Producto en el Catálogo'}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* LISTADO DE PRODUCTOS DEL CATÁLOGO */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          border: '1px solid #EFE6EA'
        }}>
          {/* Barra de Filtros */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Buscador */}
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <Search size={16} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre, marca, SKU o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '12px',
                  border: '1px solid #E5E0E2',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Filtro Marca */}
            <div style={{ minWidth: '150px' }}>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  border: '1px solid #E5E0E2',
                  fontSize: '13px',
                  backgroundColor: '#fff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {brands.map(b => (
                  <option key={b} value={b}>Marca: {b}</option>
                ))}
              </select>
            </div>

            {/* Filtro Categoría */}
            <div style={{ minWidth: '150px' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  border: '1px solid #E5E0E2',
                  fontSize: '13px',
                  backgroundColor: '#fff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {categories.map(c => (
                  <option key={c} value={c}>Categoría: {c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => refreshProducts()}
              title="Refrescar datos desde Supabase"
              style={{
                padding: '9px 12px',
                borderRadius: '12px',
                border: '1px solid #E5E0E2',
                backgroundColor: '#fff',
                color: '#3B3537',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} /> Sincronizar
            </button>
          </div>

          <div style={{ fontSize: '12.5px', color: '#888', marginBottom: '14px' }}>
            Mostrando <strong>{filteredProducts.length}</strong> de {products.length} productos
          </div>

          {/* Grilla / Lista de Productos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {filteredProducts.slice(0, 60).map((prod) => {
              const isSelected = editingProduct?.id === prod.id;
              const hasCustomPhotos = prod.images && prod.images.length > 1;
              return (
                <div
                  key={prod.id}
                  style={{
                    backgroundColor: isSelected ? '#FFF5F8' : '#FFFFFF',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid #8A5B66' : '1px solid #EFE6EA',
                    padding: '12px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    boxShadow: isSelected ? '0 4px 14px rgba(138,91,102,0.15)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img
                    src={prod.mainImage || '/img/Logo luna.png'}
                    alt={prod.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      objectFit: 'contain',
                      backgroundColor: '#FBF8FA',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '10.5px', color: '#999', textTransform: 'uppercase', fontWeight: '600' }}>
                      {prod.brand} • {prod.category}
                    </span>
                    <h4 style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#3B3537',
                      margin: '2px 0 4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {prod.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <strong style={{ color: '#8A5B66' }}>
                        ${prod.price ? prod.price.toLocaleString('es-CO') : '0'}
                      </strong>
                      <span style={{ color: prod.stock > 0 ? '#10B981' : '#EF4444', fontWeight: '500' }}>
                        Stock: {prod.stock}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartEdit(prod)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isSelected ? '#8A5B66' : '#F7EDF1',
                      color: isSelected ? '#FFFFFF' : '#8A5B66',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Editar
                  </button>
                </div>
              );
            })}
          </div>

          {filteredProducts.length > 60 && (
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '12.5px' }}>
              Usa el buscador o filtros para encontrar productos específicos entre los {filteredProducts.length} resultados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
