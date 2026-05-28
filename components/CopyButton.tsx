'use client'

import React, { FC, useEffect, useState } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'

type CopyButtonProps = {
  getContent: () => string
} & ButtonProps

export const CopyButton: FC<CopyButtonProps> = ({
  getContent,
  children,
  ...rest
}) => {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <Button
      type="button"
      {...rest}
      onClick={() => {
        void navigator.clipboard.writeText(getContent())
        setCopied(true)
      }}
    >
      {copied ? 'Copied!' : children}
    </Button>
  )
}
