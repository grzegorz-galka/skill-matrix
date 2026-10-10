import { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Tooltip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../auth/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { LanguageToggle } from '../LanguageToggle';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigationItems = [
    { label: t.nav.employees, path: '/employees' },
    { label: t.nav.skillProfiles, path: '/skill-profiles' },
    { label: t.nav.skills, path: '/skills' },
    { label: t.nav.employeeSkills, path: '/employee-skills' },
    { label: t.nav.skillsMatrix, path: '/skills-matrix' },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ bgcolor: '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
        <Toolbar sx={{ py: 0.5 }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label={t.nav.menu}
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: isMobile ? 1 : 0,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 32, color: '#60a5fa' }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5rem',
              }}
            >
              {t.common.appTitle}
            </Typography>
          </Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 3, ml: 6 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: '#cbd5e1',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      color: 'white',
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {!isMobile && (
            <Box sx={{ mr: user ? 2 : 0 }}>
              <LanguageToggle variant="dark" />
            </Box>
          )}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {!isMobile && (
                <Box sx={{ textAlign: 'right', lineHeight: 1.2 }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    {user.email}
                  </Typography>
                </Box>
              )}
              <Chip
                label={t.roles[user.role as keyof typeof t.roles] ?? user.role}
                size="small"
                sx={{ bgcolor: '#1e293b', color: '#60a5fa', fontWeight: 600 }}
              />
              <Tooltip title={t.nav.signOut}>
                <IconButton aria-label={t.nav.signOut} onClick={logout} sx={{ color: '#cbd5e1' }}>
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={isMobile && drawerOpen} onClose={handleDrawerClose}>
        <Box sx={{ width: 250 }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={handleDrawerClose}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Box sx={{ px: 2, py: 1 }}>
            <LanguageToggle />
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#0f172a',
          py: 4,
          textAlign: 'center',
          mt: 'auto',
        }}
      >
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          {t.nav.footer}
        </Typography>
      </Box>
    </Box>
  );
}
