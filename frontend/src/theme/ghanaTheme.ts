import { createTheme } from '@mui/material/styles';
import * as React from 'react';

// Extend the Material-UI theme to include Ghana-specific properties
declare module '@mui/material/styles' {
  interface Palette {
    ghana: {
      kente: {
        red: string;
        gold: string;
        green: string;
        black: string;
        white: string;
      };
      adinkra: {
        brown: string;
        darkGold: string;
        earthRed: string;
      };
    };
  }

  interface PaletteOptions {
    ghana?: {
      kente?: {
        red?: string;
        gold?: string;
        green?: string;
        black?: string;
        white?: string;
      };
      adinkra?: {
        brown?: string;
        darkGold?: string;
        earthRed?: string;
      };
    };
  }
}

// Ghana's traditional colors and cultural theme
export const ghanaTheme = createTheme({
  palette: {
    primary: {
      main: '#DC143C', // Red from Ghana flag - represents blood of heroes
      light: '#FF6B6B',
      dark: '#B71C1C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFD700', // Gold from Ghana flag - represents mineral wealth
      light: '#FFF176',
      dark: '#F57F17',
      contrastText: '#000000',
    },
    success: {
      main: '#228B22', // Green from Ghana flag - represents forests and agriculture
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A', // Darker for better contrast
      secondary: '#4A4A4A', // Improved contrast while maintaining readability
    },
    // Custom Ghana-inspired colors
    ghana: {
      kente: {
        red: '#DC143C',
        gold: '#FFD700',
        green: '#228B22',
        black: '#000000',
        white: '#FFFFFF',
      },
      adinkra: {
        brown: '#8B4513',
        darkGold: '#B8860B',
        earthRed: '#CD853F',
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Ubuntu", "Segoe UI", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#DC143C',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      color: '#2C2C2C',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#2C2C2C',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#DC143C',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.1rem',
      color: '#2C2C2C',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
      color: '#666666',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(220, 20, 60, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(220, 20, 60, 0.3)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease-in-out',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #DC143C 0%, #B71C1C 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #B71C1C 0%, #8B0000 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFA000 0%, #FF8F00 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: '#E0E0E0',
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: '#FFD700',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#DC143C',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #DC143C 0%, #228B22 50%, #FFD700 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Adinkra symbols as React components (simplified SVG representations)
export const AdinkraSymbols = {
  // Gye Nyame - "Except for God" - Supreme authority and omnipotence
  GyeNyame: () => React.createElement(
    'svg',
    { width: 40, height: 40, viewBox: '0 0 40 40', fill: 'currentColor' },
    React.createElement('circle', { cx: 20, cy: 20, r: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 2 }),
    React.createElement('path', { d: 'M20 8 L20 32 M12 12 L28 12 M12 28 L28 28', stroke: 'currentColor', strokeWidth: 2 }),
    React.createElement('circle', { cx: 20, cy: 20, r: 4, fill: 'currentColor' })
  ),
  
  // Sankofa - "Go back and get it" - Learning from the past
  Sankofa: () => React.createElement(
    'svg',
    { width: 40, height: 40, viewBox: '0 0 40 40', fill: 'currentColor' },
    React.createElement('path', { d: 'M20 8 Q12 8 12 16 Q12 24 20 24 Q28 24 28 16 Q28 8 20 8', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }),
    React.createElement('path', { d: 'M15 12 L10 16 L15 20', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }),
    React.createElement('circle', { cx: 20, cy: 32, r: 4, fill: 'currentColor' })
  ),
  
  // Dwennimmen - "Ram's horns" - Humility and strength
  Dwennimmen: () => React.createElement(
    'svg',
    { width: 40, height: 40, viewBox: '0 0 40 40', fill: 'currentColor' },
    React.createElement('path', { d: 'M10 30 Q10 10 20 10 Q30 10 30 30', fill: 'none', stroke: 'currentColor', strokeWidth: 3 }),
    React.createElement('path', { d: 'M8 28 Q8 20 12 20 M32 28 Q32 20 28 20', fill: 'none', stroke: 'currentColor', strokeWidth: 2 })
  ),
};

export default ghanaTheme;
