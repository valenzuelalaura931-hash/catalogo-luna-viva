import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#E49EBC', padding: 'var(--space-12) 0 var(--space-6)', color: 'white' }}>
      <div className="container footer-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-8)',
        marginBottom: 'var(--space-12)'
      }}>
        <div>
          <img
            src="/img/logo_24.png"
            alt="Luna Viva Beauty Logo"
            style={{ height: '90px', marginBottom: 'var(--space-4)' }}
          />
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
            Tu belleza. Tu expresión. Tu momento.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <a href="https://www.instagram.com/luna_viva_/" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span>@luna_viva_</span>
            </a>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)', color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Enlaces Rápidos</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li><Link to="/shop" className="footer-link">Tienda</Link></li>
            <li><Link to="/about" className="footer-link">Nuestra Historia</Link></li>
            <li><Link to="/experience" className="footer-link">Experiencia Física</Link></li>
            <li><Link to="/contact" className="footer-link">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-base)', color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Contacto</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <li>
              <a href="https://share.google/Q61pFWAyGTmB8E09Z" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Cra 25 #32-05<br />Calarcá, Quindío<br />Colombia</span>
              </a>
            </li>
            <li>
              <a href="https://wa.me/573218839425?text=%C2%A1Hola!%20Me%20gustar%C3%ADa%20recibir%20asesor%C3%ADa%20sobre%20sus%20productos." target="_blank" rel="noopener noreferrer" className="footer-link" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <Phone size={16} />
                <span>+57 321 883 9425</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container" style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 'var(--space-6)', color: 'rgba(255,255,255,0.8)', fontSize: 'var(--text-xs)' }}>
        <p>&copy; {new Date().getFullYear()} Luna Viva Beauty. Todos los derechos reservados.</p>
      </div>

      <style>{`
        .footer-link {
          color: white;
          transition: color 0.2s ease-in-out;
          text-decoration: none;
          font-size: var(--text-sm);
        }
        .footer-link:hover {
          color: #767676;
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: var(--space-8) !important;
          }
          .footer-grid > div:first-child {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding-bottom: var(--space-4);
            border-bottom: 1px solid var(--rosa-suave);
          }
        } 
      `}</style>
    </footer>
  );
}
