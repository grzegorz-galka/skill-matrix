import React, { ReactNode, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.tsx'
import { buildTheme } from './theme/theme'
import { LanguageProvider, useTranslation } from './i18n/LanguageContext'
import './index.css'

// MUI's own component text (Autocomplete "No options" etc.) follows the active language.
function LocalizedThemeProvider({ children }: { children: ReactNode }) {
  const { language } = useTranslation()
  const theme = useMemo(() => buildTheme(language), [language])
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <LocalizedThemeProvider>
        <CssBaseline />
        <App />
      </LocalizedThemeProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
