import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Language, useTranslation } from '../i18n/LanguageContext';

interface LanguageToggleProps {
  variant?: 'dark' | 'light';
}

export function LanguageToggle({ variant = 'light' }: LanguageToggleProps) {
  const { language, setLanguage, t } = useTranslation();
  const isDark = variant === 'dark';

  return (
    <ToggleButtonGroup
      value={language}
      exclusive
      size="small"
      aria-label={t.language.label}
      onChange={(_event, next: Language | null) => {
        if (next) {
          setLanguage(next);
        }
      }}
      sx={{
        '& .MuiToggleButton-root': {
          px: 1,
          py: 0.25,
          fontWeight: 600,
          fontSize: '0.75rem',
          color: isDark ? '#94a3b8' : undefined,
          borderColor: isDark ? '#334155' : undefined,
        },
        '& .MuiToggleButton-root.Mui-selected': isDark
          ? { color: '#60a5fa', bgcolor: '#1e293b', '&:hover': { bgcolor: '#1e293b' } }
          : {},
      }}
    >
      <ToggleButton value="en" aria-label={t.language.en}>
        EN
      </ToggleButton>
      <ToggleButton value="pl" aria-label={t.language.pl}>
        PL
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
