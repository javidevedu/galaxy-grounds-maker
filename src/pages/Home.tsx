import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    // Marker animation
    const textPath = document.getElementById('text-path') as unknown as SVGTextPathElement;
    const markerTip = document.getElementById('marker-tip');
    const path = document.getElementById('writing-path') as unknown as SVGPathElement;
    if (!textPath || !markerTip || !path) return;

    const totalLength = path.getTotalLength();
    let progress = 0;
    let animating = true;

    const animate = () => {
      if (!animating) return;
      progress += 0.15;
      if (progress > 100) progress = 100;

      const offsetPercent = 100 - progress;
      textPath.setAttribute('startOffset', `${-offsetPercent}%`);

      const charLen = (progress / 100) * totalLength;
      const pt = path.getPointAtLength(Math.min(charLen, totalLength));
      if (markerTip) {
        markerTip.style.left = `calc(50% - ${500 - pt.x}px)`;
        markerTip.style.top = `calc(${pt.y}px + 8vh + 60px)`;
      }

      if (progress < 100) requestAnimationFrame(animate);
    };

    const timer = setTimeout(() => requestAnimationFrame(animate), 1000);
    return () => {
      animating = false;
      clearTimeout(timer);
    };
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

      {/* Marker Board BG */}
      <div id="marker-board-bg" style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <svg id="writing-svg" style={{ position: 'absolute', bottom: '8vh', left: '50%', transform: 'translateX(-50%)', width: 'min(1000px, 90vw)', height: 260 }}>
          <defs>
            <path id="writing-path" d="M 50 200 C 150 50, 250 50, 300 150 S 450 250, 500 150 S 650 50, 700 150 S 850 250, 950 150" fill="none" />
          </defs>
          <text className="writing-text" style={{ fontFamily: "'Pacifico','Segoe Script',cursive", fontSize: 120, fill: 'none', stroke: 'rgba(0,0,0,0.85)', strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <textPath id="text-path" href="#writing-path" startOffset="-100%">JaviDevEdu</textPath>
          </text>
        </svg>
        <div id="marker-tip" style={{ position: 'absolute', width: 36, height: 12, background: '#ffffff', borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.3)', transform: 'rotate(-8deg)', display: 'none' }} />
      </div>

      {/* Hero */}
      <section className="hero-fullscreen" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', position: 'relative',
        background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)', overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, padding: '0 2rem', animation: 'fadeInUp 1s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <img src="/favicon.ico" alt="Favicon" style={{ width: 28, height: 28 }} />
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>JaviDevEdu - EDTECH</span>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 700, lineHeight: 1.1, marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            letterSpacing: '-0.02em'
          }}>
            JaviDevEdu
          </h1>
          <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', color: 'var(--text-secondary)', fontWeight: 400, maxWidth: 600, margin: '0 auto 3rem', lineHeight: 1.6 }}>
            I love to create software to inspire and educate.
          </p>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Apps Created
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>My EdTech applications and tools</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {appsCreated.map((app, i) => (
              <a
                key={i}
                href={app.active ? app.href : undefined}
                target={app.active ? '_blank' : undefined}
                rel={app.active ? 'noopener noreferrer' : undefined}
                style={{
                  background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden',
                  border: '1px solid var(--border-color)', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: app.active ? 'pointer' : 'default', textDecoration: 'none', color: 'inherit',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem',
                  width: 180, height: 140, boxShadow: 'var(--shadow-sm)', opacity: app.active ? 1 : 0.6
                }}
                className={app.active ? 'app-card-active' : ''}
                onClick={e => { if (!app.active) e.preventDefault(); }}
              >
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', background: app.active
                    ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                    : 'var(--hover-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.5rem'
                }}>
                  {app.icon}
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9rem', fontWeight: 600, textAlign: 'center', margin: 0 }}>
                  {app.name}
                </h3>
              </a>
            ))}
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
          color: 'var(--text-tertiary)', fontSize: '0.85rem'
        }}>
          <span>About me</span>
          <i className="fas fa-chevron-down" style={{ fontSize: '1.5rem' }} />
        </div>
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
                  desc: 'aaA comprehensive book review platform with user authentication and rating system',
                  href: '/projects/book-review',
                },
                {
                  title: 'Frontend & Backend Development: Travel Recommendation Web',
                  desc: 'Dynamic search functionality for travel destinations with real-time recommendations',
                  href: '/projects/travel-recommendation',
                },
                {
                  title: 'Frontend Development javidev.site',
                  desc: 'UX/UI coding & design - Modern portfolio website',
                  href: '/projects/javidev-site',
                },
                {
                  title: 'E-commerce Web Development – WhatToBuy',
                  desc: 'Full-featured e-commerce platform with WooCommerce integration',
                  href: '/projects/whattobuy',
                },
                {
                  title: 'Creative Agency Web Design – JV Luxe Marketing',
                  desc: 'Elegant marketing agency website with custom WordPress theme',
                  href: '/projects/jv-luxe',
                },
              ].map((proj, i) => (
                <a
                  key={i}
                  href={proj.href}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div style={{
                    background: 'var(--bg-secondary)', borderRadius: 16, overflow: 'hidden',
                    border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer'
                  }} className="project-card-home">
                    <div style={{ width: '100%', height: 180, background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fas fa-code" style={{ fontSize: '2rem', color: 'var(--text-tertiary)' }} />
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        {proj.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{proj.desc}</p>
                    </div>
                  </div>
                </a>
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
