import * as React from 'react'

/** Shared primary control surface (buttons, icon links). */
export const buttonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-m)] border-0 bg-[var(--color-interactive-bg)] px-2 py-1.5 text-sm leading-5 text-[var(--color-text-secondary)] transition-[color,background-color,transform] duration-100 ease-out hover:bg-[var(--color-interactive-bg-hover)] hover:text-[var(--color-text-primary)] active:translate-y-px active:bg-[var(--color-interactive-bg-active)] focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--color-text-primary)]'

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function Button({ className, type = 'button', ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={[buttonClass, className].filter(Boolean).join(' ')}
      {...props}
    />
  )
})

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={[
        buttonClass,
        'active:translate-y-0 [&>option]:bg-[var(--color-surface-card)] [&>option]:text-[var(--color-text-primary)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
})

const invisibleInputClass =
  'border-0 bg-transparent p-0 text-[var(--color-text-secondary)] transition-colors duration-100 hover:text-[var(--color-text-primary)] focus:text-[var(--color-text-primary)] focus:outline-none'

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
  'rounded-[var(--radius-m)] border border-transparent bg-[var(--color-interactive-bg)] px-2 py-[0.3125rem] text-sm leading-5 text-[var(--color-text-primary)] transition-[border-color,color] duration-100 focus:border-[var(--color-text-primary)] focus:text-[var(--color-text-primary)] focus:outline-none'

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
        '[&>*:first-child]:rounded-l-[var(--radius-m)] [&>*:first-child]:rounded-tl-[var(--radius-m)] [&>*:first-child]:rounded-bl-[var(--radius-m)]',
        '[&>*:last-child]:rounded-r-[var(--radius-m)] [&>*:last-child]:rounded-tr-[var(--radius-m)] [&>*:last-child]:rounded-br-[var(--radius-m)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}
