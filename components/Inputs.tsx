import * as React from 'react'

/** Shared surface for native `<select>` controls (not the shadcn/base-ui Button). */
const controlSurfaceClass =
  'inline-flex cursor-pointer items-center justify-center gap-8 rounded-(--radius-m) border-0 bg-(--color-interactive-bg) px-8 py-6 text-sm leading-5 text-(--color-text-secondary) transition-[color,background-color,transform] duration-100 ease-out hover:bg-(--color-interactive-bg-hover) hover:text-(--color-text-primary) active:translate-y-px active:bg-(--color-interactive-bg-active) focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[3px] focus-visible:outline-(--color-text-primary)'

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={[
        controlSurfaceClass,
        'active:translate-y-0 [&>option]:bg-(--color-surface-card) [&>option]:text-(--color-text-primary)',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
})

const invisibleInputClass =
  'border-0 bg-transparent p-0 text-(--color-text-secondary) transition-colors duration-100 hover:text-(--color-text-primary) focus:text-(--color-text-primary) focus:outline-none'

export const InvisibleInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function InvisibleInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={[invisibleInputClass, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
})

const inputClass =
  'rounded-(--radius-m) border border-transparent bg-(--color-interactive-bg) px-8 py-[0.3125rem] text-sm leading-5 text-(--color-text-primary) transition-[border-color,color] duration-100 focus:border-(--color-text-primary) focus:text-(--color-text-primary) focus:outline-none'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={[inputClass, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
})

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={[inputClass, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
})

export function ControlGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'flex gap-px [&>*]:rounded-none',
        '[&>*:first-child]:rounded-l-(--radius-m) [&>*:first-child]:rounded-tl-(--radius-m) [&>*:first-child]:rounded-bl-(--radius-m)',
        '[&>*:last-child]:rounded-r-(--radius-m) [&>*:last-child]:rounded-tr-(--radius-m) [&>*:last-child]:rounded-br-(--radius-m)',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
