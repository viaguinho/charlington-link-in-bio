export function SlotNavLink({ children, href, onClick, className = '' }) {
  const Tag = onClick ? 'button' : 'a'
  
  return (
    <Tag
      href={href}
      onClick={onClick}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      className={`group relative inline-flex items-center justify-center overflow-hidden ${className}`}
    >
      <span className="inline-flex flex-col overflow-hidden h-[1.3em] leading-[1.3em]">
        <span className="block transition-transform duration-400 ease-brand group-hover:-translate-y-full">
          {children}
        </span>
        <span className="block transition-transform duration-400 ease-brand group-hover:-translate-y-full" aria-hidden="true">
          {children}
        </span>
      </span>
    </Tag>
  )
}
