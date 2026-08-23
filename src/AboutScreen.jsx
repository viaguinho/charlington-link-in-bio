import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { PlusCircle, CornerDownLeft } from 'lucide-react'
import { BIO, BIO_EN, ABOUT_TITLE, ABOUT_TITLE_EN } from './content'
import { SlotNavLink } from './components/ui/slot-nav-link'

const InstagramIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);


export default function AboutScreen({ onClose }) {
  const overlayRef = useRef(null)
  const titleRef = useRef(null)
  const imageRef = useRef(null)
  
  const [lang, setLang] = useState('pt') // 'pt' or 'en'
  const currentBio = lang === 'pt' ? BIO : BIO_EN
  const currentTitle = lang === 'pt' ? ABOUT_TITLE : ABOUT_TITLE_EN

  useEffect(() => {
    // Trava rolagem principal da página por trás
    document.body.style.overflow = 'hidden'

    const ctx = gsap.context(() => {
      // Background and overlay fade in
      gsap.from(overlayRef.current, { 
        opacity: 0, 
        duration: 0.8, 
        ease: 'power3.out' 
      })

      // Title lines reveal
      gsap.from('.about-title-line', {
        yPercent: 120,
        duration: 1.2,
        stagger: 0.1,
        ease: 'power4.out',
        delay: 0.2
      })

      // Image fade and scale (clip-path reveal)
      gsap.fromTo(imageRef.current,
        { clipPath: 'inset(10% 0% 0% 0%)', opacity: 0 },
        { 
          clipPath: 'inset(0% 0% 0% 0%)', 
          opacity: 1,
          duration: 1.5, 
          ease: 'power3.inOut', 
          delay: 0.4 
        }
      )

      // Bio text lines fade up
      gsap.from('.bio-text-block', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.6
      })

    }, overlayRef)

    return () => {
      document.body.style.overflow = ''
      ctx.revert()
    }
  }, [])

  const handleClose = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power3.inOut',
      onComplete: onClose
    })
  }

  const highlightText = (text) => {
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  }

  return (
    <div 
      ref={overlayRef} 
      data-lenis-prevent="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-black text-white overscroll-none selection:bg-white/20"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {/* Header com as mesmas informações do projeto principal e logo girando no meio */}
      <header className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-8 md:px-12 py-8 md:py-10 text-[13px] font-['Inter'] tracking-widest uppercase font-normal text-white/70">
        <nav className="flex items-center gap-6 md:gap-8">
          <SlotNavLink onClick={handleClose} className="hover:text-[#0071e3] transition-colors focus-visible:outline-none">INFOS</SlotNavLink>
          <SlotNavLink onClick={handleClose} className="hover:text-[#0071e3] transition-colors focus-visible:outline-none">SOBRE</SlotNavLink>
        </nav>
        <div className="absolute left-1/2 -translate-x-1/2 flex justify-center">
          <img src="/logo.svg" alt="Logo" className="w-6 h-6 md:w-8 md:h-8 animate-spin-y" />
        </div>
        <div className="flex items-center">
          <SlotNavLink href="https://wa.me/5519971502747" className="hover:text-[#0071e3] transition-colors focus-visible:outline-none">CONTATO</SlotNavLink>
        </div>
      </header>

      {/* Main Content Container em bloco (permite scroll natural) */}
      <div className="pt-40 md:pt-[22vh] px-8 md:px-12 pb-32 max-w-[1800px] mx-auto">
        
        {/* Massive Title exatamente como marioo.info com fonte Phudu e 120px no desktop */}
        <h1 
          ref={titleRef} 
          className="text-[14vw] md:text-[120px] leading-[0.85] tracking-tighter uppercase text-white mb-20 md:mb-32 font-['Phudu']"
        >
          {currentTitle.map((line, index) => (
            <div key={index} className="overflow-hidden pb-1 md:pb-2">
              <div className="about-title-line">{line}</div>
            </div>
          ))}
        </h1>

        {/* 2-Column Layout */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
          
          {/* Left Column: Image (Sticky) - Menor, imagem super ampliada e espelhada horizontalmente */}
          <div className="w-full md:w-[35%] md:sticky md:top-12 flex justify-end">
            <div className="relative w-full md:max-w-120 aspect-4/3 overflow-hidden bg-[#111] rounded-sm" ref={imageRef}>
              <img 
                src="/charlington.jpg" 
                alt="Dr. Charlington Cavalcante"
                className="absolute inset-0 w-full h-full object-cover grayscale" 
                style={{ transform: 'scale(-1.5, 1.5)', objectPosition: 'center 15%' }}
              />
            </div>
          </div>

          {/* Right Column: Bio Text */}
          <div className="w-full md:w-[65%] text-[#808080] max-w-2xl mt-4 md:mt-0 font-['Inter'] text-start">
            {/* Lang switcher */}
            <div className="flex gap-4 mb-8 md:mb-12 text-[11px] uppercase tracking-widest font-medium font-['Inter']">
              <button 
                onClick={() => setLang('pt')} 
                className={`transition-colors hover:text-[#0071e3] ${lang === 'pt' ? 'text-white' : 'text-[#808080]'}`}
              >
                Ler em português
              </button>
              <span className="text-[#555]">·</span>
              <button 
                onClick={() => setLang('en')} 
                className={`transition-colors hover:text-[#0071e3] ${lang === 'en' ? 'text-white' : 'text-[#808080]'}`}
              >
                English
              </button>
            </div>
            
            <div className="space-y-8 md:space-y-12 text-[15px] leading-[1.65] font-light">
              {currentBio.map((paragraph, i) => (
                <p key={i} className="bio-text-block">
                  {highlightText(paragraph)}
                </p>
              ))}
            </div>
            
            {/* End Footer */}
            <div className="bio-text-block mt-12 md:mt-16 flex flex-col gap-6">
              <div className="flex gap-8 text-[10px] uppercase tracking-widest text-[#555]">
                <a href="https://instagram.com/charlington.cavalcante" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#0071e3] transition-colors">
                  <InstagramIcon size={14} />
                  <span>Instagram</span>
                </a>
                <a href="https://www.linkedin.com/in/ch%C3%A1rlington-cavalcante-42453891" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#0071e3] transition-colors">
                  <LinkedinIcon size={14} />
                  <span>LinkedIn</span>
                </a>
                <a href="https://www.doctoralia.com.br/charlington-cavalcante/neurologista-pediatrico-pediatra-neurofisiologista/campinas" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#0071e3] transition-colors">
                  <PlusCircle size={14} />
                  <span>Doctoralia</span>
                </a>
              </div>
              
              <div className="flex mt-2">
                <button 
                  onClick={handleClose}
                  className="flex items-center gap-4 text-[24px] md:text-[33.75px] font-['Phudu'] font-normal tracking-tight text-white hover:text-[#0071e3] transition-colors focus-visible:outline-none"
                >
                  <span>{lang === 'pt' ? 'VOLTAR AO INÍCIO' : 'RETURN TO WORK'}</span>
                  <CornerDownLeft size={34} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
