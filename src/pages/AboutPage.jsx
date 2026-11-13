import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Compass, Star, Users, Sparkles } from 'lucide-react';

export function AboutPage() {
  const values = [
    { icon: <Heart size={24} color="var(--accent)" />, name: "Cercanía", desc: "Tratamos a cada cliente como parte de la familia Luna." },
    { icon: <Compass size={24} color="var(--accent)" />, name: "Asesoría Honesta", desc: "No te vendemos lo más caro, sino lo que de verdad le hace bien a tu piel." },
    { icon: <Star size={24} color="var(--accent)" />, name: "Calidad", desc: "Seleccionamos minuciosamente cada marca y producto de nuestro catálogo." },
    { icon: <Users size={24} color="var(--accent)" />, name: "Comunidad", desc: "Luna Viva es un espacio seguro para aprender y compartir sobre belleza." }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: 'var(--space-16) 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h1 style={{ fontSize: 'var(--text-5xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Nuestra Historia</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>El latido detrás de Luna Viva Beauty</p>
        </div>

        {/* Historia */}
        <div className="about-story-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-10)',
          alignItems: 'center',
          marginBottom: 'var(--space-16)'
        }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)', lineHeight: 1.8 }}>
              Luna Viva nació en **2024** a partir de una hermosa idea de Amanda, madre de Laura. La familia atravesaba una etapa de cambios y decidieron unir su pasión por el cuidado personal y el maquillaje para crear un emprendimiento digital.
            </p>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: 'var(--space-4)', lineHeight: 1.8 }}>
              Comenzamos como una tienda virtual manejada desde nuestra casa, empacando cada pedido con notas escritas a mano y la ilusión de crecer. Muy pronto, la calidez y honestidad de nuestras asesorías nos ganaron el corazón de una hermosa comunidad.
            </p>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', lineHeight: 1.8 }}>
              Hoy, hemos dado el paso más emocionante: abrir las puertas de nuestro **punto físico en Calarcá, Quindío**. Un espacio físico diseñado para que vengas a sentir los productos, conversar y encontrar tu momento Luna en persona.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              height: '400px',
              backgroundImage: 'url("/img/ChatGPT Image 23 ago 2026, 06_11_59 p.m..png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 'var(--space-20)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', textAlign: 'center', marginBottom: 'var(--space-10)' }}>Nuestra Línea del Tiempo</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', position: 'relative', paddingLeft: 'var(--space-6)', borderLeft: '2px solid var(--rosa-suave)' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--accent)', margin: '0 0 var(--space-1)' }}>2024 - El Comienzo</h3>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>Nace Luna Viva como una tienda virtual desde casa con las primeras 10 referencias de maquillaje.</p>
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--accent)', margin: '0 0 var(--space-1)' }}>Mediados de 2024 - Crecimiento</h3>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>Ampliamos nuestro catálogo a más de 50 productos y asistimos a nuestra primera feria de emprendimiento.</p>
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--accent)', margin: '0 0 var(--space-1)' }}>Hoy - El Sueño Físico</h3>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>Abrimos nuestra primera tienda en Calarcá, integrando la experiencia digital y el contacto cara a cara.</p>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div>
          <h2 style={{ fontSize: 'var(--text-3xl)', textAlign: 'center', marginBottom: 'var(--space-10)' }}>Lo que nos guía</h2>
          <div className="about-values-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-6)'
          }}>
            {values.map((v, i) => (
              <div key={i} style={{ backgroundColor: 'white', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ marginBottom: 'var(--space-3)' }}>{v.icon}</div>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>{v.name}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .about-story-grid {
            grid-template-columns: 1fr !important;
          }
          .about-values-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
