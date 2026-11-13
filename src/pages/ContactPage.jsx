import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function ContactPage() {
  const phoneNumber = "573218839425"; // Número oficial
  const waMessage = encodeURIComponent("¡Hola! Me gustaría ponerme en contacto con ustedes.");

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: 'var(--space-16) 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h1 style={{ fontSize: 'var(--text-5xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Ponte en Contacto</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Estamos aquí para escucharte y asesorarte</p>
        </div>

        <div className="contact-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-8)'
        }}>

        <style>{`
          @media (max-width: 768px) {
            .contact-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
          {/* Canales de Contacto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ backgroundColor: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--rosa-suave)', borderRadius: '50%' }}>
                <MapPin color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', margin: 0 }}>Ubicación Física</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Calarcá, Quindío - Colombia</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--rosa-suave)', borderRadius: '50%' }}>
                <Phone color="var(--accent)" />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', margin: 0 }}>Línea Celular</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>+57 321 883 9425</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--rosa-suave)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', margin: 0 }}>Instagram</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>@lunavivabeauty</p>
              </div>
            </div>

          </div>

          {/* Formulario de Mensaje */}
          <div style={{ backgroundColor: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>Escríbenos directamente</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>Nombre</label>
                <input type="text" placeholder="Ej. Ana María" style={{ padding: '8px 12px', border: '1px solid var(--rosa-suave)', borderRadius: 'var(--radius-md)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>Celular</label>
                <input type="tel" placeholder="Ej. 300 123 4567" style={{ padding: '8px 12px', border: '1px solid var(--rosa-suave)', borderRadius: 'var(--radius-md)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: '500' }}>Mensaje</label>
                <textarea placeholder="Cuéntanos en qué te podemos asesorar..." style={{ padding: '8px 12px', border: '1px solid var(--rosa-suave)', borderRadius: 'var(--radius-md)', minHeight: '100px', fontFamily: 'var(--font-body)' }} />
              </div>
              <a 
                href={`https://wa.me/${phoneNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="md" fullWidth style={{ display: 'flex', gap: '8px', backgroundColor: '#25D366', color: 'white' }}>
                  <MessageCircle size={18} /> Enviar a WhatsApp
                </Button>
              </a>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
