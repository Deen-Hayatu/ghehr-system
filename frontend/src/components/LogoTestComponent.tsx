import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { GhEHRLogo } from './GhEHRLogo';

const LogoTestComponent: React.FC = () => {
  return (
    <Paper sx={{ p: 4, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        GhEHR Logo Integration Test
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header variant */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Header Variant (as used in Dashboard):
          </Typography>
          <Box sx={{ 
            background: 'linear-gradient(to right, #dc143c, #ff8c00, #ffd700, #32cd32)',
            p: 2,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <GhEHRLogo variant="header" height="45px" />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              GhEHR Dashboard
            </Typography>
          </Box>
        </Box>

        {/* Default variant */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Default Variant:
          </Typography>
          <GhEHRLogo variant="default" height="50px" />
        </Box>

        {/* Login variant */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Login Variant:
          </Typography>
          <GhEHRLogo variant="login" height="80px" />
        </Box>

        {/* Instructions */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.contrastText">
            <strong>To use your actual logo:</strong><br />
            1. Upload your logo to Imgur<br />
            2. Get the direct image URL (should end with .png, .jpg, etc.)<br />
            3. Replace 'YOUR_ACTUAL_IMAGE_ID' in GhEHRLogo.tsx with your image ID<br />
            4. The fallback Ghana flag logo will show until you update the URL
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default LogoTestComponent;
