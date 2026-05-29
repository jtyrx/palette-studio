import localFont from 'next/font/local'

/** Inter Variable (v4.1) — https://rsms.me/inter/ */
export const fontSans = localFont({
  src: [
    {
      path: './fonts/InterVariable.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: './fonts/InterVariable-Italic.woff2',
      weight: '100 900',
      style: 'italic',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
  declarations: [
    {
      prop: 'font-feature-settings',
      value: "'liga' 1, 'calt' 1",
    },
  ],
})
