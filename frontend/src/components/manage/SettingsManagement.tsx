import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationIcon,
  Palette as BrandingIcon,
  Backup as BackupIcon,
  Language as LanguageIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface SystemSettings {
  general: {
    facilityName: string;
    facilityAddress: string;
    contactEmail: string;
    contactPhone: string;
    timezone: string;
    language: string;
    currency: string;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    autoLogout: boolean;
    ipWhitelist: boolean;
    auditLogging: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    appointmentReminders: boolean;
    labResultAlerts: boolean;
    systemAlerts: boolean;
  };
  branding: {
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    customTheme: boolean;
    facilitySlogan: string;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionPeriod: number;
    cloudBackup: boolean;
    lastBackup: string;
  };
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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const SettingsManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      facilityName: 'Ghana Health Center - Accra',
      facilityAddress: '123 Independence Avenue, Accra, Ghana',
      contactEmail: 'admin@ghehr.com',
      contactPhone: '+233 24 123 4567',
      timezone: 'Africa/Accra',
      language: 'en',
      currency: 'GHS'
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 30,
      twoFactorAuth: true,
      autoLogout: true,
      ipWhitelist: false,
      auditLogging: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      whatsappNotifications: false,
      appointmentReminders: true,
      labResultAlerts: true,
      systemAlerts: true
    },
    branding: {
      logoUrl: '/assets/logo.png',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      customTheme: false,
      facilitySlogan: 'Quality Healthcare for All Ghanaians'
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: 30,
      cloudBackup: true,
      lastBackup: '2025-07-23T02:00:00Z'
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const updateGeneralSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }));
  };

  const updateSecuritySettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [field]: value }
    }));
  };

  const updateNotificationSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const updateBrandingSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      branding: { ...prev.branding, [field]: value }
    }));
  };

  const updateBackupSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      backup: { ...prev.backup, [field]: value }
    }));
  };

  const handleSaveSettings = () => {
    setSaveDialogOpen(false);
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const settingsTabConfig = [
    { label: 'General', icon: SettingsIcon, color: '#1976d2' },
    { label: 'Security', icon: SecurityIcon, color: '#f44336' },
    { label: 'Notifications', icon: NotificationIcon, color: '#ff9800' },
    { label: 'Branding', icon: BrandingIcon, color: '#9c27b0' },
    { label: 'Backup', icon: BackupIcon, color: '#4caf50' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          ⚙️ System Settings & Configuration
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size="small"
          >
            Export Config
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setSaveDialogOpen(true)}
            sx={{ backgroundColor: '#4caf50' }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Settings Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 70,
              textTransform: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              flexDirection: 'column',
              gap: 0.5,
            },
          }}
        >
          {settingsTabConfig.map((tab, index) => {
            const IconComponent = tab.icon;
            return (
              <Tab
                key={index}
                icon={
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '6px',
                      backgroundColor: tabValue === index ? tab.color : 'rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <IconComponent 
                      sx={{ 
                        color: tabValue === index ? 'white' : 'rgba(0,0,0,0.6)',
                        fontSize: 20 
                      }} 
                    />
                  </Box>
                }
                label={
                  <Typography variant="subtitle2" fontWeight="bold">
                    {tab.label}
                  </Typography>
                }
              />
            );
          })}
        </Tabs>
      </Paper>

      {/* General Settings */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🏥 General Facility Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Facility Name"
                  value={settings.general.facilityName}
                  onChange={(e) => updateGeneralSettings('facilityName', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) => updateGeneralSettings('contactEmail', e.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Facility Address"
                  multiline
                  rows={2}
                  value={settings.general.facilityAddress}
                  onChange={(e) => updateGeneralSettings('facilityAddress', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={settings.general.contactPhone}
                  onChange={(e) => updateGeneralSettings('contactPhone', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.general.timezone}
                    label="Timezone"
                    onChange={(e) => updateGeneralSettings('timezone', e.target.value)}
                  >
                    <MenuItem value="Africa/Accra">Africa/Accra (GMT)</MenuItem>
                    <MenuItem value="Africa/Lagos">Africa/Lagos (WAT)</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.general.language}
                    label="Language"
                    onChange={(e) => updateGeneralSettings('language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="tw">Twi</MenuItem>
                    <MenuItem value="ga">Ga</MenuItem>
                    <MenuItem value="ee">Ewe</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Security Settings */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔒 Security & Access Control
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Changes to security settings will affect all users. Please review carefully before saving.
              </Typography>
            </Alert>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Minimum Password Length"
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSecuritySettings('passwordMinLength', parseInt(e.target.value))}
                  inputProps={{ min: 6, max: 20 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSecuritySettings('sessionTimeout', parseInt(e.target.value))}
                  inputProps={{ min: 15, max: 120 }}
                />
              </Grid>
            </Grid>
            <List>
              <ListItem>
                <ListItemText
                  primary="Two-Factor Authentication"
                  secondary="Require 2FA for all user accounts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => updateSecuritySettings('twoFactorAuth', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Auto-Logout on Inactivity"
                  secondary="Automatically log out inactive users"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.security.autoLogout}
                    onChange={(e) => updateSecuritySettings('autoLogout', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="IP Address Whitelisting"
                  secondary="Restrict access to specific IP ranges"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.security.ipWhitelist}
                    onChange={(e) => updateSecuritySettings('ipWhitelist', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Comprehensive Audit Logging"
                  secondary="Log all user activities for compliance"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.security.auditLogging}
                    onChange={(e) => updateSecuritySettings('auditLogging', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Notifications Settings */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔔 Notification Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure how and when the system sends notifications to users and patients.
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Send notifications via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => updateNotificationSettings('emailNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="SMS Notifications"
                  secondary="Send SMS alerts and reminders"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => updateNotificationSettings('smsNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="WhatsApp Notifications"
                  secondary="Send WhatsApp messages (requires setup)"
                />
                <ListItemSecondaryAction>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip label="Coming Soon" size="small" color="primary" />
                    <Switch
                      checked={settings.notifications.whatsappNotifications}
                      onChange={(e) => updateNotificationSettings('whatsappNotifications', e.target.checked)}
                      disabled
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Appointment Reminders"
                  secondary="Automatic reminders for upcoming appointments"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.appointmentReminders}
                    onChange={(e) => updateNotificationSettings('appointmentReminders', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Lab Result Alerts"
                  secondary="Notify doctors when lab results are ready"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.labResultAlerts}
                    onChange={(e) => updateNotificationSettings('labResultAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="System Alerts"
                  secondary="Critical system notifications and security alerts"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.notifications.systemAlerts}
                    onChange={(e) => updateNotificationSettings('systemAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Branding Settings */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎨 Branding & Appearance
            </Typography>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Facility Slogan"
                  value={settings.branding.facilitySlogan}
                  onChange={(e) => updateBrandingSettings('facilitySlogan', e.target.value)}
                  placeholder="Enter your facility's motto or slogan"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={settings.branding.primaryColor}
                  onChange={(e) => updateBrandingSettings('primaryColor', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={settings.branding.secondaryColor}
                  onChange={(e) => updateBrandingSettings('secondaryColor', e.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Facility Logo
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #ccc'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Logo
                      </Typography>
                    </Box>
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        component="label"
                        size="small"
                      >
                        Upload Logo
                        <input type="file" hidden accept="image/*" />
                      </Button>
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                        Recommended: 200x200px, PNG or SVG
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              <Grid size={12}>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Custom Theme"
                      secondary="Apply custom colors throughout the application"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.branding.customTheme}
                        onChange={(e) => updateBrandingSettings('customTheme', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Backup Settings */}
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💾 Data Backup & Recovery
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Last backup: {new Date(settings.backup.lastBackup).toLocaleString()} (Automatic)
              </Typography>
            </Alert>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={settings.backup.backupFrequency}
                    label="Backup Frequency"
                    onChange={(e) => updateBackupSettings('backupFrequency', e.target.value)}
                  >
                    <MenuItem value="hourly">Every Hour</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Retention Period (days)"
                  type="number"
                  value={settings.backup.retentionPeriod}
                  onChange={(e) => updateBackupSettings('retentionPeriod', parseInt(e.target.value))}
                  inputProps={{ min: 7, max: 365 }}
                />
              </Grid>
            </Grid>
            <List>
              <ListItem>
                <ListItemText
                  primary="Automatic Backups"
                  secondary="Enable scheduled automatic backups"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.backup.autoBackup}
                    onChange={(e) => updateBackupSettings('autoBackup', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Cloud Backup"
                  secondary="Store backups in secure cloud storage"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.backup.cloudBackup}
                    onChange={(e) => updateBackupSettings('cloudBackup', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<BackupIcon />}
                sx={{ mr: 2 }}
              >
                Create Backup Now
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
              >
                Download Latest Backup
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Save Confirmation Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to save these settings? Some changes may require users to log in again.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSettings} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsManagement;