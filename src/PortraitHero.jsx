import React, { forwardRef } from 'react'
import { PROFILE } from './content'
import { RandomLetterSwap } from './components/ui/random-letter-swap'

const PortraitHero = forwardRef((props, ref) => {
  const crmLines = Array.isArray(PROFILE.council) 
    ? PROFILE.council.map(c => c.split(', ')[0])
    : [PROFILE.council?.split(', ')[0] || ''];
    
  const rqeLines = Array.isArray(PROFILE.council)
    ? PROFILE.council.map(c => c.split(', ')[1] || '')
    : [PROFILE.council?.split(', ')[1] || ''];

  return (
    <div 
      ref={ref} 
      className="relative w-full flex flex-col items-center justify-center pointer-events-auto will-change-transform mb-4"
    >
      <h1 className="hero-name" aria-label="Charlington Cavalcante">
        <span className="hn-line hn-1" aria-hidden="true">Charlington</span>
        <span className="hn-line hn-2" aria-hidden="true" style={{ display: 'flex' }}>
          <span>CAVALCA</span>
          <span className="relative flex flex-col items-end">
            <span>NTE</span>
            <div className="absolute top-[90%] right-0 flex flex-col items-end text-text-muted/80 uppercase font-sans whitespace-nowrap" style={{ fontFamily: 'var(--font-sans, ui-sans-serif, system-ui, sans-serif)', letterSpacing: '0.15em', fontSize: 'clamp(9px, 1.8vw, 12px)', lineHeight: '1.4' }}>
              <RandomLetterSwap labels={crmLines} intervalMs={3000} className="justify-end flex-nowrap shrink-0 w-max" />
              {rqeLines[0] && <RandomLetterSwap labels={rqeLines} intervalMs={3000} className="justify-end flex-nowrap shrink-0 w-max" />}
            </div>
          </span>
        </span>
        <span className="hero-pic" aria-hidden="true">
          <div className="hero-pic-inner">
            <img src="/PHOTO-2026-08-17-23-21-54.jpg" alt="Dr. Charlington Cavalcante" decoding="async" />
            <div className="hero-pic-glass"></div>
          </div>
          <i className="avatar-dot" title="online"></i>
        </span>
      </h1>

      <style>{`
        .hero-name {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 0.84;
          margin: 4px 0 10px;
        }
        .hn-line {
          font-family: 'Bebas Neue', sans-serif;
          font-weight: 400;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: var(--color-glow, #2F66E0);
          white-space: nowrap;
          display: inline-block;
          will-change: transform, filter;
        }
        .hn-1 {
          font-size: clamp(3rem, min(16vw, 12vh), 5.75rem);
        }
        .hn-2 {
          font-size: clamp(4.5rem, min(24vw, 18vh), 8.625rem);
        }
        .hero-pic {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 2;
          width: 5.125rem;
          height: 7.375rem;
          transform: translate(-50%, -50%);
          animation: picfloat 5.5s ease-in-out infinite alternate;
        }
        .hero-pic-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 999px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          cursor: pointer;
          -webkit-mask: radial-gradient(circle at 85.35% 85.35%, transparent 4px, black 4.5px);
          mask: radial-gradient(circle at 85.35% 85.35%, transparent 4px, black 4.5px);
        }
        @media(min-width: 700px) {
          .hero-pic {
            width: 6rem;
            height: 8.75rem;
          }
        }
        @media(min-width: 1024px) {
          .hero-pic {
            width: 7.5rem;
            height: 10.875rem;
          }
        }
        @media(min-width: 1280px) {
          .hero-pic {
            width: 9rem;
            height: 13.125rem;
          }
        }
        .hero-pic-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 50% 35%;
          filter: grayscale(100%);
          transition: all 0.7s ease-out;
        }
        .hero-pic:hover .hero-pic-inner img {
          filter: grayscale(0%);
          transform: scale(1.05);
        }
        .hero-pic-glass {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.2);
          pointer-events: none;
        }
        
        .avatar-dot {
          position: absolute;
          right: 14.65%;
          bottom: 14.65%;
          width: 6px;
          height: 6px;
          background-color: #2F66E0;
          border-radius: 50%;
          border: 1px solid transparent;
          z-index: 3;
          transform: translate(50%, 50%);
          box-shadow: 0 0 6px rgba(47, 102, 224, 0.5);
        }
        @media(min-width: 700px) {
          .avatar-dot { width: 7px; height: 7px; border-width: 1px; }
          .hero-pic-inner { -webkit-mask: radial-gradient(circle at 85.35% 85.35%, transparent 4.5px, black 5px); mask: radial-gradient(circle at 85.35% 85.35%, transparent 4.5px, black 5px); }
        }
        @media(min-width: 1024px) {
          .avatar-dot { width: 8px; height: 8px; border-width: 2px; }
          .hero-pic-inner { -webkit-mask: radial-gradient(circle at 85.35% 85.35%, transparent 6px, black 6.5px); mask: radial-gradient(circle at 85.35% 85.35%, transparent 6px, black 6.5px); }
        }
        @media(min-width: 1280px) {
          .avatar-dot { width: 10px; height: 10px; border-width: 2px; }
          .hero-pic-inner { -webkit-mask: radial-gradient(circle at 85.35% 85.35%, transparent 7px, black 7.5px); mask: radial-gradient(circle at 85.35% 85.35%, transparent 7px, black 7.5px); }
        }

        @keyframes blurin {
          from { opacity: 0; filter: blur(14px); transform: translateY(-24px); }
          to { opacity: 1; filter: blur(0); transform: none; }
        }
        @keyframes picin {
          from { opacity: 0; transform: translate(-50%, -30%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes picfloat {
          from { transform: translate(-50%, -50%); }
          to { transform: translate(-50%, calc(-50% - 6px)); }
        }
      `}</style>
    </div>
  )
})

export default PortraitHero
