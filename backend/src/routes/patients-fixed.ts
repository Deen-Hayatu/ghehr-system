import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { Patient, GHANA_REGIONS } from '../models/Patient';

const router = express.Router();

// Mock patient data storage (replace with database in production)
const patients: Patient[] = [
  {
    id: '1',
    patientId: 'GH-2025-001001',
    firstName: 'Kwame',
    lastName: 'Asante',
    middleName: 'Kofi',
    dateOfBirth: '1985-05-15',
    gender: 'male',
    nationality: 'Ghana',
    ghanaCardNumber: 'GHA-123456789-1',
    nhisNumber: 'NHIS-123456789',
    phoneNumber: '+233244123456',
    email: 'kwame.asante@email.com',
    address: {
      region: 'Ashanti',
      district: 'Kumasi Metropolitan',
      town: 'Kumasi',
      area: 'Asafo',
      digitalAddress: 'AK-123-4567'
    },
    emergencyContact: {
      name: 'Ama Asante',
      relationship: 'Wife',
      phoneNumber: '+233244654321'
    },
    bloodGroup: 'O+',
    allergies: ['Penicillin'],
    chronicConditions: ['Hypertension'],
    currentMedications: ['Lisinopril 10mg'],
    insurance: {
      hasNHIS: true,
      nhisStatus: 'active'
    },
    createdAt: '2025-01-15T08:30:00Z',
    updatedAt: '2025-06-20T10:45:00Z',
    createdBy: '1',
    facilityId: 'facility_1',
    status: 'active',
    preferredLanguage: 'twi',
    interpreterNeeded: false
  }
];

// Get all patients
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('📋 GET /api/patients - Fetching patients');
    const { page = 1, limit = 10, search = '' } = req.query;
    const facilityId = req.user?.facilityId;

    // Filter by facility and search term
    let filteredPatients = patients.filter(patient => 
      patient.facilityId === facilityId &&
      (search === '' || 
       patient.firstName.toLowerCase().includes(search.toString().toLowerCase()) ||
       patient.lastName.toLowerCase().includes(search.toString().toLowerCase()) ||
       patient.id.toLowerCase().includes(search.toString().toLowerCase())
      )
    );

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

    console.log(`✅ Found ${filteredPatients.length} patients, returning ${paginatedPatients.length}`);

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

// GET /api/patients/:id - Get specific patient
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log(`🔍 GET /api/patients/${req.params.id} - Fetching specific patient`);
    const { id } = req.params;
    const patient = patients.find(p => 
      (p.id === id || p.patientId === id) && 
      p.facilityId === req.user?.facilityId
    );

    if (!patient) {
      console.log(`❌ Patient with ID ${id} not found`);
      res.status(404).json({
        success: false,
        error: { message: 'Patient not found' }
      });
      return;
    }

    console.log(`✅ Found patient: ${patient.firstName} ${patient.lastName}`);
    res.json({
      success: true,
      data: { patient }
    });
  } catch (error) {
    console.error('❌ Error fetching patient:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Server error while fetching patient' }
    });
  }
});

// POST /api/patients - Create new patient (simplified validation)
router.post('/', [
  authenticateToken,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📥 POST /api/patients - Creating new patient');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
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

    console.log('✅ Creating new patient:', newPatient.firstName, newPatient.lastName);
    patients.push(newPatient);
    console.log(`🎉 Patient created! Total patients: ${patients.length}`);

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

// PUT /api/patients/:id - Update existing patient
router.put('/:id', [
  authenticateToken,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('📝 PUT /api/patients/:id - Updating patient');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input', details: errors.array() },
      });
      return;
    }

    const { id } = req.params;
    const facilityId = req.user?.facilityId;

    // Find the patient to update
    const patientIndex = patients.findIndex(p => 
      (p.id === id || p.patientId === id) && 
      p.facilityId === facilityId
    );

    if (patientIndex === -1) {
      console.log(`❌ Patient with ID ${id} not found`);
      res.status(404).json({
        success: false,
        error: { message: 'Patient not found' }
      });
      return;
    }

    // Update the patient data
    const updatedPatient: Patient = {
      ...patients[patientIndex], // Keep existing data
      ...req.body, // Override with new data
      updatedAt: new Date().toISOString(),
      // Keep original system fields
      id: patients[patientIndex].id,
      patientId: patients[patientIndex].patientId,
      createdAt: patients[patientIndex].createdAt,
      createdBy: patients[patientIndex].createdBy,
      facilityId: patients[patientIndex].facilityId,
    };

    patients[patientIndex] = updatedPatient;
    console.log('✅ Patient updated successfully:', updatedPatient.firstName, updatedPatient.lastName);

    res.json({
      success: true,
      data: { patient: updatedPatient },
    });
  } catch (error) {
    console.error('❌ Error updating patient:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error updating patient' },
    });
  }
});

export default router;
