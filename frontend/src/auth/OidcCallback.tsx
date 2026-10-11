import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { setAccessToken } from './tokenStore';
import { useTranslation } from '../i18n/LanguageContext';
import { Messages } from '../i18n/en';

export function OidcCallback() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [error, setError] = useState<keyof Messages['auth'] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      setError('noAuthCode');
      return;
    }

    // Token exchange would happen here with a real OIDC provider
    // For now, this is a placeholder for when OIDC is configured
    setError('oidcNotImplemented');

    // When implemented, the flow would be:
    // 1. Exchange code for tokens at the IdentityServer token endpoint
    // 2. Call setAccessToken(accessToken)
    // 3. Navigate to '/'
    void navigate;
  }, [navigate]);

  if (error) {
    return (
      <Box sx={{ mt: 12, textAlign: 'center' }}>
        <Typography color="error">{t.auth[error]}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 12, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>{t.auth.completing}</Typography>
    </Box>
  );
}

// Suppress unused import warning - setAccessToken will be used when OIDC exchange is implemented
void setAccessToken;
