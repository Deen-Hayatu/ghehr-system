import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth';
import { Patient, PatientSearchCriteria, PatientRegistrationRequest, GHANA_REGIONS } from '../models/Patient';
import { patients } from '../models/patientData';
import { emailService, EmailNotificationType } from '../services/EmailService';

const router = express.Router();

// Get all patients
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', gender, region } = req.query;
    const facilityId = req.user?.facilityId;

    let filteredPatients = patients;

    // When a specific search, gender, or region filter is active, scope patients to the user's facility.
    if (search || gender || region) {
      console.log('🏥 Applying facility filter for specific search. Facility ID:', facilityId);
      if (facilityId) { // Ensure facilityId exists before filtering
        filteredPatients = patients.filter(patient => 
          patient.facilityId === facilityId
        );
      }
    } else {
      // When no filters are applied (e.g., for dropdowns), do not filter by facility.
      console.log('📋 No specific filters applied, returning all patients for dropdowns.');
    }

    // Apply search filter
    if (search && search !== '') {
      filteredPatients = filteredPatients.filter(patient => 
        patient.firstName.toLowerCase().includes(search.toString().toLowerCase()) ||
        patient.lastName.toLowerCase().includes(search.toString().toLowerCase()) ||
        patient.patientId.toLowerCase().includes(search.toString().toLowerCase())
      );
      console.log('📋 Patients after search filter:', filteredPatients.length);
    }

    // Apply gender filter
    if (gender && gender !== '') {
      filteredPatients = filteredPatients.filter(patient => 
        patient.gender === gender
      );
      console.log('📋 Patients after gender filter:', filteredPatients.length);
    }

    // Apply region filter
    if (region && region !== '') {
      filteredPatients = filteredPatients.filter(patient => 
        patient.address?.region === region
      );
      console.log('📋 Patients after region filter:', filteredPatients.length);
    }

    // Pagination - if limit is 0, return all patients (for dropdowns)
    let paginatedPatients = filteredPatients;
    if (Number(limit) > 0) {
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      paginatedPatients = filteredPatients.slice(startIndex, endIndex);
    }

    console.log('📄 Final results:', paginatedPatients.length, 'of', filteredPatients.length);

    res.json({
      success: true,
      data: {
        patients: paginatedPatients,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(filteredPatients.length / Number(limit)),
          totalPatients: filteredPatients.length,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching patients' },
    });
  }
});

// GET /api/patients/search - Search patients for reports (must be before /:id route)
router.get('/search', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q } = req.query;
    const facilityId = req.user?.facilityId;

    if (!q || q.toString().trim() === '') {
      res.json({
        success: true,
        data: { patients: [] },
      });
      return;
    }

    const searchTerm = q.toString().toLowerCase().trim();
    let filteredPatients = patients;

    // Filter by facility if user has one
    if (facilityId) {
      filteredPatients = patients.filter(patient => 
        patient.facilityId === facilityId
      );
    }

    // Search by name, patient ID, or phone
    const matchingPatients = filteredPatients.filter(patient => 
      patient.firstName.toLowerCase().includes(searchTerm) ||
      patient.lastName.toLowerCase().includes(searchTerm) ||
      patient.patientId.toLowerCase().includes(searchTerm) ||
      (patient.phoneNumber && patient.phoneNumber.includes(searchTerm)) ||
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm)
    );

    // Limit to 10 results for performance
    const limitedResults = matchingPatients.slice(0, 10);

    // Calculate age from date of birth
    const calculateAge = (dateOfBirth: string): number => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Transform to simple format for reports
    const transformedPatients = limitedResults.map(patient => ({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      age: calculateAge(patient.dateOfBirth),
      gender: patient.gender,
      phone: patient.phoneNumber,
      patientId: patient.patientId,
    }));

    res.json({
      success: true,
      data: { patients: transformedPatients },
    });
  } catch (error) {
    console.error('❌ Error searching patients:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error searching patients' },
    });
  }
});

// GET /api/patients/:id - Get specific patient
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const patient = patients.find(p => 
      (p.id === id || p.patientId === id) && 
      p.facilityId === req.user?.facilityId
    );

    if (!patient) {
      res.status(404).json({
        success: false,
        error: { message: 'Patient not found' }
      });
      return;
    }

    res.json({
      success: true,
      data: { patient }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching patient' }
    });
  }
});

// POST /api/patients - Create new patient
router.post('/', [
  authenticateToken,
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('dateOfBirth').isISO8601().toDate(),
  body('gender').isIn(['male', 'female', 'other']),
  body('phoneNumber').notEmpty().trim(),
  body('address.region').isIn(GHANA_REGIONS),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📥 Received patient creation request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input', details: errors.array() },
      });
      return;
    }

    const facilityId = req.user?.facilityId;
    const newPatientId = `GH-2025-${String(patients.length + 2).padStart(6, '0')}`;

    const newPatient: Patient = {
      id: String(patients.length + 1),
      patientId: newPatientId,
      ...req.body,
      facilityId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user?.id || '1',
    };

    console.log('✅ Creating new patient:', newPatient);
    patients.push(newPatient);
    console.log(`🎉 Patient created! Total patients: ${patients.length}`);

    // 📧 AUTOMATED EMAIL: Send welcome email to new patient
    if (newPatient.email) {
      try {
        console.log('📧 Sending welcome email to:', newPatient.email);
        await emailService.queueEmail({
          to: newPatient.email,
          type: EmailNotificationType.PATIENT_REGISTRATION,
          data: {
            patientName: `${newPatient.firstName} ${newPatient.lastName}`,
            patientId: newPatient.patientId,
            facilityName: 'GhEHR Medical Center',
            facilityTagline: 'Your Health, Our Priority',
            facilityPhone: '+233 302 123 456',
            facilityEmail: 'info@ghehr.gh',
            facilityAddress: 'Accra, Ghana',
            registrationDate: new Date().toLocaleDateString(),
            nextSteps: [
              'Keep your Patient ID safe: ' + newPatient.patientId,
              'Bring a valid ID when visiting the facility',
              'Contact us if you have any questions'
            ],
            emergencyPhone: '+233 302 123 456',
            privacyPolicyLink: '#',
            termsLink: '#',
            unsubscribeLink: '#'
          },
          priority: 'normal'
        });
        console.log('✅ Welcome email queued successfully');
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError);
        // Don't fail the registration if email fails
      }
    } else {
      console.log('⚠️ No email provided, skipping welcome email');
    }

    res.status(201).json({
      success: true,
      data: { patient: newPatient },
    });
  } catch (error) {
    console.error('❌ Error creating patient:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error creating patient' },
    });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const facilityId = req.user?.facilityId;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Filter patients by facility
    const facilityPatients = patients.filter(patient => patient.facilityId === facilityId);
    
    // Calculate today's patients (new registrations today)
    const todaysPatients = facilityPatients.filter(patient => 
      patient.createdAt.split('T')[0] === todayStr
    ).length;
    
    // Calculate gender distribution
    const malePatients = facilityPatients.filter(p => p.gender === 'male').length;
    const femalePatients = facilityPatients.filter(p => p.gender === 'female').length;
    
    // Calculate NHIS patients
    const nhisPatients = facilityPatients.filter(p => p.insurance.hasNHIS).length;
    
    // Calculate age distribution
    const getAge = (dateOfBirth: string) => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };
    
    const pediatricPatients = facilityPatients.filter(p => getAge(p.dateOfBirth) < 18).length;
    const adultPatients = facilityPatients.filter(p => {
      const age = getAge(p.dateOfBirth);
      return age >= 18 && age < 65;
    }).length;
    const elderlyPatients = facilityPatients.filter(p => getAge(p.dateOfBirth) >= 65).length;
    
    // Calculate chronic conditions
    const patientsWithChronicConditions = facilityPatients.filter(p => 
      p.chronicConditions && p.chronicConditions.length > 0
    ).length;

    const stats = {
      totalPatients: facilityPatients.length,
      todaysPatients,
      malePatients,
      femalePatients,
      nhisPatients,
      pediatricPatients,
      adultPatients,
      elderlyPatients,
      patientsWithChronicConditions,
      // Calculate percentages
      nhisPercentage: facilityPatients.length > 0 ? Math.round((nhisPatients / facilityPatients.length) * 100) : 0,
      // Recent growth (mock calculation - in real app, this would be based on historical data)
      todaysGrowth: todaysPatients > 0 ? '+' + todaysPatients : '0',
      nhisGrowth: '+5%', // Mock data
      totalGrowth: '+' + Math.round((todaysPatients / Math.max(facilityPatients.length - todaysPatients, 1)) * 100) + '%'
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching dashboard statistics' }
    });
  }
});

export default router;
