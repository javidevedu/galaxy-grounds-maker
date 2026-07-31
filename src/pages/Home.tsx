import { useEffect, useRef } from 'react';
import SVGPersonFollow from '../components/SVGPersonFollow';
import { Link } from 'react-router-dom';

const appsCreated = [
  {
    name: 'LantestAI',
    description: 'AI-powered platform for teachers to create, share and automatically grade evaluations.',
    href: '/LantestAI',
    active: true,
    icon: '🧠',
  },
  {
    name: 'PBL English',
    description: 'Problem-Based Learning platform for interactive English practice with AI.',
    href: '/pbl/admin',
    active: true,
    icon: '💬',
  },
  {
    name: 'FullDictationAI',
    description: 'Create English dictations with AI: play the audio, then reveal the text and its Spanish translation.',
    href: '/fulldictationai',
    active: true,
    icon: '🎧',
  },
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

  // ...existing code...

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: 'relative' }}>
      {/* Personaje SVG en la esquina superior derecha */}
      <SVGPersonFollow />
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

        {/* Ray from Eyes eliminado para aligerar la página */}

        {/* Monitor grande y contenido hero */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
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
                      <Link
                        key={i}
                        to={app.href!}
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
                      </Link>
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
        </div>


        {/* Removed scroll to explore */}


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

      {/* Main 2-Column Layout */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem',
        maxWidth: 1920, margin: '0 auto', padding: '3rem 2.5rem'
      }} className="home-main-layout">
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
