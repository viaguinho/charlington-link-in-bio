import { useLayoutEffect, useRef, useState, useCallback, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Capsule from './Capsule'
import Prism from './Prism'
import HeroLogo3D from './HeroLogo3D'
import AboutScreen from './AboutScreen'
import FaqModal from './FaqModal'
import { PROFILE, TOP_NAV, SCROLL_CUE } from './content'
import { RandomLetterSwap } from './components/ui/random-letter-swap'
import { SlotNavLink } from './components/ui/slot-nav-link'

gsap.registerPlugin(ScrollTrigger)

const LOGO = './logo.svg'
const LOADER_LOGO_PX = 44
const LOADER_MIN_MS = 2500

export default function App() {
  const rootRef = useRef(null)
  const driverRef = useRef(null)
  const columnRef = useRef(null)
  const logoRef = useRef(null)
  const logoImgRef = useRef(null)
  const haloRef = useRef(null)
  const haloPulseRef = useRef(null)
  const topNavRef = useRef(null)
  const nameRef = useRef(null)
  const cueRef = useRef(null)
  const capsuleWrapRef = useRef(null)
  const slotRef = useRef(null)
  const ruleRef = useRef(null)
  const ruleFillRef = useRef(null)
  const lenisRef = useRef(null)
  const prismWrapRef = useRef(null)

  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [logoReady, setLogoReady] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showFaq, setShowFaq] = useState(false)
  const [fadeBg, setFadeBg] = useState(false)

  useEffect(() => {
    if (showFaq) {
      setFadeBg(true)
    } else {
      const timer = setTimeout(() => setFadeBg(false), 300)
      return () => clearTimeout(timer)
    }
  }, [showFaq])

  const fadeClass = fadeBg ? `max-md:transition-opacity max-md:duration-300 ${showFaq ? 'max-md:!opacity-0 max-md:!pointer-events-none' : ''}` : ''

  /*
    A cápsula existe no DOM desde o início (para o GSAP animá-la), mas só passa a
    receber toque, foco e rolagem quando o encaixe termina. Sem isso, uma cápsula
    invisível fica por cima do herói engolindo o gesto de rolar e deixando os
    links clicáveis às cegas.
  */
  const [capsuleLive, setCapsuleLive] = useState(reduced)

  const backToTop = useCallback(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 1.2 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
    }

    /*
      Onde o logo do herói tem de aterrissar.

      Só usa caixas de layout — offsetWidth, offsetTop e o retângulo do container
      do herói, que não é afetado por transforms aplicados aos filhos. Por isso
      pode ser recalculado a qualquer momento, inclusive com a cápsula no meio da
      própria animação de entrada.
    */
    let lastMeasure = { scale: 1, dx: 0, dy: 0, logoW: 1, centerY: 0 }

    const measure = () => {
      const logo = logoRef.current
      const col = columnRef.current
      const slot = slotRef.current
      if (!logo || !col || !slot) return lastMeasure

      const logoW = logo.offsetWidth || 1
      const logoH = logo.offsetHeight || 1
      const colRect = col.getBoundingClientRect()
      const centerY = colRect.top + logoH / 2
      const centerX = colRect.left + colRect.width / 2

      // A cápsula é o offsetParent do slot e está centrada na viewport, então a
      // posição de layout dela se deriva da própria altura — sem ler transform.
      const capsule = slot.offsetParent
      const containerH = capsuleWrapRef.current?.parentElement?.offsetHeight || window.innerHeight
      const containerW = capsuleWrapRef.current?.parentElement?.offsetWidth || window.innerWidth
      const capsuleTop = (containerH - (capsule?.offsetHeight || 0)) / 2
      const slotCenterY = capsuleTop + slot.offsetTop + slot.offsetHeight / 2
      const slotCenterX = containerW / 2

      lastMeasure = {
        logoW,
        centerY,
        scale: slot.offsetWidth / logoW,
        dx: slotCenterX - centerX,
        dy: slotCenterY - centerY,
      }
      return lastMeasure
    }

    // ── Sem animação: estado final direto, página de uma tela. ────────────
    if (reduced) {
      const m = measure()
      gsap.set(logoRef.current, { scale: m.scale, x: m.dx, y: m.dy })
      gsap.set(haloRef.current, { scale: 0.9, opacity: 0.35 })
      gsap.set(topNavRef.current, { opacity: 0 })
      gsap.set([nameRef.current, cueRef.current, ruleRef.current], { opacity: 0 })
      gsap.set(capsuleWrapRef.current, { opacity: 1, y: 0 })
      return
    }

    ScrollTrigger.config({ ignoreMobileResize: true })

    const lenis = new Lenis({ duration: 1.1 })
    lenisRef.current = lenis
    lenis.stop() // travado até o herói terminar de expandir
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      const logo = logoRef.current
      const m0 = measure()

      // ── Fase 0 · estado de loader ────────────────────────────────────────
      gsap.set(logo, {
        scale: LOADER_LOGO_PX / m0.logoW,
        opacity: 1,
        transformOrigin: '50% 50%',
      })
      gsap.set(haloRef.current, { scale: 0.3, opacity: 0.45 })
      gsap.set('.top-nav-item', { opacity: 0, y: 20 })
      gsap.set(nameRef.current, { opacity: 0, y: 14 })
      gsap.set(cueRef.current, { opacity: 0, y: 10 })
      gsap.set(capsuleWrapRef.current, { opacity: 0, y: '30vh' })
      gsap.set('[data-row]', { opacity: 0, y: 12 })
      gsap.set(ruleFillRef.current, { scaleX: 0, transformOrigin: '0% 50%' })
      // A régua acompanha o logo minúsculo, 34px abaixo dele.
      gsap.set(ruleRef.current, { top: m0.centerY + 34 })

      gsap.to(haloPulseRef.current, {
        scale: 1.06,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      // Preenchimento da régua: piso fixo de 2.5s, em toda visita.
      const bar = gsap.to(ruleFillRef.current, {
        scaleX: 1,
        duration: LOADER_MIN_MS / 1000,
        ease: 'none',
      })

      const barDone = new Promise((res) => bar.eventCallback('onComplete', res))
      const assetsDone = Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((res) => {
          const img = new Image()
          img.onload = img.onerror = res
          img.src = LOGO
        }),
      ])

      Promise.all([barDone, assetsDone]).then(() => {
        if (!logoRef.current) return

        // ── Fase 1 · expansão ─────────────────────────────────────────────
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .to(ruleRef.current, { opacity: 0, duration: 0.2 }, 0)
          .to(logo, { scale: 1, opacity: 1, duration: 0.95, ease: 'expo.out' }, 0)
          .to(
            haloRef.current,
            { scale: 1, opacity: 1, duration: 1.15, ease: 'expo.out' },
            0,
          )
          .to('.top-nav-item', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' }, 0.2)
          .to(nameRef.current, { opacity: 1, y: 0, duration: 0.7 }, 0.35)
          .to(cueRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.6)
          .add(() => {
            window.scrollTo(0, 0)
            lenis.start()
            buildScrub()
          }, 1.0)
      })

      // ── Fase 3 · scrub de 1 viewport ───────────────────────────────────
      const buildScrub = () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: driverRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) => setCapsuleLive(self.progress > 0.85),
            },
          })
          .to(
            logo,
            {
              scale: () => measure().scale,
              ease: 'power3.out', // shrink faster at the start to avoid overlap
              duration: 1,
            },
            0,
          )
          .to(
            logo,
            {
              x: () => measure().dx,
              y: () => measure().dy,
              ease: 'power3.inOut',
              duration: 1,
            },
            0,
          )
          // O halo recolhe mas não zera: continua sendo o brilho por trás do
          // logo pequeno. O que dá corpo ao vidro agora é o Prism, não ele.
          .to(
            haloRef.current,
            { scale: 0.9, opacity: 0.35, ease: 'power2.out', duration: 0.85 },
            0,
          )
          .to(
            topNavRef.current,
            { opacity: 0, y: -16, ease: 'power2.in', duration: 0.35 },
            0,
          )
          .to(
            nameRef.current,
            { opacity: 0, y: -24, ease: 'power2.in', duration: 0.35 },
            0,
          )
          .to(cueRef.current, { opacity: 0, duration: 0.15 }, 0)
          // A cápsula só sobe depois que o logo já liberou o centro da tela.
          .to(
            capsuleWrapRef.current,
            { opacity: 1, y: 0, ease: 'power3.out', duration: 0.28 },
            0.62,
          )
          /*
            O conteúdo entra tarde de propósito. No desktop o logo do herói tem
            531px contra uma cápsula de 236px, e a 70% do gesto ele ainda cobre o
            nome — a suíte acusa isso. A superfície de vidro materializa cedo
            (0.55), mas o texto só aparece quando o logo já está quase pousado.

            O último elemento tem de terminar exatamente em 1.0: o scrub mapeia a
            rolagem sobre a duração TOTAL da timeline, então um stagger que
            empurre o fim para 1.3 faz tudo antes dele acontecer 30% mais cedo do
            que a marcação escrita sugere. São 7 elementos [data-row]:
            0.80 + 6×0.016 de stagger + 0.104 de duração = 1.0.
          */
          .to(
            '[data-row]',
            { opacity: 1, y: 0, stagger: 0.016, ease: 'power2.out', duration: 0.104 },
            0.8,
          )
      }
    }, rootRef)

    return () => {
      ctx.revert()
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  return (
    <div ref={rootRef} className="relative bg-ink">
      {/*
        Campo vivo. Existe por motivo funcional, não decorativo: backdrop-filter
        sobre preto puro produz cinza chapado. A referência só parece vidro
        porque há uma grade colorida de projetos atrás dela.
      */}
      <div ref={prismWrapRef} className="pointer-events-none fixed top-0 inset-x-0 h-lvh z-0" aria-hidden="true">
        <Prism
          animationType="rotate"
          timeScale={reduced ? 0 : 0.32}
          height={3.5}
          baseWidth={5.5}
          scale={3.2}
          hueShift={0}
          colorFrequency={0.9}
          noise={0.14}
          glow={0.45}
          bloom={0.7}
          maxDpr={1.5}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 120% 80% at 50% 50%, rgba(10,10,12,0.85) 0%, rgba(10,10,12,0.65) 40%, rgba(10,10,12,0.4) 100%)',
          }}
        />
      </div>

      {/* Trilho de rolagem: 2 telas = 1 tela de gesto. Puramente estrutural. */}
      <div
        ref={driverRef}
        aria-hidden="true"
        className={`pointer-events-none ${reduced ? 'h-svh' : 'h-[200svh]'}`}
      />

      {/* ── Cápsula de vidro: superfície única, destino do logo ────────── */}
      <div className="pointer-events-none fixed top-0 inset-x-0 h-svh z-20 grid place-items-center px-4">
        <div
          ref={capsuleWrapRef}
          inert={!capsuleLive}
          className={`will-change-transform ${fadeClass}`}
        >
          <Capsule live={capsuleLive} slotRef={slotRef} onBackToTop={backToTop} />
        </div>
      </div>

      {/* ── Herói: halo + logo + assinatura ───────────────────────────── */}
      {/*
        Empilhamento: a cápsula é a superfície (z-20), o logo pousa por cima dela
        (z-30). Invertido, o backdrop-blur da cápsula é pintado sobre a marca e
        a escurece justamente onde ela precisa de contraste.
      */}
      <div className="pointer-events-none fixed top-0 inset-x-0 h-svh z-30 grid place-items-center px-6">
        <div ref={columnRef} className="flex flex-col items-center">
          <div className="relative grid place-items-center">
            <div
              ref={haloRef}
              className="pointer-events-none absolute inset-0 -z-10 grid place-items-center"
            >
              <div
                ref={haloPulseRef}
                className="aspect-square w-[165%] rounded-full blur-[70px] md:blur-[110px]"
                style={{
                  background:
                    'radial-gradient(circle, rgba(47,102,224,0.18) 0%, rgba(30,193,230,0.12) 42%, rgba(10,10,12,0) 70%)',
                }}
              />
            </div>

            {/* Logo do herói */}
            <div
              ref={logoRef}
              className="logo-hero relative aspect-1384/1080 will-change-transform"
            >
              <HeroLogo3D
                src={LOGO}
                className="absolute inset-0 size-full"
                highlight="#2F66E0"
                scale={8}
                cameraDistance={8}
                floatIntensity={0.8}
                rotationIntensity={0.5}
                rotationSpeed={0.8}
                baseRotationZ={-0.25}
                floatSpeed={1.5}
                onLoad={() => setLogoReady(true)}
                onError={() => setLogoReady(true)}
              />
            </div>
          </div>

          <div ref={nameRef} className={`mt-9 text-center md:mt-12 font-['Helvetica',Arial,sans-serif] ${fadeClass}`}>
            <span className="block mb-2 text-[11.5px] tracking-[0.26em] text-text-muted uppercase md:text-[13px]">
              {PROFILE.specialty}
            </span>
            <p className="text-[15px] leading-tight font-medium tracking-[0.22em] text-text-main uppercase md:text-[17px] md:tracking-[0.26em]">
              {PROFILE.name}
            </p>
            <div className="mt-2.5 flex items-center justify-center text-[11.5px] tracking-[0.26em] text-text-muted uppercase md:text-[13px]">
              {Array.isArray(PROFILE.council) ? (
                <RandomLetterSwap
                  labels={PROFILE.council}
                  intervalMs={3000}
                />
              ) : (
                <span>{PROFILE.council}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Régua do loader */}
      <div
        ref={ruleRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 z-30 h-px w-[min(56vw,240px)] -translate-x-1/2 bg-black/10"
      >
        <div ref={ruleFillRef} className="h-full w-full bg-glow" />
      </div>

      {/* Convite de rolagem */}
      <div
        ref={cueRef}
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 bottom-8 z-30 flex flex-col items-center gap-2 text-center text-[10px] tracking-[0.28em] text-text-muted/70 uppercase md:bottom-10 md:text-[11px] ${fadeClass}`}
      >
        <div className="flex h-6 w-3.5 items-start justify-center rounded-full border border-text-muted/40 p-0.75">
          <div className="h-1.5 w-1 rounded-full bg-text-muted/70 animate-scroll-wheel" />
        </div>
        <span>{SCROLL_CUE}</span>
      </div>

      {/* ── Barra superior estilo marioo.info (Infos, Sobre / Contato) ── */}
      <header
        ref={topNavRef}
        inert={capsuleLive}
        className={`fixed top-0 inset-x-0 z-30 flex items-center justify-between px-6 pt-3 md:px-10 md:pt-4 ${fadeClass}`}
      >
        <nav aria-label="Navegação institucional" className="flex items-center gap-6 md:gap-8">
          {TOP_NAV.left.map((item) => (
            <SlotNavLink
              key={item.label}
              href={item.href}
              onClick={
                item.action === 'about' ? (e) => { e.preventDefault(); setShowAbout(true) } 
                : item.action === 'faq' ? (e) => { e.preventDefault(); setShowFaq(true) } 
                : undefined
              }
              className="top-nav-item min-h-11 items-center text-[13px] tracking-[0.22em] text-text-muted hover:text-text-main uppercase transition-colors duration-150 focus-visible:outline-none md:tracking-[0.26em]"
            >
              {item.label}
            </SlotNavLink>
          ))}
        </nav>
        <div className="flex items-center">
          {TOP_NAV.right.map((item) => (
            <SlotNavLink
              key={item.label}
              href={item.href}
              className="top-nav-item min-h-11 items-center text-[13px] tracking-[0.22em] text-text-muted hover:text-text-main uppercase transition-colors duration-150 focus-visible:outline-none md:tracking-[0.26em]"
            >
              {item.label}
            </SlotNavLink>
          ))}
        </div>
      </header>

      {showAbout && <AboutScreen onClose={() => setShowAbout(false)} />}
      {showFaq && <FaqModal onClose={() => setShowFaq(false)} />}
    </div>
  )
}
