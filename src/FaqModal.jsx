import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { FAQ } from './content'
import { X, Plus, Minus } from 'lucide-react'

function FaqItem({ item, isOpen, onClick }) {
  const contentRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      gsap.to(contentRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.4,
        ease: 'power3.out'
      })
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power3.inOut'
      })
    }
  }, [isOpen])

  return (
    <div className="border-b border-black/10 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left focus:outline-none group"
      >
        <span className="text-[15px] font-medium text-gray-900 group-hover:text-black transition-colors pr-6">
          {item.question}
        </span>
        <span className="text-gray-500 group-hover:text-gray-800 transition-colors shrink-0">
          {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </button>
      <div 
        ref={contentRef} 
        className="h-0 opacity-0 overflow-hidden"
      >
        <div className="p-6 text-[14px] leading-relaxed text-gray-800 bg-transparent">
          <div dangerouslySetInnerHTML={{ __html: item.answer }} />
        </div>
      </div>
    </div>
  )
}

export default function FaqModal({ onClose }) {
  const overlayRef = useRef(null)
  const modalRef = useRef(null)
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const ctx = gsap.context(() => {
      // Fade in the background overlay
      gsap.from(overlayRef.current, { 
        opacity: 0, 
        duration: 0.4, 
        ease: 'power3.out' 
      })

      // Scale and fade in the modal box
      gsap.from(modalRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: 'power3.out',
        delay: 0.1
      })
    })

    return () => {
      document.body.style.overflow = ''
      ctx.revert()
    }
  }, [])

  const handleClose = useCallback(() => {
    const ctx = gsap.context(() => {
      gsap.to(modalRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 10,
        duration: 0.3,
        ease: 'power3.in'
      })
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in',
        delay: 0.1,
        onComplete: onClose
      })
    })
  }, [onClose])

  useEffect(() => {
    const initialScrollY = window.scrollY
    
    const handleScroll = () => {
      // Se a página de fundo rolar mais de 10px, fecha a modal
      if (Math.abs(window.scrollY - initialScrollY) > 10) {
        handleClose()
      }
    }
    
    // Pequeno delay para não capturar a inércia do scroll no momento de abertura
    const timer = setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }, 100)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleClose])

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div 
      ref={overlayRef} 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/30"
      style={{ fontFamily: 'var(--font-display)' }}
    >
      {/* Clicar fora fecha */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div 
        ref={modalRef}
        className="relative w-full max-w-95 bg-white/40 rounded-3xl overflow-hidden flex flex-col max-h-105 mb-16"
        style={{
          backdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
          WebkitBackdropFilter: "blur(40px) saturate(180%) brightness(1.1)",
          boxShadow: `
            inset 0 0 0 1px color-mix(in srgb, white 15%, transparent),
            inset 0px 3px 0px -2px color-mix(in srgb, white 40%, transparent),
            inset 0px -2px 0px -2px color-mix(in srgb, white 30%, transparent),
            inset 0px -8px 1px -6px color-mix(in srgb, white 20%, transparent),
            inset 0px -1px 4px 0px color-mix(in srgb, black 12%, transparent),
            inset 0px 2.5px 0px -2px color-mix(in srgb, black 20%, transparent),
            0px 10px 30px -5px color-mix(in srgb, black 40%, transparent),
            0px 30px 60px -10px color-mix(in srgb, black 50%, transparent)
          `
        }}
      >

        {/* Header */}
        <div className="relative z-10 p-5 md:p-6 border-b border-black/10 text-center shrink-0">
          <div className="max-w-md mx-auto">
            <span className="text-[11px] font-medium tracking-[0.2em] text-gray-600 uppercase mb-2 block">
              Informações
            </span>
            <h2 className="text-2xl font-light text-gray-900 tracking-wide mb-3">
              Perguntas Frequentes
            </h2>
            <p className="text-[13px] leading-relaxed text-gray-700 max-w-sm mx-auto">
              Tudo o que você precisa saber sobre o atendimento.
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div 
          className="relative z-10 p-5 md:p-6 overflow-y-auto font-['Inter']"
          data-lenis-prevent="true"
        >
          <div className="space-y-8">
            {/* Primeiro bloco: 3 perguntas */}
            <div className="space-y-1">
              {FAQ.slice(0, 3).map((item, index) => (
                <FaqItem 
                  key={index} 
                  item={item} 
                  isOpen={openIndex === index}
                  onClick={() => toggleItem(index)}
                />
              ))}
            </div>

            {/* Segundo bloco: 3 perguntas */}
            <div className="space-y-1 pt-2">
              {FAQ.slice(3, 6).map((item, index) => {
                const actualIndex = index + 3;
                return (
                  <FaqItem 
                    key={actualIndex} 
                    item={item} 
                    isOpen={openIndex === actualIndex}
                    onClick={() => toggleItem(actualIndex)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
