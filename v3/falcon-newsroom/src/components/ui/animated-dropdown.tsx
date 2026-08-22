'use client'

import React from 'react'

/**
 * @author: @emerald-ui
 * @description: Animated Dropdown Component with smooth transitions and click-outside behavior
 * @version: 1.0.0
 * @date: 2026-02-03
 * @license: MIT
 * @website: https://emerald-ui.com
 */
import { useState, useRef, FC, ReactNode, useId } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
function cn(...inputs: any[]) { return twMerge(clsx(inputs)) }

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string }>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "outline" ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" :
      variant === "ghost" ? "hover:bg-accent hover:text-accent-foreground" :
      variant === "link" ? "text-primary underline-offset-4 hover:underline" :
      "bg-primary text-primary-foreground hover:bg-primary/90",
      size === "sm" ? "h-9 px-3" : size === "lg" ? "h-11 px-8" : size === "icon" ? "h-10 w-10" : "h-10 px-4 py-2",
      className
    )} {...props} />
  )
);
Button.displayName = "Button";

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) handler()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, handler])
}

interface DropdownItem {
  name: string
  link: string
  value?: string
  deletable?: boolean
}

interface AnimatedDropdownProps {
  items?: DropdownItem[]
  text?: string
  className?: string
  menuClassName?: string
  menuMaxHeight?: string
  onSelect?: (item: DropdownItem) => void
  onDelete?: (item: DropdownItem) => void
  disabled?: boolean
  ariaLabel?: string
}

const DEMO: DropdownItem[] = [
  { name: 'Documentation', link: '#' },
  { name: 'Components', link: '#' },
  { name: 'Examples', link: '#' },
  { name: 'GitHub', link: '#' },
]

export default function AnimatedDropdown({
  items = DEMO,
  text = 'Select Option',
  className,
  menuClassName,
  menuMaxHeight = 'min(18rem, calc(100dvh - 8rem))',
  onSelect,
  onDelete,
  disabled = false,
  ariaLabel = 'Select an option',
}: AnimatedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()

  const focusOption = (position: 'first' | 'last' | 'selected' = 'selected') => {
    window.requestAnimationFrame(() => {
      const options: HTMLElement[] = menuRef.current
        ? Array.from(menuRef.current.querySelectorAll('[role="option"]')) as HTMLElement[]
        : []
      if (!options.length) return
      const selectedIndex = options.findIndex((option) => option.getAttribute('aria-selected') === 'true')
      const index = position === 'first' ? 0 : position === 'last' ? options.length - 1 : Math.max(0, selectedIndex)
      options[index]?.focus()
    })
  }

  React.useEffect(() => {
    if (!isOpen) return undefined
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
      const options: HTMLElement[] = menuRef.current
        ? Array.from(menuRef.current.querySelectorAll('[role="option"]')) as HTMLElement[]
        : []
      if (!options.length) return
      event.preventDefault()
      const currentIndex = options.indexOf(document.activeElement as HTMLElement)
      const nextIndex = event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? options.length - 1
          : event.key === 'ArrowDown'
            ? (Math.max(-1, currentIndex) + 1) % options.length
            : (currentIndex <= 0 ? options.length : currentIndex) - 1
      options[nextIndex]?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  React.useEffect(() => {
    if (disabled) setIsOpen(false)
  }, [disabled])

  return (
    <OnClickOutside onClickOutside={() => setIsOpen(false)}>
      <div
        data-state={isOpen ? 'open' : 'closed'}
        className={cn('group relative block w-full', className)}
      >
        <Button
          ref={triggerRef}
          variant='outline'
          type='button'
          aria-haspopup='listbox'
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={(event) => {
            if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
            event.preventDefault()
            setIsOpen(true)
            focusOption(event.key === 'ArrowUp' ? 'last' : 'selected')
          }}
          className='h-11 w-full justify-between gap-2 rounded-xl border-white/[0.08] bg-white/[0.035] px-3 text-zinc-200 hover:bg-white/[0.06] hover:text-zinc-50 focus-visible:ring-white/20 focus-visible:ring-offset-0'
        >
          <span className='truncate'>{text}</span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ChevronDown className='h-4 w-4 text-zinc-500' />
          </motion.div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              id={listboxId}
              role='listbox'
              aria-label={ariaLabel}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
              className={cn(
                'absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 w-full origin-top',
                'max-h-[18rem] overflow-x-hidden overflow-y-auto overscroll-contain rounded-xl',
                'border border-white/[0.08] bg-zinc-950',
                'shadow-2xl shadow-black/40',
                menuClassName
              )}
              style={{ maxHeight: menuMaxHeight }}
            >
              <motion.div
                className='flex flex-col'
                initial='hidden'
                animate='visible'
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.03,
                    },
                  },
                }}
              >
                {items.map((item, index) => {
                  const showDelete = Boolean(onDelete && item.deletable !== false)
                  const itemClassName = cn(
                    'border-b border-white/[0.06] last:border-b-0',
                    'bg-zinc-950 transition-colors duration-150',
                    'text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-50'
                  )
                  if (!showDelete) {
                    return (
                      <motion.button
                        key={item.value || `${item.name}-${index}`}
                        type='button'
                        role='option'
                        aria-selected={item.name === text}
                        onClick={() => {
                          onSelect?.(item)
                          setIsOpen(false)
                        }}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0 },
                        }}
                        className={cn('block w-full truncate px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20', itemClassName)}
                      >
                        {item.name}
                      </motion.button>
                    )
                  }
                  return (
                    <motion.div
                      key={item.value || `${item.name}-${index}`}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      className={cn('flex min-w-0 items-center', itemClassName)}
                    >
                      <button
                        type='button'
                        role='option'
                        aria-selected={item.name === text}
                        onClick={() => {
                          onSelect?.(item)
                          setIsOpen(false)
                        }}
                        className='min-w-0 flex-1 truncate px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/20'
                      >
                        {item.name}
                      </button>
                      <button
                        type='button'
                        aria-label={`Delete ${item.name}`}
                        title={`Delete ${item.name}`}
                        onClick={(event) => {
                          event.preventDefault()
                          event.stopPropagation()
                          onDelete?.(item)
                        }}
                        className='mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-rose-400/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40'
                      >
                        <X aria-hidden='true' className='h-3.5 w-3.5' />
                      </button>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnClickOutside>
  )
}

interface Props {
  children: ReactNode
  onClickOutside: () => void
  classes?: string
}

const OnClickOutside: FC<Props> = ({ children, onClickOutside, classes }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useClickOutside(wrapperRef, onClickOutside)

  return (
    <div ref={wrapperRef} className={cn(classes)}>
      {children}
    </div>
  )
}
