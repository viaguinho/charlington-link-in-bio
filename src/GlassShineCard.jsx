import React from 'react'

export function GlassShineCard({ children, className = '' }) {
  return (
    <div
      className={`w-full h-full overflow-hidden ${className}`}
      style={{
        borderRadius: 'inherit',
        background: 'linear-gradient(110deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01)), rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
      }}
    >
      {/* Ruído/textura */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Orbs de fundo sutis para dar volume interno */}
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

      {/* Conteúdo encapsulado */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}
