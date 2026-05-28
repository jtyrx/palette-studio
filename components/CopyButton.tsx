'use client'

import React, { FC, useEffect, useState } from 'react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'

type CopyButtonProps = {
  getContent: () => string
} & ComponentProps<'button'>

export const CopyButton: FC<CopyButtonProps> = ({
  getContent,
  children,
  ...rest
}) => {
  const [copied, setCopied] = useState(false)

  const onCopy = () => {
    const content = getContent()
    void navigator.clipboard.writeText(content)
    setCopied(true)
  }

  useEffect(() => {
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <Button {...rest} onClick={onCopy}>
      {copied ? 'Copied!' : children}
    </Button>
  )
}
