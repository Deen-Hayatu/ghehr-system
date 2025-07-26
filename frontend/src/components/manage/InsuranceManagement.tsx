import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  VerifiedUser as EligibilityIcon,
  Assignment as PreAuthIcon,
  Description as ClaimIcon,
  AccountBalance as BillingIcon,
} from '@mui/icons-material';
import EligibilityCheck from './insurance/EligibilityCheck';
import PreAuthorization from './insurance/PreAuthorization';
import ClaimCreation from './insurance/ClaimCreation';
import BillingProvider from './insurance/BillingProvider';

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
      id={`insurance-tabpanel-${index}`}
      aria-labelledby={`insurance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const InsuranceManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const insuranceTabConfig = [
    {
      label: 'Eligibility Check',
      icon: EligibilityIcon,
      color: '#2196f3',
    },
    {
      label: 'Pre-authorization',
      icon: PreAuthIcon,
      color: '#ff9800',
    },
    {
      label: 'Claim Creation',
      icon: ClaimIcon,
      color: '#4caf50',
    },
    {
      label: 'Billing Provider',
      icon: BillingIcon,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      {/* Insurance Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          🛡️ Insurance Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive insurance workflow management for eligibility verification, 
          pre-authorization, claims processing, and billing provider coordination.
        </Typography>
      </Box>

      {/* Insurance Sub-Navigation */}
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
          {insuranceTabConfig.map((tab, index) => {
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

      {/* Insurance Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <EligibilityCheck />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <PreAuthorization />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <ClaimCreation />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <BillingProvider />
      </TabPanel>
    </Box>
  );
};

export default InsuranceManagement;
