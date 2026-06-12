import { useState } from 'react';
import { AppBar, Toolbar, Container, Button, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Dashboard as DashboardIcon, AttachMoney as DashboardCostsIcon } from '@mui/icons-material';
import Dashboard from './pages/Dashboard';
import GACosts from './pages/GACosts';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#10b981',
    },
    background: {
      default: '#f9fafb',
    },
  },
  typography: {
    fontFamily: 'Nunito, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        {/* Navigation */}
        <AppBar position="sticky">
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}>
                ₿
              </Box>
              <Box sx={{ fontSize: '1.5rem', fontWeight: 700 }}>IT Budget Tracker</Box>
            </Box>
            <Button
              color={currentPage === 'dashboard' ? 'inherit' : 'inherit'}
              onClick={() => setCurrentPage('dashboard')}
              sx={{
                fontWeight: currentPage === 'dashboard' ? 600 : 500,
                textTransform: 'none',
                fontSize: '1rem',
                mx: 1,
                pb: 0.5,
                borderBottom: currentPage === 'dashboard' ? '3px solid white' : 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              startIcon={<DashboardIcon />}
            >
              Dashboard
            </Button>
            <Button
              color={currentPage === 'gacosts' ? 'inherit' : 'inherit'}
              onClick={() => setCurrentPage('gacosts')}
              sx={{
                fontWeight: currentPage === 'gacosts' ? 600 : 500,
                textTransform: 'none',
                fontSize: '1rem',
                mx: 1,
                pb: 0.5,
                borderBottom: currentPage === 'gacosts' ? '3px solid white' : 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
              startIcon={<DashboardCostsIcon />}
            >
              G&A Costs
            </Button>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'gacosts' && <GACosts />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
