import React, { useRef, useEffect } from 'react';

// SVG as a React component
const PersonSVG = ({ headAngleX = 0, headAngleY = 0 }) => (
  <svg viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 180, height: 270 }}>
    {/* Piernas */}
    <path d="M210 400l20 130h30l-20-130z" fill="#2D3748"/>
    <path d="M230 530v30h40q10 0 10-15t-10-15h-10z" fill="#fff"/>
    <path d="M235 550h40" stroke="#1A202C" strokeWidth="2" strokeLinecap="round"/>
    <path d="M160 400l-20 130h-30l20-130z" fill="#2D3748"/>
    <path d="M110 530v30h40q10 0 10-15t-10-15h-10z" fill="#fff"/>
    <path d="M115 550h40" stroke="#1A202C" strokeWidth="2" strokeLinecap="round"/>
    {/* Torso con Hombros Curvos */}
    <path d="M120 410h130l-10-155q0-15-20-15h-70q-20 0-20 15z" fill="#1A202C"/>
    <path d="M185 210h25l-5 50h-15z" fill="#FFDBAC"/>
    <path d="M185 240h20l-10 80z" fill="#fff"/>
    <path d="M192 245h6l-3 55z" fill="#E11D48"/>
    <path d="M130 255q0-15 20-15h35l10 80-35-65zM240 255q0-15-20-15h-15l-10 80 15-65z" fill="#2D3748"/>
    {/* Brazos */}
    <path d="M130 250l-25 60 30 15 20-60z" fill="#1A202C"/>
    <path d="M105 310l20 65 30-15-20-50z" fill="#1A202C"/>
    <path d="M125 375l20 35 30-10-20-40z" fill="#FFDBAC"/>
    <circle cx="155" cy="400" r="18" fill="#fff" stroke="#E5E7EB"/>
    <path d="M155 385v30" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
    <path d="M205 255l30 60 25-10-30-60z" fill="#1A202C"/>
    <path d="M235 315l40 45 25-10-40-45z" fill="#1A202C"/>
    <path d="M275 360l25 30 25-10-25-30z" fill="#FFDBAC"/>
    <circle cx="310" cy="380" r="18" fill="#fff" stroke="#E5E7EB"/>
    {/* Cabeza y Visor (rotada en X e Y) */}
    <g style={{
      transform: `rotateY(${headAngleY}deg) rotateZ(${headAngleX}deg)`,
      transformOrigin: '195px 170px',
      transition: 'transform 0.1s',
    }}>
      <circle cx="195" cy="170" r="60" fill="#FFDBAC"/>
      <path d="M140 150q-2-30 15-45l15-20 15 15 20-25 15 20 25-15 10 30-5 40q0 10-15 10t-20-10q-5 10-25 10t-25-10q-5 10-15 10t-10-10q0-10 0-10z" fill="#5D4037"/>
      <path d="M195 185q5 5 0 10" stroke="#D2B48C" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M180 205q20 10 40 0" stroke="#8B4513" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <g>
        <path d="M135 160h10M245 160h10" stroke="#333" strokeWidth="10" strokeLinecap="round"/>
        <rect x="145" y="135" width="100" height="50" rx="12" fill="#fff" stroke="#E5E7EB"/>
        <rect x="153" y="143" width="84" height="30" rx="6" fill="#1E3A8A"/>
        <text x="195" y="158" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'sans-serif' }}>Javidevedu</text>
        <path d="M160 150h25" stroke="#fff" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round"/>
      </g>
      <circle cx="140" cy="180" r="10" fill="#FFDBAC"/>
    </g>
  </svg>
);

// Wrapper that tracks mouse and rotates head

const SVGPersonFollow = () => {
  const [angle, setAngle] = React.useState({ x: 0, y: 0 });
  // Centro de la cabeza en la pantalla (ajustar según posición SVG)
  const svgWidth = 180;
  const svgHeight = 270;
  const svgRight = 32;
  const svgTop = 32;

  function getHeadCenter() {
    return {
      x: window.innerWidth - svgRight - svgWidth / 2 + (195 - 200) * (svgWidth / 400),
      y: svgTop + (170 * (svgHeight / 600)),
    };
  }

  useEffect(() => {
    function handleMouseMove(e) {
      const headCenter = getHeadCenter();
      const dx = e.clientX - headCenter.x;
      const dy = e.clientY - headCenter.y;
      // Limitar el rango de movimiento para simular un óvalo (no 360°)
      // X: izquierda-derecha (horizontal), Y: arriba-abajo (vertical)
      // Ángulo horizontal simétrico: negativo a la izquierda, positivo a la derecha
      let angleY = Math.max(-15, Math.min(15, dx / 16)); // -15° (izquierda) a 15° (derecha)
      let angleX = Math.max(-8, Math.min(8, dy / 30)); // -8° a 8°
      setAngle({ x: angleX, y: angleY });
    }
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ position: 'absolute', top: svgTop, right: svgRight, zIndex: 50, cursor: 'pointer', userSelect: 'none' }}>
      <PersonSVG headAngleX={angle.x} headAngleY={angle.y} />
    </div>
  );
};

export default SVGPersonFollow;
