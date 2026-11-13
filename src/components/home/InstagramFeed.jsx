import React from 'react';
import { Play } from 'lucide-react';

export function InstagramFeed() {
  const instagramHandle = "@luna_viva_";
  const instagramLink = "https://www.instagram.com/luna_viva_/";

  // Reemplaza estas imágenes con los thumbnails de tus videos reales de Instagram
  // o reemplaza todo el objeto por un array de URLs de videos en formato .mp4
  const posts = [
    { id: 1, type: 'video', media: '/img/ig_cover_1.png', link: "https://www.instagram.com/reel/Dblk-_3Cu-8/" },
    { id: 2, type: 'video', media: '/img/ig_cover_2.png', link: "https://www.instagram.com/reel/DbZEWx0i5G2/" },
    { id: 3, type: 'video', media: '/img/ig_cover_3.png', link: "https://www.instagram.com/reel/DbT2MTgis6h/" },
    { id: 4, type: 'video', media: '/img/ig_cover_4.png', link: "https://www.instagram.com/reel/DbLufEOCjOG/" },
    { id: 5, type: 'video', media: '/img/ig_cover_5.png', link: "https://www.instagram.com/reel/DbHSZtai8p0/" },
    { id: 6, type: 'video', media: '/img/ig_cover_6.png', link: "https://www.instagram.com/reel/DaHUma4iEIc/" }
  ];

  return (
    <section style={{ backgroundColor: 'white', padding: 'var(--space-12) 0', overflow: 'hidden' }}>
      
      {/* Título de la sección */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h2 style={{ 
          fontSize: 'var(--text-3xl)', 
          color: '#EAA3C7', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em',
          margin: '0 0 var(--space-2) 0',
          fontFamily: 'var(--font-heading)'
        }}>
          Síguenos en Instagram
        </h2>
        <a 
          href={instagramLink} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            color: 'var(--text-secondary)', 
            fontSize: 'var(--text-sm)', 
            textDecoration: 'none',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: '500'
          }}
        >
          {instagramHandle}
        </a>
      </div>

      {/* Contenedor de la animación con overflow hidden */}
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div className="instagram-track">
          {[...posts, ...posts].map((post, index) => (
            <a 
              key={`${post.id}-${index}`} 
              href={post.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="instagram-item"
              style={{ 
                position: 'relative', 
                flex: '1',
                aspectRatio: '9 / 16',
                display: 'block',
                overflow: 'hidden',
                backgroundColor: 'var(--rosa-suave)'
              }}
            >
              {/* Imagen de fondo (thumbnail del video) */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${post.media}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                transition: 'transform 0.5s ease'
              }} className="instagram-image" />
              
              {/* Overlay y Play Button */}
              {post.type === 'video' && (
                <div 
                  className="instagram-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '50%',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Play size={24} fill="white" color="white" />
                  </div>
                </div>
              )}
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .instagram-track {
          display: flex;
          width: 200%;
          animation: slideRight 30s linear infinite;
        }

        .instagram-track:hover {
          animation-play-state: paused;
        }

        @keyframes slideRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }

        .instagram-item:hover .instagram-image {
          transform: scale(1.05);
        }
        .instagram-item:hover .instagram-overlay {
          opacity: 1 !important;
        }

        /* Responsive grid para móviles y tablets */
        @media (max-width: 1024px) {
          .instagram-track {
            width: 400%; /* 3 items per viewport (12 items total) */
          }
        }
        @media (max-width: 480px) {
          .instagram-track {
            width: 600%; /* 2 items per viewport (12 items total) */
          }
        }
      `}</style>
    </section>
  );
}
