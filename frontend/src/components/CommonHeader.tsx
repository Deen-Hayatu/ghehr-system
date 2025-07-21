import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Notifications,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { GhEHRLogo } from './GhEHRLogo';

interface CommonHeaderProps {
  title: string;
  subtitle?: string;
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({ title, subtitle }) => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {/* Logo Integration - Increased by 40% */}
          <GhEHRLogo 
            variant="header"
            height="63px"
            sx={{ mr: 2 }}
          />
          <Box>
            <Typography variant="h6" component="div" sx={{ 
              fontWeight: 600,
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ 
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.875rem'
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* User greeting - matches logo feature style */}
          <Typography variant="body1" sx={{ 
            display: { xs: 'none', md: 'block' },
            color: 'white',
            fontWeight: 500
          }}>
            Akwaaba, {user?.name?.split(' ')[0] || 'Dr. User'}!
          </Typography>
          <Avatar sx={{ 
            bgcolor: 'white', 
            color: theme.palette.primary.main,
            fontWeight: 600,
            fontSize: '14px'
          }}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'DR'}
          </Avatar>
          <Typography variant="body2" sx={{ 
            display: { xs: 'none', sm: 'block' },
            color: 'rgba(255,255,255,0.8)'
          }}>
            {new Date().toLocaleDateString('en-GH', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Typography>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton color="inherit">
            <Settings />
          </IconButton>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default CommonHeader;
