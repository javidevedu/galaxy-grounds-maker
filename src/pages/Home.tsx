import { useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';

const VRPerson3D = lazy(() => import('@/components/VRPerson3D'));

const appsCreated = [
  {
    name: 'LantestAI',
    description: 'AI-powered platform for teachers to create, share and automatically grade evaluations.',
    href: '/LantestAI',
    active: true,
    icon: '🧠',
  },
  { name: 'Coming Soon', description: 'A new AI-powered tool is on its way.', active: false, icon: '🚀' },
  { name: 'Coming Soon', description: 'Another app coming to the JaviDevEdu ecosystem.', active: false, icon: '💡' },
  
];

export default function Home() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-in-up').forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const vrHeadRef = useRef<HTMLDivElement>(null);
  const rayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // VR head following cursor
    const handleMouseMove = (e: MouseEvent) => {
      if (!vrHeadRef.current || !rayRef.current) return;
      
      const rect = vrHeadRef.current.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
      const distance = Math.hypot(e.clientX - eyeX, e.clientY - eyeY);
      
      // Rotate head slightly
      const headRotation = (e.clientX - window.innerWidth / 2) * 0.02;
      vrHeadRef.current.style.transform = `rotateY(${headRotation}deg) rotateZ(${(e.clientY - window.innerHeight / 2) * 0.01}deg)`;
      
      // Draw ray from eyes to cursor
      rayRef.current.style.left = `${eyeX}px`;
      rayRef.current.style.top = `${eyeY}px`;
      rayRef.current.style.width = `${Math.min(distance, 800)}px`;
      rayRef.current.style.transform = `rotate(${angle}rad)`;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        :root {
          --bg-primary: #fafafa;
          --bg-secondary: #ffffff;
          --text-primary: #1a1a1a;
          --text-secondary: #6b6b6b;
          --text-tertiary: #9b9b9b;
          --accent-primary: #6366f1;
          --accent-secondary: #8b5cf6;
          --accent-tertiary: #ec4899;
          --border-color: #e5e5e5;
          --hover-bg: #f5f5f5;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
          --shadow-lg: 0 10px 30px rgba(0,0,0,0.1);
          --glow: 0 0 20px rgba(99,102,241,0.3);
        }
      `}</style>

      {/* Marker Board BG - Removed */}

      {/* Hero - VR on Monitor Scene */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)',
        overflow: 'hidden', flexDirection: 'column', perspective: '1000px'
      }}>
        {/* Fondo animado */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.08,
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(99,102,241,.3) 25%, rgba(99,102,241,.3) 26%, transparent 27%, transparent 74%, rgba(99,102,241,.3) 75%, rgba(99,102,241,.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(99,102,241,.3) 25%, rgba(99,102,241,.3) 26%, transparent 27%, transparent 74%, rgba(99,102,241,.3) 75%, rgba(99,102,241,.3) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite', zIndex: 0
        }} />

        {/* Ray from Eyes */}
        <div ref={rayRef} style={{
          position: 'fixed', height: 3, background: 'linear-gradient(90deg, #00ffff, transparent)',
          pointerEvents: 'none', zIndex: 20, transformOrigin: 'left center'
        }} />

        {/* Monitor + VR Person + Keyboard */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
          {/* Persona VR sentada en 3D sobre el monitor */}
          <div style={{ position: 'absolute', top: -160, left: '50%', transform: 'translateX(-50%)', zIndex: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
            {/* Piernas */}
            <div style={{ display: 'flex', gap: 10, marginBottom: -18, zIndex: 1 }}>
              <div style={{ width: 18, height: 60, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, boxShadow: '0 4px 12px #6366f155', transform: 'rotate(18deg)', border: '2px solid #222' }} />
              <div style={{ width: 18, height: 60, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, boxShadow: '0 4px 12px #6366f155', transform: 'rotate(-18deg)', border: '2px solid #222' }} />
            </div>
            {/* Cuerpo y brazos */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
              {/* Cuerpo */}
              <div style={{ width: 38, height: 70, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 20, boxShadow: '0 8px 24px #6366f155', marginBottom: -8, border: '2px solid #222', position: 'relative', zIndex: 2 }} />
              {/* Brazos */}
              <div style={{ position: 'absolute', top: 30, left: -32, display: 'flex', gap: 60, width: 100, height: 40, zIndex: 1 }}>
                <div style={{ width: 18, height: 48, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, boxShadow: '0 4px 12px #6366f155', transform: 'rotate(30deg)', border: '2px solid #222' }} />
                <div style={{ width: 18, height: 48, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, boxShadow: '0 4px 12px #6366f155', transform: 'rotate(-30deg)', border: '2px solid #222' }} />
              </div>
            </div>
            {/* Cabeza con VR, sigue el mouse */}
            <div ref={vrHeadRef} style={{
              width: 80, height: 80, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%',
              boxShadow: '0 8px 32px #6366f199, 0 0 0 8px #1a1a2e', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.05s ease-out', zIndex: 3, marginTop: -110, border: '2.5px solid #222'
            }}>
              {/* VR Glasses */}
              <div style={{ position: 'absolute', top: 28, left: 10, width: 60, height: 24, background: 'linear-gradient(90deg, #00ffff 60%, #6366f1 100%)', borderRadius: 12, boxShadow: '0 0 16px #00ffff99', border: '2px solid #00ffff88', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 22, color: '#222', fontWeight: 700, marginRight: 4 }}>👓</span>
              </div>
              {/* Nariz */}
              <div style={{ position: 'absolute', top: 48, left: 36, width: 8, height: 12, background: '#222', borderRadius: 6, opacity: 0.18 }} />
            </div>
          </div>

          {/* Monitor grande */}
          <div style={{
            width: 480, height: 320, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '12px solid #2a2a4e', borderRadius: 18,
            boxShadow: '0 40px 80px #6366f133, 0 0 0 8px #222',
            position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', marginBottom: 32, marginTop: 40
          }}>
            {/* Pantalla (contenido hero) */}
            <div style={{
              width: '100%', height: '100%', padding: '2.5rem 2rem 1.5rem 2rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#00ff88', fontFamily: "'Space Mono', monospace",
              fontSize: '1rem', textAlign: 'center', animation: 'screenGlow 2s ease-in-out infinite', zIndex: 2,
              position: 'relative', pointerEvents: 'auto'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.2rem', color: '#00ffff' }}>JaviDevEdu - EDTECH</div>
              <div style={{ fontSize: '2.1rem', color: '#00ff88', fontWeight: 700, marginBottom: '1.2rem', fontFamily: "'Space Grotesk', sans-serif" }}>JaviDevEdu</div>
              <div style={{ fontSize: '1.1rem', lineHeight: 1.4, color: '#fff', marginBottom: '1.5rem', fontWeight: 500 }}>I love to create software to inspire and educate.</div>
              <div style={{ marginBottom: '1.2rem' }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em', color: '#00ff88' }}>
                  Apps Created
                </h2>
                <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {appsCreated.map((app, i) => (
                    app.active ? (
                      <a
                        key={i}
                        href={app.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: 'rgba(99,102,241,0.2)',
                          borderRadius: 10, border: '1px solid #00ffff55', color: '#fff',
                          display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.1rem', fontWeight: 600,
                          fontSize: '1.1rem', boxShadow: '0 2px 8px #00ffff33', marginBottom: 4,
                          textDecoration: 'none', transition: 'all 0.2s', pointerEvents: 'auto'
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,255,0.2)';
                          (e.currentTarget as HTMLElement).style.color = '#222';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.2)';
                          (e.currentTarget as HTMLElement).style.color = '#fff';
                        }}
                      >
                        <span style={{ fontSize: '1.3rem' }}>{app.icon}</span> {app.name}
                      </a>
                    ) : (
                      <span key={i} style={{
                        background: 'rgba(99,102,241,0.1)',
                        borderRadius: 10, border: '1px solid #00ffff55', color: '#fff',
                        display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.1rem', fontWeight: 600,
                        fontSize: '1.1rem', opacity: 0.6, marginBottom: 4
                      }}>
                        <span style={{ fontSize: '1.3rem' }}>{app.icon}</span> {app.name}
                      </span>
                    )
                  ))}
                </div>
              </div>
            </div>
            {/* Screen Glitch Effect */}
            <div style={{
              position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.08) 50%, transparent 100%)',
              animation: 'screenScan 8s linear infinite', zIndex: 1, pointerEvents: 'none'
            }} />
          </div>

          {/* Teclado QWERTY completo, solo JAVIDEV EDU con highlight */}
          <div style={{ marginTop: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem', perspective: '1000px', zIndex: 11, alignItems: 'center' }}>
            {[
              ['Q','W','E','R','T','Y','U','I','O','P'],
              ['A','S','D','F','G','H','J','K','L'],
              ['Z','X','C','V','B','N','M']
            ].map((row, rowIdx) => (
              <div key={rowIdx} style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                {row.map((key, i) => {
                  const highlight = 'JAVIDEVEDU'.includes(key.replace(' ',''));
                  if (key === ' ') {
                    return <div key={i} style={{ width: 44, height: 44, margin: '0 8px' }} />;
                  }
                  return (
                    <div
                      key={i}
                      style={{
                        width: 44, height: 44, background: highlight ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#222',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 6, color: highlight ? 'white' : '#aaa', fontWeight: 700, cursor: highlight ? 'pointer' : 'default',
                        boxShadow: highlight ? '0 4px 16px #6366f155, inset 0 -2px 8px #222' : '0 2px 4px #111',
                        transition: 'all 0.1s cubic-bezier(.4,0,.2,1)', transform: 'translateY(0)',
                        fontSize: '1.1rem',
                        animation: highlight ? `keyboardBounce ${0.6 + i * 0.08}s ease-in-out infinite` : 'none',
                        border: highlight ? '2px solid #222' : '1px solid #333',
                        opacity: rowIdx === 3 && !highlight ? 0 : 1
                      }}
                      onMouseEnter={highlight ? e => {
                        (e.target as HTMLElement).style.transform = 'translateY(7px) scale(1.08)';
                        (e.target as HTMLElement).style.boxShadow = '0 2px 8px #00ffff99, 0 0 0 2px #00ffff';
                        (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #00ffff, #6366f1)';
                        (e.target as HTMLElement).style.color = '#222';
                      } : undefined}
                      onMouseLeave={highlight ? e => {
                        (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)';
                        (e.target as HTMLElement).style.boxShadow = '0 4px 16px #6366f155, inset 0 -2px 8px #222';
                        (e.target as HTMLElement).style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                        (e.target as HTMLElement).style.color = 'white';
                      } : undefined}
                    >
                      {key}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll down */}
        <div style={{
          position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
          color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', animation: 'bounce 2s infinite', zIndex: 30
        }}>
          <span>Scroll to explore</span>
          <i className="fas fa-chevron-down" style={{ fontSize: '1.7rem' }} />
        </div>

        {/* Animaciones */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes screenGlow {
            0%, 100% { text-shadow: 0 0 10px #00ff88, 0 0 20px rgba(0,255,255,0.5); }
            50% { text-shadow: 0 0 20px #00ff88, 0 0 40px rgba(0,255,255,0.8); }
          }
          @keyframes screenScan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          @keyframes keyboardBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes gridMove {
            0% { transform: translateY(0); }
            100% { transform: translateY(50px); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(10px); }
          }
          @media (max-width: 968px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 2rem; }
          }
          @media (max-width: 640px) {
            .hero-grid { gap: 1.5rem; }
            .hero-grid > div:first-child { height: 400px; }
          }
        `}</style>
      </section>

      {/* Main 3-Column Layout */}
      <div style={{
        display: 'grid', gridTemplateColumns: '340px 1fr 380px', gap: '3rem',
        maxWidth: 1920, margin: '0 auto', padding: '3rem 2.5rem'
      }} className="home-main-layout">
        {/* Left Sidebar */}
        <aside style={{ position: 'sticky', top: '4rem', height: 'fit-content' }}>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 20, padding: '2rem',
            border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%', margin: '0 auto 1rem',
              overflow: 'hidden', border: '3px solid var(--border-color)', background: 'var(--hover-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--accent-primary)'
            }}>
              JC
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>
              Javier Castillo
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--accent-primary)', fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              EdTech
            </p>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Educator & Developer
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.75rem 1rem', background: 'var(--hover-bg)', borderRadius: 12, marginBottom: '1rem', fontSize: '0.9rem'
            }}>
              <i className="fas fa-briefcase" />
              <strong style={{ color: 'var(--accent-primary)' }}>2+</strong> years of experience
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                { icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/in/javier-castillo-83562b33b/' },
                { icon: 'fab fa-github', href: 'https://github.com/javidevedu' },
                { icon: 'fab fa-instagram', href: 'https://www.instagram.com/javidevedu/' },
                { icon: 'fab fa-youtube', href: 'https://www.youtube.com/@jjavidevedu' },
                { icon: 'fab fa-tiktok', href: 'https://www.tiktok.com/@javidevedu' },
                ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                  width: 40, height: 40, borderRadius: 10, background: 'var(--hover-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  border: '1px solid var(--border-color)', transition: 'all 0.3s ease'
                }}>
                  <i className={s.icon} />
                </a>
                ))}
            </div>
          </div>

          {/* Experience */}
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 20, padding: '1.5rem',
            border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', marginTop: '1.5rem'
          }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', textAlign: 'center' }}>Experience</h3>
            {[
              { role: 'English Teacher – UNILINGUA', company: 'Universidad del Cauca', type: 'Contract', date: 'Aug 2025 - Present · 4 mos', location: 'Popayán · On-site' },
              { role: 'Monitor in Communications Management', company: 'Universidad Nacional Abierta y a Distancia', type: 'Full-time', date: 'Mar 2025 - Present · 9 mos', location: 'Popayán · On-site' },
              { role: 'English teaching monitor - Unilingua', company: 'Universidad del Cauca', type: 'Contract', date: 'Jul 2022 - Jun 2023 · 1 yr', location: 'Popayán, Cauca, Colombia · On-site' },
            ].map((exp, i) => (
              <div key={i} style={{ padding: '1rem 0', borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>{exp.role}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.25rem', fontWeight: 500 }}>{exp.company}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>{exp.type}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>{exp.date}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <i className="fas fa-map-marker-alt" style={{ fontSize: '0.65rem' }} /> {exp.location}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main>
          {/* Projects Section */}
          <section className="fade-in-up">
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Projects
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>A selection of my most recent work</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {[
                {
                  title: 'Backend Development: Online Book Review Application',
                  desc: 'Book reviews, ratings, and secure user access.',
                  href: '/projects/book-review',
                  image: '/covers/book-review.png',
                },
                {
                  title: 'Frontend & Backend Development: Travel Recommendation Web',
                  desc: 'Travel search, dynamic results, and location discovery.',
                  href: '/projects/travel-recommendation',
                  image: '/covers/travel-recommendation.png',
                },
                {
                  title: 'Frontend Development javidev.site',
                  desc: 'Portfolio design, resources, and developer roadmaps.',
                  href: '/projects/javidev-site',
                  image: '/covers/javidev-site.png',
                },
                {
                  title: 'E-commerce Web Development – WhatToBuy',
                  desc: 'Online shopping, product browsing, and smooth checkout.',
                  href: '/projects/whattobuy',
                  image: '/covers/whattobuy.png',
                },
                {
                  title: 'Creative Agency Web Design – JV Luxe Marketing',
                  desc: 'Luxury branding, clean visuals, and agency presence.',
                  href: '/projects/jv-luxe',
                  image: '/covers/jv-luxe.png',
                },
              ].map((proj, i) => (
                <Link
                  key={i}
                  to={proj.href}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div style={{
                    background: 'var(--bg-secondary)', borderRadius: 16, overflow: 'hidden',
                    border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
                  }} className="project-card-home">
                    <div style={{ width: '100%', height: 180, background: 'var(--hover-bg)', overflow: 'hidden' }}>
                      <img
                        src={proj.image}
                        alt={proj.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        {proj.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{proj.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="fade-in-up" style={{ marginTop: '4rem', paddingTop: '4rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="contact-grid-home">
              <div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                  Contact Me
                </h2>
                <p style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '1.5rem' }}>
                  Let's Work Together, Get In Touch!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem',
                    background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)'
                  }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 12, background: 'rgba(99,102,241,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '1.25rem', flexShrink: 0
                    }}>
                      <i className="fas fa-phone" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Contact Phone</h4>
                      <a href="tel:+573209557380" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>+57 3209557380</a>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem',
                    background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)'
                  }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 12, background: 'rgba(99,102,241,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '1.25rem', flexShrink: 0
                    }}>
                      <i className="fas fa-envelope" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Email</h4>
                      <a href="mailto:javidevedu@gmail.com" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>javidevedu@gmail.com</a>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: '100%', maxWidth: 300, aspectRatio: '1', borderRadius: 20,
                  background: 'var(--hover-bg)', border: '3px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '4rem', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--accent-primary)'
                }}>
                  JC
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Right Sidebar */}
        <aside style={{ position: 'sticky', top: '4rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stack & Tools */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '1rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Stack & Tools</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { title: 'Development', tools: ['HTML', 'CSS', 'JavaScript', 'React.js', 'WordPress', 'WooCommerce', 'Shopify', 'Bootstrap', 'Tailwind'] },
                { title: 'Design', tools: ['Figma', 'Canva'] },
                { title: 'Collaboration', tools: ['Git & GitHub', 'Notion', 'Asana'] },
                { title: 'SEO & Analytics', tools: ['Google Analytics', 'Power BI', 'Excel', 'SEMrush', 'Google Search Console'] },
              ].map((cat, i) => (
                <div key={i} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{cat.title}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {cat.tools.map((tool, j) => (
                      <span key={j} style={{
                        fontSize: '0.7rem', padding: '0.25rem 0.55rem', background: 'var(--hover-bg)',
                        borderRadius: 5, border: '1px solid var(--border-color)', fontWeight: 500, whiteSpace: 'nowrap'
                      }}>{tool}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '1.25rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Education</h3>
            {[
              {
                year: 'Current', items: [
                  { title: 'Bachelor of Engineering - BE, Systems Engineering', inst: 'UNAD University' },
                  { title: 'Software Analysis and Development', inst: 'National Learning Service (SENA)' },
                ]
              },
              {
                year: '2023 - 2024', items: [
                  { title: 'HTML, CSS, and Javascript for Web Developers Specialization', inst: 'The Johns Hopkins University' },
                  { title: 'UI / UX Design Specialization', inst: 'California Institute of the Arts' },
                  { title: 'IBM Front-End Developer Specialization', inst: 'IBM' },
                  { title: 'Business English', inst: 'Arizona State University' },
                  { title: 'Google Project Management Professional Certificate', inst: 'Google' },
                ]
              },
              {
                year: '2021 - 2022', items: [
                  { title: 'Branding: The Creative Journey', inst: 'IE Business School' },
                  { title: 'Digital Product Management', inst: 'University of Virginia' },
                  { title: 'Digital Marketing', inst: 'University of Illinois at Urbana-Champaign' },
                ]
              },
            ].map((group, i) => (
              <div key={i} style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group.year}</div>
                {group.items.map((item, j) => (
                  <div key={j} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{item.inst}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
            color: 'white', textAlign: 'center', padding: '1.75rem 1.25rem', borderRadius: 16
          }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'white' }}>Let's work together</h3>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Looking for a developer who builds with purpose?
            </p>
            <a href="mailto:javidevedu@gmail.com" style={{
              display: 'inline-block', padding: '0.875rem 2rem', background: 'white',
              color: 'var(--accent-primary)', textDecoration: 'none', borderRadius: 10, fontWeight: 600
            }}>
              Get in touch
            </a>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '2rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>© 2025 JaviDevEdu. All rights reserved.</p>
      </footer>

      {/* Responsive + hover styles */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { opacity: 0; transform: translateY(30px); transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .fade-in-up.visible { opacity: 1; transform: translateY(0); }
        .app-card-active:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg), var(--glow) !important; border-color: var(--accent-primary) !important; }
        .project-card-home:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg), var(--glow); border-color: var(--accent-primary); }
        @media (max-width: 1200px) {
          .home-main-layout { grid-template-columns: 300px 1fr 340px !important; gap: 2.5rem !important; }
        }
        @media (max-width: 968px) {
          .home-main-layout { grid-template-columns: 1fr !important; gap: 2.5rem !important; padding: 2rem 1.5rem !important; }
          .contact-grid-home { grid-template-columns: 1fr !important; gap: 3rem !important; }
        }
        @media (max-width: 640px) {
          .home-main-layout { padding: 2rem 1rem !important; }
        }
      `}</style>
    </div>
  );
}
