'use client'

import type { HTMLAttributes } from 'react'
import { FC } from 'react'
import { CSSExportButton, TokenExportButton } from './ExportButtons'

export const Help: FC = () => (
  <div className="mt-24">
    <ExportsSection />
    <HotkeysSection />
    <CreditsSection />
  </div>
)

const ExportsSection: FC = () => (
  <section className="mb-24 text-base">
    <h3 className="text-base font-bold">Exports</h3>

    <p className="mt-12 max-w-[60ch]">
      <strong>Figma.</strong> Install{' '}
      <a
        className="text-inherit underline decoration-(--color-text-secondary) hover:text-(--color-text-primary) hover:no-underline"
        href="https://www.figma.com/community/plugin/843461159747178978/Figma-Tokens"
      >
        Figma Tokens
      </a>
      . Run the plugin and open JSON tab. Copy tokens and paste there.
    </p>
    <p className="mt-12 max-w-[60ch]">
      <TokenExportButton />
    </p>
    <p className="mt-12 max-w-[60ch]">
      <CSSExportButton />
    </p>
  </section>
)

function metaKeyLabel() {
  if (typeof navigator === 'undefined') return '⌘'
  return navigator.platform.toUpperCase().includes('WIN') ? 'Ctrl' : '⌘'
}

const HotkeysSection = () => {
  return (
    <section className="mb-24 text-base">
      <h3 className="text-base font-bold">Hotkeys</h3>
      <ul className="pl-0 [&>li]:mt-12 [&>li:first-child]:mt-0" role="list">
        <li>
          <Key>1</Key> - <Key>9</Key> — switch palette
        </li>
        <li>
          <Key>↑</Key> <Key>↓</Key> <Key>→</Key> <Key>←</Key> — select another
          color
        </li>
        <li>
          <Key>{metaKeyLabel()}</Key> + <Key>↑</Key> <Key>↓</Key> <Key>→</Key>{' '}
          <Key>←</Key> — move rows and columns
        </li>
        <li>
          <Key>{metaKeyLabel()}</Key> + <Key>⇧</Key> + <Key>↑</Key> <Key>↓</Key>{' '}
          <Key>→</Key> <Key>←</Key> — duplicate rows and columns
        </li>
        <li>
          <Key>L</Key> + <Key>↑</Key> <Key>↓</Key> — change lightness of
          selected color
        </li>
        <li>
          <Key>C</Key> + <Key>↑</Key> <Key>↓</Key> — change chroma of selected
          color
        </li>
        <li>
          <Key>H</Key> + <Key>↑</Key> <Key>↓</Key> — change hue of selected
          color
        </li>
        <li>
          <Key>{metaKeyLabel()}</Key> + <Key>C</Key> — copy selected color as hex.
        </li>
        <li>
          <Key>{metaKeyLabel()}</Key> + <Key>⇧</Key> + <Key>C</Key> — copy selected color in{' '}
          <code className="rounded-(--radius-m) border border-(--color-border-subtle) px-0.75 font-mono">
            lch()
          </code>{' '}
          format. Note that it has limited{' '}
          <a
            className="text-inherit underline decoration-(--color-text-secondary) hover:text-(--color-text-primary) hover:no-underline"
            href="https://caniuse.com/css-lch-lab"
          >
            browser support
          </a>
          .
        </li>
        <li>
          <Key>{metaKeyLabel()}</Key> + <Key>V</Key> — paste color. Just copy color in any
          format and paste it here.
        </li>
        <li>
          Hold <Key>B</Key> — preview palette in greys.
        </li>
      </ul>
    </section>
  )
}

const CreditsSection = () => (
  <section className="mb-24 text-base">
    <h3 className="text-base font-bold">Credits</h3>
    <p className="mt-12 max-w-[60ch]">
      Palette Studio is based on{' '}
      <a
        className="text-inherit underline decoration-(--color-text-secondary) hover:text-(--color-text-primary) hover:no-underline"
        href="https://github.com/ardov/huetone"
      >
        Huetone
      </a>{' '}
      by{' '}
      <a
        className="text-inherit underline decoration-(--color-text-secondary) hover:text-(--color-text-primary) hover:no-underline"
        href="https://ardov.me"
      >
        Alexey Ardov
      </a>{' '}
      (MIT).
    </p>
    <p className="mt-12 max-w-[60ch]">
      The original app is heavily inspired by{' '}
      <a
        className="text-inherit underline decoration-(--color-text-secondary) hover:text-(--color-text-primary) hover:no-underline"
        href="https://stripe.com/blog/accessible-color-systems"
      >
        that Stripe article
      </a>
      . And it uses the great{' '}
      <a
        className="text-inherit underline decoration-(--color-text-secondary) hover:text-(--color-text-primary) hover:no-underline"
        href="https://github.com/gka/chroma.js"
      >
        chroma.js
      </a>{' '}
      library under the hood.
    </p>
    <p className="mt-12 max-w-[60ch]">
      Special thanks for{' '}
      <a
        className="text-inherit underline decoration-(--color-text-secondary) hover:text-(--color-text-primary) hover:no-underline"
        href="https://twitter.com/LeaVerou"
      >
        Lea Verou
      </a>
      ,{' '}
      <a
        className="text-inherit underline decoration-(--color-text-secondary) hover:text-(--color-text-primary) hover:no-underline"
        href="https://twitter.com/svgeesus"
      >
        Chris Lilley
      </a>{' '}
      and the CSS working group for providing all the essential code for color
      conversions.
    </p>
    <p className="mt-12 max-w-[60ch]">
      Accessible Perceptual Contrast Algorithm (APCA) by Andrew Somers is a
      WCAG 3 working draft and may change later. To learn more visit{' '}
      <a
        className="text-inherit underline decoration-(--color-text-secondary) hover:text-(--color-text-primary) hover:no-underline"
        href="https://www.w3.org/WAI/GL/task-forces/silver/wiki/Visual_Contrast_of_Text_Subgroup"
      >
        this page
      </a>{' '}
      or check{' '}
      <a
        className="text-inherit underline decoration-(--color-text-secondary) hover:text-(--color-text-primary) hover:no-underline"
        href="https://github.com/w3c/wcag/issues/695"
      >
        this thread on GitHub
      </a>
      .
    </p>
  </section>
)

const Key = ({
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className="inline-block min-w-28 rounded border border-(--color-border-subtle) bg-(--color-interactive-bg) px-4 text-center"
    {...props}
  >
    {children}
  </span>
)
