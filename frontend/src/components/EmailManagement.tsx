import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Alert,
  FormControlLabel,
  Switch,
  CircularProgress,
  Card,
  CardContent,
  Checkbox,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Assessment as StatsIcon,
  Refresh as RefreshIcon,
  BugReport as TestIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Reply as BounceIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Email notification types
interface EmailType {
  value: string;
  label: string;
}

// Email log interface
interface EmailLog {
  id: string;
  to: string;
  type: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sentAt?: string;
  errorMessage?: string;
  data: Record<string, any>;
}

// Email stats interface
interface EmailStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  bounced: number;
}

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName: string;
}

const EmailManagement: React.FC = () => {
  const { token } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Email sending state
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [emailFormData, setEmailFormData] = useState({
    to: '',
    cc: '',
    bcc: '',
    type: '',
    data: '{}',
    priority: 'normal'
  });
  
  // Email types state
  const [emailTypes, setEmailTypes] = useState<EmailType[]>([]);
  
  // Email logs state
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsFilter, setLogsFilter] = useState({
    type: '',
    status: '',
    limit: 50,
    offset: 0
  });
  
  // Email stats state
  const [emailStats, setEmailStats] = useState<EmailStats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    bounced: 0
  });
  
  // Email configuration state
  const [configLoading, setConfigLoading] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    from: '',
    fromName: 'GhEHR System'
  });
  
  // Test email state
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  
  // Alert state
  const [alert, setAlert] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ show: false, type: 'info', message: '' });

  // Load initial data
  useEffect(() => {
    if (token) {
      loadEmailTypes();
      loadEmailLogs();
      loadEmailStats();
    }
  }, [token]);

  // Auto-refresh logs and stats
  useEffect(() => {
    if (activeTab === 1 || activeTab === 2) {
      const interval = setInterval(() => {
        if (activeTab === 1) loadEmailLogs();
        if (activeTab === 2) loadEmailStats();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [activeTab, token]);

  // Show alert helper
  const showAlert = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: 'info', message: '' }), 5000);
  };

  // Load email types
  const loadEmailTypes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/emails/types`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEmailTypes(response.data.data);
      }
    } catch (error) {
      console.error('Error loading email types:', error);
    }
  };

  // Load email logs
  const loadEmailLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/emails/logs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: logsFilter
      });
      
      if (response.data.success) {
        setEmailLogs(response.data.data.logs);
      }
    } catch (error) {
      console.error('Error loading email logs:', error);
      showAlert('error', 'Failed to load email logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // Load email statistics
  const loadEmailStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/emails/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEmailStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading email stats:', error);
      showAlert('error', 'Failed to load email statistics');
    }
  };

  // Send email
  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      
      // Parse JSON data
      let parsedData;
      try {
        parsedData = JSON.parse(emailFormData.data);
      } catch (error) {
        showAlert('error', 'Invalid JSON data format');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/api/emails/send`, {
        to: emailFormData.to.split(',').map(email => email.trim()),
        cc: emailFormData.cc ? emailFormData.cc.split(',').map(email => email.trim()) : undefined,
        bcc: emailFormData.bcc ? emailFormData.bcc.split(',').map(email => email.trim()) : undefined,
        type: emailFormData.type,
        data: parsedData,
        priority: emailFormData.priority
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showAlert('success', 'Email sent successfully!');
        setSendDialogOpen(false);
        setEmailFormData({
          to: '',
          cc: '',
          bcc: '',
          type: '',
          data: '{}',
          priority: 'normal'
        });
        loadEmailLogs();
        loadEmailStats();
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      showAlert('error', error.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Test email configuration
  const handleTestEmail = async () => {
    try {
      setTestingEmail(true);
      
      const response = await axios.post(`${API_BASE_URL}/api/emails/test`, {
        testEmail
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showAlert('success', 'Test email sent successfully!');
        setTestEmailDialogOpen(false);
        setTestEmail('');
      }
    } catch (error: any) {
      console.error('Error testing email:', error);
      showAlert('error', error.response?.data?.message || 'Failed to send test email');
    } finally {
      setTestingEmail(false);
    }
  };

  // Update email configuration
  const handleUpdateConfig = async () => {
    try {
      setConfigLoading(true);
      
      const response = await axios.put(`${API_BASE_URL}/api/emails/config`, emailConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showAlert('success', 'Email configuration updated successfully!');
        setConfigDialogOpen(false);
      }
    } catch (error: any) {
      console.error('Error updating email config:', error);
      showAlert('error', error.response?.data?.message || 'Failed to update email configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <SuccessIcon sx={{ color: '#4caf50' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: '#f44336' }} />;
      case 'pending':
        return <PendingIcon sx={{ color: '#ff9800' }} />;
      case 'bounced':
        return <BounceIcon sx={{ color: '#9c27b0' }} />;
      default:
        return <PendingIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      case 'bounced':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderDashboard();
      case 1:
        return renderEmailLogs();
      case 2:
        return renderEmailStats();
      case 3:
        return renderEmailSettings();
      default:
        return renderDashboard();
    }
  };

  // Dashboard tab
  const renderDashboard = () => (
    <Box>
      {/* Quick Stats */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {emailStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Emails
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {emailStats.sent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sent
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {emailStats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {emailStats.failed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Quick Actions and Success Rate */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📧 Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={() => setSendDialogOpen(true)}
                fullWidth
              >
                Send Email
              </Button>
              <Button
                variant="outlined"
                startIcon={<TestIcon />}
                onClick={() => setTestEmailDialogOpen(true)}
                fullWidth
              >
                Test Email Config
              </Button>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setConfigDialogOpen(true)}
                fullWidth
              >
                Email Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Email Success Rate
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Success Rate</Typography>
                <Typography variant="body2">
                  {emailStats.total > 0 
                    ? Math.round((emailStats.sent / emailStats.total) * 100)
                    : 0}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={emailStats.total > 0 ? (emailStats.sent / emailStats.total) * 100 : 0}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );

  // Email logs tab
  const renderEmailLogs = () => (
    <Box>
      {/* Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Filter Email Logs
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, alignItems: 'center' }}>
            <FormControl fullWidth>
              <InputLabel>Email Type</InputLabel>
              <Select
                value={logsFilter.type}
                label="Email Type"
                onChange={(e) => setLogsFilter({ ...logsFilter, type: e.target.value })}
              >
                <MenuItem value="">All Types</MenuItem>
                {emailTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={logsFilter.status}
                label="Status"
                onChange={(e) => setLogsFilter({ ...logsFilter, status: e.target.value })}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="bounced">Bounced</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadEmailLogs}
              fullWidth
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Email Logs Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📧 Email History
          </Typography>
          {logsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>To</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Error</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emailLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.sentAt 
                          ? new Date(log.sentAt).toLocaleString()
                          : 'Not sent'
                        }
                      </TableCell>
                      <TableCell>{log.to}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.type.replace(/_/g, ' ')}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(log.status)}
                          label={log.status.toUpperCase()}
                          color={getStatusColor(log.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {log.errorMessage && (
                          <Tooltip title={log.errorMessage}>
                            <Chip
                              label="Error"
                              size="small"
                              color="error"
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {emailLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                        No email logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  // Email stats tab
  const renderEmailStats = () => (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Email Statistics
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr 1fr' }, gap: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary">
                {emailStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main">
                {emailStats.sent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sent
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main">
                {emailStats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main">
                {emailStats.failed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="secondary.main">
                {emailStats.bounced}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bounced
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main">
                {emailStats.total > 0 
                  ? Math.round((emailStats.sent / emailStats.total) * 100)
                  : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Email settings tab
  const renderEmailSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ⚙️ Email Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Configure your SMTP settings for sending emails. Make sure to test the configuration after updating.
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<SettingsIcon />}
          onClick={() => setConfigDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Configure Email Settings
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<TestIcon />}
          onClick={() => setTestEmailDialogOpen(true)}
          sx={{ mb: 2, ml: 2 }}
        >
          Test Email Configuration
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          📧 Email Notifications Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setSendDialogOpen(true)}
        >
          Send Email
        </Button>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<EmailIcon />} label="Dashboard" />
          <Tab icon={<HistoryIcon />} label="Email Logs" />
          <Tab icon={<StatsIcon />} label="Statistics" />
          <Tab icon={<SettingsIcon />} label="Settings" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Send Email Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📧 Send Email Notification
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="To (comma-separated emails)"
              value={emailFormData.to}
              onChange={(e) => setEmailFormData({ ...emailFormData, to: e.target.value })}
              required
              placeholder="user@example.com, another@example.com"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="CC (optional)"
                value={emailFormData.cc}
                onChange={(e) => setEmailFormData({ ...emailFormData, cc: e.target.value })}
                placeholder="cc@example.com"
              />
              <TextField
                fullWidth
                label="BCC (optional)"
                value={emailFormData.bcc}
                onChange={(e) => setEmailFormData({ ...emailFormData, bcc: e.target.value })}
                placeholder="bcc@example.com"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Email Type</InputLabel>
                <Select
                  value={emailFormData.type}
                  label="Email Type"
                  onChange={(e) => setEmailFormData({ ...emailFormData, type: e.target.value })}
                >
                  {emailTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={emailFormData.priority}
                  label="Priority"
                  onChange={(e) => setEmailFormData({ ...emailFormData, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              label="Email Data (JSON format)"
              value={emailFormData.data}
              onChange={(e) => setEmailFormData({ ...emailFormData, data: e.target.value })}
              multiline
              rows={6}
              placeholder='{"patientName": "John Doe", "facilityName": "GhEHR Medical Center"}'
              helperText="Enter email template data in JSON format"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendEmail}
            variant="contained"
            disabled={sendingEmail || !emailFormData.to || !emailFormData.type}
            startIcon={sendingEmail ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sendingEmail ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={testEmailDialogOpen} onClose={() => setTestEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          🧪 Test Email Configuration
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a test email to verify your email configuration is working correctly.
          </Typography>
          <TextField
            fullWidth
            label="Test Email Address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            type="email"
            required
            placeholder="your-email@example.com"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestEmailDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleTestEmail}
            variant="contained"
            disabled={testingEmail || !testEmail}
            startIcon={testingEmail ? <CircularProgress size={20} /> : <TestIcon />}
          >
            {testingEmail ? 'Testing...' : 'Send Test'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Configuration Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          ⚙️ Email Configuration
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure your SMTP server settings for sending emails.
          </Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="SMTP Host"
                value={emailConfig.host}
                onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                required
                placeholder="smtp.gmail.com"
              />
              <TextField
                fullWidth
                label="Port"
                type="number"
                value={emailConfig.port}
                onChange={(e) => setEmailConfig({ ...emailConfig, port: parseInt(e.target.value) })}
                required
                placeholder="587"
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={emailConfig.secure}
                  onChange={(e) => setEmailConfig({ ...emailConfig, secure: e.target.checked })}
                />
              }
              label="Use SSL/TLS"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="Username"
                value={emailConfig.user}
                onChange={(e) => setEmailConfig({ ...emailConfig, user: e.target.value })}
                required
                placeholder="your-email@gmail.com"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={emailConfig.pass}
                onChange={(e) => setEmailConfig({ ...emailConfig, pass: e.target.value })}
                required
                placeholder="your-app-password"
              />
            </Box>
            <TextField
              fullWidth
              label="From Email"
              value={emailConfig.from}
              onChange={(e) => setEmailConfig({ ...emailConfig, from: e.target.value })}
              required
              placeholder="noreply@ghehr.gh"
            />
            <TextField
              fullWidth
              label="From Name"
              value={emailConfig.fromName}
              onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
              placeholder="GhEHR System"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateConfig}
            variant="contained"
            disabled={configLoading}
            startIcon={configLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {configLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailManagement;
