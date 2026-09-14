import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { setAccessToken } from './AuthProvider';

export function OidcCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      setError('No authorization code received');
      return;
    }

    // Token exchange would happen here with a real OIDC provider
    // For now, this is a placeholder for when OIDC is configured
    setError('OIDC token exchange not yet implemented. Use dev mode for development.');

    // When implemented, the flow would be:
    // 1. Exchange code for tokens at the IdentityServer token endpoint
    // 2. Call setAccessToken(accessToken)
    // 3. Navigate to '/'
    void navigate;
  }, [navigate]);

  if (error) {
    return (
      <Box sx={{ mt: 12, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 12, textAlign: 'center' }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Completing authentication...</Typography>
    </Box>
  );
}

// Suppress unused import warning - setAccessToken will be used when OIDC exchange is implemented
void setAccessToken;
