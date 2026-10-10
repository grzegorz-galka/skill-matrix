import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import api from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';

interface DevLoginPageProps {
  onLogin: (token: string) => void;
}

export function DevLoginPage({ onLogin }: DevLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t } = useTranslation();
  const [error, setError] = useState<{ serverMessage?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/dev-login', { email, password });
      onLogin(response.data.accessToken);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      // Keep only the server's text so the localized part follows a language switch.
      setError({ serverMessage: axiosError.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <LanguageToggle />
          </Box>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            {t.auth.devTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {t.auth.devHint}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.serverMessage ? `${t.auth.loginFailed} (${error.serverMessage})` : t.auth.loginFailed}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t.auth.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label={t.auth.password}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? t.auth.signingIn : t.auth.signIn}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
