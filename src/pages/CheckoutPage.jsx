import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Calarcá',
    paymentMethod: 'nequi',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    
    // Crear el mensaje formateado para enviar por WhatsApp
    const phoneNumber = "573218839425"; // Número oficial
    let orderDetails = `*NUEVO PEDIDO LUNA VIVA BEAUTY*\n\n`;
    orderDetails += `*Cliente:* ${formData.name}\n`;
    orderDetails += `*Teléfono:* ${formData.phone}\n`;
    orderDetails += `*Dirección:* ${formData.address}, ${formData.city}\n`;
    orderDetails += `*Método de Pago:* ${formData.paymentMethod.toUpperCase()}\n`;
    if (formData.notes) {
      orderDetails += `*Notas:* ${formData.notes}\n`;
    }
    orderDetails += `\n*Productos:*\n`;
    
    cartItems.forEach((item, index) => {
      const priceText = item.price ? `$ ${item.price.toLocaleString('es-CO')}` : '[Precio a definir]';
      orderDetails += `${index + 1}. ${item.name} (${item.brand}) x${item.quantity} - ${priceText}\n`;
    });

    if (cartTotal > 0) {
      orderDetails += `\n*Total Estimado:* $ ${cartTotal.toLocaleString('es-CO')}\n`;
    }

    const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderDetails)}`;
    
    // Abrir WhatsApp en otra pestaña
    window.open(waLink, '_blank');
    
    // Limpiar carrito después de enviar
    clearCart();
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: 'var(--space-16) 0', textAlign: 'center', backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
        <div className="container">
          <h2>Tu bolsa está vacía</h2>
          <p style={{ marginBottom: 'var(--space-6)' }}>Agrega productos a tu bolsa para continuar con el pago.</p>
          <Link to="/shop">
            <Button variant="primary">Explorar Tienda</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: 'var(--space-10) 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-sm)', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Volver a la Tienda
        </Link>

        <h1 style={{ fontSize: 'var(--text-4xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-8)' }}>
          Finalizar Compra
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-8)'
        }}>
          {/* Formulario */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Datos de Envío</h3>
            <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>Nombre Completo</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="Ej. Laura Restrepo"
                  style={{ padding: '8px 12px', border: '1px solid var(--rosa-suave)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>Celular / WhatsApp</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  value={formData.phone} 
                  onChange={handleChange}
                  placeholder="Ej. 3001234567"
                  style={{ padding: '8px 12px', border: '1px solid var(--rosa-suave)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>Ciudad</label>
                <input 
                  type="text" 
                  name="city" 
                  required 
                  value={formData.city} 
                  onChange={handleChange}
                  placeholder="Ej. Calarcá"
                  style={{ padding: '8px 12px', border: '1px solid var(--rosa-suave)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>Dirección de Entrega</label>
                <input 
                  type="text" 
                  name="address" 
                  required 
                  value={formData.address} 
                  onChange={handleChange}
                  placeholder="Ej. Calle 30 # 24-10"
                  style={{ padding: '8px 12px', border: '1px solid var(--rosa-suave)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>Método de Pago</label>
                <select 
                  name="paymentMethod" 
                  value={formData.paymentMethod} 
                  onChange={handleChange}
                  style={{ padding: '8px 12px', border: '1px solid var(--rosa-suave)', borderRadius: 'var(--radius-md)' }}
                >
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="efectivo">Efectivo contra entrega (Calarcá)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>Notas del pedido</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange}
                  placeholder="Ej. Tono del corrector, indicaciones del envío..."
                  style={{ padding: '8px 12px', border: '1px solid var(--rosa-suave)', borderRadius: 'var(--radius-md)', minHeight: '80px', fontFamily: 'var(--font-body)' }}
                />
              </div>

              <Button type="submit" variant="primary" size="lg" style={{ display: 'flex', gap: '8px', backgroundColor: '#25D366', color: 'white', marginTop: 'var(--space-2)' }}>
                <MessageCircle size={20} /> Procesar en WhatsApp
              </Button>

            </form>
          </div>

          {/* Resumen del pedido */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Resumen</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{item.name} x{item.quantity}</span>
                  <span style={{ fontWeight: '500' }}>{item.price ? `$ ${(item.price * item.quantity).toLocaleString('es-CO')}` : '[PRECIO]'}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--rosa-suave)', paddingTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: 'var(--text-lg)' }}>
              <span>Total Estimado</span>
              <span>{cartTotal > 0 ? `$ ${cartTotal.toLocaleString('es-CO')}` : '[Definir Precios]'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
