import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Typography,
  LinearProgress,
  Alert,
  Button,
  Divider
} from '@mui/material';
import {
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Sync as SyncIcon,
  SyncDisabled as SyncDisabledIcon,
  Warning as WarningIcon,
  Cloud as CloudIcon,
  CloudOff as CloudOffIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { networkManager, syncManager } from '../services/SyncManager';
import offlineDB from '../services/OfflineDatabase';
import ConflictResolution from './ConflictResolution';

interface OfflineStatusProps {
  position?: 'fixed' | 'relative';
}

const OfflineStatus: React.FC<OfflineStatusProps> = ({ position = 'fixed' }) => {
  const [isOnline, setIsOnline] = useState(networkManager.getStatus());
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);
  const [conflicts, setConflicts] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Network status listener
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
      if (online) {
        setLastSyncTime(new Date());
      }
    };

    networkManager.onStatusChange(handleNetworkChange);

    // Sync status polling
    const syncInterval = setInterval(updateSyncStatus, 2000);

    // Conflict detection
    const conflictInterval = setInterval(checkConflicts, 5000);

    // Initial status check
    updateSyncStatus();
    checkConflicts();

    return () => {
      networkManager.removeStatusListener(handleNetworkChange);
      clearInterval(syncInterval);
      clearInterval(conflictInterval);
    };
  }, []);

  const updateSyncStatus = async () => {
    try {
      const pendingOps = await offlineDB.getPendingSyncOperations();
      setPendingOperations(pendingOps.length);
      
      const status = syncManager.getSyncStatus();
      setSyncInProgress(status.inProgress);
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  };

  const checkConflicts = async () => {
    try {
      const unresolvedConflicts = await offlineDB.getConflicts();
      setConflicts(unresolvedConflicts.length);
    } catch (error) {
      console.error('Failed to check conflicts:', error);
    }
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleForceSync = async () => {
    handleMenuClose();
    try {
      await syncManager.forcSync();
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  const handleShowConflicts = () => {
    handleMenuClose();
    setShowConflictDialog(true);
  };

  const getStatusColor = () => {
    if (conflicts > 0) return 'error';
    if (!isOnline) return 'warning';
    if (pendingOperations > 0) return 'info';
    return 'success';
  };

  const getStatusText = () => {
    if (conflicts > 0) return 'Conflicts';
    if (!isOnline) return 'Offline';
    if (syncInProgress) return 'Syncing';
    if (pendingOperations > 0) return `${pendingOperations} Pending`;
    return 'Online';
  };

  const getStatusIcon = () => {
    if (conflicts > 0) return <WarningIcon />;
    if (!isOnline) return <WifiOffIcon />;
    if (syncInProgress) return <SyncIcon className="rotating" />;
    if (pendingOperations > 0) return <CloudOffIcon />;
    return <CloudIcon />;
  };

  const StatusChipContent = () => (
    <Badge 
      badgeContent={conflicts > 0 ? conflicts : pendingOperations > 0 ? pendingOperations : 0}
      color={conflicts > 0 ? 'error' : 'primary'}
      max={99}
    >
      <Chip
        icon={getStatusIcon()}
        label={getStatusText()}
        color={getStatusColor()}
        size="small"
        clickable
        onClick={handleStatusClick}
        sx={{
          cursor: 'pointer',
          '& .MuiChip-icon': {
            animation: syncInProgress ? 'spin 1s linear infinite' : 'none'
          }
        }}
      />
    </Badge>
  );

  return (
    <>
      <Box
        sx={{
          position,
          top: position === 'fixed' ? 16 : 'auto',
          right: position === 'fixed' ? 16 : 'auto',
          zIndex: 1300,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <StatusChipContent />
        
        {syncInProgress && (
          <Box sx={{ width: 100 }}>
            <LinearProgress />
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 250 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Sync Status
          </Typography>
          
          <Box display="flex" alignItems="center" mb={2}>
            {isOnline ? (
              <>
                <WifiIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="success.main">
                  Connected to server
                </Typography>
              </>
            ) : (
              <>
                <WifiOffIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2" color="warning.main">
                  Working offline
                </Typography>
              </>
            )}
          </Box>

          {lastSyncTime && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </Typography>
          )}

          {pendingOperations > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {pendingOperations} operations waiting to sync
              </Typography>
            </Alert>
          )}

          {conflicts > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {conflicts} conflicts need resolution
              </Typography>
            </Alert>
          )}

          <Divider sx={{ my: 1 }} />
        </Box>

        <MenuItem onClick={handleForceSync} disabled={!isOnline || syncInProgress}>
          <RefreshIcon sx={{ mr: 1 }} />
          Force Sync
        </MenuItem>

        {conflicts > 0 && (
          <MenuItem onClick={handleShowConflicts}>
            <WarningIcon sx={{ mr: 1 }} />
            Resolve Conflicts ({conflicts})
          </MenuItem>
        )}

        <MenuItem onClick={() => window.location.reload()}>
          <SyncIcon sx={{ mr: 1 }} />
          Refresh App
        </MenuItem>
      </Menu>

      <ConflictResolution
        open={showConflictDialog}
        onClose={() => setShowConflictDialog(false)}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default OfflineStatus;
