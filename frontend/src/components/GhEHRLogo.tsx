import React, { useState } from 'react';
import { Box, BoxProps } from '@mui/material';

interface LogoProps extends Omit<BoxProps, 'component'> {
  height?: string | number;
  variant?: 'default' | 'header' | 'login';
  showFallback?: boolean;
}

export const GhEHRLogo: React.FC<LogoProps> = ({ 
  height = '50px', 
  variant = 'default',
  showFallback = true,
  sx,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Replace with your actual Imgur direct image URL
  // Make sure it's the direct link ending with .png, .jpg, etc.
  const logoUrl = 'https://i.imgur.com/b8WvnC0.png';
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'header':
        return {
          // Remove all background styling for natural integration
          padding: '4px 8px', // Minimal padding just for spacing
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))', // Natural shadow instead of box-shadow
        };
      case 'login':
        return {
          height: '80px',
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        };
      default:
        return {};
    }
  };
  
  // Fallback: Ghana flag colors with "GhEHR" text - more integrated design
  const fallbackLogo = (
    <Box
      sx={{
        height,
        width: 'auto',
        minWidth: height,
        background: 'linear-gradient(135deg, #dc143c 0%, #ff8c00 30%, #ffd700 60%, #32cd32 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        color: 'white',
        textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
        padding: '6px 12px',
        border: '2px solid rgba(255,255,255,0.3)',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
        ...getVariantStyles(),
        ...sx
      }}
      {...props}
    >
      GhEHR
    </Box>
  );
  
  // If image failed to load or we don't have a URL, show fallback
  if (imageError || logoUrl.includes('YOUR_ACTUAL_IMAGE_ID') || !showFallback) {
    return fallbackLogo;
  }
  
  return (
    <Box
      component="img"
      src={logoUrl}
      alt="GhEHR - Ghana Electronic Health Records"
      onError={() => setImageError(true)}
      sx={{
        height,
        width: 'auto',
        objectFit: 'contain',
        ...getVariantStyles(),
        ...sx
      }}
      {...props}
    />
  );
};

export default GhEHRLogo;
