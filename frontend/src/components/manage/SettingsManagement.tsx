import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  FormControlLabel,
} from '@mui/material';
import {
  AccountCircle as PreferencesIcon,
  Lock as PasswordIcon,
  Apps as ApplicationIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  RestartAlt as ResetIcon,
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
  Schedule as ScheduleIcon,
  Today as DateIcon,
  Palette as ThemeIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Star as FavoriteIcon,
  Code as CodeIcon,
  Notifications as NotificationIcon,
  Palette as BrandingIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';

interface PreferencesSettings {
  doctorSignature: {
    uploaded: boolean;
    fileName: string;
    uploadDate: string;
  };
  autoLogoutTime: number; // in minutes
  dateFormat: string;
  theme: string;
  language: string;
}

interface ApplicationSettings {
  favorites: string[];
  customCodes: Array<{
    id: string;
    code: string;
    description: string;
    category: string;
  }>;
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    labResultAlerts: boolean;
  };
  branding: {
    facilityName: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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
  // State management
  const [preferences, setPreferences] = useState<PreferencesSettings>({
    doctorSignature: {
      uploaded: false,
      fileName: '',
      uploadDate: '',
    },
    autoLogoutTime: 30,
    dateFormat: 'DD/MM/YYYY',
    theme: 'Light',
    language: 'English',
  });

  const [applicationSettings, setApplicationSettings] = useState<ApplicationSettings>({
    favorites: ['Patient Management', 'Appointments', 'Clinical Notes'],
    customCodes: [
      { id: '1', code: 'MALARIA-001', description: 'Malaria - Uncomplicated', category: 'Infectious Disease' },
      { id: '2', code: 'HTN-001', description: 'Essential Hypertension', category: 'Cardiovascular' },
    ],
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      labResultAlerts: true,
    },
    branding: {
      facilityName: 'GhEHR Medical Center',
      logoUrl: '',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
    },
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saveDialog, setSaveDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [newCodeDialog, setNewCodeDialog] = useState(false);
  const [newCode, setNewCode] = useState({ code: '', description: '', category: '' });

  // Available options
  const autoLogoutOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours' },
  ];

  const dateFormatOptions = [
    'DD/MM/YYYY',
    'MM/DD/YYYY',
    'YYYY-MM-DD',
    'DD-MM-YYYY',
  ];

  const themeOptions = ['Light', 'Dark', 'Auto'];
  const languageOptions = ['English', 'Twi', 'Ga', 'Ewe'];

  const availableModules = [
    'Dashboard',
    'Patient Management',
    'Appointments',
    'Clinical Notes',
    'Billing',
    'Reports',
    'Lab Orders',
    'Pharmacy Orders',
    'MOH Dashboard',
  ];

  // Event handlers
  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a server
      setPreferences((prev: any) => ({
        ...prev,
        doctorSignature: {
          uploaded: true,
          fileName: file.name,
          uploadDate: new Date().toLocaleDateString(),
        },
      }));
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    // In a real app, you would send this to the server
    console.log('Password change requested');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password changed successfully');
  };

  const handleAddCustomCode = () => {
    if (!newCode.code || !newCode.description || !newCode.category) {
      alert('Please fill in all fields');
      return;
    }
    
    setApplicationSettings((prev: any) => ({
      ...prev,
      customCodes: [...prev.customCodes, { 
        id: Date.now().toString(), 
        ...newCode 
      }],
    }));
    
    setNewCode({ code: '', description: '', category: '' });
    setNewCodeDialog(false);
  };

  const handleDeleteCustomCode = (id: string) => {
    setApplicationSettings((prev: any) => ({
      ...prev,
      customCodes: prev.customCodes.filter((code: any) => code.id !== id),
    }));
  };

  const handleToggleFavorite = (module: string) => {
    setApplicationSettings((prev: any) => ({
      ...prev,
      favorites: prev.favorites.includes(module)
        ? prev.favorites.filter((fav: any) => fav !== module)
        : [...prev.favorites, module],
    }));
  };

  const handleResetAllSettings = () => {
    setPreferences({
      doctorSignature: { uploaded: false, fileName: '', uploadDate: '' },
      autoLogoutTime: 30,
      dateFormat: 'DD/MM/YYYY',
      theme: 'Light',
      language: 'English',
    });
    setApplicationSettings({
      favorites: [],
      customCodes: [],
      notifications: {
        emailNotifications: false,
        smsNotifications: false,
        appointmentReminders: false,
        labResultAlerts: false,
      },
      branding: {
        facilityName: 'GhEHR Medical Center',
        logoUrl: '',
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
      },
    });
    setResetDialog(false);
    alert('All settings have been reset to defaults');
  };

  const handleSaveAllSettings = () => {
    // In a real app, you would send this to the server
    console.log('Saving settings:', { preferences, applicationSettings });
    setSaveDialog(false);
    alert('Settings saved successfully');
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          ⚙️ Manage Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialog(true)}
          sx={{ backgroundColor: '#4caf50' }}
        >
          Save All Changes
        </Button>
      </Box>

      {/* Main Content */}
      <Stack spacing={3}>
        
        {/* 1. PREFERENCES SECTION */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={2}>
              <PreferencesIcon sx={{ color: '#1976d2' }} />
              <Typography variant="h6" fontWeight="bold">
                Preferences
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" flexWrap="wrap" gap={3}>
              
              {/* Doctor Signature Upload */}
              <Box flex="1" minWidth="300px">
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                      <CloudUploadIcon sx={{ color: '#1976d2' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Doctor Signature Upload
                      </Typography>
                    </Box>
                    
                    {preferences.doctorSignature.uploaded ? (
                      <Box>
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Signature uploaded: {preferences.doctorSignature.fileName}
                          <br />
                          Upload date: {preferences.doctorSignature.uploadDate}
                        </Alert>
                        <Button
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          color="error"
                          onClick={() => setPreferences((prev: any) => ({
                            ...prev,
                            doctorSignature: { uploaded: false, fileName: '', uploadDate: '' }
                          }))}
                        >
                          Remove Signature
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Upload your digital signature for reports and prescriptions
                        </Typography>
                        <input
                          accept="image/*,.pdf"
                          style={{ display: 'none' }}
                          id="signature-upload"
                          type="file"
                          onChange={handleSignatureUpload}
                        />
                        <label htmlFor="signature-upload">
                          <Button
                            variant="contained"
                            component="span"
                            startIcon={<UploadIcon />}
                            sx={{ backgroundColor: '#1976d2' }}
                          >
                            Upload Signature
                          </Button>
                        </label>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Auto Logout Time */}
              <Box flex="1" minWidth="300px">
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                      <ScheduleIcon sx={{ color: '#f57c00' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Auto Logout Time
                      </Typography>
                    </Box>
                    <FormControl fullWidth>
                      <Select
                        value={preferences.autoLogoutTime}
                        onChange={(e) => setPreferences((prev: any) => ({
                          ...prev,
                          autoLogoutTime: e.target.value as number
                        }))}
                      >
                        {autoLogoutOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Box>

              {/* Date Format Selection */}
              <Box flex="1" minWidth="300px">
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                      <DateIcon sx={{ color: '#388e3c' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Date Format Selection
                      </Typography>
                    </Box>
                    <FormControl fullWidth>
                      <Select
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences((prev: any) => ({
                          ...prev,
                          dateFormat: e.target.value
                        }))}
                      >
                        {dateFormatOptions.map((format) => (
                          <MenuItem key={format} value={format}>
                            {format} (Example: {new Date().toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }).replace(/\//g, format.includes('-') ? '-' : '/')})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Box>

              {/* Theme Selection */}
              <Box flex="1" minWidth="300px">
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                      <ThemeIcon sx={{ color: '#9c27b0' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Theme Selection
                      </Typography>
                    </Box>
                    <FormControl fullWidth>
                      <Select
                        value={preferences.theme}
                        onChange={(e) => setPreferences((prev: any) => ({
                          ...prev,
                          theme: e.target.value
                        }))}
                      >
                        {themeOptions.map((theme) => (
                          <MenuItem key={theme} value={theme}>
                            {theme}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Box>

              {/* Language Selection */}
              <Box flex="1" minWidth="300px">
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                      <LanguageIcon sx={{ color: '#00796b' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Language Selection
                      </Typography>
                    </Box>
                    <FormControl fullWidth>
                      <Select
                        value={preferences.language}
                        onChange={(e) => setPreferences((prev: any) => ({
                          ...prev,
                          language: e.target.value
                        }))}
                      >
                        {languageOptions.map((language) => (
                          <MenuItem key={language} value={language}>
                            {language}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Box>

              {/* Reset All Settings */}
              <Box flex="1" minWidth="300px">
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                      <ResetIcon sx={{ color: '#d32f2f' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Reset All Settings
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      This will reset all preferences to their default values
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<ResetIcon />}
                      onClick={() => setResetDialog(true)}
                    >
                      Reset Settings
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* 2. CHANGE PASSWORD SECTION */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={2}>
              <PasswordIcon sx={{ color: '#d32f2f' }} />
              <Typography variant="h6" fontWeight="bold">
                Change Password
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Card>
              <CardContent>
                <Box display="flex" flexWrap="wrap" gap={3}>
                  <Box flex="1" minWidth="200px">
                    <TextField
                      fullWidth
                      type="password"
                      label="Current Password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((prev: any) => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))}
                    />
                  </Box>
                  <Box flex="1" minWidth="200px">
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev: any) => ({
                        ...prev,
                        newPassword: e.target.value
                      }))}
                    />
                  </Box>
                  <Box flex="1" minWidth="200px">
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev: any) => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                    />
                  </Box>
                  <Box width="100%">
                    <Button
                      variant="contained"
                      onClick={handlePasswordChange}
                      disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      sx={{ backgroundColor: '#d32f2f' }}
                    >
                      Change Password
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </AccordionDetails>
        </Accordion>

        {/* 3. APPLICATION SETTINGS SECTION */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={2}>
              <ApplicationIcon sx={{ color: '#1976d2' }} />
              <Typography variant="h6" fontWeight="bold">
                Application Settings
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              
              {/* Favorites */}
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <FavoriteIcon sx={{ color: '#ff9800' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Favorites
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Pin your frequently used modules for quick access
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {availableModules.map((module) => (
                      <Chip
                        key={module}
                        label={module}
                        onClick={() => handleToggleFavorite(module)}
                        color={applicationSettings.favorites.includes(module) ? 'primary' : 'default'}
                        icon={applicationSettings.favorites.includes(module) ? <FavoriteIcon /> : undefined}
                        variant={applicationSettings.favorites.includes(module) ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Custom Codes */}
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CodeIcon sx={{ color: '#4caf50' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Custom Codes
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setNewCodeDialog(true)}
                    >
                      Add Code
                    </Button>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Facility-specific diagnosis and procedure codes
                  </Typography>
                  <List>
                    {applicationSettings.customCodes.map((code) => (
                      <ListItem key={code.id}>
                        <ListItemText
                          primary={`${code.code} - ${code.description}`}
                          secondary={`Category: ${code.category}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteCustomCode(code.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <NotificationIcon sx={{ color: '#2196f3' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Notifications
                    </Typography>
                  </Box>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={applicationSettings.notifications.emailNotifications}
                          onChange={(e) => setApplicationSettings((prev: any) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              emailNotifications: e.target.checked
                            }
                          }))}
                        />
                      }
                      label="Email Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={applicationSettings.notifications.smsNotifications}
                          onChange={(e) => setApplicationSettings((prev: any) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              smsNotifications: e.target.checked
                            }
                          }))}
                        />
                      }
                      label="SMS Notifications"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={applicationSettings.notifications.appointmentReminders}
                          onChange={(e) => setApplicationSettings((prev: any) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              appointmentReminders: e.target.checked
                            }
                          }))}
                        />
                      }
                      label="Appointment Reminders"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={applicationSettings.notifications.labResultAlerts}
                          onChange={(e) => setApplicationSettings((prev: any) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              labResultAlerts: e.target.checked
                            }
                          }))}
                        />
                      }
                      label="Lab Result Alerts"
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Branding */}
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                    <BrandingIcon sx={{ color: '#9c27b0' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Branding
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Customize your facility's branding that appears on all reports
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={2}>
                    <Box flex="1" minWidth="200px">
                      <TextField
                        fullWidth
                        label="Facility Name"
                        value={applicationSettings.branding.facilityName}
                        onChange={(e) => setApplicationSettings((prev: any) => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            facilityName: e.target.value
                          }
                        }))}
                      />
                    </Box>
                    <Box flex="1" minWidth="200px">
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="logo-upload"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // In a real app, upload to server
                            setApplicationSettings((prev: any) => ({
                              ...prev,
                              branding: {
                                ...prev.branding,
                                logoUrl: URL.createObjectURL(file)
                              }
                            }));
                          }
                        }}
                      />
                      <label htmlFor="logo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<UploadIcon />}
                          fullWidth
                        >
                          Upload Logo
                        </Button>
                      </label>
                    </Box>
                    <Box flex="1" minWidth="200px">
                      <TextField
                        fullWidth
                        label="Primary Color"
                        type="color"
                        value={applicationSettings.branding.primaryColor}
                        onChange={(e) => setApplicationSettings((prev: any) => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            primaryColor: e.target.value
                          }
                        }))}
                      />
                    </Box>
                    <Box flex="1" minWidth="200px">
                      <TextField
                        fullWidth
                        label="Secondary Color"
                        type="color"
                        value={applicationSettings.branding.secondaryColor}
                        onChange={(e) => setApplicationSettings((prev: any) => ({
                          ...prev,
                          branding: {
                            ...prev.branding,
                            secondaryColor: e.target.value
                          }
                        }))}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Stack>

      {/* Dialogs */}
      
      {/* Save Confirmation Dialog */}
      <Dialog open={saveDialog} onClose={() => setSaveDialog(false)}>
        <DialogTitle>Save All Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to save all changes? This will update your preferences, 
            application settings, and system configuration.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveAllSettings} variant="contained">
            Save All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialog} onClose={() => setResetDialog(false)}>
        <DialogTitle>Reset All Settings</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>
          <Typography>
            Are you sure you want to reset all settings to their default values? 
            This will affect preferences, favorites, custom codes, and all other configurations.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog(false)}>Cancel</Button>
          <Button onClick={handleResetAllSettings} color="error" variant="contained">
            Reset All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Custom Code Dialog */}
      <Dialog open={newCodeDialog} onClose={() => setNewCodeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Custom Code</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Code"
              value={newCode.code}
              onChange={(e) => setNewCode((prev: any) => ({ ...prev, code: e.target.value }))}
              placeholder="e.g., MALARIA-001"
            />
            <TextField
              fullWidth
              label="Description"
              value={newCode.description}
              onChange={(e) => setNewCode((prev: any) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Malaria - Uncomplicated"
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newCode.category}
                onChange={(e) => setNewCode((prev: any) => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="Infectious Disease">Infectious Disease</MenuItem>
                <MenuItem value="Cardiovascular">Cardiovascular</MenuItem>
                <MenuItem value="Respiratory">Respiratory</MenuItem>
                <MenuItem value="Neurological">Neurological</MenuItem>
                <MenuItem value="Orthopedic">Orthopedic</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCodeDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCustomCode} variant="contained">
            Add Code
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsManagement;