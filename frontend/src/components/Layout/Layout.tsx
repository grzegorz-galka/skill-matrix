import { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
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

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigationItems = [
    { label: 'Employees', path: '/employees' },
    { label: 'Job Profiles', path: '/job-profiles' },
    { label: 'Skills', path: '/skills' },
    { label: 'Employee Skills', path: '/employee-skills' },
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
              aria-label="menu"
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
              Skills Matrix
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
          Employee Skills Management System
        </Typography>
      </Box>
    </Box>
  );
}
