import {
  buildThemeInitScript,
  themeProviderPropsToScriptConfig,
} from '@/lib/theme/script'
import type { ThemeScriptProps } from '@/lib/theme/types'

export function ThemeScript(props: ThemeScriptProps) {
  const { nonce, ...providerProps } = props
  const script = buildThemeInitScript(themeProviderPropsToScriptConfig(providerProps))

  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}
