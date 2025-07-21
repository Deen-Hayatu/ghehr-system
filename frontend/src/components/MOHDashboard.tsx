
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableRow, 
  CircularProgress, 
  Divider,
  Avatar,
  useTheme,
  alpha,
  Chip,
  TableHead,
  Paper
} from '@mui/material';
import {
  LocalHospital,
  Security,
  VerifiedUser,
  Assessment,
  LocationOn,
  People,
  TrendingUp,
  Warning,
  CheckCircle
} from '@mui/icons-material';

export default function MOHDashboard() {
  const theme = useTheme();
  const [insights, setInsights] = useState<any>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [insightsRes, facilitiesRes] = await Promise.all([
          axios.get('/api/moh/insights'),
          axios.get('/api/moh/facilities'),
        ]);
        setInsights(insightsRes.data);
        setFacilities(facilitiesRes.data);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !insights) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
        <Typography sx={{ mt: 2, color: theme.palette.text.primary, fontSize: '1.1rem' }}>
          Loading MOH Dashboard...
        </Typography>
      </Box>
    );
  }

  // Facility distribution
  const facilityTypes = facilities.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalFacilities = facilities.length;

  // Disease surveillance
  const diseases = insights.disease_surveillance || [];

  return (
    <Box sx={{ 
      p: 3,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
      minHeight: '100vh'
    }}>
      {/* Header Section with Ghana styling */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              mr: 3,
            }}
          >
            <LocalHospital sx={{ color: 'white', fontSize: '2rem' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ 
              color: theme.palette.primary.main, 
              fontWeight: 700,
              mb: 1
            }}>
              Ghana MOH Dashboard
            </Typography>
            <Typography variant="subtitle1" sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 500
            }}>
              Ministry of Health Integration & Compliance Overview
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ 
          color: theme.palette.text.primary,
          maxWidth: '800px',
          lineHeight: 1.6
        }}>
          This dashboard shows compliance with Ghana MOH standards, disease surveillance data, and alignment with the Health Information System Strategic Plan (HISSP) 2025.
        </Typography>
      </Box>
      
      <Divider sx={{ my: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
      
      {/* Compliance Overview Cards */}
      <Typography variant="h5" sx={{ 
        mb: 3, 
        color: theme.palette.primary.main, 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center'
      }}>
        <VerifiedUser sx={{ mr: 1 }} />
        MOH Compliance Overview
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card elevation={4} sx={{ 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
            color: '#FFF9E6', // Light cream color for better contrast against red
            borderRadius: 3,
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment sx={{ fontSize: '2rem', mr: 2, color: '#FFFBF0' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFFBF0' }}>MOH Compliance Score</Typography>
              </Box>
              <Typography variant="h2" sx={{ fontWeight: 700, mb: 1, color: '#FFFBF0' }}>
                {insights.compliance_score || 'N/A'}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, color: '#FFF9E6' }}>Overall System Compliance</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card elevation={4} sx={{ 
            borderRadius: 3,
            transition: 'transform 0.3s ease-in-out',
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.2)}`
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ fontSize: '1.8rem', mr: 2, color: theme.palette.secondary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  HISSP 2025 Alignment
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ 
                color: theme.palette.secondary.main, 
                fontWeight: 600,
                mb: 1
              }}>
                {insights.hissp_alignment || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Health Information System Strategic Plan compliance
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card elevation={4} sx={{ 
            borderRadius: 3,
            transition: 'transform 0.3s ease-in-out',
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.2)}`
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ fontSize: '1.8rem', mr: 2, color: theme.palette.success.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Data Protection Act
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ 
                color: theme.palette.success.main, 
                fontWeight: 600,
                mb: 1
              }}>
                {insights.data_protection_act || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Ghana Data Protection Act compliance
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Additional Compliance Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card elevation={4} sx={{ 
            borderRadius: 3,
            transition: 'transform 0.3s ease-in-out',
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.2)}`
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn sx={{ fontSize: '1.8rem', mr: 2, color: theme.palette.info.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Facility Registration
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ 
                color: theme.palette.info.main, 
                fontWeight: 600,
                mb: 1
              }}>
                {insights.facility_registration || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                MOH facility registration and licensing
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card elevation={4} sx={{ 
            borderRadius: 3,
            transition: 'transform 0.3s ease-in-out',
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.2)}`
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp sx={{ fontSize: '1.8rem', mr: 2, color: theme.palette.warning.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Lightwave Compatibility
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ 
                color: theme.palette.warning.main, 
                fontWeight: 600,
                mb: 1
              }}>
                {insights.lightwave_compatibility || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                National e-health system integration
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Divider sx={{ my: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
      
      {/* Disease Surveillance Section */}
      <Typography variant="h5" sx={{ 
        mb: 3, 
        color: theme.palette.primary.main, 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center'
      }}>
        <Warning sx={{ mr: 1 }} />
        Disease Surveillance (MOH Priority Diseases - Last 30 Days)
      </Typography>
      
      <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Disease</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Cases</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {diseases.map((d: any, idx: number) => (
              <TableRow key={idx} sx={{ 
                '&:nth-of-type(odd)': { bgcolor: alpha(theme.palette.secondary.main, 0.05) },
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
              }}>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  {d.name}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={d.status} 
                    color={d.status === 'Critical' ? 'error' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '1.1rem',
                  color: d.status === 'Critical' ? theme.palette.error.main : theme.palette.warning.main
                }}>
                  {d.count}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary }}>{d.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      
      {/* Facility Distribution Section */}
      <Typography variant="h5" sx={{ 
        mb: 3, 
        color: theme.palette.primary.main, 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center'
      }}>
        <LocalHospital sx={{ mr: 1 }} />
        Facility Distribution (MOH Registered Healthcare Facilities)
      </Typography>
      
      <Paper elevation={6} sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>Facility Type</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(facilityTypes).map(([type, count]) => (
              <TableRow key={type} sx={{ 
                '&:nth-of-type(odd)': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.05) }
              }}>
                <TableCell sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.text.primary,
                  textTransform: 'capitalize'
                }}>
                  {type}
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  fontSize: '1.1rem',
                  color: theme.palette.secondary.main
                }}>
                  {Number(count)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                fontSize: '1.1rem'
              }}>
                Total Registered Facilities
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '1.2rem',
                color: theme.palette.primary.main
              }}>
                {totalFacilities}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
      
      {/* Patient Registration Section */}
      <Divider sx={{ my: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
      
      <Typography variant="h5" sx={{ 
        mb: 3, 
        color: theme.palette.primary.main, 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center'
      }}>
        <People sx={{ mr: 1 }} />
        Patient Registration Overview
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card elevation={4} sx={{ 
            borderRadius: 3,
            transition: 'transform 0.3s ease-in-out',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ fontSize: '1.8rem', mr: 2, color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Total Patients Registered
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                color: theme.palette.primary.main, 
                fontWeight: 700,
                mb: 1
              }}>
                {insights.total_patients || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card elevation={4} sx={{ 
            borderRadius: 3,
            transition: 'transform 0.3s ease-in-out',
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.2)}`
            }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VerifiedUser sx={{ fontSize: '1.8rem', mr: 2, color: theme.palette.success.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  NHIS Integration
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ 
                color: theme.palette.success.main, 
                fontWeight: 700,
                mb: 1
              }}>
                {insights.nhis_integration || 'N/A'}%
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                of patients have valid NHIS numbers
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      <Divider sx={{ my: 4, bgcolor: alpha(theme.palette.primary.main, 0.1) }} />
      
      <Box sx={{ 
        p: 3, 
        bgcolor: alpha(theme.palette.success.main, 0.1),
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
      }}>
        <Typography variant="body1" sx={{ 
          color: theme.palette.text.primary,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center'
        }}>
          <CheckCircle sx={{ mr: 2, color: theme.palette.success.main }} />
          MOH Patient IDs: Ready for Lightwave integration
        </Typography>
      </Box>
    </Box>
  );
}
