import * as React from 'react'

import {cn} from '@/lib/utils'

function Kbd({className, ...props}: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-20 w-fit min-w-20 items-center justify-center gap-4 rounded-sm bg-muted px-4 font-sans text-xs font-medium text-muted-foreground select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-12",
        className,
      )}
      {...props}
    />
  )
}

Kbd.displayName = 'Kbd'

function KbdGroup({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-4', className)}
      {...props}
    />
  )
}

KbdGroup.displayName = 'KbdGroup'

export {Kbd, KbdGroup}
