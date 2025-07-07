import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Mock appointment data
let appointments = [
  {
    id: 'APT-001',
    patientId: '1', // Kwame Asante
    doctorId: '2',
    date: '2025-07-05', // Today
    time: '09:00',
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    notes: 'Regular checkup - Blood pressure monitoring',
    facilityId: 'facility_1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'APT-002',
    patientId: '2', // Ama Mensah
    doctorId: '2',
    date: '2025-07-05', // Today
    time: '10:00',
    duration: 45,
    type: 'follow-up',
    status: 'confirmed',
    notes: 'Post-delivery checkup',
    facilityId: 'facility_1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'APT-003',
    patientId: '3', // Kofi Owusu
    doctorId: '2',
    date: '2025-07-06', // Tomorrow
    time: '14:00',
    duration: 60,
    type: 'consultation',
    status: 'scheduled',
    notes: 'Diabetes management consultation',
    facilityId: 'facility_1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'APT-004',
    patientId: '4', // Akosua Boateng
    doctorId: '2',
    date: '2025-07-05', // Today
    time: '15:30',
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    notes: 'Pediatric routine checkup',
    facilityId: 'facility_1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'APT-005',
    patientId: '5', // Emmanuel Adjei
    doctorId: '2',
    date: '2025-07-04', // Yesterday
    time: '11:00',
    duration: 45,
    type: 'follow-up',
    status: 'completed',
    notes: 'Hypertension and arthritis follow-up',
    facilityId: 'facility_1',
    createdAt: new Date().toISOString(),
  },
];

// Get appointments
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, doctorId, patientId, status, type } = req.query;
    const facilityId = req.user?.facilityId;
    
    console.log('📅 Filtering appointments with filters:', { date, doctorId, patientId, status, type });
    console.log('🏥 User facility ID:', facilityId);

    let filteredAppointments = appointments.filter(apt => 
      apt.facilityId === facilityId
    );

    console.log('📋 Appointments before filters:', filteredAppointments.length);

    // Apply filters
    if (date) {
      console.log('🔍 Applying date filter for:', date);
      filteredAppointments = filteredAppointments.filter(apt => {
        try {
          // Handle both date string formats: "2025-07-12" and "2025-07-12T00:00:00.000Z"
          // Convert date to string first in case it's a Date object
          const dateStr = String(apt.date);
          const appointmentDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
          console.log(`   📊 Comparing: ${appointmentDate} === ${date} -> ${appointmentDate === date}`);
          return appointmentDate === date;
        } catch (error) {
          console.error('❌ Error processing appointment date:', apt.date, error);
          return false;
        }
      });
      console.log('📋 Appointments after date filter:', filteredAppointments.length);
    }
    if (doctorId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.doctorId === doctorId);
      console.log('📋 Appointments after doctor filter:', filteredAppointments.length);
    }
    if (patientId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.patientId === patientId);
      console.log('📋 Appointments after patient filter:', filteredAppointments.length);
    }
    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
      console.log('📋 Appointments after status filter:', filteredAppointments.length);
    }
    if (type) {
      filteredAppointments = filteredAppointments.filter(apt => apt.type === type);
      console.log('📋 Appointments after type filter:', filteredAppointments.length);
    }

    res.json({
      success: true,
      data: { appointments: filteredAppointments },
    });
  } catch (error) {
    console.error('❌ Error in appointments GET route:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching appointments' },
    });
  }
});

// Create appointment
router.post('/', [
  authenticateToken,
  body('patientId').notEmpty(),
  body('doctorId').notEmpty(),
  body('date').isISO8601(),
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('type').isIn(['consultation', 'follow-up', 'emergency', 'surgery']),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input', details: errors.array() },
      });
      return;
    }

    const facilityId = req.user?.facilityId;
    const newAppointmentId = `APT-${(appointments.length + 1).toString().padStart(3, '0')}`;

    // Ensure date is stored as YYYY-MM-DD format
    const dateValue = req.body.date;
    const formattedDate = dateValue.includes('T') ? dateValue.split('T')[0] : dateValue;

    const newAppointment = {
      id: newAppointmentId,
      ...req.body,
      date: formattedDate, // Use the formatted date
      status: 'scheduled',
      facilityId,
      createdAt: new Date().toISOString(),
    };

    console.log('📅 Creating new appointment with date:', formattedDate);
    console.log('🏥 Facility ID:', facilityId);
    console.log('📋 New appointment:', newAppointment);

    appointments.push(newAppointment);

    res.status(201).json({
      success: true,
      data: { appointment: newAppointment },
    });
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error creating appointment' },
    });
  }
});

// Update appointment status
router.patch('/:id/status', [
  authenticateToken,
  body('status').isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid status', details: errors.array() },
      });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;
    const facilityId = req.user?.facilityId;

    const appointmentIndex = appointments.findIndex(apt => 
      apt.id === id && apt.facilityId === facilityId
    );

    if (appointmentIndex === -1) {
      res.status(404).json({
        success: false,
        error: { message: 'Appointment not found' },
      });
      return;
    }

    appointments[appointmentIndex].status = status;

    res.json({
      success: true,
      data: { appointment: appointments[appointmentIndex] },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error updating appointment' },
    });
  }
});

export default router;
