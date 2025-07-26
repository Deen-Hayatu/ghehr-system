import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
  Alert,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Person as UserIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'data_access' | 'data_modification' | 'system' | 'security';
  outcome: 'success' | 'failure' | 'warning';
  sessionId?: string;
}

const AuditTrails: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: 'AUDIT-001',
      timestamp: '2025-07-23T10:30:00Z',
      userId: 'USER-001',
      userName: 'Dr. Ama Osei',
      userRole: 'Doctor',
      action: 'VIEW_PATIENT_RECORD',
      resource: 'Patient',
      resourceId: 'PAT-001',
      details: 'Accessed patient medical history for Kwame Asante',
      ipAddress: '192.168.1.101',
      severity: 'low',
      category: 'data_access',
      outcome: 'success',
      sessionId: 'SES-12345'
    },
    {
      id: 'AUDIT-002',
      timestamp: '2025-07-23T10:25:00Z',
      userId: 'USER-002',
      userName: 'Alice Adjei',
      userRole: 'Pharmacist',
      action: 'DISPENSE_MEDICATION',
      resource: 'PharmacyOrder',
      resourceId: 'PH-001',
      details: 'Dispensed Paracetamol 500mg x20 tablets to patient PAT-001',
      ipAddress: '192.168.1.102',
      severity: 'medium',
      category: 'data_modification',
      outcome: 'success',
      sessionId: 'SES-12346'
    },
    {
      id: 'AUDIT-003',
      timestamp: '2025-07-23T10:20:00Z',
      userId: 'USER-003',
      userName: 'John Mensah',
      userRole: 'Lab Technician',
      action: 'UPDATE_LAB_RESULT',
      resource: 'LabOrder',
      resourceId: 'LAB-001',
      details: 'Updated CBC results for patient PAT-001 - WBC: 7.5, RBC: 4.2',
      ipAddress: '192.168.1.103',
      severity: 'high',
      category: 'data_modification',
      outcome: 'success',
      sessionId: 'SES-12347'
    },
    {
      id: 'AUDIT-004',
      timestamp: '2025-07-23T10:15:00Z',
      userId: 'USER-004',
      userName: 'Unknown User',
      userRole: 'Unknown',
      action: 'FAILED_LOGIN',
      resource: 'Authentication',
      resourceId: 'AUTH-001',
      details: 'Failed login attempt with username: admin@ghehr.com',
      ipAddress: '203.45.67.89',
      severity: 'critical',
      category: 'security',
      outcome: 'failure',
      sessionId: undefined
    },
    {
      id: 'AUDIT-005',
      timestamp: '2025-07-23T10:10:00Z',
      userId: 'USER-001',
      userName: 'Dr. Ama Osei',
      userRole: 'Doctor',
      action: 'CREATE_CLINICAL_NOTE',
      resource: 'ClinicalNote',
      resourceId: 'NOTE-001',
      details: 'Created clinical note for patient PAT-002 - Diagnosis: Malaria',
      ipAddress: '192.168.1.101',
      severity: 'medium',
      category: 'data_modification',
      outcome: 'success',
      sessionId: 'SES-12345'
    },
    {
      id: 'AUDIT-006',
      timestamp: '2025-07-23T10:05:00Z',
      userId: 'SYSTEM',
      userName: 'System Administrator',
      userRole: 'System',
      action: 'BACKUP_DATABASE',
      resource: 'Database',
      resourceId: 'DB-MAIN',
      details: 'Automated daily database backup completed successfully',
      ipAddress: '127.0.0.1',
      severity: 'low',
      category: 'system',
      outcome: 'success',
      sessionId: undefined
    },
    {
      id: 'AUDIT-007',
      timestamp: '2025-07-23T09:55:00Z',
      userId: 'USER-005',
      userName: 'Mary Kuffour',
      userRole: 'Front Desk',
      action: 'REGISTER_PATIENT',
      resource: 'Patient',
      resourceId: 'PAT-004',
      details: 'Registered new patient: Esi Bonsu, DOB: 1985-03-15',
      ipAddress: '192.168.1.104',
      severity: 'medium',
      category: 'data_modification',
      outcome: 'success',
      sessionId: 'SES-12348'
    },
    {
      id: 'AUDIT-008',
      timestamp: '2025-07-23T09:50:00Z',
      userId: 'USER-006',
      userName: 'Grace Ampong',
      userRole: 'Admin',
      action: 'DELETE_USER',
      resource: 'User',
      resourceId: 'USER-999',
      details: 'Deleted inactive user account: temp.user@ghehr.com',
      ipAddress: '192.168.1.105',
      severity: 'high',
      category: 'data_modification',
      outcome: 'success',
      sessionId: 'SES-12349'
    }
  ]);

  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(logs);
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    outcome: '',
    userId: '',
    dateFrom: '',
    dateTo: ''
  });

  const applyFilters = () => {
    let filtered = logs;

    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }
    if (filters.severity) {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }
    if (filters.outcome) {
      filtered = filtered.filter(log => log.outcome === filters.outcome);
    }
    if (filters.userId) {
      filtered = filtered.filter(log => 
        log.userId.toLowerCase().includes(filters.userId.toLowerCase()) ||
        log.userName.toLowerCase().includes(filters.userId.toLowerCase())
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(filters.dateTo)
      );
    }

    setFilteredLogs(filtered);
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      severity: '',
      outcome: '',
      userId: '',
      dateFrom: '',
      dateTo: ''
    });
    setFilteredLogs(logs);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'view_patient_record':
      case 'view':
        return <ViewIcon sx={{ color: '#2196f3' }} />;
      case 'create_clinical_note':
      case 'register_patient':
      case 'create':
        return <AddIcon sx={{ color: '#4caf50' }} />;
      case 'update_lab_result':
      case 'dispense_medication':
      case 'update':
        return <EditIcon sx={{ color: '#ff9800' }} />;
      case 'delete_user':
      case 'delete':
        return <DeleteIcon sx={{ color: '#f44336' }} />;
      case 'failed_login':
      case 'login':
        return <LoginIcon sx={{ color: '#9c27b0' }} />;
      case 'logout':
        return <LogoutIcon sx={{ color: '#607d8b' }} />;
      default:
        return <SecurityIcon sx={{ color: '#795548' }} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return 'success';
      case 'failure':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security':
        return 'error';
      case 'data_modification':
        return 'warning';
      case 'data_access':
        return 'info';
      case 'authentication':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Role', 'Action', 'Resource', 'Details', 'IP Address', 'Severity', 'Category', 'Outcome'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.userName,
        log.userRole,
        log.action,
        log.resource,
        `"${log.details}"`,
        log.ipAddress,
        log.severity,
        log.category,
        log.outcome
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          🔒 Audit Trails & Security Logs
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<ExportIcon />}
            onClick={exportAuditLogs}
            sx={{ backgroundColor: '#1976d2' }}
          >
            Export Logs
          </Button>
        </Box>
      </Box>

      {/* Security Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Security Notice:</strong> All user activities are monitored and logged for compliance and security purposes. 
        Failed login attempts from IP 203.45.67.89 detected - please review security settings.
      </Alert>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {filteredLogs.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Logs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {filteredLogs.filter(log => log.severity === 'critical').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {filteredLogs.filter(log => log.outcome === 'failure').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed Actions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {filteredLogs.filter(log => log.category === 'security').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Security Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filter Audit Logs
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  label="Category"
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  <MenuItem value="authentication">Authentication</MenuItem>
                  <MenuItem value="data_access">Data Access</MenuItem>
                  <MenuItem value="data_modification">Data Modification</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filters.severity}
                  label="Severity"
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                >
                  <MenuItem value="">All Severities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Outcome</InputLabel>
                <Select
                  value={filters.outcome}
                  label="Outcome"
                  onChange={(e) => setFilters({ ...filters, outcome: e.target.value })}
                >
                  <MenuItem value="">All Outcomes</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="failure">Failure</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="User/ID"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                placeholder="Search user..."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="From Date"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="To Date"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={12}>
              <Box display="flex" gap={1} sx={{ mt: 1 }}>
                <Button variant="contained" onClick={applyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outlined" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Audit Log Entries ({filteredLogs.length} records)
          </Typography>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                  <TableCell><strong>Resource</strong></TableCell>
                  <TableCell><strong>Details</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Severity</strong></TableCell>
                  <TableCell><strong>Outcome</strong></TableCell>
                  <TableCell><strong>IP Address</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <UserIcon fontSize="small" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {log.userName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.userRole} ({log.userId})
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getActionIcon(log.action)}
                        <Typography variant="body2">
                          {log.action.replace(/_/g, ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {log.resource}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.resourceId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {log.details.length > 60 ? `${log.details.substring(0, 60)}...` : log.details}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.category.replace('_', ' ').toUpperCase()}
                        color={getCategoryColor(log.category) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.severity.toUpperCase()}
                        color={getSeverityColor(log.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.outcome.toUpperCase()}
                        color={getOutcomeColor(log.outcome) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {log.ipAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Full Details">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditTrails;
