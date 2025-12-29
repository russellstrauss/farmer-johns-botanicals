import { ref } from 'vue'

const THEME_STORAGE_KEY = 'fjb-theme'
const THEME_LIGHT = 'light'
const THEME_DARK = 'dark'

const currentTheme = ref(THEME_LIGHT)

export function useTheme() {
  const setTheme = (theme) => {
    if (theme !== THEME_LIGHT && theme !== THEME_DARK) {
      console.warn(`Invalid theme: ${theme}. Using default: ${THEME_LIGHT}`)
      theme = THEME_LIGHT
    }
    
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }

  const toggleTheme = () => {
    const newTheme = currentTheme.value === THEME_LIGHT ? THEME_DARK : THEME_LIGHT
    setTheme(newTheme)
  }

  const initTheme = () => {
    // Check localStorage first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    
    if (savedTheme && (savedTheme === THEME_LIGHT || savedTheme === THEME_DARK)) {
      setTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const systemTheme = prefersDark ? THEME_DARK : THEME_LIGHT
      setTheme(systemTheme)
    }
    
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          setTheme(e.matches ? THEME_DARK : THEME_LIGHT)
        }
      })
    }
  }

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    initTheme,
    THEME_LIGHT,
    THEME_DARK
  }
}

