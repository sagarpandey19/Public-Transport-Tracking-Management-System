import { createTheme } from '@mui/material/styles';

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode Palette
          primary: {
            main: '#d84e55',
            light: '#e07176',
            dark: '#b34046',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#2c3e50',
            light: '#566573',
            dark: '#1a252f',
            contrastText: '#ffffff',
          },
          success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
            contrastText: '#ffffff',
          },
          error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#b91c1c',
            contrastText: '#ffffff',
          },
          background: {
            default: '#eceef2',
            paper: '#ffffff',
          },
          text: {
            primary: '#111827',
            secondary: '#4b5563',
          },
          divider: '#dfe1e6',
        }
      : {
          // Dark Mode Palette - Silicon Valley Soft Grey
          primary: {
            main: '#E57373', // Softened brand red
            light: '#EF9A9A',
            dark: '#D32F2F',
            contrastText: '#121212', // High readability on primary
          },
          secondary: {
            main: '#64B5F6',
            light: '#90CAF9',
            dark: '#1976D2',
            contrastText: '#121212',
          },
          success: {
            main: '#81C784', // Soft green
            light: '#A5D6A7',
            dark: '#388E3C',
            contrastText: '#121212',
          },
          error: {
            main: '#F06292', // Soft red/pink
            light: '#F48FB1',
            dark: '#C2185B',
            contrastText: '#121212',
          },
          background: {
            default: '#121212', // Deep immersive grey
            paper: '#1E1E1E',   // Surface/Card
          },
          text: {
            primary: '#E0E0E0', // Off-white
            secondary: '#A0A0A0', // Muted grey
          },
          divider: 'rgba(255, 255, 255, 0.08)',
        }),
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'light' 
              ? '0 4px 6px -1px rgba(216, 78, 85, 0.2), 0 2px 4px -1px rgba(216, 78, 85, 0.1)'
              : '0 4px 6px -1px rgba(229, 115, 115, 0.25), 0 2px 4px -1px rgba(229, 115, 115, 0.15)',
          },
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
      defaultProps: {
        disableElevation: true,
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            : 'none', // No shadow in dark, use border and background
          border: mode === 'light' 
            ? '1px solid rgba(0,0,0,0.05)'
            : '1px solid #333333',
          backgroundImage: 'none',
          backgroundColor: mode === 'light' ? '#ffffff' : '#1E1E1E',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: mode === 'dark' ? '#121212' : 'transparent',
            '& fieldset': {
               borderColor: mode === 'dark' ? '#333333' : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: mode === 'dark' ? '#E57373' : 'rgba(0, 0, 0, 0.87)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          backgroundColor: mode === 'light' ? '#ffffff' : '#2A2A2A',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
});

// For backwards compatibility where simple explicit theme import was expected (like index.js)
// But going forward we should use useMemo + createTheme in App.js
const theme = createTheme(getDesignTokens('light'));
export default theme;
