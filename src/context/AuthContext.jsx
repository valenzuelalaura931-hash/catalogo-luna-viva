import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const SUPABASE_URL = "https://oytdvgeyvuxqafxmgtcp.supabase.co/rest/v1";
const SUPABASE_KEY = "sb_publishable__oG8sW5N2U7Bg018wfPL3w_3xWijWth";

const ADMIN_PIN = "5924";
const ADMIN_EMAIL = "lunaviva423@gmail.com";
const ADMIN_PASSWORD = "lqur@123";
const STORAGE_KEY_CUSTOMER = "luna_viva_customer_session_v1";
const STORAGE_KEY_ADMIN = "luna_viva_admin_session_v1";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const adminSession = localStorage.getItem(STORAGE_KEY_ADMIN);
        if (adminSession) {
          const parsed = JSON.parse(adminSession);
          if (parsed && parsed.role === 'admin') return parsed;
        }
        const custSession = localStorage.getItem(STORAGE_KEY_CUSTOMER);
        if (custSession) {
          const parsed = JSON.parse(custSession);
          if (parsed && parsed.role === 'customer') return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register' | 'admin'
  const [loading, setLoading] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Abrir / Cerrar modal
  const openAuthModal = useCallback((tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Registrar nuevo cliente en Supabase
  const registerCustomer = async ({ name, email, password, phone, address, city }) => {
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      
      if (cleanEmail === ADMIN_EMAIL) {
        throw new Error('Este correo corresponde a la cuenta de Administradora. Inicia sesión en la pestaña "Iniciar Sesión".');
      }
      
      // 1. Verificar si ya existe una cuenta con este correo
      const checkRes = await fetch(`${SUPABASE_URL}/accounts?channel=eq.web_customer&select=*`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });
      
      if (checkRes.ok) {
        const existingAccounts = await checkRes.json();
        const exists = existingAccounts.some(acc => {
          try {
            const meta = JSON.parse(acc.notes || '{}');
            return (meta.email || '').toLowerCase() === cleanEmail;
          } catch (e) {
            return false;
          }
        });

        if (exists) {
          throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
        }
      }

      // 2. Crear nuevo registro de cliente en Supabase accounts
      const newAccountId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const accountPayload = {
        id: newAccountId,
        customerName: name.trim(),
        phone: (phone || '').trim(),
        channel: 'web_customer',
        notes: JSON.stringify({
          email: cleanEmail,
          password: password, // Almacenado para verificación de sesión
          address: (address || '').trim(),
          city: (city || 'Calarcá').trim(),
          createdAt: new Date().toISOString()
        })
      };

      const insertRes = await fetch(`${SUPABASE_URL}/accounts`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(accountPayload)
      });

      if (!insertRes.ok) {
        throw new Error('No se pudo registrar la cuenta. Por favor intenta nuevamente.');
      }

      const userObj = {
        id: newAccountId,
        name: name.trim(),
        email: cleanEmail,
        phone: (phone || '').trim(),
        address: (address || '').trim(),
        city: (city || 'Calarcá').trim(),
        role: 'customer'
      };

      localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(userObj));
      localStorage.removeItem(STORAGE_KEY_ADMIN);
      setCurrentUser(userObj);
      closeAuthModal();
      return { success: true, user: userObj };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión cliente o Administradora
  const loginCustomer = async (email, password) => {
    setLoading(true);
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      // 1. Verificación directa de cuenta Administradora (Laura)
      if (cleanEmail === ADMIN_EMAIL) {
        if (cleanPassword === ADMIN_PASSWORD || cleanPassword === ADMIN_PIN) {
          const adminUser = {
            id: 'admin_laura',
            name: 'Laura Rosero',
            email: ADMIN_EMAIL,
            role: 'admin'
          };

          localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(adminUser));
          localStorage.removeItem(STORAGE_KEY_CUSTOMER);
          setCurrentUser(adminUser);
          closeAuthModal();
          return { success: true, user: adminUser };
        } else {
          throw new Error('Contraseña de Administradora incorrecta.');
        }
      }
      
      const res = await fetch(`${SUPABASE_URL}/accounts?channel=eq.web_customer&select=*`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!res.ok) {
        throw new Error('Error al conectar con el servidor.');
      }

      const accounts = await res.json();
      let matched = null;

      for (const acc of accounts) {
        try {
          const meta = JSON.parse(acc.notes || '{}');
          if ((meta.email || '').toLowerCase() === cleanEmail) {
            if (meta.password === cleanPassword) {
              matched = {
                id: acc.id,
                name: acc.customerName,
                email: meta.email,
                phone: acc.phone || '',
                address: meta.address || '',
                city: meta.city || 'Calarcá',
                role: 'customer'
              };
              break;
            } else {
              throw new Error('Contraseña incorrecta. Por favor verifica tus datos.');
            }
          }
        } catch (e) {
          if (e.message.includes('Contraseña incorrecta')) throw e;
        }
      }

      if (!matched) {
        throw new Error('No encontramos ninguna cuenta con este correo.');
      }

      localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(matched));
      localStorage.removeItem(STORAGE_KEY_ADMIN);
      setCurrentUser(matched);
      closeAuthModal();
      return { success: true, user: matched };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión Administradora (Laura)
  const loginAdmin = async (pinOrPassword) => {
    setLoading(true);
    try {
      const cleanPin = (pinOrPassword || '').trim();
      if (cleanPin === ADMIN_PIN || cleanPin === ADMIN_PASSWORD || cleanPin.toLowerCase() === 'admin5924' || cleanPin.toLowerCase() === 'laura5924') {
        const adminUser = {
          id: 'admin_laura',
          name: 'Laura Rosero',
          email: ADMIN_EMAIL,
          role: 'admin'
        };

        localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(adminUser));
        localStorage.removeItem(STORAGE_KEY_CUSTOMER);
        setCurrentUser(adminUser);
        closeAuthModal();
        return { success: true, user: adminUser };
      } else {
        throw new Error('PIN o contraseña de Administradora incorrecta.');
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_CUSTOMER);
    localStorage.removeItem(STORAGE_KEY_ADMIN);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      loading,
      isAuthModalOpen,
      authModalTab,
      openAuthModal,
      closeAuthModal,
      setAuthModalTab,
      registerCustomer,
      loginCustomer,
      loginAdmin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
