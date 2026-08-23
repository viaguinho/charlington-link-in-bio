import { useState, useRef, useCallback, useLayoutEffect, memo } from 'react'
import gsap from 'gsap'
import { LINKS, ADDRESSES, PROFILE, SOCIALS } from './content'
import { ArrowUp, ArrowUpRight, Instagram, Linkedin, Doctoralia } from './Icons'
import BorderGlow from './BorderGlow'
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
        <BorderGlow
          borderRadius={9999}
          edgeSensitivity={20}
          backgroundColor="rgba(10, 10, 12, 0.25)"
          colors={['#1ec1e6', '#81c9eb', '#a2e0f9']}
          coneSpread={28}
          className={`w-49 px-5 py-5 md:w-59 md:px-6 md:py-6 lg:w-72 lg:px-8 lg:py-8 xl:w-80 xl:px-10 xl:py-10 ${
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
            className="relative z-10 h-11 w-14 md:h-13 md:w-16 lg:h-16 lg:w-20 xl:h-20 xl:w-24"
          />

          <header data-row className="relative z-10 mt-4 text-center md:mt-5 lg:mt-6 xl:mt-8">
            <span className="block mb-1.5 text-[10px] leading-[1.45] text-white/45 md:text-[11px] lg:text-[13px] xl:text-[15px] tracking-[0.2em] uppercase">
              {PROFILE.specialty}
            </span>
            <h1 className="text-[12px] leading-[1.35] font-medium text-white/95 md:text-[13px] lg:text-[16px] xl:text-[18px]">
              {PROFILE.nameLines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </h1>
            <div className="mt-2 text-[10px] leading-[1.45] text-white/45 md:text-[11px] lg:text-[13px] xl:text-[15px]">
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

          <nav aria-label="Canais e consultórios" className="relative z-10 mt-4 w-full md:mt-5 lg:mt-7 xl:mt-9">
            <ul className="flex flex-col items-center">
              {view === 'main' ? (
                LINKS.map((item) => (
                  <li key={item.id} data-row className="w-full">
                    {item.id === 'addresses' ? (
                      <button
                        type="button"
                        onClick={() => setView('addresses')}
                        className="flex w-full min-h-11 items-center justify-center text-center text-[13px] leading-none transition-colors duration-150 focus-visible:outline-none md:text-[15px] lg:min-h-14 lg:text-[18px] xl:min-h-16 xl:text-[20px] text-white/80 hover:text-glow focus-visible:text-glow"
                      >
                        {item.label}
                      </button>
                    ) : item.id === 'groups' ? (
                      <button
                        type="button"
                        onClick={handleGroupsClick}
                        className="flex w-full min-h-11 items-center justify-center text-center text-[13px] leading-none transition-colors duration-150 focus-visible:outline-none md:text-[15px] lg:min-h-14 lg:text-[18px] xl:min-h-16 xl:text-[20px] text-white/80 hover:text-glow focus-visible:text-glow"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex min-h-11 items-center justify-center text-center text-[13px] leading-none transition-colors duration-150 focus-visible:outline-none md:text-[15px] lg:min-h-14 lg:text-[18px] xl:min-h-16 xl:text-[20px] ${
                          item.primary
                            ? 'text-white hover:text-glow focus-visible:text-glow'
                            : 'text-white/80 hover:text-glow focus-visible:text-glow'
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
                        className="flex min-h-11 items-center justify-center gap-1.5 text-center text-[13px] leading-none transition-colors duration-150 focus-visible:outline-none md:text-[15px] lg:min-h-14 lg:text-[18px] xl:min-h-16 xl:text-[20px] text-white/80 hover:text-glow focus-visible:text-glow"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="size-3.5 lg:size-4 xl:size-5 opacity-70" />
                      </a>
                    </li>
                  ))}
                  <li data-row className="w-full">
                    <button
                      type="button"
                      onClick={() => setView('main')}
                      className="flex w-full min-h-11 items-center justify-center text-center text-[10px] uppercase tracking-[0.2em] text-white/45 hover:text-glow focus-visible:text-glow transition-colors duration-150 focus-visible:outline-none md:text-[11px] lg:min-h-14 lg:text-[14px] xl:min-h-16 xl:text-[16px]"
                    >
                      Voltar
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div data-row className="relative z-10 mt-3 flex items-center gap-1 md:mt-4 lg:mt-6 xl:mt-8">
            {SOCIALS.map((s) => {
              const Icon = socialIcon[s.id]
              return (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid size-11 lg:size-14 xl:size-16 place-items-center rounded-full text-white transition-colors duration-150 hover:text-glow focus-visible:text-glow focus-visible:outline-none"
                >
                  <Icon className="size-4.25 lg:size-6 xl:size-7" />
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
            className="relative z-10 mt-3 md:mt-4 lg:mt-6 xl:mt-8 group grid size-11 lg:size-14 xl:size-16 place-items-center rounded-full focus-visible:outline-none"
          >
            <span className="grid size-8 lg:size-10 xl:size-12 place-items-center rounded-full border border-white/10 text-white/80 transition-colors duration-150 group-hover:border-glow/40 group-hover:text-glow group-focus-visible:border-glow/40 group-focus-visible:text-glow md:size-9">
              <ArrowUp className="size-3 md:size-4 lg:size-5" />
            </span>
          </button>
        </BorderGlow>
      )}
    </div>
  )
})
export default Capsule
