import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, User, Lock, Mail, Phone, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    loginCustomer,
    registerCustomer,
    loginAdmin,
    loading
  } = useAuth();

  // Estados de formularios
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Calarcá');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [adminPin, setAdminPin] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleTabChange = (tab) => {
    setErrorMsg('');
    setSuccessMsg('');
    setAuthModalTab(tab);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }
    const res = await loginCustomer(loginEmail, loginPassword);
    if (!res.success) {
      setErrorMsg(res.error || 'Error al iniciar sesión.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Por favor completa nombre, correo y contraseña.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const res = await registerCustomer({
      name: regName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      address: regAddress,
      city: regCity
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Error al registrar la cuenta.');
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!adminPin) {
      setErrorMsg('Ingresa el PIN de Administradora.');
      return;
    }
    const res = await loginAdmin(adminPin);
    if (!res.success) {
      setErrorMsg(res.error || 'PIN incorrecto.');
    }
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        {/* Fondo oscurecido con desenfoque suave */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(27, 23, 24, 0.65)',
            backdropFilter: 'blur(4px)'
          }}
        />

        {/* Contenedor del Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'relative',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '460px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            zIndex: 10,
            padding: '28px 24px'
          }}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeAuthModal}
            type="button"
            aria-label="Cerrar"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: '#F9EEF2',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#3B3537'
            }}
          >
            <X size={18} />
          </button>

          {/* Encabezado con Logo y Bienvenida */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img
              src="/img/Logo luna sin fondo.png"
              alt="Luna Viva Logo"
              style={{ height: '54px', objectFit: 'contain', margin: '0 auto 8px' }}
            />
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#3B3537',
              margin: '0 0 4px',
              letterSpacing: '-0.01em'
            }}>
              {authModalTab === 'admin'
                ? 'Acceso de Administradora'
                : authModalTab === 'register'
                  ? 'Crear Cuenta en Luna Viva'
                  : 'Bienvenida a Luna Viva'}
            </h2>
            <p style={{ fontSize: '12.5px', color: '#777', margin: 0 }}>
              {authModalTab === 'admin'
                ? 'Ingresa tu PIN administrativo para editar el catálogo'
                : authModalTab === 'register'
                  ? 'Regístrate para comprar y agilizar tus envíos'
                  : 'Inicia sesión para gestionar tus compras'}
            </p>
          </div>

          {/* Selector de Pestañas */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F7EDF1',
            borderRadius: '12px',
            padding: '3px',
            marginBottom: '18px'
          }}>
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '10px',
                border: 'none',
                background: authModalTab === 'login' ? '#FFFFFF' : 'transparent',
                color: authModalTab === 'login' ? '#3B3537' : '#888',
                fontWeight: authModalTab === 'login' ? '700' : '500',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: authModalTab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '10px',
                border: 'none',
                background: authModalTab === 'register' ? '#FFFFFF' : 'transparent',
                color: authModalTab === 'register' ? '#3B3537' : '#888',
                fontWeight: authModalTab === 'register' ? '700' : '500',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: authModalTab === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Crear Cuenta
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: '10px',
                border: 'none',
                background: authModalTab === 'admin' ? '#FEDDE6' : 'transparent',
                color: authModalTab === 'admin' ? '#8A5B66' : '#888',
                fontWeight: authModalTab === 'admin' ? '700' : '500',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: authModalTab === 'admin' ? '0 2px 6px rgba(138,91,102,0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>👑</span> Admin
            </button>
          </div>

          {/* Alertas de error */}
          {errorMsg && (
            <div style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12.5px',
              marginBottom: '16px',
              lineHeight: 1.3
            }}>
              {errorMsg}
            </div>
          )}

          {/* TAB 1: INICIAR SESIÓN CLIENTE */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '5px', display: 'block' }}>
                  Correo Electrónico
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} color="#999" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '12px',
                      border: '1px solid #E5E0E2',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '5px', display: 'block' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} color="#999" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 36px',
                      borderRadius: '12px',
                      border: '1px solid #E5E0E2',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#3B3537',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '4px',
                  boxShadow: '0 4px 12px rgba(59,53,55,0.2)',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#777' }}>¿No tienes cuenta? </span>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  style={{ background: 'none', border: 'none', color: '#8A5B66', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Regístrate aquí
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CREAR CUENTA CLIENTE */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' }}>
                  Nombre Completo *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={16} color="#999" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre y apellido"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
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
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' }}>
                  Correo Electrónico *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} color="#999" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
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
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' }}>
                  Contraseña (mínimo 6 caracteres) *
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} color="#999" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 38px 9px 36px',
                      borderRadius: '12px',
                      border: '1px solid #E5E0E2',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' }}>
                    Teléfono WhatsApp
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Phone size={15} color="#999" style={{ position: 'absolute', left: '10px' }} />
                    <input
                      type="tel"
                      placeholder="321..."
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 10px 9px 32px',
                        borderRadius: '12px',
                        border: '1px solid #E5E0E2',
                        fontSize: '12.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' }}>
                    Ciudad
                  </label>
                  <input
                    type="text"
                    placeholder="Calarcá, Armenia..."
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '12px',
                      border: '1px solid #E5E0E2',
                      fontSize: '12.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '4px', display: 'block' }}>
                  Dirección de entrega (Opcional)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <MapPin size={15} color="#999" style={{ position: 'absolute', left: '10px' }} />
                  <input
                    type="text"
                    placeholder="Calle, Carrera, Barrio o Apto"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px 9px 32px',
                      borderRadius: '12px',
                      border: '1px solid #E5E0E2',
                      fontSize: '12.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#8A5B66',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '4px',
                  boxShadow: '0 4px 12px rgba(138,91,102,0.25)',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta y Continuar'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: '#777' }}>¿Ya tienes cuenta? </span>
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  style={{ background: 'none', border: 'none', color: '#3B3537', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Inicia sesión
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ACCESO ADMINISTRADORA */}
          {authModalTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                backgroundColor: '#FFF9F5',
                border: '1px solid #FEDDE6',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div style={{
                  backgroundColor: '#FEDDE6',
                  borderRadius: '10px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  👑
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#3B3537' }}>
                    Panel Exclusivo de Edición
                  </h4>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#777', lineHeight: 1.3 }}>
                    Te permite modificar las fotos, descripciones, beneficios y precios de cualquier producto del catálogo en tiempo real.
                  </p>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '6px', display: 'block' }}>
                  PIN o Clave de Administradora
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <ShieldCheck size={18} color="#8A5B66" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type={showAdminPin ? 'text' : 'password'}
                    required
                    placeholder="Ingresa PIN (5924)"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 38px',
                      borderRadius: '12px',
                      border: '1.5px solid #FEDDE6',
                      fontSize: '15px',
                      fontWeight: '600',
                      letterSpacing: showAdminPin ? 'normal' : '0.2em',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPin(!showAdminPin)}
                    style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}
                  >
                    {showAdminPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#8A5B66',
                  color: 'white',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(138,91,102,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
              >
                <span>👑</span>
                <span>{loading ? 'Verificando...' : 'Ingresar al Editor de Catálogo'}</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
