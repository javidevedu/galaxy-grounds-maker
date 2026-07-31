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
          .home-main-layout { grid-template-columns: 1fr 340px !important; gap: 2.5rem !important; }
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
