import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { MapPin, Clock, MessageCircle } from 'lucide-react';

export function PhysicalStore() {
  const WHATSAPP_NUMBER = '573218839425'; // Número oficial
  const GOOGLE_MAPS_LINK = 'https://share.google/Q61pFWAyGTmB8E09Z'; // Replace with actual maps link

  return (
    <section style={{ backgroundColor: 'var(--crema)', padding: 'var(--space-16) 0' }}>
      <div className="container">
        <div className="store-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-10)',
          alignItems: 'center'
        }}>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div className="store-image" style={{
                height: '450px',
                backgroundImage: 'url("/img/tienda_fisica2.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'var(--space-6)',
                background: 'linear-gradient(to top, rgba(59,53,55,0.8), transparent)',
                color: 'white'
              }}>
                <h3 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>El espacio Luna</h3>
                <p>Donde la magia sucede en persona</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 style={{ fontSize: 'var(--text-4xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>Vive la experiencia física</h2>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
              Nacimos en lo digital, pero crecimos para estar más cerca de ti. Visita nuestro local en Calarcá y descubre un espacio diseñado para tu bienestar, donde la asesoría personalizada es nuestra prioridad.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 'var(--space-8)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--rosa-suave)', borderRadius: '50%', flexShrink: 0 }}>
                  <MapPin color="var(--accent)" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-base)' }}>Ubicación</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Cra 25 #32-05</p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Calarcá, Quindío</p>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--rosa-suave)', borderRadius: '50%', flexShrink: 0 }}>
                  <Clock color="var(--accent)" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-base)' }}>Horario</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Lunes a Sabado: 10:00 a.m. a 8:00 p.m.</p>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Domingos: 2:00 p.m. a 8:00 p.m.</p>
                </div>
              </li>
            </ul>

            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => window.open(GOOGLE_MAPS_LINK, '_blank')}>Cómo llegar</Button>
              <Button variant="outline" style={{ display: 'flex', gap: '8px' }} onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20me%20gustar%C3%ADa%20agendar%20una%20visita%20a%20la%20tienda.`, '_blank')}>
                <MessageCircle size={20} /> Agendar visita
              </Button>
            </div>
          </motion.div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .store-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-8) !important;
          }
          .store-image {
            height: 300px !important;
          }
        }
      `}</style>
    </section>
  );
}
