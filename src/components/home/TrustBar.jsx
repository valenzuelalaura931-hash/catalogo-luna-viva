import React from 'react';
import { Truck, ShieldCheck, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function TrustBar() {
  const benefits = [
    {
      icon: <Truck size={28} color="var(--accent)" />,
      title: "Envíos Seguros",
      desc: "A toda Colombia"
    },
    {
      icon: <ShieldCheck size={28} color="var(--accent)" />,
      title: "100% Originales",
      desc: "Marcas garantizadas"
    },
    {
      icon: <Heart size={28} color="var(--accent)" />,
      title: "Asesoría Personal",
      desc: "Te ayudamos a elegir"
    },
    {
      icon: <MessageCircle size={28} color="var(--accent)" />,
      title: "WhatsApp",
      desc: "Estamos para ti"
    }
  ];

  return (
    <section style={{ backgroundColor: 'var(--bg-primary)', padding: 'var(--space-8) 0', borderBottom: '1px solid var(--rosa-suave)' }}>
      <div className="container trust-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--space-6)',
        textAlign: 'center'
      }}>
        {benefits.map((b, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <div style={{
              backgroundColor: 'var(--rosa-suave)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-full)',
              marginBottom: 'var(--space-2)'
            }}>
              {b.icon}
            </div>
            <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: '600' }}>{b.title}</h4>
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{b.desc}</p>
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .trust-grid {
            display: flex !important;
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: var(--space-6) !important;
            padding-bottom: var(--space-4);
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            /* Ocultar barra de scroll para que se vea limpio */
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .trust-grid::-webkit-scrollbar {
            display: none;
          }
          .trust-grid > div {
            min-width: 130px; /* Ancho mínimo para que no se apachurren */
            flex: 0 0 auto;
            scroll-snap-align: start;
          }
        }
      `}</style>
    </section>
  );
}
