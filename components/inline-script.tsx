/**
 * Next.js soft-navigation safe inline script (see preventing-flash-before-hydration guide).
 * Server: executes during HTML parse. Client navigations: text/plain is ignored; client code applies theme.
 */
export function InlineScript({
  html,
  nonce,
}: {
  html: string
  nonce?: string
}) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

InlineScript.displayName = 'InlineScript'
