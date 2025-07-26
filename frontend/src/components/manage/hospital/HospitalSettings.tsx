import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Avatar,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  LocalHospital as HospitalIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import HospitalConfigService, { HospitalConfig } from '../../../services/HospitalConfigService';

const HospitalSettings: React.FC = () => {
  const [currentConfig, setCurrentConfig] = useState<HospitalConfig>(
    HospitalConfigService.getCurrentConfig()
  );
  const [availableHospitals, setAvailableHospitals] = useState<HospitalConfig[]>([]);
  const [editDialog, setEditDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<HospitalConfig | null>(null);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setAvailableHospitals(HospitalConfigService.getAvailableHospitals());
  }, []);

  const handleSwitchHospital = (hospitalId: string) => {
    const success = HospitalConfigService.switchHospital(hospitalId);
    if (success) {
      setCurrentConfig(HospitalConfigService.getCurrentConfig());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleEditConfig = (config?: HospitalConfig) => {
    setEditingConfig(config || currentConfig);
    setEditDialog(true);
  };

  const handleSaveConfig = () => {
    if (editingConfig) {
      HospitalConfigService.setCurrentConfig(editingConfig);
      setCurrentConfig(editingConfig);
      setEditDialog(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleUpdateEditingConfig = (field: keyof HospitalConfig, value: any) => {
    if (editingConfig) {
      setEditingConfig({
        ...editingConfig,
        [field]: value
      });
    }
  };

  const handleUpdateColors = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    if (editingConfig) {
      setEditingConfig({
        ...editingConfig,
        colors: {
          ...editingConfig.colors,
          [colorType]: value
        }
      });
    }
  };

  const generatePreviewHTML = (config: HospitalConfig) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Preview - ${config.name}</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.4; 
          }
          .header {
            text-align: center;
            border-bottom: 3px solid ${config.colors.primary};
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary});
            border-radius: 50%;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: ${config.colors.primary};
            margin-bottom: 5px;
          }
          .hospital-tagline {
            font-size: 14px;
            color: #666;
            font-style: italic;
          }
          .contact-info {
            font-size: 12px;
            color: #888;
            margin-top: 10px;
          }
          .document-title {
            font-size: 20px;
            font-weight: bold;
            color: ${config.colors.primary};
            margin-top: 15px;
          }
          .sample-content {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">${config.logoEmoji}</div>
          <div class="hospital-name">${config.name}</div>
          <div class="hospital-tagline">${config.tagline}</div>
          <div class="contact-info">
            ${config.address} • ${config.phone}
            ${config.email ? ` • ${config.email}` : ''}
            ${config.license ? `<br>License: ${config.license}` : ''}
          </div>
          <div class="document-title">SAMPLE MEDICAL FORM</div>
        </div>
        
        <div class="sample-content">
          <h3 style="color: ${config.colors.primary};">This is how your forms will look</h3>
          <p>Patient forms, lab orders, and pharmacy orders will use this branding.</p>
          <p><strong>Primary Color:</strong> ${config.colors.primary}</p>
          <p><strong>Secondary Color:</strong> ${config.colors.secondary}</p>
          <p><strong>Currency:</strong> ${config.currency}</p>
        </div>
      </body>
      </html>
    `;
  };

  const handlePreview = () => {
    setPreviewDialog(true);
  };

  const openPreviewWindow = () => {
    const previewContent = generatePreviewHTML(editingConfig || currentConfig);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(previewContent);
      printWindow.document.close();
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          🏥 Hospital Settings & Branding
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => handleEditConfig()}
          sx={{ backgroundColor: currentConfig.colors.primary }}
        >
          Edit Configuration
        </Button>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Hospital configuration updated successfully!
        </Alert>
      )}

      {/* Current Hospital Info */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Hospital Configuration
              </Typography>
              
              <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: currentConfig.colors.primary,
                    mr: 2,
                    fontSize: '24px'
                  }}
                >
                  {currentConfig.logoEmoji}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color={currentConfig.colors.primary}>
                    {currentConfig.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentConfig.tagline}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="body2">
                    <strong>Address:</strong> {currentConfig.address}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {currentConfig.phone}
                  </Typography>
                  {currentConfig.email && (
                    <Typography variant="body2">
                      <strong>Email:</strong> {currentConfig.email}
                    </Typography>
                  )}
                </Grid>
                <Grid size={6}>
                  <Typography variant="body2">
                    <strong>Currency:</strong> {currentConfig.currency}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Language:</strong> {currentConfig.language.toUpperCase()}
                  </Typography>
                  {currentConfig.license && (
                    <Typography variant="body2">
                      <strong>License:</strong> {currentConfig.license}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Brand Colors
              </Typography>
              <Box display="flex" gap={2}>
                <Chip
                  label="Primary"
                  sx={{ 
                    bgcolor: currentConfig.colors.primary, 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Chip
                  label="Secondary"
                  sx={{ 
                    bgcolor: currentConfig.colors.secondary, 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Chip
                  label="Accent"
                  sx={{ 
                    bgcolor: currentConfig.colors.accent, 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<PaletteIcon />}
                  onClick={handlePreview}
                  sx={{ mr: 2 }}
                >
                  Preview Forms
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => handleEditConfig()}
                >
                  Customize
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Switch Hospital
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select from pre-configured hospitals
              </Typography>
              
              <List>
                {availableHospitals.map((hospital) => (
                  <ListItem key={hospital.id} disablePadding>
                    <ListItemButton 
                      onClick={() => handleSwitchHospital(hospital.id)}
                      selected={hospital.id === currentConfig.id}
                    >
                      <Avatar sx={{ mr: 2, bgcolor: hospital.colors.primary }}>
                        {hospital.logoEmoji}
                      </Avatar>
                      <ListItemText
                        primary={hospital.name}
                        secondary={hospital.tagline}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Configuration Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Hospital Configuration
        </DialogTitle>
        <DialogContent>
          {editingConfig && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Hospital Name"
                  value={editingConfig.name}
                  onChange={(e) => handleUpdateEditingConfig('name', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Tagline"
                  value={editingConfig.tagline}
                  onChange={(e) => handleUpdateEditingConfig('tagline', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Logo Emoji"
                  value={editingConfig.logoEmoji}
                  onChange={(e) => handleUpdateEditingConfig('logoEmoji', e.target.value)}
                  placeholder="⚕️"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editingConfig.phone}
                  onChange={(e) => handleUpdateEditingConfig('phone', e.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={editingConfig.address}
                  onChange={(e) => handleUpdateEditingConfig('address', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  value={editingConfig.email || ''}
                  onChange={(e) => handleUpdateEditingConfig('email', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="License Number"
                  value={editingConfig.license || ''}
                  onChange={(e) => handleUpdateEditingConfig('license', e.target.value)}
                />
              </Grid>
              
              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" gutterBottom>Brand Colors</Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={editingConfig.colors.primary}
                  onChange={(e) => handleUpdateColors('primary', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={editingConfig.colors.secondary}
                  onChange={(e) => handleUpdateColors('secondary', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Accent Color"
                  type="color"
                  value={editingConfig.colors.accent}
                  onChange={(e) => handleUpdateColors('accent', e.target.value)}
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={editingConfig.currency}
                    label="Currency"
                    onChange={(e) => handleUpdateEditingConfig('currency', e.target.value)}
                  >
                    <MenuItem value="GHS">GHS (Ghana Cedi)</MenuItem>
                    <MenuItem value="USD">USD (US Dollar)</MenuItem>
                    <MenuItem value="EUR">EUR (Euro)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={editingConfig.language}
                    label="Language"
                    onChange={(e) => handleUpdateEditingConfig('language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="tw">Twi</MenuItem>
                    <MenuItem value="ga">Ga</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={openPreviewWindow} variant="outlined">
            Preview
          </Button>
          <Button onClick={handleSaveConfig} variant="contained" startIcon={<SaveIcon />}>
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HospitalSettings;
