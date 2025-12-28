import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type MouseEventHandler,
  type UIEvent,
} from 'react'
import { motion, useInView } from 'motion/react'
import { cn } from '@/lib/utils'

interface AnimatedItemProps {
  children: ReactNode
  delay?: number
  index: number
  onMouseEnter?: MouseEventHandler<HTMLDivElement>
  onClick?: MouseEventHandler<HTMLDivElement>
}

export const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.5, once: false })

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.8, opacity: 0, y: 15 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0, y: 15 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay,
      }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

export interface AnimatedListItem {
  id: string
  content: ReactNode
}

interface AnimatedListProps {
  /** Array of items to display - can be strings or objects with id and content */
  items: (string | AnimatedListItem)[]
  /** Callback when an item is selected */
  onItemSelect?: (item: string | AnimatedListItem, index: number) => void
  /** Show gradient overlays at top/bottom when scrollable */
  showGradients?: boolean
  /** Enable keyboard navigation (arrow keys, tab, enter) */
  enableArrowNavigation?: boolean
  /** Additional class for the container */
  className?: string
  /** Additional class for each item wrapper */
  itemClassName?: string
  /** Show custom scrollbar */
  displayScrollbar?: boolean
  /** Initial selected index (-1 for none) */
  initialSelectedIndex?: number
  /** Custom render function for items */
  renderItem?: (
    item: string | AnimatedListItem,
    index: number,
    isSelected: boolean
  ) => ReactNode
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  items = [],
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  renderItem,
}) => {
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex)
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false)
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0)
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1)

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index)
    setKeyboardNav(false)
  }, [])

  const handleItemClick = useCallback(
    (item: string | AnimatedListItem, index: number) => {
      setSelectedIndex(index)
      onItemSelect?.(item, index)
    },
    [onItemSelect]
  )

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement
    setTopGradientOpacity(Math.min(scrollTop / 50, 1))
    const bottomDistance = scrollHeight - (scrollTop + clientHeight)
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
    )
  }

  // Keyboard navigation
  useEffect(() => {
    if (!enableArrowNavigation) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault()
        setKeyboardNav(true)
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault()
          onItemSelect?.(items[selectedIndex], selectedIndex)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation])

  // Scroll selected item into view
  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return

    const container = listRef.current
    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement | null

    if (selectedItem) {
      const extraMargin = 50
      const containerScrollTop = container.scrollTop
      const containerHeight = container.clientHeight
      const itemTop = selectedItem.offsetTop
      const itemBottom = itemTop + selectedItem.offsetHeight

      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' })
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth',
        })
      }
    }
    setKeyboardNav(false)
  }, [selectedIndex, keyboardNav])

  // Check initial scroll state
  useEffect(() => {
    if (!listRef.current) return
    const { scrollHeight, clientHeight } = listRef.current
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : 1)
  }, [items])

  const getItemContent = (item: string | AnimatedListItem): ReactNode => {
    if (typeof item === 'string') return item
    return item.content
  }

  const getItemId = (item: string | AnimatedListItem, index: number): string => {
    if (typeof item === 'string') return `item-${index}`
    return item.id
  }

  const defaultRenderItem = (
    item: string | AnimatedListItem,
    index: number,
    isSelected: boolean
  ) => (
    <div
      className={cn(
        'px-3 py-2 rounded-md transition-colors',
        'border border-transparent',
        isSelected
          ? 'bg-accent text-accent-foreground border-border'
          : 'hover:bg-muted',
        itemClassName
      )}
    >
      {typeof item === 'string' ? (
        <p className="m-0 text-sm">{item}</p>
      ) : (
        item.content
      )}
    </div>
  )

  return (
    <div className={cn('relative w-full', className)}>
      <div
        ref={listRef}
        className={cn(
          'max-h-[400px] overflow-y-auto p-2 space-y-1',
          displayScrollbar
            ? '[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full'
            : 'scrollbar-hide'
        )}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          scrollbarColor: 'var(--border) transparent',
        }}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={getItemId(item, index)}
            delay={0.05}
            index={index}
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
          >
            {renderItem
              ? renderItem(item, index, selectedIndex === index)
              : defaultRenderItem(item, index, selectedIndex === index)}
          </AnimatedItem>
        ))}
      </div>

      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  )
}

export default AnimatedList
