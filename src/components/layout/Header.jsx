import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductsContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { products } = useProducts();
  const { setIsCartOpen, totalItems } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
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

  const searchResults = searchQuery.trim()
    ? products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
    : [];

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
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <AnimatePresence>
          {isSearchOpen && (
            <motion.form
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 180, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSearch}
              style={{ overflow: 'hidden', marginRight: '8px' }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #ddd',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </motion.form>
          )}
        </AnimatePresence>
        <div onClick={() => setIsSearchOpen(!isSearchOpen)} style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/img/buscador.png" alt="Buscar" style={{ height: '70px', cursor: 'pointer' }} />
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
                top: 'calc(100% + 15px)',
                right: 0,
                width: '380px',
                maxWidth: '90vw',
                backgroundColor: 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                borderRadius: '8px',
                maxHeight: '450px',
                overflowY: 'auto',
                zIndex: 99
              }}
            >
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
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <Link
                          to={`/product/${p.id}`}
                          onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                          style={{
                            fontWeight: 'bold',
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            fontSize: '13px',
                            display: 'block',
                            marginBottom: '2px',
                            lineHeight: '1.2',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.name}
                        </Link>
                        <div style={{ fontSize: '10px', color: '#999', textTransform: 'uppercase' }}>
                          {p.category}{p.subcategory ? `, ${p.subcategory}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '6px' }}>
                        {p.price ? `$${p.price.toLocaleString()}` : 'Próximamente'}
                      </div>
                      <Link
                        to={`/product/${p.id}`}
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
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
                        LEER MÁS
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        onClick={() => setIsCartOpen(true)}
        style={{ position: 'relative', cursor: 'pointer', display: 'flex' }}
      >
        <img src="/img/bolsa.webp" alt="Carrito" style={{ height: '32px', cursor: 'pointer' }} />
        {totalItems > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-6px',
            backgroundColor: '#EAA3C7',
            color: 'white',
            fontSize: '11px',
            fontWeight: 'bold',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {totalItems}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ===== MAIN HEADER (Relative, default layout) ===== */}
      <header style={{
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
          <div className="mobile-only" onClick={() => setIsMobileMenuOpen(true)} style={{ cursor: 'pointer', flex: 1 }}>
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
                style={{ height: '70px', objectFit: 'contain' }}
              />
            </Link>
          </div>

          {/* Icons (Right) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <RightIcons />
          </div>
        </div>
      </header>

      {/* ===== STICKY HEADER (Fixed, layout from screenshot) ===== */}
      {/* Aparece con transición al bajar, desaparece sin transición al subir para no superponerse */}
      <header style={{
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
          <div className="mobile-only" onClick={() => setIsMobileMenuOpen(true)} style={{ cursor: 'pointer', flex: 1 }}>
            <Menu size={24} color="#3B3537" />
          </div>

          {/* Logo (Left/Center) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }} className="mobile-center-logo">
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="/img/Logo luna sin fondo.png"
                alt="Luna Viva Beauty Logo"
                style={{ height: '45px', objectFit: 'contain' }}
              />
            </Link>
          </div>

          {/* Desktop: Nav Links (Center) */}
          <div className="desktop-only" style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
            <DesktopNav />
          </div>

          {/* Icons (Right) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
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

              {/* Bottom links */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '24px', borderTop: '1px solid #f5f5f5' }}>
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
        @media (max-width: 768px) {
          .header-logo { height: 50px !important; }
          .mobile-center-logo { justify-content: center !important; }
        }
      `}</style>
    </>
  );
}
