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
    // Always default to light theme
    // Remove any existing dark theme preference from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme === THEME_DARK) {
      localStorage.removeItem(THEME_STORAGE_KEY)
    }
    setTheme(THEME_LIGHT)
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

