import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import {
  Business as HospitalIcon,
  People as UsersIcon,
  Payment as SubscriptionIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { CommonHeader } from './CommonHeader';
import HospitalManagement from './manage/HospitalManagement';
import UsersManagement from './manage/UsersManagement';
import SubscriptionManagement from './manage/SubscriptionManagement';
import SettingsManagement from './manage/SettingsManagement';

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
      id={`manage-tabpanel-${index}`}
      aria-labelledby={`manage-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ManageManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const tabConfig = [
    {
      label: 'Hospital',
      icon: HospitalIcon,
      description: 'Storage, Lab Orders, Pharmacy Orders & Audit Trails',
      color: '#1976d2',
    },
    {
      label: 'Users',
      icon: UsersIcon,
      description: 'User Management, Roles & Permissions',
      color: '#388e3c',
    },
    {
      label: 'Subscription',
      icon: SubscriptionIcon,
      description: 'Payment Management & Plan Upgrades',
      color: '#f57c00',
    },
    {
      label: 'Settings',
      icon: SettingsIcon,
      description: 'Preferences, Branding & Application Settings',
      color: '#7b1fa2',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <CommonHeader 
        title="MANAGE - Practice Management"
        subtitle="Comprehensive healthcare facility management system"
      />
      
      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Welcome Card */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
              🏥 Welcome to MANAGE Management
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Your comprehensive practice management hub for hospital operations, user management, 
              subscription billing, and system settings.
            </Typography>
          </CardContent>
        </Card>

        {/* Main Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 80,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                flexDirection: 'column',
                gap: 1,
              },
            }}
          >
            {tabConfig.map((tab, index) => {
              const IconComponent = tab.icon;
              return (
                <Tab
                  key={index}
                  icon={
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
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
                          fontSize: 24 
                        }} 
                      />
                    </Box>
                  }
                  label={
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {tab.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tab.description}
                      </Typography>
                    </Box>
                  }
                />
              );
            })}
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <HospitalManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <UsersManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <SubscriptionManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <SettingsManagement />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default ManageManagement;
