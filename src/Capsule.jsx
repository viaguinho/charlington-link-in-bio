import { useState, useRef, useCallback, useLayoutEffect, memo } from 'react'
import gsap from 'gsap'
import { LINKS, ADDRESSES, PROFILE, SOCIALS } from './content'
import { ArrowUp, ArrowUpRight, Instagram, Linkedin, Doctoralia } from './Icons'
import { GlassShineCard } from './GlassShineCard'
import { RandomLetterSwap } from './components/ui/random-letter-swap'
import GroupCapsules from './GroupCapsules'

const socialIcon = { instagram: Instagram, linkedin: Linkedin, doctoralia: Doctoralia }

/*
  Superfície única de vidro, centralizada. Valores extraídos do DOM de marioo.info,
  não estimados: raio total, blur(24px), fundo rgba(0,0,0,0.25), borda de 1px em
  rgba(255,255,255,0.1).

  A proporção esbelta (largura em torno de 45% da altura) é o que faz o raio total
  ler como cápsula em vez de pastilha. Alargar para caber rótulo longo destrói a
  forma — por isso os rótulos são curtos.

  A curva engole as pontas: no topo e na base só entram elementos estreitos e
  centrados (o slot do logo e o botão de voltar), como na referência.

  ──────────────────────────────────────────────────────────────────────
  ANIMAÇÃO DE GRUPOS: quando o usuário clica em "Grupos", a cápsula
  tomba para a esquerda (rotateY -90°) e é trocada por duas
  mini-cápsulas que crescem do centro com efeito orgânico de membrana.

  A animação opera em um wrapper leve que só recebe perspective/
  transformStyle — sem position nem offset, para que o [data-slot]
  continue a ter capsuleWrapRef como offsetParent.
  ──────────────────────────────────────────────────────────────────────
*/
const Capsule = memo(function Capsule({ live = true, slotRef, onBackToTop }) {
  const [view, setView] = useState('main')

  /*
    flipRef: wrapper leve que envolve o conteúdo atual da cápsula.
    Recebe perspective + transformStyle. Não tem position/display que
    afete offsetParent.
  */
  const flipRef = useRef(null)
  const groupsRef = useRef(null)
  // Trava contra cliques duplos durante a transição.
  const animatingRef = useRef(false)
  // Flag para saber se acabou de voltar de 'groups'
  const returningRef = useRef(false)

  /*
    Quando voltamos de 'groups' para 'main', o componente re-renderiza
    e o flipRef aponta para o wrapper novo. Precisamos animá-lo entrando.
  */
  useLayoutEffect(() => {
    if (returningRef.current && view === 'main' && flipRef.current) {
      returningRef.current = false
      gsap.set(flipRef.current, { rotateZ: -90, scale: 0.8, opacity: 0 })
      gsap.to(flipRef.current, {
        rotateZ: 0,
        scale: 1,
        opacity: 1,
        duration: 0.45,
        ease: 'expo.out',
        onComplete: () => {
          animatingRef.current = false
        },
      })
    }
  }, [view])

  /*
    Volta automática ao rolar para cima.
  */
  useLayoutEffect(() => {
    if (view === 'groups') {
      let lastScrollY = window.scrollY
      
      const onScroll = () => {
        if (window.scrollY < lastScrollY - 10) {
          handleBack()
        }
        lastScrollY = window.scrollY
      }

      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
  }, [view])

  /*
    handleGroupsClick: dispara a animação de divisão celular.
  */
  const handleGroupsClick = useCallback(() => {
    if (animatingRef.current) return
    animatingRef.current = true

    const el = flipRef.current
    if (!el) return

    gsap.to(el, {
      rotateZ: -90,
      scale: 0.8,
      opacity: 0,
      duration: 0.45,
      ease: 'power3.in',
      onComplete: () => {
        setView('groups')
        // A entrada de groups será animada via useLayoutEffect em GroupCapsules
      },
    })
  }, [])

  /*
    handleBack: desfaz a animação de grupos.
  */
  const handleBack = useCallback(() => {
    if (animatingRef.current) return
    animatingRef.current = true

    const el = flipRef.current

    // Anima saída das mini-cápsulas
    const outTl = groupsRef.current?.animateOut()

    const tl = gsap.timeline()

    if (outTl) {
      tl.add(outTl)
    }

    tl.to(
      el,
      {
        opacity: 0,
        scale: 0.8,
        duration: 0.35,
        ease: 'power3.in',
        onComplete: () => {
          returningRef.current = true
          setView('main')
        },
      },
      '-=0.2',
    )
  }, [])

  /*
    Quando a view muda para 'groups', anima a entrada.
  */
  useLayoutEffect(() => {
    if (view === 'groups' && flipRef.current) {
      document.body.classList.add('view-groups')
      gsap.set(flipRef.current, { rotateZ: 0, scale: 1, opacity: 1 })
      // A própria GroupCapsules tem sua animação complexa de entrada (animateIn).
      // Evitamos animar o scale do flipRef ao mesmo tempo para não travar a GPU com composições aninhadas.
      requestAnimationFrame(() => {
        groupsRef.current?.animateIn()
        animatingRef.current = false
      })
    } else {
      document.body.classList.remove('view-groups')
    }
  }, [view])

  return (
    <div
      ref={flipRef}
      style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
    >
      {view === 'groups' ? (
        <GroupCapsules ref={groupsRef} onBack={handleBack} />
      ) : (
        <div
          className={`relative rounded-full flex flex-col items-center w-54 px-5 pt-8 pb-5.5 md:w-50 md:px-5 md:pt-8 md:pb-5.5 lg:w-60 lg:px-6 lg:pt-10 lg:pb-7 xl:w-68 xl:px-7 xl:pt-12 xl:pb-8 ${
            live ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <GlassShineCard className="absolute inset-0 pointer-events-none z-0" />
          
          {/* Onde o logo do herói aterrissa. Vazio de propósito: o logo é um
              elemento próprio, animado por cima da cápsula. */}
          <div
            ref={slotRef}
            data-slot
            aria-hidden="true"
            className="relative z-10 h-10 w-14 md:h-11 md:w-14 lg:h-14 lg:w-18 xl:h-16 xl:w-20"
          />

          <header data-row className="relative z-10 mt-2 text-center md:mt-2.5 lg:mt-3 xl:mt-4">
            <span className="block mb-0.5 text-[10.5px] leading-[1.4] text-white/50 md:text-[10.5px] lg:text-[12px] xl:text-[14px] tracking-[0.2em] uppercase transition-colors duration-200 hover:text-glow cursor-default">
              {PROFILE.specialty}
            </span>
            <h1 className="text-[13.5px] leading-[1.3] font-medium text-white/95 md:text-[13px] lg:text-[15px] xl:text-[17px] transition-colors duration-200 hover:text-glow cursor-default">
              {PROFILE.nameLines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h1>
            <div className="mt-0.5 text-[10.5px] leading-[1.4] text-white/50 md:text-[10.5px] lg:text-[12px] xl:text-[14px] transition-colors duration-200 hover:text-glow cursor-default">
              {Array.isArray(PROFILE.council) ? (
                <RandomLetterSwap
                  labels={PROFILE.council}
                  intervalMs={3000}
                  className="w-full"
                />
              ) : (
                <span className="block">{PROFILE.council}</span>
              )}
            </div>
          </header>

          <nav aria-label="Canais e consultórios" className="relative z-10 mt-2 w-full md:mt-2.5 lg:mt-3.5 xl:mt-4">
            <ul className="flex flex-col items-center">
              {view === 'main' ? (
                LINKS.map((item) => (
                  <li key={item.id} data-row className="w-full">
                    {item.id === 'addresses' ? (
                      <button
                        type="button"
                        onClick={() => setView('addresses')}
                        className="flex w-full min-h-9 md:min-h-9 lg:min-h-11 xl:min-h-12 items-center justify-center text-center text-[14px] leading-none transition-all duration-200 ease-out focus-visible:outline-none md:text-[14px] lg:text-[16px] xl:text-[18px] text-white/80 hover:text-glow hover:scale-[1.04] focus-visible:text-glow focus-visible:scale-[1.04] active:scale-[0.98]"
                      >
                        {item.label}
                      </button>
                    ) : item.id === 'groups' ? (
                      <button
                        type="button"
                        onClick={handleGroupsClick}
                        className="flex w-full min-h-9 md:min-h-9 lg:min-h-11 xl:min-h-12 items-center justify-center text-center text-[14px] leading-none transition-all duration-200 ease-out focus-visible:outline-none md:text-[14px] lg:text-[16px] xl:text-[18px] text-white/80 hover:text-glow hover:scale-[1.04] focus-visible:text-glow focus-visible:scale-[1.04] active:scale-[0.98]"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex min-h-9 md:min-h-9 lg:min-h-11 xl:min-h-12 items-center justify-center text-center text-[14px] leading-none transition-all duration-200 ease-out focus-visible:outline-none md:text-[14px] lg:text-[16px] xl:text-[18px] ${
                          item.primary
                            ? 'text-white hover:text-glow hover:scale-[1.04] focus-visible:text-glow focus-visible:scale-[1.04] active:scale-[0.98]'
                            : 'text-white/80 hover:text-glow hover:scale-[1.04] focus-visible:text-glow focus-visible:scale-[1.04] active:scale-[0.98]'
                        }`}
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))
              ) : (
                <>
                  {ADDRESSES.map((item) => (
                    <li key={item.id} data-row className="w-full">
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item flex min-h-9 md:min-h-9 lg:min-h-11 xl:min-h-12 items-center justify-center gap-1.5 text-center text-[14px] leading-none transition-all duration-200 ease-out focus-visible:outline-none md:text-[14px] lg:text-[16px] xl:text-[18px] text-white/80 hover:text-glow hover:scale-[1.04] focus-visible:text-glow focus-visible:scale-[1.04] active:scale-[0.98]"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="size-3 lg:size-3.5 xl:size-4 opacity-70 transition-transform duration-200 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 group-hover/item:opacity-100" />
                      </a>
                    </li>
                  ))}
                  <li data-row className="w-full">
                    <button
                      type="button"
                      onClick={() => setView('main')}
                      className="flex w-full min-h-9 md:min-h-9 lg:min-h-11 xl:min-h-12 items-center justify-center text-center text-[10.5px] uppercase tracking-[0.2em] text-white/50 hover:text-glow focus-visible:text-glow hover:tracking-[0.24em] transition-all duration-200 focus-visible:outline-none md:text-[10.5px] lg:text-[12px] xl:text-[14px]"
                    >
                      Voltar
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div data-row className="relative z-10 mt-2 flex items-center gap-1.5 md:mt-2.5 lg:mt-3 xl:mt-3.5">
            {SOCIALS.map((s) => {
              const Icon = socialIcon[s.id]
              return (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-9 md:size-8.5 lg:size-10 xl:size-11 place-items-center rounded-full text-white/80 transition-all duration-200 hover:text-glow hover:scale-115 hover:bg-white/5 focus-visible:text-glow focus-visible:scale-115 focus-visible:outline-none active:scale-95"
                >
                  <Icon className="size-4 md:size-4 lg:size-4.5 xl:size-5 transition-transform duration-200" />
                </a>
              )
            })}
          </div>

          {/*
            O círculo desenhado tem o tamanho da referência (32px / 36px), mas a área
            de clique é de 44px — a regra do design system: o alvo de toque excede a
            marca visual, nunca o contrário.
          */}
          <button
            data-row
            type="button"
            onClick={onBackToTop}
            aria-label="Voltar ao topo"
            className="relative z-10 mt-2 md:mt-2 lg:mt-2.5 xl:mt-3 group grid size-9 md:size-8.5 lg:size-10 xl:size-11 place-items-center rounded-full focus-visible:outline-none transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <span className="grid size-7.5 md:size-7 lg:size-8.5 xl:size-9 place-items-center rounded-full border border-white/10 text-white/80 transition-all duration-200 group-hover:border-glow group-hover:bg-glow/15 group-hover:text-glow group-focus-visible:border-glow group-focus-visible:text-glow group-hover:shadow-[0_0_12px_rgba(47,102,224,0.3)]">
              <ArrowUp className="size-3 md:size-3 lg:size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
            </span>
          </button>
        </div>
      )}
    </div>
  )
})
export default Capsule
