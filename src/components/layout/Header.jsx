import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductsContext';
import { useAuth } from '../../context/AuthContext';
import { matchProductSearch } from '../../utils/searchUtils';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { products } = useProducts();
  const { setIsCartOpen, totalItems } = useCart();
  const { currentUser, isAdmin, openAuthModal, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 90);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const navLinkStyle = {
    color: '#767676',
    transition: 'color var(--duration-fast)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontSize: '13px'
  };

  const mobileNavLinkStyle = {
    color: '#3B3537',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: '15px',
    fontWeight: '500',
    padding: '12px 0',
    borderBottom: '1px solid #f5f5f5',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer'
  };

  const iconStyle = {
    color: '#767676',
    cursor: 'pointer'
  };

  const { searchResults, totalSearchMatches } = React.useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return { searchResults: [], totalSearchMatches: 0 };
    const matches = [];
    (products || []).forEach(p => {
      if (p.hidden) return;
      const res = matchProductSearch(p, q);
      if (res.matches) {
        matches.push({ product: p, score: res.score });
      }
    });
    matches.sort((a, b) => b.score - a.score);
    return {
      searchResults: matches.slice(0, 8).map(m => m.product),
      totalSearchMatches: matches.length
    };
  }, [products, searchQuery]);

  const DesktopNav = () => (
    <nav className="desktop-only" style={{
      gap: 'var(--space-6)',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center'
    }}>
      <Link to="/" className="desktop-nav-link">INICIO</Link>
      <Link to="/shop?category=Accesorios" className="desktop-nav-link">ACCESORIOS</Link>
      <Link to="/shop?category=Capilar" className="desktop-nav-link">CABELLO</Link>
      <Link to="/shop?category=Skincare" className="desktop-nav-link">SKINCARE</Link>
      <Link to="/shop?category=Maquillaje" className="desktop-nav-link">MAQUILLAJE</Link>
    </nav>
  );

  const RightIcons = () => (
    <div className="header-right-icons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <AnimatePresence>
          {isSearchOpen && (
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 180, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSearch}
              style={{ overflow: 'hidden', marginRight: '6px' }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar o relacionados..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid #F3B1D5',
                  outline: 'none',
                  fontSize: '12px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(243, 177, 213, 0.25)'
                }}
              />
            </motion.form>
          )}
        </AnimatePresence>
        <div
          onClick={(e) => {
            if (isSearchOpen && searchQuery.trim()) {
              handleSearch(e);
            } else {
              setIsSearchOpen(!isSearchOpen);
            }
          }}
          className="header-icon-btn"
          title={isSearchOpen && searchQuery.trim() ? "Ver productos en pantalla" : "Buscar productos"}
          style={{ cursor: 'pointer' }}
        >
          <img src="/img/buscador.png" alt="Buscar" className="header-search-icon" />
        </div>

        {/* Search Dropdown Results */}
        <AnimatePresence>
          {isSearchOpen && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                width: '350px',
                maxWidth: 'calc(100vw - 32px)',
                backgroundColor: 'white',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                borderRadius: '12px',
                maxHeight: '460px',
                overflowY: 'auto',
                zIndex: 99,
                border: '1px solid #F3E5EB'
              }}
            >
              {/* Botón superior directo para ver todos los cards en pantalla completa */}
              <div
                onClick={handleSearch}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EE 100%)',
                  borderBottom: '1px solid #F3D2DF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderRadius: '12px 12px 0 0',
                  transition: 'background 0.2s ease'
                }}
                title="Ver todos los productos en tarjetas en la pantalla"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={15} color="#D9537F" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#D9537F' }}>
                    Ver resultados en pantalla
                  </span>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#3B3537',
                  backgroundColor: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: '1px solid #F3D2DF'
                }}>
                  {totalSearchMatches} {totalSearchMatches === 1 ? 'producto' : 'productos'} ➔
                </span>
              </div>

              <div style={{ padding: '0 16px' }}>
                {searchResults.map((p, idx) => (
                  <div key={p.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid #f5f5f5'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <img
                        src={p.mainImage}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, border: '1px solid #F5EBF0' }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <Link
                          to={`/product/${p.id}`}
                          onClick={() => { setIsSearchOpen(false); }}
                          style={{
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            fontSize: '13px',
                            display: 'block',
                            marginBottom: '3px',
                            lineHeight: '1.25',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.name}
                        </Link>
                        <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <span style={{ fontWeight: '700', color: '#D9537F' }}>{p.brand}</span> · {p.category}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '10px' }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px', color: '#3B3537' }}>
                        {p.price ? `$${p.price.toLocaleString()}` : 'Próximamente'}
                      </div>
                      <Link
                        to={`/product/${p.id}`}
                        onClick={() => { setIsSearchOpen(false); }}
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#F3B1D5',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          textDecoration: 'none',
                          letterSpacing: '0.05em'
                        }}
                      >
                        VER PRODUCTO
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón inferior siempre accesible */}
              <div
                onClick={handleSearch}
                style={{
                  padding: '11px 16px',
                  textAlign: 'center',
                  backgroundColor: '#FAFAFA',
                  borderTop: '1px solid #F0F0F0',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#D9537F',
                  borderRadius: '0 0 12px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>Ver todos los resultados para "{searchQuery}"</span>
                <span>➔</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Cart Button */}
        <div
          onClick={() => setIsCartOpen(true)}
          className="header-icon-btn"
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <img src="/img/bolsa.webp" alt="Carrito" className="header-cart-icon" />
          {totalItems > 0 && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-3px',
              backgroundColor: '#EAA3C7',
              color: 'white',
              fontSize: '9px',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1
            }}>
              {totalItems}
            </span>
          )}
        </div>

        {/* User / Admin Button */}
        <div style={{ position: 'relative' }}>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="header-icon-btn admin-badge-btn"
              title="Panel Administradora"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'linear-gradient(135deg, #FFF0F5 0%, #FEDDE6 100%)',
                border: '1px solid #EAA3C7',
                borderRadius: '20px',
                padding: '4px 10px',
                cursor: 'pointer',
                color: '#8A5B66',
                fontWeight: '700',
                fontSize: '11px',
                height: '32px'
              }}
            >
              <span>👑</span>
              <span className="desktop-only">Admin</span>
            </button>
          ) : currentUser ? (
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="header-icon-btn"
              title={currentUser.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#FEDDE6',
                border: '1px solid #EAA3C7',
                cursor: 'pointer',
                color: '#8A5B66',
                fontWeight: '700',
                fontSize: '12px'
              }}
            >
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <User size={16} />}
            </button>
          ) : (
            <div
              onClick={() => openAuthModal('login')}
              className="header-icon-btn"
              title="Iniciar Sesión / Registro"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <User size={21} color="#767676" />
            </div>
          )}

          {/* User Dropdown */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  border: '1px solid #F3E5EB',
                  padding: '12px',
                  minWidth: '210px',
                  zIndex: 110
                }}
              >
                {isAdmin ? (
                  <>
                    <div style={{ paddingBottom: '8px', borderBottom: '1px solid #f5f5f5', marginBottom: '8px' }}>
                      <p style={{ margin: 0, fontSize: '10px', color: '#8A5B66', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>👑 Sesión Administradora</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{currentUser?.name || 'Laura Rosero'}</p>
                    </div>
                    <button
                      onClick={() => { setIsUserMenuOpen(false); navigate('/admin'); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        backgroundColor: '#FEDDE6',
                        color: '#1A1A1A',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        marginBottom: '6px',
                        textAlign: 'left'
                      }}
                    >
                      <span>✏️</span> Editar Catálogo
                    </button>
                    <button
                      onClick={() => { setIsUserMenuOpen(false); logout(); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        color: '#991b1b',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={14} /> Cerrar Sesión
                    </button>
                  </>
                ) : currentUser ? (
                  <>
                    <div style={{ paddingBottom: '8px', borderBottom: '1px solid #f5f5f5', marginBottom: '8px' }}>
                      <p style={{ margin: 0, fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mi Cuenta</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: '700', color: '#1A1A1A' }}>{currentUser.name}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => { setIsUserMenuOpen(false); navigate('/checkout'); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#FAF5F7',
                        color: '#1A1A1A',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer',
                        marginBottom: '6px',
                        textAlign: 'left'
                      }}
                    >
                      <ShoppingBag size={14} /> Ir a Pagar
                    </button>
                    <button
                      onClick={() => { setIsUserMenuOpen(false); logout(); }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        color: '#991b1b',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={14} /> Cerrar Sesión
                    </button>
                  </>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </div>
  );

  return (
    <>
      {/* ===== MAIN HEADER (Relative, default layout) ===== */}
      <header className="main-header" style={{
        height: '90px',
        backgroundColor: 'white',
        position: 'relative',
        zIndex: 90
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%'
        }}>
          {/* Mobile: Hamburger Button */}
          <div className="mobile-only header-icon-btn" onClick={() => setIsMobileMenuOpen(true)} style={{ cursor: 'pointer', flex: '0 0 auto' }}>
            <Menu size={24} color="#3B3537" />
          </div>

          {/* Desktop: Nav Links (Left) */}
          <div className="desktop-only" style={{ flex: 1 }}>
            <DesktopNav />
          </div>

          {/* Logo (Center) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="/img/Logo luna sin fondo.png"
                alt="Luna Viva Beauty Logo"
                className="header-logo"
                style={{ objectFit: 'contain' }}
              />
            </Link>
          </div>

          {/* Icons (Right) */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end' }}>
            <RightIcons />
          </div>
        </div>
      </header>

      {/* ===== STICKY HEADER (Fixed, layout from screenshot) ===== */}
      <header className="sticky-header" style={{
        height: '65px',
        backgroundColor: 'white',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        transform: isScrolled ? 'translateY(0)' : 'translateY(-100%)',
        opacity: isScrolled ? 1 : 0,
        transition: isScrolled ? 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out' : 'none',
        pointerEvents: isScrolled ? 'auto' : 'none'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%'
        }}>
          {/* Mobile: Hamburger Button */}
          <div className="mobile-only header-icon-btn" onClick={() => setIsMobileMenuOpen(true)} style={{ cursor: 'pointer', flex: '0 0 auto' }}>
            <Menu size={24} color="#3B3537" />
          </div>

          {/* Logo (Left/Center) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }} className="mobile-center-logo">
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="/img/Logo luna sin fondo.png"
                alt="Luna Viva Beauty Logo"
                className="header-logo"
                style={{ objectFit: 'contain' }}
              />
            </Link>
          </div>

          {/* Desktop: Nav Links (Center) */}
          <div className="desktop-only" style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
            <DesktopNav />
          </div>

          {/* Icons (Right) */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end' }}>
            <RightIcons />
          </div>
        </div>
      </header>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'black',
                zIndex: 200
              }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '280px',
                maxWidth: '80vw',
                backgroundColor: 'white',
                zIndex: 201,
                display: 'flex',
                flexDirection: 'column',
                padding: '24px'
              }}
            >
              {/* Close button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <img
                  src="/img/Logo luna sin fondo.png"
                  alt="Luna Viva"
                  style={{ height: '40px' }}
                />
                <button onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex' }}>
                  <X size={24} color="#3B3537" />
                </button>
              </div>

              {/* Nav Links */}
              <nav style={{ display: 'flex', flexDirection: 'column' }}>
                <div onClick={() => handleNavClick('/')} style={mobileNavLinkStyle}>INICIO</div>
                <div onClick={() => handleNavClick('/shop?category=Accesorios')} style={mobileNavLinkStyle}>ACCESORIOS</div>
                <div onClick={() => handleNavClick('/shop?category=Capilar')} style={mobileNavLinkStyle}>CABELLO</div>
                <div onClick={() => handleNavClick('/shop?category=Skincare')} style={mobileNavLinkStyle}>SKINCARE</div>
                <div onClick={() => handleNavClick('/shop?category=Maquillaje')} style={mobileNavLinkStyle}>MAQUILLAJE</div>
                <div onClick={() => handleNavClick('/shop')} style={{ ...mobileNavLinkStyle, borderBottom: 'none', color: '#EAA3C7', fontWeight: '600' }}>VER TODO</div>
              </nav>

              {/* Bottom links & Auth */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '20px', borderTop: '1px solid #f5f5f5' }}>
                {currentUser ? (
                  <div style={{ backgroundColor: '#FAF5F7', padding: '12px', borderRadius: '10px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#FEDDE6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '12px',
                        color: '#8A5B66'
                      }}>
                        {isAdmin ? '👑' : (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U')}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {currentUser.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          {isAdmin ? 'Administradora' : currentUser.email}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => { setIsMobileMenuOpen(false); navigate('/admin'); }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          backgroundColor: '#FEDDE6',
                          color: '#1A1A1A',
                          border: '1px solid #EAA3C7',
                          padding: '8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          marginBottom: '6px'
                        }}
                      >
                        👑 Panel Administradora (Editar)
                      </button>
                    )}
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        color: '#991b1b',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <LogOut size={13} /> Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); openAuthModal('login'); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: '#FEDDE6',
                      color: '#1A1A1A',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <User size={16} /> Iniciar Sesión / Registro
                  </button>
                )}
                <div onClick={() => handleNavClick('/about')} style={{ fontSize: '13px', color: '#767676', cursor: 'pointer' }}>Nuestra Historia</div>
                <div onClick={() => handleNavClick('/contact')} style={{ fontSize: '13px', color: '#767676', cursor: 'pointer' }}>Contacto</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .desktop-nav-link {
          color: #767676;
          transition: color 0.2s ease-in-out;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 13px;
          text-decoration: none;
        }
        .desktop-nav-link:hover {
          color: #EAA3C7;
        }
        .header-icon-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.15s ease;
        }
        .header-icon-btn:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
        .header-search-icon {
          width: 25px;
          height: 25px;
          object-fit: contain;
          cursor: pointer;
          display: block;
        }
        .header-cart-icon {
          width: 25px;
          height: 25px;
          object-fit: contain;
          cursor: pointer;
          display: block;
        }
        .header-logo {
          height: 68px;
          width: 68px;
          object-fit: contain;
          display: block;
          transition: transform 0.2s ease;
        }
        .header-logo:hover {
          transform: scale(1.03);
        }
        @media (max-width: 768px) {
          .main-header {
            height: 62px !important;
          }
          .sticky-header {
            height: 62px !important;
          }
          .header-logo {
            height: 44px !important;
            width: 44px !important;
          }
          .header-icon-btn {
            width: 32px !important;
            height: 32px !important;
          }
          .header-search-icon {
            width: 23px !important;
            height: 23px !important;
          }
          .header-cart-icon {
            width: 23px !important;
            height: 23px !important;
          }
          .header-right-icons {
            gap: 4px !important;
          }
          .mobile-center-logo {
            justify-content: center !important;
          }
        }
      `}</style>
    </>
  );
}
