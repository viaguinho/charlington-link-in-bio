import { useRef, useLayoutEffect, forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import gsap from 'gsap'
import { GROUPS, SCROLL_CUE } from './content'
import { GlassShineCard } from './GlassShineCard'
import PortraitHero from './PortraitHero'
import HeroLogo3D from './HeroLogo3D'

const LOGO = '/logo.svg'
/*
  Ícone de seta para voltar (↶).
*/
const ArrowBack = (p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    {...p}
  >
    <path d="M19 12H5M5 12l7 7M5 12l7-7" />
  </svg>
)

/*
  GroupCapsules — estado "dividido" da cápsula.
  
  Cards de grupos recreando a diagramação, tipografia e microinterações de rickmiura.com/linkbio,
  adaptados para o formato de pílula estendida com BorderGlow.
*/
const GroupCapsules = forwardRef(function GroupCapsules({ onBack }, ref) {
  const wrapRef = useRef(null)
  const membraneRef = useRef(null)
  const portraitRef = useRef(null)
  const capRefs = useRef([])
  const bioRef = useRef(null)
  const cueRef = useRef(null)

  const [showLogo, setShowLogo] = useState(false)

  useEffect(() => {
    // Atrasamos a montagem do WebGL em 1200ms para não travar a animação GSAP de transição
    // (a animação leva ~1.05s, então 1200ms garante que ela terminou)
    const timer = setTimeout(() => setShowLogo(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  useImperativeHandle(ref, () => ({
    /*
      animateIn(): membrana de gel estica e arrebenta → duas cápsulas crescem
      do centro para cima/baixo com spring overshoot.
    */
    animateIn() {
      const tl = gsap.timeline()
      const caps = capRefs.current.filter(Boolean)
      const membrane = membraneRef.current
      const cue = cueRef.current

      // Estado inicial
      gsap.set(wrapRef.current, { opacity: 1 })
      gsap.set(portraitRef.current, { opacity: 0, scale: 0.9 })
      gsap.set(bioRef.current, { opacity: 0, y: 15 })
      gsap.set(caps, { opacity: 0, y: (i) => (i === 0 ? 30 : -30) })
      gsap.set(membrane, { opacity: 0.7, scaleX: 0.6, scaleY: 0.2 })
      if (cue) gsap.set(cue, { opacity: 0, y: 12 })

      // Fase 1: membrana cresce
      tl.to(membrane, {
        scaleY: 1.8,
        scaleX: 1,
        opacity: 0.5,
        duration: 0.3,
        ease: 'power2.out',
      })
      // Fase 2: membrana estica mais e arrebenta
      .to(membrane, {
        scaleY: 3,
        scaleX: 0.3,
        opacity: 0,
        duration: 0.25,
        ease: 'power3.in',
      })
      // Fase 3: cápsulas surgem com spring
      .to(
        portraitRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power3.out',
        },
        '-=0.25',
      )
      .to(
        bioRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power3.out',
        },
        '-=0.3'
      )
      .to(
        caps[0],
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'back.out(1.2)',
        },
        '-=0.15',
      )
      .to(
        caps[1],
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'back.out(1.2)',
        },
        '-=0.4'
      )
      if (cue) {
        tl.to(
          cue,
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: 'power3.out',
          },
          '-=0.2',
        )
      }

      return tl
    },

    /*
      animateOut(): cápsulas convergem para o centro e somem → prepara
      para o flip reverso da cápsula-mãe.
    */
    animateOut() {
      const tl = gsap.timeline()
      const caps = capRefs.current.filter(Boolean)
      const cue = cueRef.current

      tl.to(portraitRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.35,
        ease: 'power3.in',
      }, 0)
      
      tl.to(bioRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.35,
        ease: 'power3.in',
      }, 0)
      
      tl.to(caps, {
        opacity: 0,
        y: (_i, _el, arr) => (arr.indexOf(_el) === 0 ? 30 : -30),
        duration: 0.35,
        ease: 'power3.in',
        stagger: 0.05,
      })

      if (cue) {
        tl.to(cue, { opacity: 0, y: -10, duration: 0.25, ease: 'power3.in' }, 0)
      }

      tl.to(wrapRef.current, { opacity: 0, duration: 0.1 }, '-=0.1')

      return tl
    },
  }))

  // Esconde por padrão até animateIn() rodar
  useLayoutEffect(() => {
    gsap.set(wrapRef.current, { opacity: 0 })
  }, [])

  return (
    <div
      ref={wrapRef}
      className="pointer-events-auto relative flex flex-col items-center gap-2.5 md:gap-3.5 lg:gap-5 w-[min(92vw,26.875rem)] md:w-[min(92vw,28.75rem)] lg:w-[min(92vw,37.5rem)] xl:w-[min(92vw,50rem)] mt-3 md:mt-5 lg:mt-8"
    >
      <div className="w-full flex flex-col items-center mt-1 mb-2 md:mt-2 md:mb-4 lg:mt-3 lg:mb-6 pointer-events-none z-10">
        <PortraitHero ref={portraitRef} />
        
        <div ref={bioRef} className="mt-3 md:mt-5 lg:mt-6 flex flex-col items-center text-center gap-1.5">
          <p className="font-mono text-[11px] md:text-xs lg:text-[13px] tracking-[0.2em] text-white uppercase">
            <b className="bg-glow text-white px-1.5 py-0.5">Neurologia Infantil</b>
          </p>
          <p className="font-mono text-[10px] md:text-[11px] lg:text-xs tracking-[0.15em] text-white uppercase">
            <b className="bg-glow text-white px-1.5 py-0.5">desenvolvimento, autismo,</b>
          </p>
          <p className="font-mono text-[10px] md:text-[11px] lg:text-xs tracking-[0.15em] text-white uppercase">
            <b className="bg-glow text-white px-1.5 py-0.5">TDAH e epilepsia</b>
          </p>
        </div>
      </div>

      {/* Membrana de gel — oval que estica e arrebenta entre as cápsulas */}
      <div
        ref={membraneRef}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: '60%',
          height: 40,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, rgba(30,193,230,0.35) 0%, rgba(47,102,224,0.15) 60%, transparent 100%)',
          transformOrigin: '50% 50%',
        }}
      />

      {GROUPS.map((group, i) => (
        <div
          key={group.id}
          ref={(el) => (capRefs.current[i] = el)}
          className="w-full pointer-events-auto"
        >
          <div
            className={`p-0 overflow-hidden relative pointer-events-auto rounded-full border border-white/15 transition-colors ${group.video || group.image ? 'bg-transparent' : 'bg-[#0a0a0c]/45'}`}
          >
            {/* Fundo de vidro com blur apenas quando o card não tiver mídia */}
            {!group.video && !group.image && (
              <GlassShineCard className="absolute inset-0 pointer-events-none z-0" />
            )}

            <a
              href={group.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${group.title} — ${group.sub}`}
              className="group relative flex w-full items-center justify-between min-h-24 md:min-h-28 lg:min-h-36 xl:min-h-44 px-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 lg:py-5 xl:py-7 focus-visible:outline-none transition-all duration-300 pointer-events-auto cursor-pointer"
            >
              {/* Camada de mídia (vídeo ou imagem) com definição cristalina */}
              {(group.video || group.image) && (
                <div className="absolute inset-0 z-0 overflow-hidden rounded-full pointer-events-none">
                  {group.video ? (
                    <video
                      src={group.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="size-full object-contain object-right origin-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <img
                      src={group.image}
                      alt=""
                      decoding="async"
                      className="size-full object-contain object-right origin-center transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  {/* Degradê apenas à esquerda para garantir legibilidade do texto: azul luminoso mais claro (#165ee6) */}
                  <div
                    className={`absolute inset-0 bg-linear-to-r ${
                      i === 0
                        ? 'from-[#165ee6]/85 via-[#165ee6]/35 via-35% to-transparent'
                        : 'from-[#0a0b0d]/95 via-[#0a0b0d]/40 via-40% to-transparent'
                    }`}
                  />
                  {/* Borda interna sutil de vidro */}
                  <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" />
                </div>
              )}

              {/* Corpo do card com hierarquia tipográfica idêntica à referência */}
              <div className="relative z-20 flex flex-col justify-center text-left py-1 pr-4 max-w-[64%] sm:max-w-[68%] lg:max-w-[75%]">
                {/* Tag de sessão */}
                <span
                  className="font-mono-card text-[8.5px] md:text-[9.5px] lg:text-[12px] xl:text-[14px] font-normal tracking-[0.14em] uppercase text-white/50 group-hover:text-glow transition-colors duration-200"
                >
                  {group.tag}
                </span>

                {/* Título com a fonte Phudu da área Sobre */}
                <h2
                  className="mt-0.5 font-['Phudu',sans-serif] text-[18px] sm:text-[21px] md:text-[24px] lg:text-[32px] xl:text-[40px] font-normal leading-[1.05] tracking-tight uppercase text-white [text-shadow:0_3px_16px_rgba(0,0,0,0.6)]"
                >
                  {group.title}
                </h2>

                {/* Subtítulo de ação com traço expansível */}
                <div
                  className="mt-1 lg:mt-2.5 font-mono-card text-[8.5px] md:text-[9.5px] lg:text-[12px] xl:text-[14px] font-normal tracking-[0.11em] uppercase text-white/60 group-hover:text-white inline-flex items-center gap-2 transition-colors duration-200"
                >
                  <span
                    aria-hidden="true"
                    className="inline-block h-px w-4.5 lg:w-6 xl:w-8 bg-white/40 transition-all duration-300 ease-out group-hover:w-7 lg:group-hover:w-10 xl:group-hover:w-12 group-hover:bg-glow"
                  />
                  <span className="truncate">{group.sub}</span>
                </div>
              </div>

              {/* Botão circular com seta em vidro fosco */}
              <div
                aria-hidden="true"
                className="absolute right-4 sm:right-5 md:right-6 lg:right-8 xl:right-10 top-1/2 -translate-y-1/2 z-20 size-8.5 md:size-10 lg:size-13 xl:size-15 rounded-full border border-white/20 bg-white/10 grid place-items-center text-white/80 transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:rotate-[-35deg] group-hover:scale-105 group-hover:bg-glow group-hover:text-white shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5 md:size-4 lg:size-5 xl:size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </a>
          </div>
        </div>
      ))}

      {/* Miniatura giratória do logo */}
      <div className={`relative mt-2 mb-0.5 h-12 w-16 md:h-14 md:w-20 lg:h-18 lg:w-24 grid place-items-center pointer-events-none transition-opacity duration-700 ${showLogo ? 'opacity-90' : 'opacity-0'}`}>
        {showLogo && (
          <HeroLogo3D
            src={LOGO}
            className="absolute inset-0 size-full"
            highlight="#2F66E0"
            scale={6}
            cameraDistance={8}
            floatIntensity={0.6}
            rotationIntensity={0.9}
            rotationSpeed={1.5}
            baseRotationZ={0}
            floatSpeed={2}
          />
        )}
      </div>

      {/* Informativo animado de rolar a tela para cima para voltar */}
      <button
        ref={cueRef}
        type="button"
        onClick={onBack}
        aria-label="Role para cima para voltar"
        className="pointer-events-auto flex flex-col items-center gap-1.5 text-center text-[10px] tracking-[0.24em] text-text-muted/90 hover:text-glow uppercase md:text-[11px] transition-all duration-200 cursor-pointer focus-visible:outline-none group mt-8 mb-6 md:mt-0 md:mb-4 md:pb-2"
      >
        <div className="flex h-5.5 w-3.5 items-start justify-center rounded-full border border-text-muted/60 p-0.75 rotate-180 transition-colors duration-200 group-hover:border-glow">
          <div className="h-1.5 w-1 rounded-full bg-text-muted transition-colors duration-200 group-hover:bg-glow animate-scroll-wheel" />
        </div>
        <span className="transition-colors duration-200 font-medium">Role para cima para voltar</span>
      </button>
    </div>
  )
})

export default GroupCapsules
