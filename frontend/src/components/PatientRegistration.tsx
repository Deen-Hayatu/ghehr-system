import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocalHospital as HospitalIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { AdinkraSymbols } from '../theme/ghanaTheme';

// Ghana regions and common districts
const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Central', 'Eastern', 'Volta',
  'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo', 'Western North',
  'Savannah', 'North East', 'Bono', 'Bono East', 'Oti'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const LANGUAGES = [
  'English', 'Twi', 'Ga', 'Ewe', 'Fante', 'Hausa', 'Dagbani', 'Other'
];

const RELATIONSHIPS = [
  'Spouse', 'Parent', 'Child', 'Sibling', 'Relative', 'Friend', 'Other'
];

interface PatientFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  
  // Identification
  ghanaCardNumber: string;
  nhisNumber: string;
  votersId: string;
  
  // Contact Information
  phoneNumber: string;
  alternativePhone: string;
  email: string;
  
  // Address
  region: string;
  district: string;
  town: string;
  area: string;
  houseNumber: string;
  landmark: string;
  digitalAddress: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  
  // Medical Information
  bloodGroup: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  preferredLanguage: string;
}

interface PatientRegistrationProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
  editMode?: boolean;
  patientData?: any; // Patient data for editing
}

const steps = [
  'Personal Information',
  'Contact & Address',
  'Emergency Contact',
  'Medical Information'
];

const PatientRegistration: React.FC<PatientRegistrationProps> = ({
  open,
  onClose,
  onSubmit,
  editMode = false,
  patientData = null
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  
  // Function to get initial form data
  const getInitialFormData = (): PatientFormData => {
    if (editMode && patientData) {
      return {
        firstName: patientData.firstName || '',
        lastName: patientData.lastName || '',
        middleName: patientData.middleName || '',
        dateOfBirth: patientData.dateOfBirth || '',
        gender: patientData.gender || '',
        nationality: patientData.nationality || 'Ghana',
        ghanaCardNumber: patientData.ghanaCardNumber || '',
        nhisNumber: patientData.nhisNumber || '',
        votersId: patientData.votersId || '',
        phoneNumber: patientData.phoneNumber || '',
        alternativePhone: patientData.alternativePhone || '',
        email: patientData.email || '',
        region: patientData.address?.region || '',
        district: patientData.address?.district || '',
        town: patientData.address?.town || '',
        area: patientData.address?.area || '',
        houseNumber: patientData.address?.houseNumber || '',
        landmark: patientData.address?.landmark || '',
        digitalAddress: patientData.address?.digitalAddress || '',
        emergencyContactName: patientData.emergencyContact?.name || '',
        emergencyContactRelationship: patientData.emergencyContact?.relationship || '',
        emergencyContactPhone: patientData.emergencyContact?.phoneNumber || '',
        bloodGroup: patientData.bloodGroup || '',
        allergies: Array.isArray(patientData.allergies) ? patientData.allergies.join(', ') : '',
        chronicConditions: Array.isArray(patientData.chronicConditions) ? patientData.chronicConditions.join(', ') : '',
        currentMedications: Array.isArray(patientData.currentMedications) ? patientData.currentMedications.join(', ') : '',
        preferredLanguage: patientData.preferredLanguage || 'English'
      };
    }
    
    return {
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      gender: '',
      nationality: 'Ghana',
      ghanaCardNumber: '',
      nhisNumber: '',
      votersId: '',
      phoneNumber: '',
      alternativePhone: '',
      email: '',
      region: '',
      district: '',
      town: '',
      area: '',
      houseNumber: '',
      landmark: '',
      digitalAddress: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      bloodGroup: '',
      allergies: '',
      chronicConditions: '',
      currentMedications: '',
      preferredLanguage: 'English'
    };
  };

  const [formData, setFormData] = useState<PatientFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Partial<PatientFormData>>({});

  // Reset form data when dialog opens or patient data changes
  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData());
      setActiveStep(0);
      setErrors({});
    }
  }, [open, editMode, patientData]);

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<PatientFormData> = {};

    switch (step) {
      case 0: // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        break;
      
      case 1: // Contact & Address
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        else if (!/^\+233[0-9]{9}$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Phone number must be in format +233XXXXXXXXX';
        }
        if (!formData.region) newErrors.region = 'Region is required';
        if (!formData.district.trim()) newErrors.district = 'District is required';
        if (!formData.town.trim()) newErrors.town = 'Town is required';
        break;
      
      case 2: // Emergency Contact
        if (!formData.emergencyContactName.trim()) {
          newErrors.emergencyContactName = 'Emergency contact name is required';
        }
        if (!formData.emergencyContactRelationship) {
          newErrors.emergencyContactRelationship = 'Relationship is required';
        }
        if (!formData.emergencyContactPhone.trim()) {
          newErrors.emergencyContactPhone = 'Emergency contact phone is required';
        } else if (!/^\+233[0-9]{9}$/.test(formData.emergencyContactPhone)) {
          newErrors.emergencyContactPhone = 'Phone number must be in format +233XXXXXXXXX';
        }
        break;
      
      case 3: // Medical Information (optional fields, just validate format)
        // All fields are optional in this step
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      gender: '',
      nationality: 'Ghana',
      ghanaCardNumber: '',
      nhisNumber: '',
      votersId: '',
      phoneNumber: '',
      alternativePhone: '',
      email: '',
      region: '',
      district: '',
      town: '',
      area: '',
      houseNumber: '',
      landmark: '',
      digitalAddress: '',
      emergencyContactName: '',
      emergencyContactRelationship: '',
      emergencyContactPhone: '',
      bloodGroup: '',
      allergies: '',
      chronicConditions: '',
      currentMedications: '',
      preferredLanguage: 'English'
    });
    setErrors({});
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonAddIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Personal Information
            </Typography>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="First Name *"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
              <TextField
                fullWidth
                label="Last Name *"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
              <TextField
                fullWidth
                label="Middle Name"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
              />
              <TextField
                fullWidth
                label="Date of Birth *"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel>Gender *</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  label="Gender *"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.gender && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
              <TextField
                fullWidth
                label="Nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
              />
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom color="primary">
              Identification Numbers (Optional)
            </Typography>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Ghana Card Number"
                value={formData.ghanaCardNumber}
                onChange={(e) => handleInputChange('ghanaCardNumber', e.target.value)}
                placeholder="GHA-XXXXXXXXX-X"
              />
              <TextField
                fullWidth
                label="NHIS Number"
                value={formData.nhisNumber}
                onChange={(e) => handleInputChange('nhisNumber', e.target.value)}
                placeholder="NHIS-XXXXXXXXX"
              />
              <TextField
                fullWidth
                label="Voter's ID"
                value={formData.votersId}
                onChange={(e) => handleInputChange('votersId', e.target.value)}
              />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Contact Information
            </Typography>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                label="Primary Phone Number *"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber || 'Format: +233XXXXXXXXX'}
                placeholder="+233244123456"
              />
              <TextField
                fullWidth
                label="Alternative Phone"
                value={formData.alternativePhone}
                onChange={(e) => handleInputChange('alternativePhone', e.target.value)}
                placeholder="+233244123456"
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Address Information
            </Typography>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2,
              }}
            >
              <FormControl fullWidth error={!!errors.region}>
                <InputLabel>Region *</InputLabel>
                <Select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  label="Region *"
                >
                  {GHANA_REGIONS.map((region) => (
                    <MenuItem key={region} value={region}>
                      {region}
                    </MenuItem>
                  ))}
                </Select>
                {errors.region && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.region}
                  </Typography>
                )}
              </FormControl>
              <TextField
                fullWidth
                label="District *"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                error={!!errors.district}
                helperText={errors.district}
              />
              <TextField
                fullWidth
                label="Town/City *"
                value={formData.town}
                onChange={(e) => handleInputChange('town', e.target.value)}
                error={!!errors.town}
                helperText={errors.town}
              />
              <TextField
                fullWidth
                label="Area/Neighborhood"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
              />
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="House Number"
                value={formData.houseNumber}
                onChange={(e) => handleInputChange('houseNumber', e.target.value)}
              />
              <TextField
                fullWidth
                label="Landmark"
                value={formData.landmark}
                onChange={(e) => handleInputChange('landmark', e.target.value)}
              />
              <TextField
                fullWidth
                label="Digital Address"
                value={formData.digitalAddress}
                onChange={(e) => handleInputChange('digitalAddress', e.target.value)}
                placeholder="GH-123-4567"
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
              Emergency Contact Information
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please provide details of someone we can contact in case of emergency.
            </Alert>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                label="Contact Name *"
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                error={!!errors.emergencyContactName}
                helperText={errors.emergencyContactName}
              />
              <FormControl fullWidth error={!!errors.emergencyContactRelationship}>
                <InputLabel>Relationship *</InputLabel>
                <Select
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                  label="Relationship *"
                >
                  {RELATIONSHIPS.map((relationship) => (
                    <MenuItem key={relationship} value={relationship}>
                      {relationship}
                    </MenuItem>
                  ))}
                </Select>
                {errors.emergencyContactRelationship && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.emergencyContactRelationship}
                  </Typography>
                )}
              </FormControl>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Contact Phone Number *"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                error={!!errors.emergencyContactPhone}
                helperText={errors.emergencyContactPhone || 'Format: +233XXXXXXXXX'}
                placeholder="+233244123456"
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <HospitalIcon sx={{ mr: 1, color: theme.palette.success.main }} />
              Medical Information
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              This information is optional but helps provide better healthcare services.
            </Alert>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                mb: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Blood Group</InputLabel>
                <Select
                  value={formData.bloodGroup}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                  label="Blood Group"
                >
                  {BLOOD_GROUPS.map((group) => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Preferred Language</InputLabel>
                <Select
                  value={formData.preferredLanguage}
                  onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                  label="Preferred Language"
                >
                  {LANGUAGES.map((language) => (
                    <MenuItem key={language} value={language}>
                      {language}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Known Allergies"
                multiline
                rows={2}
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="List any known allergies (medications, foods, etc.)"
              />
              <TextField
                fullWidth
                label="Chronic Conditions"
                multiline
                rows={2}
                value={formData.chronicConditions}
                onChange={(e) => handleInputChange('chronicConditions', e.target.value)}
                placeholder="List any chronic medical conditions"
              />
              <TextField
                fullWidth
                label="Current Medications"
                multiline
                rows={2}
                value={formData.currentMedications}
                onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                placeholder="List current medications and dosages"
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '70vh',
          background: alpha(theme.palette.background.paper, 0.98),
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                mr: 2,
              }}
            >
              <PersonAddIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {editMode ? 'Edit Patient' : 'Register New Patient'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Step {activeStep + 1} of {steps.length}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ color: theme.palette.secondary.main }}>
            <AdinkraSymbols.GyeNyame />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<SaveIcon />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
            }}
          >
            Register Patient
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PatientRegistration;
