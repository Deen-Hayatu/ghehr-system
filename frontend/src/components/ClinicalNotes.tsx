import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Alert,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Notes as NotesIcon,
  Psychology as AIIcon,
  // ...existing code...
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { AdinkraSymbols } from '../theme/ghanaTheme';
import axios from 'axios';
import { debounce } from 'lodash';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Types
interface ClinicalNote {
  id: string;
  patientId: string;
  providerId: string;
  content: string;
  diagnosis?: string;
  treatment?: string;
  symptoms: string[];
  aiSuggestions: { [condition: string]: number };
  confidence: { [condition: string]: number };
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
}

interface AIInsights {
  suggestedConditions: Array<{
    condition: string;
    confidence: number;
    reasoning: string;
  }>;
  extractedSymptoms: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  treatmentRecommendations: string[];
  culturalGuidance: string[];
  riskFactors: string[];
  followUpInstructions: string[];
}

const ClinicalNotes: React.FC = () => {
  const theme = useTheme();
  const { token } = useAuth();

  // State management
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    patientId: '',
    content: '',
    diagnosis: '',
    treatment: '',
  });

  // AI Analysis state
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Debounced AI analysis function
  const analyzeText = useCallback(
    debounce(async (text: string) => {
      if (text.length < 10) return; // Don't analyze very short text
      
      setAnalyzing(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/notes/analyze`, { text }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data.success) {
          const data = response.data.data;
          
          // Handle both old and new response formats
          const normalizedInsights: AIInsights = {
            suggestedConditions: data.suggestedConditions || 
              (data.suggestions ? data.suggestions.map(([condition, confidence]: [string, number]) => ({
                condition,
                confidence,
                reasoning: `Based on symptom analysis and Ghana medical patterns`
              })) : []),
            extractedSymptoms: data.extractedSymptoms || data.symptoms || [],
            severity: data.severity || 'mild',
            urgencyLevel: data.urgencyLevel || 'low',
            treatmentRecommendations: data.treatmentRecommendations || data.recommendations || [],
            culturalGuidance: data.culturalGuidance || [],
            riskFactors: data.riskFactors || [],
            followUpInstructions: data.followUpInstructions || []
          };
          
          setAiInsights(normalizedInsights);
        }
      } catch (error) {
        console.error('Error analyzing text:', error);
      } finally {
        setAnalyzing(false);
      }
    }, 500),
    [token]
  );

  // Handle content change with AI analysis
  const handleContentChange = (value: string) => {
    setFormData({ ...formData, content: value });
    analyzeText(value);
  };

  // Fetch clinical notes
  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams();
      if (selectedPatient) {
        params.append('patientId', selectedPatient);
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/notes?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        console.log('✅ Clinical notes loaded:', response.data.data.notes);
        setNotes(response.data.data.notes);
      } else {
        setError('Failed to fetch clinical notes');
      }
    } catch (error: any) {
      console.error('Error fetching notes:', error);
      setError(error.response?.data?.error?.message || 'Error fetching notes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patients
  const fetchPatients = async () => {
    try {
      if (!token) {
        console.warn('No token available for fetching patients');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/patients?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        console.log('✅ Patients loaded for clinical notes:', response.data.data.patients);
        setPatients(response.data.data.patients);
      } else {
        console.error('❌ Failed to fetch patients:', response.data);
      }
    } catch (error: any) {
      console.error('Error fetching patients:', error);
    }
  };

  // Handle note creation
  const handleCreateNote = async () => {
    try {
      setError(null);
      
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await axios.post(`${API_BASE_URL}/api/notes`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        console.log('✅ Clinical note created successfully');
        await fetchNotes();
        setAddDialogOpen(false);
        setFormData({
          patientId: '',
          content: '',
          diagnosis: '',
          treatment: '',
        });
        setAiInsights(null);
      }
    } catch (error: any) {
      console.error('Error creating note:', error);
      setError(error.response?.data?.error?.message || 'Error creating note');
    }
  };

  // Get patient name
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId || p.patientId === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : patientId;
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'error';
    if (confidence >= 0.4) return 'warning';
    return 'info';
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'severe': return 'warning';
      case 'moderate': return 'info';
      case 'mild': return 'success';
      default: return 'default';
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Handle view note
  const handleViewNote = (note: ClinicalNote) => {
    setSelectedNote(note);
    setViewDialogOpen(true);
  };

  useEffect(() => {
    fetchNotes();
    fetchPatients();
  }, [selectedPatient]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              mr: 2,
            }}
          >
            <NotesIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              Clinical Notes with AI Insights
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enhanced documentation with Ghana-specific medical AI
            </Typography>
          </Box>
          <Box sx={{ color: theme.palette.secondary.main, fontSize: '2rem' }}>
            <AdinkraSymbols.Dwennimmen />
          </Box>
        </Box>
      </Box>

      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Patient</InputLabel>
              <Select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                label="Patient"
              >
                <MenuItem value="">All Patients</MenuItem>
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} ({patient.patientId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchNotes}
              size="small"
            >
              Refresh
            </Button>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              }}
            >
              New Clinical Note
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Notes Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Patient</strong></TableCell>
                  <TableCell><strong>Content</strong></TableCell>
                  <TableCell><strong>AI Insights</strong></TableCell>
                  <TableCell><strong>Provider</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : notes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">No clinical notes found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  notes.map((note) => (
                    <TableRow key={note.id} hover>
                      <TableCell>
                        {new Date(note.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getPatientName(note.patientId)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {note.content}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {Object.entries(note.aiSuggestions || {})
                            .filter(([_, confidence]) => confidence > 0.3)
                            .slice(0, 2)
                            .map(([condition, confidence]) => (
                              <Chip
                                key={condition}
                                label={`${condition} (${Math.round(confidence * 100)}%)`}
                                size="small"
                                color={getConfidenceColor(confidence) as any}
                                variant="outlined"
                                icon={<AIIcon />}
                              />
                            ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {note.providerId}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewNote(note)}
                            color="primary"
                          >
                            <SearchIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Note Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotesIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              New Clinical Note
            </Typography>
            {analyzing && <CircularProgress size={20} sx={{ ml: 2 }} />}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr',
              gap: 2
            }}>
              <FormControl fullWidth>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  label="Patient"
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} ({patient.patientId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Clinical Notes"
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                multiline
                rows={6}
                fullWidth
                placeholder="Describe patient's symptoms, examination findings, and observations..."
                helperText="AI will analyze your notes and suggest possible conditions as you type"
              />

              {/* AI Insights Panel */}
              {aiInsights && (
                <Card sx={{ 
                  background: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AIIcon color="info" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="info.main">
                        AI Medical Insights
                      </Typography>
                    </Box>

                    {aiInsights.suggestedConditions.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Suggested Conditions:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {aiInsights.suggestedConditions.map((condition, index) => (
                            <Tooltip 
                              key={index} 
                              title={`${condition.reasoning} - Confidence: ${Math.round(condition.confidence * 100)}%`}
                            >
                              <Chip
                                label={`${condition.condition} (${Math.round(condition.confidence * 100)}%)`}
                                color={getConfidenceColor(condition.confidence) as any}
                                variant="filled"
                                size="small"
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {aiInsights.extractedSymptoms.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Extracted Symptoms:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {aiInsights.extractedSymptoms.join(', ')}
                        </Typography>
                      </Box>
                    )}

                    {/* Severity and Urgency Assessment */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Severity:
                        </Typography>
                        <Chip
                          label={aiInsights.severity.toUpperCase()}
                          size="small"
                          color={getSeverityColor(aiInsights.severity)}
                          variant="filled"
                        />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Urgency:
                        </Typography>
                        <Chip
                          label={aiInsights.urgencyLevel.toUpperCase()}
                          size="small"
                          color={getUrgencyColor(aiInsights.urgencyLevel)}
                          variant="filled"
                        />
                      </Box>
                    </Box>

                    {aiInsights.treatmentRecommendations.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <LightbulbIcon sx={{ mr: 0.5, fontSize: 16 }} />
                          Treatment Recommendations:
                        </Typography>
                        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                          {aiInsights.treatmentRecommendations.map((rec, index) => (
                            <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                              {rec}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {aiInsights.culturalGuidance.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          🏠 Cultural Guidance:
                        </Typography>
                        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                          {aiInsights.culturalGuidance.map((guidance, index) => (
                            <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                              {guidance}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {aiInsights.riskFactors.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <WarningIcon sx={{ mr: 0.5, fontSize: 16, color: 'warning.main' }} />
                          Risk Factors:
                        </Typography>
                        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                          {aiInsights.riskFactors.map((risk, index) => (
                            <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                              {risk}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {aiInsights.followUpInstructions.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          📅 Follow-up Instructions:
                        </Typography>
                        <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                          {aiInsights.followUpInstructions.map((instruction, index) => (
                            <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                              {instruction}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
              
              <TextField
                label="Diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                fullWidth
                placeholder="Primary and secondary diagnoses"
              />
              
              <TextField
                label="Treatment Plan"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                multiline
                rows={3}
                fullWidth
                placeholder="Prescribed medications, follow-up instructions, etc."
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateNote}
            disabled={!formData.patientId || !formData.content}
            startIcon={<SaveIcon />}
          >
            Save Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Note Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Clinical Note Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedNote && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Patient:</strong> {getPatientName(selectedNote.patientId)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Date:</strong> {new Date(selectedNote.createdAt).toLocaleDateString()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" gutterBottom>
                <strong>Clinical Notes:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {selectedNote.content}
              </Typography>
              
              {selectedNote.diagnosis && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Diagnosis:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedNote.diagnosis}
                  </Typography>
                </>
              )}
              
              {selectedNote.treatment && (
                <>
                  <Typography variant="body1" gutterBottom>
                    <strong>Treatment:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {selectedNote.treatment}
                  </Typography>
                </>
              )}

              {/* AI Insights */}
              {Object.keys(selectedNote.aiSuggestions || {}).length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <AIIcon sx={{ mr: 1 }} />
                    <strong>AI Analysis:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(selectedNote.aiSuggestions).map(([condition, confidence]) => (
                      <Chip
                        key={condition}
                        label={`${condition} (${Math.round(confidence * 100)}%)`}
                        color={getConfidenceColor(confidence) as any}
                        size="small"
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClinicalNotes;
