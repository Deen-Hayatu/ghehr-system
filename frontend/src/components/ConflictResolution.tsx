import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Grid2 as Grid,
  Chip,
  Alert,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CloudOff as CloudOffIcon,
  Cloud as CloudIcon,
  Merge as MergeIcon
} from '@mui/icons-material';
import offlineDB, { ConflictItem } from '../services/OfflineDatabase';
import { syncManager } from '../services/SyncManager';

interface ConflictResolutionProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`conflict-tabpanel-${index}`}
      aria-labelledby={`conflict-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ConflictResolution: React.FC<ConflictResolutionProps> = ({ open, onClose }) => {
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadConflicts();
    }
  }, [open]);

  const loadConflicts = async () => {
    try {
      const unresolvedConflicts = await offlineDB.getConflicts();
      setConflicts(unresolvedConflicts);
      if (unresolvedConflicts.length > 0 && !selectedConflict) {
        setSelectedConflict(unresolvedConflicts[0]);
      }
    } catch (error) {
      console.error('Failed to load conflicts:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConflictSelect = (conflict: ConflictItem) => {
    setSelectedConflict(conflict);
    setTabValue(0);
  };

  const resolveConflict = async (resolution: 'local' | 'server' | 'merge', mergedData?: any) => {
    if (!selectedConflict) return;

    setLoading(true);
    try {
      let finalData: any;

      switch (resolution) {
        case 'local':
          finalData = selectedConflict.localData;
          break;
        case 'server':
          finalData = selectedConflict.serverData;
          break;
        case 'merge':
          finalData = mergedData || selectedConflict.localData;
          break;
      }

      // Resolve the conflict
      await offlineDB.resolveConflict(selectedConflict.id!, resolution);

      // Update local data with resolved version
      const storeName = getStoreName(selectedConflict.entityType);
      await offlineDB.save(storeName, finalData);

      // Queue the resolved data for sync
      await syncManager.queueOperation(
        'update',
        selectedConflict.entityType,
        selectedConflict.entityId,
        finalData,
        'high'
      );

      // Reload conflicts
      await loadConflicts();

      console.log(`✅ Conflict resolved using ${resolution} version`);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStoreName = (entityType: string): string => {
    const storeNames: { [key: string]: string } = {
      patient: 'patients',
      appointment: 'appointments',
      clinicalNote: 'clinicalNotes',
      labOrder: 'labOrders',
      billing: 'billing'
    };
    return storeNames[entityType] || entityType;
  };

  const renderDataComparison = (localData: any, serverData: any) => {
    const allKeys = new Set([...Object.keys(localData), ...Object.keys(serverData)]);
    const differences: string[] = [];

    return (
      <Grid container spacing={3}>
        <Grid xs={6}>
          <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <CloudOffIcon sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Local Version</Typography>
              <Chip label="Your Changes" size="small" color="warning" sx={{ ml: 1 }} />
            </Box>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {Array.from(allKeys).map(key => {
                const isDifferent = JSON.stringify(localData[key]) !== JSON.stringify(serverData[key]);
                if (isDifferent) differences.push(key);
                
                return (
                  <Box key={`local-${key}`} sx={{ mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={isDifferent ? 'warning.main' : 'text.secondary'}
                    >
                      {key}:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        bgcolor: isDifferent ? 'warning.50' : 'transparent',
                        p: isDifferent ? 0.5 : 0,
                        borderRadius: 1
                      }}
                    >
                      {JSON.stringify(localData[key], null, 2)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        <Grid xs={6}>
          <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <CloudIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Server Version</Typography>
              <Chip label="Latest" size="small" color="primary" sx={{ ml: 1 }} />
            </Box>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {Array.from(allKeys).map(key => {
                const isDifferent = JSON.stringify(localData[key]) !== JSON.stringify(serverData[key]);
                
                return (
                  <Box key={`server-${key}`} sx={{ mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={isDifferent ? 'primary.main' : 'text.secondary'}
                    >
                      {key}:
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        bgcolor: isDifferent ? 'primary.50' : 'transparent',
                        p: isDifferent ? 0.5 : 0,
                        borderRadius: 1
                      }}
                    >
                      {JSON.stringify(serverData[key], null, 2)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {differences.length > 0 && (
          <Grid xs={12}>
            <Alert severity="info" icon={<MergeIcon />}>
              <Typography variant="body2">
                <strong>Differences found in:</strong> {differences.join(', ')}
              </Typography>
            </Alert>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderConflictsList = () => (
    <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
      {conflicts.map((conflict, index) => (
        <Paper
          key={conflict.id}
          sx={{
            p: 2,
            mb: 1,
            cursor: 'pointer',
            border: selectedConflict?.id === conflict.id ? 2 : 1,
            borderColor: selectedConflict?.id === conflict.id ? 'primary.main' : 'divider',
            '&:hover': { bgcolor: 'action.hover' }
          }}
          onClick={() => handleConflictSelect(conflict)}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle2">
                {conflict.entityType} - {conflict.entityId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(conflict.timestamp).toLocaleString()}
              </Typography>
            </Box>
            <Chip
              icon={<WarningIcon />}
              label="Conflict"
              color="warning"
              size="small"
            />
          </Box>
        </Paper>
      ))}
    </Box>
  );

  if (conflicts.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Sync Conflicts</DialogTitle>
        <DialogContent>
          <Alert severity="success">
            <Typography>No sync conflicts found. All data is synchronized!</Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth maxHeight="90vh">
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
          Resolve Sync Conflicts ({conflicts.length})
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Conflicts occur when the same data is modified both locally (offline) and on the server. 
            Please review the differences and choose how to resolve each conflict.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Conflicts to Resolve:</Typography>
          {renderConflictsList()}
        </Box>

        {selectedConflict && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resolving: {selectedConflict.entityType} - {selectedConflict.entityId}
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Compare Versions" />
                <Tab label="Raw Data" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {renderDataComparison(selectedConflict.localData, selectedConflict.serverData)}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <Typography variant="subtitle1" gutterBottom>Local Data:</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ margin: 0, fontSize: '12px' }}>
                      {JSON.stringify(selectedConflict.localData, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="subtitle1" gutterBottom>Server Data:</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
                    <pre style={{ margin: 0, fontSize: '12px' }}>
                      {JSON.stringify(selectedConflict.serverData, null, 2)}
                    </pre>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={() => resolveConflict('server')}
          disabled={loading || !selectedConflict}
          color="primary"
        >
          Use Server Version
        </Button>
        <Button 
          onClick={() => resolveConflict('local')}
          disabled={loading || !selectedConflict}
          color="warning"
        >
          Use Local Version
        </Button>
        <Button 
          onClick={() => resolveConflict('merge')}
          disabled={loading || !selectedConflict}
          variant="contained"
          color="success"
        >
          Auto-Merge (Prefer Local)
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConflictResolution;
