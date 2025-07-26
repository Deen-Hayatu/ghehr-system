import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  SupervisorAccount as AdminIcon,
  LocalHospital as DoctorIcon,
  Science as LabIcon,
  Desk as FrontDeskIcon,
  LocalPharmacy as PharmacyIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// User interface
interface User {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'doctor' | 'nurse' | 'lab-technician' | 'front-desk' | 'pharmacy';
  status: 'active' | 'suspended' | 'deactivated' | 'not-activated';
  facilityId: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

const UsersManagement: React.FC = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    role: 'nurse' as User['role'],
    status: 'not-activated' as User['status'],
    password: '',
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Authentication required');
        return;
      }

      // For now, using mock data until backend API is ready
      const mockUsers: User[] = [
        {
          id: '1',
          userId: 'USR-001',
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@ghehr.com',
          role: 'admin',
          status: 'active',
          facilityId: 'FAC-001',
          lastLogin: '2025-07-23T08:30:00Z',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-07-23T08:30:00Z',
        },
        {
          id: '2',
          userId: 'USR-002',
          username: 'dr.asante',
          firstName: 'Kwame',
          lastName: 'Asante',
          email: 'k.asante@ghehr.com',
          role: 'doctor',
          status: 'active',
          facilityId: 'FAC-001',
          lastLogin: '2025-07-23T07:15:00Z',
          createdAt: '2025-01-15T00:00:00Z',
          updatedAt: '2025-07-23T07:15:00Z',
        },
        {
          id: '3',
          userId: 'USR-003',
          username: 'nurse.osei',
          firstName: 'Ama',
          lastName: 'Osei',
          email: 'a.osei@ghehr.com',
          role: 'nurse',
          status: 'active',
          facilityId: 'FAC-001',
          lastLogin: '2025-07-22T16:45:00Z',
          createdAt: '2025-02-01T00:00:00Z',
          updatedAt: '2025-07-22T16:45:00Z',
        },
        {
          id: '4',
          userId: 'USR-004',
          username: 'lab.tech1',
          firstName: 'Kofi',
          lastName: 'Mensah',
          email: 'k.mensah@ghehr.com',
          role: 'lab-technician',
          status: 'suspended',
          facilityId: 'FAC-001',
          lastLogin: '2025-07-20T14:20:00Z',
          createdAt: '2025-03-01T00:00:00Z',
          updatedAt: '2025-07-21T09:00:00Z',
        },
        {
          id: '5',
          userId: 'USR-005',
          username: 'frontdesk1',
          firstName: 'Akosua',
          lastName: 'Darko',
          email: 'a.darko@ghehr.com',
          role: 'front-desk',
          status: 'not-activated',
          facilityId: 'FAC-001',
          createdAt: '2025-07-20T00:00:00Z',
          updatedAt: '2025-07-20T00:00:00Z',
        },
      ];

      setUsers(mockUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.error?.message || 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Role configurations
  const roleConfig = {
    admin: { icon: AdminIcon, color: '#d32f2f', label: 'Administrator' },
    doctor: { icon: DoctorIcon, color: '#1976d2', label: 'Doctor' },
    nurse: { icon: PersonAddIcon, color: '#388e3c', label: 'Nurse' },
    'lab-technician': { icon: LabIcon, color: '#f57c00', label: 'Lab Technician' },
    'front-desk': { icon: FrontDeskIcon, color: '#7b1fa2', label: 'Front Desk' },
    pharmacy: { icon: PharmacyIcon, color: '#00796b', label: 'Pharmacy' },
  };

  // Status configurations
  const statusConfig = {
    active: { color: 'success', label: 'Active' },
    suspended: { color: 'warning', label: 'Suspended' },
    deactivated: { color: 'error', label: 'Deactivated' },
    'not-activated': { color: 'default', label: 'Not Activated' },
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // For now, just add to local state (backend integration later)
      if (editingUser) {
        // Update existing user
        setUsers(prev => prev.map(u => 
          u.id === editingUser.id 
            ? { ...u, ...formData, updatedAt: new Date().toISOString() }
            : u
        ));
      } else {
        // Add new user
        const newUser: User = {
          id: Date.now().toString(),
          userId: `USR-${String(users.length + 1).padStart(3, '0')}`,
          ...formData,
          facilityId: user?.facilityId || 'FAC-001',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUsers(prev => [...prev, newUser]);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  // Dialog handlers
  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'nurse',
        status: 'not-activated',
        password: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setError(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          👥 Users Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#388e3c' }}
        >
          Add New User
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {users.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {users.filter(u => u.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {users.filter(u => u.status === 'suspended').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suspended
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.secondary">
                {users.filter(u => u.status === 'not-activated').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Not Activated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>User ID</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Last Login</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => {
                  const RoleIcon = roleConfig[user.role].icon;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>{user.userId}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <RoleIcon 
                            sx={{ 
                              color: roleConfig[user.role].color, 
                              fontSize: 20 
                            }} 
                          />
                          {user.firstName} {user.lastName}
                        </Box>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Chip 
                          label={roleConfig[user.role].label}
                          size="small"
                          sx={{ 
                            backgroundColor: roleConfig[user.role].color,
                            color: 'white'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={statusConfig[user.status].label}
                          color={statusConfig[user.status].color as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit User">
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDialog(user)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  >
                    {Object.entries(roleConfig).map(([role, config]) => (
                      <MenuItem key={role} value={role}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <config.icon sx={{ fontSize: 20, color: config.color }} />
                          {config.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                  >
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <MenuItem key={status} value={status}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {!editingUser && (
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    helperText="Password will be required for new users"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.firstName || !formData.lastName || !formData.username || !formData.email || (!editingUser && !formData.password)}
          >
            {editingUser ? 'Update' : 'Create'} User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersManagement;