import React from 'react';
import { useCart } from '../../context/CartContext';
import { X, Trash2, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, totalItems, clearCart } = useCart();

  const handleClose = () => setIsCartOpen(false);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'black',
              zIndex: 1000,
              cursor: 'pointer'
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '400px',
              backgroundColor: '#F9F9F9',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '24px', 
              backgroundColor: 'white',
              borderBottom: '1px solid #EEEEEE'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    backgroundColor: '#E687B8',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {totalItems}
                  </div>
                </div>
                <h2 style={{ fontSize: '22px', margin: 0, color: '#777', fontWeight: '500' }}>Carrito</h2>
              </div>
              <button onClick={handleClose} style={{ color: '#999' }}>
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            {/* List */}
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px' }}>
              {cartItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{ 
                      display: 'flex', 
                      gap: '16px', 
                      backgroundColor: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--rosa-suave)' }}>
                        <img src={item.mainImage} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      
                      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ fontSize: '15px', margin: '0', color: '#666', fontWeight: '600' }}>{item.name}</h4>
                          <div style={{ display: 'flex', gap: '8px', color: '#999' }}>
                            <button style={{ color: '#999' }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            </button>
                            <button onClick={() => removeFromCart(item.id)} style={{ color: '#999' }}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          {/* Controles de cantidad estilo circular rosado */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                              style={{ 
                                width: '22px', height: '22px', 
                                backgroundColor: '#E687B8', color: 'white', 
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold'
                              }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '14px', color: '#777', minWidth: '12px', textAlign: 'center' }}>{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                              style={{ 
                                width: '22px', height: '22px', 
                                backgroundColor: '#E687B8', color: 'white', 
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold'
                              }}
                            >
                              +
                            </button>
                          </div>

                          <span style={{ fontWeight: '500', fontSize: '15px', color: '#666' }}>
                            {item.price ? `$${(item.price * item.quantity).toLocaleString('es-CO')}` : '[$0]'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                  <p>No tienes productos en tu carrito aún.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ backgroundColor: 'white', padding: '24px', borderTop: '1px solid #EEEEEE' }}>
              <div style={{ textAlign: 'right', marginBottom: '12px' }}>
                <button onClick={clearCart} style={{ color: '#888', fontSize: '13px' }}>
                  Vaciar Carrito
                </button>
              </div>
              
              <div style={{ borderTop: '1px dashed #CCC', margin: '0 0 16px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 'bold', color: '#666', fontSize: '16px' }}>Total</span>
                <span style={{ fontWeight: '500', color: '#666', fontSize: '16px' }}>
                  ${cartTotal.toLocaleString('es-CO')}
                </span>
              </div>
              
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
                Para conocer el costo de envío, proceda al pago.
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleClose} style={{ 
                  flex: 1, padding: '12px', backgroundColor: '#E687B8', color: 'white', 
                  borderRadius: '6px', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap'
                }}>
                  Seguir Comprando
                </button>
              
                <Link to="/checkout" onClick={handleClose} style={{ flex: 1, display: 'flex' }}>
                  <button style={{ 
                    width: '100%', padding: '12px', backgroundColor: '#E687B8', color: 'white', 
                    borderRadius: '6px', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap'
                  }}>
                    Finalizar Compra
                  </button>
                </Link>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
