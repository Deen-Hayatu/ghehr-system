import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  TrendingUp as RevenueIcon,
  Receipt as InvoiceIcon,
  CreditCard as CreditIcon,
  Upgrade as UpgradeIcon,
  CheckCircle as ActiveIcon,
  Warning as WarningIcon,
  Timeline as AnalyticsIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  features: string[];
  limits: {
    patients: number;
    storage: string;
    users: number;
  };
  isPopular?: boolean;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceNumber: string;
  paymentMethod: string;
}

interface UsageMetrics {
  patients: { current: number; limit: number };
  storage: { current: number; limit: string };
  users: { current: number; limit: number };
  apiCalls: { current: number; limit: number };
}

const SubscriptionManagement: React.FC = () => {
  const [currentPlan] = useState<SubscriptionPlan>({
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    billing: 'monthly',
    features: [
      'Unlimited Patients',
      'Unlimited Storage',
      'Advanced Analytics',
      'Priority Support',
      'Custom Integrations',
      'HIPAA Compliance',
      'Multi-location Support'
    ],
    limits: {
      patients: Number.POSITIVE_INFINITY,
      storage: 'Unlimited',
      users: 50
    }
  });

  const [usageMetrics] = useState<UsageMetrics>({
    patients: { current: 1247, limit: Number.POSITIVE_INFINITY },
    storage: { current: 156, limit: 'Unlimited' },
    users: { current: 12, limit: 50 },
    apiCalls: { current: 45689, limit: 100000 }
  });

  const [paymentHistory] = useState<PaymentRecord[]>([
    {
      id: 'PAY-001',
      date: '2025-07-01',
      amount: 299.00,
      plan: 'Enterprise Monthly',
      status: 'paid',
      invoiceNumber: 'INV-2025-001',
      paymentMethod: 'Mobile Money'
    },
    {
      id: 'PAY-002',
      date: '2025-06-01',
      amount: 299.00,
      plan: 'Enterprise Monthly',
      status: 'paid',
      invoiceNumber: 'INV-2025-002',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'PAY-003',
      date: '2025-05-01',
      amount: 299.00,
      plan: 'Enterprise Monthly',
      status: 'paid',
      invoiceNumber: 'INV-2025-003',
      paymentMethod: 'Mobile Money'
    }
  ]);

  const [availablePlans] = useState<SubscriptionPlan[]>([
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      billing: 'monthly',
      features: ['Up to 100 Patients', '10GB Storage', 'Basic Reports', 'Email Support'],
      limits: { patients: 100, storage: '10GB', users: 3 }
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 89,
      billing: 'monthly',
      features: ['Up to 500 Patients', '100GB Storage', 'Advanced Reports', 'Priority Support', 'Basic Analytics'],
      limits: { patients: 500, storage: '100GB', users: 10 },
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      billing: 'monthly',
      features: ['Unlimited Patients', 'Unlimited Storage', 'Advanced Analytics', 'Priority Support', 'Custom Integrations', 'HIPAA Compliance'],
      limits: { patients: Number.POSITIVE_INFINITY, storage: 'Unlimited', users: 50 }
    }
  ]);

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const totalRevenue = paymentHistory
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getUsagePercentage = (current: number, limit: number | string) => {
    if (limit === 'Unlimited' || limit === Number.POSITIVE_INFINITY) return 0;
    return Math.min((current / (limit as number)) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage > 90) return 'error';
    if (percentage > 70) return 'warning';
    return 'success';
  };

  const handleUpgrade = () => {
    setUpgradeDialogOpen(false);
    // Handle plan upgrade logic here
    console.log('Upgrading to plan:', selectedPlan);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          💳 Subscription & Billing Management
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size="small"
          >
            Export Invoices
          </Button>
          <Button
            variant="contained"
            startIcon={<UpgradeIcon />}
            onClick={() => setUpgradeDialogOpen(true)}
            sx={{ backgroundColor: '#f57c00' }}
          >
            Upgrade Plan
          </Button>
        </Box>
      </Box>

      {/* Current Plan Overview */}
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Current Plan:</strong> {currentPlan.name} - 
          <strong> GHS {currentPlan.price}.00/{currentPlan.billing}</strong> | 
          Next billing: August 1, 2025 | Auto-renewal: Enabled
        </Typography>
      </Alert>

      {/* Key Metrics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PaymentIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" color="primary">
                GHS {currentPlan.price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monthly Plan Cost
              </Typography>
              <Typography variant="caption" color="success.main">
                Active Subscription
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <RevenueIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
              <Typography variant="h4" color="primary">
                GHS {totalRevenue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue YTD
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {paymentHistory.filter(p => p.status === 'paid').length} payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AnalyticsIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {usageMetrics.patients.current}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Patients
              </Typography>
              <Typography variant="caption" color="success.main">
                Unlimited Plan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CreditIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
              <Typography variant="h4" color="primary">
                {usageMetrics.users.current}/{usageMetrics.users.limit}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {usageMetrics.users.limit - usageMetrics.users.current} remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Usage Analytics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Usage Analytics & Limits
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">Users</Typography>
                  <Typography variant="caption">
                    {usageMetrics.users.current} / {usageMetrics.users.limit}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={getUsagePercentage(usageMetrics.users.current, usageMetrics.users.limit)} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={getUsageColor(getUsagePercentage(usageMetrics.users.current, usageMetrics.users.limit)) as any}
                />
                <Typography variant="caption" color="text.secondary">
                  {getUsagePercentage(usageMetrics.users.current, usageMetrics.users.limit).toFixed(1)}% of plan limit
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">API Calls (Monthly)</Typography>
                  <Typography variant="caption">
                    {usageMetrics.apiCalls.current.toLocaleString()} / {usageMetrics.apiCalls.limit.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={getUsagePercentage(usageMetrics.apiCalls.current, usageMetrics.apiCalls.limit)} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={getUsageColor(getUsagePercentage(usageMetrics.apiCalls.current, usageMetrics.apiCalls.limit)) as any}
                />
                <Typography variant="caption" color="text.secondary">
                  {getUsagePercentage(usageMetrics.apiCalls.current, usageMetrics.apiCalls.limit).toFixed(1)}% of monthly limit
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">Storage</Typography>
                  <Typography variant="caption">
                    {usageMetrics.storage.current} GB / {usageMetrics.storage.limit}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={0} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="success"
                />
                <Typography variant="caption" color="success.main">
                  Unlimited storage on Enterprise plan
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">Patients</Typography>
                  <Typography variant="caption">
                    {usageMetrics.patients.current.toLocaleString()} / Unlimited
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={0} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="success"
                />
                <Typography variant="caption" color="success.main">
                  Unlimited patients on Enterprise plan
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            💰 Payment History & Invoices
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Invoice</strong></TableCell>
                  <TableCell><strong>Plan</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Payment Method</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {payment.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{payment.plan}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        GHS {payment.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status.toUpperCase()}
                        color={getStatusColor(payment.status) as any}
                        size="small"
                        icon={payment.status === 'paid' ? <ActiveIcon /> : <WarningIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<DownloadIcon />}>
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Upgrade Plan Dialog */}
      <Dialog open={upgradeDialogOpen} onClose={() => setUpgradeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upgrade Your Subscription Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {availablePlans.map((plan) => (
              <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedPlan === plan.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.isPopular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      size="small"
                      sx={{ position: 'absolute', top: -8, left: 16, zIndex: 1 }}
                    />
                  )}
                  {plan.id === currentPlan.id && (
                    <Chip
                      label="Current Plan"
                      color="success"
                      size="small"
                      sx={{ position: 'absolute', top: -8, right: 16, zIndex: 1 }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      GHS {plan.price}
                      <Typography component="span" variant="body2" color="text.secondary">
                        /{plan.billing}
                      </Typography>
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {plan.features.map((feature, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                          ✓ {feature}
                        </Typography>
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      • {plan.limits.patients === Number.POSITIVE_INFINITY ? 'Unlimited' : plan.limits.patients} Patients<br/>
                      • {plan.limits.storage} Storage<br/>
                      • {plan.limits.users} Users
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpgrade}
            variant="contained"
            disabled={!selectedPlan || selectedPlan === currentPlan.id}
          >
            {selectedPlan && selectedPlan !== currentPlan.id ? 'Upgrade Plan' : 'Select Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionManagement;