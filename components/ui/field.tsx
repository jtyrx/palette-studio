'use client'

import * as React from 'react'
import {useMemo} from 'react'
import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@/lib/utils'
import {Label} from '@/components/ui/label'
import {Separator} from '@/components/ui/separator'

function FieldSet({className, ...props}: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'flex flex-col gap-16 has-[>[data-slot=checkbox-group]]:gap-12 has-[>[data-slot=radio-group]]:gap-12',
        className,
      )}
      {...props}
    />
  )
}

FieldSet.displayName = 'FieldSet'

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & {variant?: 'legend' | 'label'}) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        'mb-6 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base',
        className,
      )}
      {...props}
    />
  )
}

FieldLegend.displayName = 'FieldLegend'

function FieldGroup({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-20 data-[slot=checkbox-group]:gap-12 *:data-[slot=field-group]:gap-16',
        className,
      )}
      {...props}
    />
  )
}

FieldGroup.displayName = 'FieldGroup'

const fieldVariants = cva(
  'group/field flex w-full gap-8 data-[invalid=true]:text-destructive',
  {
    variants: {
      orientation: {
        vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
        horizontal:
          'flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
        responsive:
          'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  },
)

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({orientation}), className)}
      {...props}
    />
  )
}

Field.displayName = 'Field'

function FieldContent({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        'group/field-content flex flex-1 flex-col gap-2 leading-snug',
        className,
      )}
      {...props}
    />
  )
}

FieldContent.displayName = 'FieldContent'

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        'group/field-label peer/field-label flex w-fit gap-8 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-10 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

FieldLabel.displayName = 'FieldLabel'

function FieldTitle({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        'flex w-fit items-center gap-8 text-sm font-medium group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

FieldTitle.displayName = 'FieldTitle'

function FieldDescription({className, ...props}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-6',
        'last:mt-0 nth-last-2:-mt-4',
        '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className,
      )}
      {...props}
    />
  )
}

FieldDescription.displayName = 'FieldDescription'

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        'relative -my-8 h-20 text-sm group-data-[variant=outline]/field-group:-mb-8',
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-8 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

FieldSeparator.displayName = 'FieldSeparator'

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<{message?: string} | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-16 flex list-disc flex-col gap-4">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-sm font-normal text-destructive', className)}
      {...props}
    >
      {content}
    </div>
  )
}

FieldError.displayName = 'FieldError'

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
