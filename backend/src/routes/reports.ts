import express, { Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';

const router = express.Router();

// Helper function to generate PDF buffer
const generatePDF = (title: string, data: any): Buffer => {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];
  
  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => {});
  
  // Add title
  doc.fontSize(20).text(title, 50, 50);
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 50, 80);
  
  // Add data (simplified for MVP)
  let yPosition = 120;
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      doc.text(`${index + 1}. ${JSON.stringify(item)}`, 50, yPosition);
      yPosition += 20;
    });
  } else {
    doc.text(JSON.stringify(data, null, 2), 50, yPosition);
  }
  
  doc.end();
  
  return Buffer.concat(chunks);
};

// Helper function to generate Excel buffer
const generateExcel = (title: string, data: any[]): Buffer => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, title);
  
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
};

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

// Admin Report: Appointment Summary
router.post('/admin/summary', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, format, doctor, status } = req.body;
    
    // Mock data for appointment summary
    const mockData = [
      {
        date: '2025-01-15',
        totalAppointments: 25,
        completed: 20,
        cancelled: 3,
        noShow: 2,
        doctor: 'Dr. Kwame Asante',
        revenue: 2500.00
      },
      {
        date: '2025-01-16',
        totalAppointments: 30,
        completed: 25,
        cancelled: 2,
        noShow: 3,
        doctor: 'Dr. Ama Osei',
        revenue: 3000.00
      }
    ];

    const fileName = `appointment_summary_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      const buffer = generateExcel('Appointment Summary', mockData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);
    } else {
      const buffer = generatePDF('Appointment Summary Report', mockData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error generating appointment summary report' },
    });
  }
});

// Admin Report: Appointment Details
router.post('/admin/details', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, format, doctor, status } = req.body;
    
    const mockData = [
      {
        appointmentId: 'APT001',
        patientName: 'John Doe',
        doctor: 'Dr. Kwame Asante',
        date: '2025-01-15',
        time: '09:00',
        status: 'Completed',
        diagnosis: 'Malaria',
        treatment: 'Antimalarial medication',
        amount: 150.00
      },
      {
        appointmentId: 'APT002',
        patientName: 'Jane Smith',
        doctor: 'Dr. Ama Osei',
        date: '2025-01-15',
        time: '10:30',
        status: 'Completed',
        diagnosis: 'Hypertension',
        treatment: 'Blood pressure medication',
        amount: 200.00
      }
    ];

    const fileName = `appointment_details_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      const buffer = generateExcel('Appointment Details', mockData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);
    } else {
      const buffer = generatePDF('Appointment Details Report', mockData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error generating appointment details report' },
    });
  }
});

// Admin Report: Visit Summary
router.post('/admin/visits', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, format, doctor, status } = req.body;
    
    const mockData = [
      {
        date: '2025-01-15',
        totalVisits: 45,
        newPatients: 8,
        followUps: 37,
        walkIns: 12,
        scheduled: 33,
        revenue: 4500.00
      },
      {
        date: '2025-01-16',
        totalVisits: 52,
        newPatients: 10,
        followUps: 42,
        walkIns: 15,
        scheduled: 37,
        revenue: 5200.00
      }
    ];

    const fileName = `visit_summary_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      const buffer = generateExcel('Visit Summary', mockData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);
    } else {
      const buffer = generatePDF('Visit Summary Report', mockData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error generating visit summary report' },
    });
  }
});

// Admin Report: Booked Appointments
router.post('/admin/booked', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, format, doctor, status } = req.body;
    
    const mockData = [
      {
        appointmentId: 'APT101',
        patientName: 'Michael Johnson',
        patientPhone: '+233241234567',
        doctor: 'Dr. Kwame Asante',
        date: '2025-01-20',
        time: '14:00',
        type: 'Consultation',
        status: 'Confirmed',
        bookedOn: '2025-01-15'
      },
      {
        appointmentId: 'APT102',
        patientName: 'Sarah Wilson',
        patientPhone: '+233541234567',
        doctor: 'Dr. Ama Osei',
        date: '2025-01-21',
        time: '09:30',
        type: 'Follow-up',
        status: 'Pending',
        bookedOn: '2025-01-16'
      }
    ];

    const fileName = `booked_appointments_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      const buffer = generateExcel('Booked Appointments', mockData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);
    } else {
      const buffer = generatePDF('Booked Appointments Report', mockData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error generating booked appointments report' },
    });
  }
});

// Admin Report: Patient Lists
router.post('/admin/lists', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate, format, doctor, status } = req.body;
    
    const mockData = [
      {
        patientId: 'PAT001',
        name: 'John Doe',
        age: 35,
        gender: 'Male',
        phone: '+233241234567',
        registrationDate: '2024-06-15',
        lastVisit: '2025-01-15',
        totalVisits: 8,
        status: 'Active'
      },
      {
        patientId: 'PAT002',
        name: 'Jane Smith',
        age: 28,
        gender: 'Female',
        phone: '+233541234567',
        registrationDate: '2024-08-20',
        lastVisit: '2025-01-10',
        totalVisits: 12,
        status: 'Active'
      }
    ];

    const fileName = `patient_lists_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      const buffer = generateExcel('Patient Lists', mockData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);
    } else {
      const buffer = generatePDF('Patient Lists Report', mockData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error generating patient lists report' },
    });
  }
});

// Patient Report: Clinical Details
router.post('/patient/clinical', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, startDate, endDate, format } = req.body;
    
    const mockData = [
      {
        visitDate: '2025-01-15',
        doctor: 'Dr. Kwame Asante',
        chiefComplaint: 'Fever and headache',
        diagnosis: 'Malaria',
        treatment: 'Antimalarial medication - Artemether/Lumefantrine',
        notes: 'Patient responded well to treatment. Follow-up in 1 week.',
        vitals: {
          temperature: '38.5°C',
          bloodPressure: '120/80',
          pulse: '85 bpm',
          weight: '70 kg'
        }
      },
      {
        visitDate: '2025-01-08',
        doctor: 'Dr. Ama Osei',
        chiefComplaint: 'Regular check-up',
        diagnosis: 'Hypertension monitoring',
        treatment: 'Continue current medication',
        notes: 'Blood pressure under control. Good adherence to medication.',
        vitals: {
          temperature: '36.8°C',
          bloodPressure: '130/85',
          pulse: '78 bpm',
          weight: '69 kg'
        }
      }
    ];

    const fileName = `clinical_details_${patientId}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      const buffer = generateExcel('Clinical Details', mockData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);
    } else {
      const buffer = generatePDF('Clinical Details Report', mockData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error generating clinical details report' },
    });
  }
});

// Patient Report: Prescription
router.post('/patient/prescription', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, startDate, endDate, format } = req.body;
    
    const mockData = [
      {
        prescriptionId: 'PRE001',
        date: '2025-01-15',
        doctor: 'Dr. Kwame Asante',
        medication: 'Artemether/Lumefantrine',
        dosage: '20mg/120mg',
        frequency: 'Twice daily',
        duration: '3 days',
        quantity: '6 tablets',
        instructions: 'Take with food. Complete the full course.',
        status: 'Active'
      },
      {
        prescriptionId: 'PRE002',
        date: '2025-01-08',
        doctor: 'Dr. Ama Osei',
        medication: 'Amlodipine',
        dosage: '5mg',
        frequency: 'Once daily',
        duration: '30 days',
        quantity: '30 tablets',
        instructions: 'Take in the morning. Monitor blood pressure.',
        status: 'Completed'
      }
    ];

    const fileName = `prescription_${patientId}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      const buffer = generateExcel('Prescription History', mockData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);
    } else {
      const buffer = generatePDF('Prescription History Report', mockData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error generating prescription report' },
    });
  }
});

// Patient Report: Test Order
router.post('/patient/test', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, startDate, endDate, format } = req.body;
    
    const mockData = [
      {
        testId: 'TEST001',
        orderDate: '2025-01-15',
        testType: 'Malaria RDT',
        doctor: 'Dr. Kwame Asante',
        status: 'Completed',
        result: 'Positive',
        completedDate: '2025-01-15',
        labTechnician: 'Lab Tech 1',
        notes: 'Positive for Plasmodium falciparum'
      },
      {
        testId: 'TEST002',
        orderDate: '2025-01-08',
        testType: 'Lipid Profile',
        doctor: 'Dr. Ama Osei',
        status: 'Completed',
        result: 'Normal',
        completedDate: '2025-01-09',
        labTechnician: 'Lab Tech 2',
        notes: 'All values within normal range'
      }
    ];

    const fileName = `test_orders_${patientId}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      const buffer = generateExcel('Test Orders', mockData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);
    } else {
      const buffer = generatePDF('Test Orders Report', mockData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error generating test orders report' },
    });
  }
});

// Patient Report: Vaccine
router.post('/patient/vaccine', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { patientId, startDate, endDate, format } = req.body;
    
    const mockData = [
      {
        vaccineId: 'VAC001',
        date: '2024-12-15',
        vaccine: 'COVID-19 Vaccine',
        manufacturer: 'AstraZeneca',
        batchNumber: 'CV001-2024',
        dose: '1st Dose',
        administrator: 'Nurse Jane',
        site: 'Left arm',
        nextDueDate: '2025-01-15',
        status: 'Completed'
      },
      {
        vaccineId: 'VAC002',
        date: '2024-11-10',
        vaccine: 'Influenza Vaccine',
        manufacturer: 'Sanofi',
        batchNumber: 'FLU001-2024',
        dose: 'Annual',
        administrator: 'Nurse John',
        site: 'Right arm',
        nextDueDate: '2025-11-10',
        status: 'Completed'
      }
    ];

    const fileName = `vaccine_history_${patientId}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'excel') {
      const buffer = generateExcel('Vaccine History', mockData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);
    } else {
      const buffer = generatePDF('Vaccine History Report', mockData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error generating vaccine history report' },
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
