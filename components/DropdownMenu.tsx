'use client'

import type { ComponentProps, ReactElement, ReactNode } from 'react'
import {
  DropdownMenu as Root,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export { Root }

export function Group(props: ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup {...props} />
}

export function Trigger({
  children,
  ...props
}: Omit<ComponentProps<typeof DropdownMenuTrigger>, 'render'> & {
  children: ReactElement
}) {
  return <DropdownMenuTrigger render={children} {...props} />
}

/** @deprecated Portal is built into DropdownMenuContent */
export function Portal({ children }: { children: ReactNode }) {
  return children
}

export function Label({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuLabel>) {
  return (
    <DropdownMenuLabel
      className={cn(
        'px-1.5 py-1.5 text-sm font-bold leading-5 text-[var(--color-text-primary)]',
        className
      )}
      {...props}
    />
  )
}

type ItemProps = ComponentProps<typeof DropdownMenuItem> & {
  selected?: boolean
  /** @deprecated Use onClick — kept for Radix call sites */
  onSelect?: () => void
}

export function Item({
  className,
  selected,
  onSelect,
  onClick,
  ...props
}: ItemProps) {
  return (
    <DropdownMenuItem
      className={cn(
        'flex cursor-pointer justify-between gap-2 rounded-[var(--radius-m)] px-1.5 py-1.5 text-sm leading-5 text-[var(--color-text-primary)] outline-none transition-[background-color] duration-100 ease-out',
        'hover:bg-[var(--color-interactive-bg)] focus:bg-[var(--color-interactive-bg)] active:bg-[var(--color-interactive-bg-active)]',
        selected && 'bg-[var(--color-interactive-bg)]',
        className
      )}
      onClick={event => {
        onClick?.(event)
        onSelect?.()
      }}
      {...props}
    />
  )
}

export function Content({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      className={cn(
        'z-[1000] max-h-[calc(100vh-4rem)] min-w-0 w-auto rounded-[var(--radius-m)] bg-[var(--color-surface-card)] p-0.5 py-2 text-[var(--color-text-primary)] shadow-lg ring-0',
        className
      )}
      {...props}
    />
  )
}
