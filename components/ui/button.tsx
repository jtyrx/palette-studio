import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-(--radius-m) border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,transform] duration-100 ease-out outline-none select-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[3px] focus-visible:outline-(--color-text-primary) active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default:
          'bg-(--color-interactive-bg) text-(--color-text-secondary) hover:bg-(--color-interactive-bg-hover) hover:text-(--color-text-primary) active:bg-(--color-interactive-bg-active)',
        outline:
          'border-border bg-background text-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-auto px-2 py-1.5 leading-5',
        xs: 'h-6 gap-1 rounded-[min(var(--radius-md),0.625rem)] px-2 text-xs [&_svg:not([class*="size-"])]:size-3',
        sm: 'h-7 gap-1 rounded-[min(var(--radius-md),0.75rem)] px-2.5 text-[0.8rem] [&_svg:not([class*="size-"])]:size-3.5',
        lg: 'h-9 gap-1.5 px-2.5',
        icon: 'size-8 p-0',
        'icon-xs':
          'size-6 rounded-[min(var(--radius-md),0.625rem)] p-0 [&_svg:not([class*="size-"])]:size-3',
        'icon-sm':
          'size-7 rounded-[min(var(--radius-md),0.75rem)] p-0',
        'icon-lg': 'size-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
