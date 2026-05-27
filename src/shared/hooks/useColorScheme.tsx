import React, {
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
  FC,
} from 'react'

type ColorScheme = 'light' | 'dark'
const KEY = 'colorScheme'

const SchemeContext = createContext<[ColorScheme, () => void]>([
  'dark',
  () => {},
])

export const ColorSchemeProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scheme, setScheme] = useState<ColorScheme>('dark')

  useEffect(() => {
    setScheme(getCurrent())
  }, [])

  const toggle = useCallback(() => {
    const current = getCurrent()
    const systemPreference = getSystemPreference()
    if (current === systemPreference) {
      localStorage.setItem(KEY, current === 'light' ? 'dark' : 'light')
    } else {
      localStorage.removeItem(KEY)
    }
    setScheme(getCurrent())
  }, [])

  // Add handler to update on local value change
  useEffect(() => {
    const updateValue = (e: StorageEvent) => {
      if (e.key === KEY) setScheme(getCurrent())
    }
    window.addEventListener('storage', updateValue)
    return () => window.removeEventListener('storage', updateValue)
  }, [])

  // Add handler to update on prefers-color-scheme change
  useEffect(() => {
    const updateValue = () => setScheme(getCurrent())
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', updateValue)
    return () =>
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', updateValue)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', scheme)
  }, [scheme])

  return (
    <SchemeContext.Provider value={[scheme, toggle]}>
      {children}
    </SchemeContext.Provider>
  )
}

export const useColorScheme = () => useContext(SchemeContext)

function getCurrent(): ColorScheme {
  return getLocalPreference() || getSystemPreference()
}

function getSystemPreference(): ColorScheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getLocalPreference(): ColorScheme | null {
  if (typeof localStorage === 'undefined') return null
  const localPreference = localStorage.getItem(KEY)
  if (localPreference === 'light' || localPreference === 'dark') {
    return localPreference
  }
  return null
}
