import express, { Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const facilityId = req.user?.facilityId;
    
    // Mock data - in production, calculate from database
    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      patientsToday: 12,
      appointmentsToday: 8,
      totalPatients: 156,
      pendingBills: 5,
      todayRevenue: 2400.00,
      monthlyRevenue: 45600.00,
      appointments: {
        scheduled: 15,
        completed: 8,
        cancelled: 2,
        noShow: 1,
      },
      patientsByAge: {
        '0-18': 23,
        '19-35': 45,
        '36-50': 52,
        '51-65': 28,
        '65+': 8,
      },
      commonDiagnoses: [
        { diagnosis: 'Malaria', count: 25 },
        { diagnosis: 'Hypertension', count: 18 },
        { diagnosis: 'Diabetes', count: 12 },
        { diagnosis: 'Respiratory Infection', count: 10 },
        { diagnosis: 'Gastroenteritis', count: 8 },
      ],
    };

    res.json({
      success: true,
      data: {
        stats,
        date: today,
        facilityId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching dashboard statistics' },
    });
  }
});

// Get patient demographics report
router.get('/demographics', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const facilityId = req.user?.facilityId;
    
    const demographics = {
      totalPatients: 156,
      byGender: {
        male: 78,
        female: 76,
        other: 2,
      },
      byAge: {
        '0-18': 23,
        '19-35': 45,
        '36-50': 52,
        '51-65': 28,
        '65+': 8,
      },
      newPatientsThisMonth: 24,
      registrationTrend: [
        { month: 'Jan', count: 15 },
        { month: 'Feb', count: 18 },
        { month: 'Mar', count: 22 },
        { month: 'Apr', count: 19 },
        { month: 'May', count: 26 },
        { month: 'Jun', count: 24 },
      ],
    };

    res.json({
      success: true,
      data: { demographics },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching demographics report' },
    });
  }
});

// Get financial report
router.get('/financial', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const facilityId = req.user?.facilityId;
    
    const financial = {
      totalRevenue: 45600.00,
      paidInvoices: 142,
      pendingInvoices: 5,
      cancelledInvoices: 3,
      averageInvoiceAmount: 321.13,
      paymentMethods: {
        cash: 28400.00,
        mobile_money: 12800.00,
        card: 3200.00,
        bank_transfer: 1200.00,
      },
      monthlyRevenue: [
        { month: 'Jan', revenue: 6800.00 },
        { month: 'Feb', revenue: 7200.00 },
        { month: 'Mar', revenue: 7800.00 },
        { month: 'Apr', revenue: 7100.00 },
        { month: 'May', revenue: 8300.00 },
        { month: 'Jun', revenue: 8400.00 },
      ],
      topServices: [
        { service: 'Consultation', revenue: 18240.00, count: 152 },
        { service: 'Lab Tests', revenue: 9120.00, count: 76 },
        { service: 'Prescription', revenue: 6840.00, count: 114 },
        { service: 'Vaccination', revenue: 4560.00, count: 38 },
        { service: 'Surgery', revenue: 6840.00, count: 6 },
      ],
    };

    res.json({
      success: true,
      data: { 
        financial,
        period: {
          startDate: startDate || '2025-01-01',
          endDate: endDate || '2025-06-30',
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching financial report' },
    });
  }
});

// Get appointment analytics
router.get('/appointments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const facilityId = req.user?.facilityId;
    
    const appointmentAnalytics = {
      totalAppointments: 285,
      completed: 234,
      cancelled: 28,
      noShow: 23,
      completionRate: 82.1,
      averageDuration: 32,
      busyHours: [
        { hour: '09:00', count: 45 },
        { hour: '10:00', count: 52 },
        { hour: '11:00', count: 38 },
        { hour: '14:00', count: 41 },
        { hour: '15:00', count: 36 },
        { hour: '16:00', count: 29 },
      ],
      weeklyTrend: [
        { day: 'Monday', count: 48 },
        { day: 'Tuesday', count: 52 },
        { day: 'Wednesday', count: 41 },
        { day: 'Thursday', count: 45 },
        { day: 'Friday', count: 39 },
        { day: 'Saturday', count: 32 },
        { day: 'Sunday', count: 28 },
      ],
    };

    res.json({
      success: true,
      data: { appointmentAnalytics },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching appointment analytics' },
    });
  }
});

export default router;
