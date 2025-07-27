import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { emailService, EmailNotificationType } from '../services/EmailService';
import { patients } from '../models/patientData';

const router = express.Router();

// Mock lab orders data
let labOrders = [
  {
    id: 'LAB-001',
    patientId: '1',
    doctorId: '2',
    facilityId: 'facility_1',
    testType: 'blood_test',
    testName: 'Complete Blood Count (CBC)',
    status: 'ordered',
    orderDate: new Date().toISOString(),
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    instructions: 'Fast for 12 hours before the test',
    priority: 'normal'
  }
];

// Get all lab orders
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const facilityId = req.user?.facilityId;
    const filteredOrders = labOrders.filter(order => order.facilityId === facilityId);
    
    res.json({
      success: true,
      data: { orders: filteredOrders }
    });
  } catch (error) {
    console.error('❌ Error fetching lab orders:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching lab orders' }
    });
  }
});

// Create new lab order
router.post('/', [
  authenticateToken,
  body('patientId').notEmpty(),
  body('testType').isIn(['blood_test', 'urine_test', 'xray', 'ultrasound', 'ecg', 'stool_test']),
  body('testName').notEmpty().trim(),
  body('scheduledDate').isISO8601().toDate(),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input', details: errors.array() }
      });
      return;
    }

    const facilityId = req.user?.facilityId;
    const newOrderId = `LAB-${String(labOrders.length + 1).padStart(3, '0')}`;

    const newLabOrder = {
      id: newOrderId,
      ...req.body,
      doctorId: req.user?.id || '1',
      facilityId,
      status: 'ordered',
      orderDate: new Date().toISOString(),
      priority: req.body.priority || 'normal'
    };

    console.log('🧪 Creating new lab order:', newLabOrder);
    labOrders.push(newLabOrder);

    // 📧 AUTOMATED EMAIL: Send lab preparation instructions
    try {
      const patient = patients.find(p => p.id === req.body.patientId || p.patientId === req.body.patientId);
      if (patient && patient.email) {
        console.log('📧 Sending lab preparation instructions to:', patient.email);
        
        // Get test-specific preparation instructions
        const preparationInstructions = getLabPreparationInstructions(req.body.testType);
        
        await emailService.queueEmail({
          to: patient.email,
          type: EmailNotificationType.LAB_RESULTS_READY, // Reusing for lab instructions
          data: {
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientId: patient.patientId,
            labOrderId: newOrderId,
            testName: req.body.testName,
            testType: req.body.testType,
            scheduledDate: new Date(req.body.scheduledDate).toDateString(),
            scheduledTime: req.body.scheduledTime || '9:00 AM',
            preparationInstructions: preparationInstructions,
            instructions: req.body.instructions || 'Follow preparation guidelines carefully',
            labLocation: req.body.labLocation || 'Ground Floor, Laboratory Department',
            doctorName: 'Dr. Kwame Asante',
            facilityName: 'GhEHR Medical Center',
            facilityTagline: 'Your Health, Our Priority',
            facilityPhone: '+233 302 123 456',
            facilityEmail: 'info@ghehr.gh',
            facilityAddress: 'Accra, Ghana',
            resultsTimeframe: getResultsTimeframe(req.body.testType),
            emergencyPhone: '+233 302 123 456',
            privacyPolicyLink: '#',
            termsLink: '#',
            unsubscribeLink: '#'
          },
          priority: req.body.priority === 'urgent' ? 'high' : 'normal'
        });
        console.log('✅ Lab preparation email queued successfully');
      } else {
        console.log('⚠️ Patient not found or no email provided, skipping lab instructions email');
      }
    } catch (emailError) {
      console.error('❌ Failed to send lab instructions email:', emailError);
      // Don't fail the lab order creation if email fails
    }

    res.status(201).json({
      success: true,
      data: { labOrder: newLabOrder }
    });
  } catch (error) {
    console.error('❌ Error creating lab order:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error creating lab order' }
    });
  }
});

// Update lab order status (and send results notification)
router.patch('/:id/status', [
  authenticateToken,
  body('status').isIn(['ordered', 'in_progress', 'completed', 'cancelled']),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const orderIndex = labOrders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      res.status(404).json({
        success: false,
        error: { message: 'Lab order not found' }
      });
      return;
    }

    labOrders[orderIndex].status = status;
    
    // 📧 AUTOMATED EMAIL: Send results ready notification
    if (status === 'completed') {
      try {
        const labOrder = labOrders[orderIndex];
        const patient = patients.find(p => p.id === labOrder.patientId || p.patientId === labOrder.patientId);
        
        if (patient && patient.email) {
          console.log('📧 Sending lab results ready notification to:', patient.email);
          
          await emailService.queueEmail({
            to: patient.email,
            type: EmailNotificationType.LAB_RESULTS_READY,
            data: {
              patientName: `${patient.firstName} ${patient.lastName}`,
              patientId: patient.patientId,
              labOrderId: labOrder.id,
              testName: labOrder.testName,
              testType: labOrder.testType,
              completedDate: new Date().toDateString(),
              resultsAvailable: 'Your test results are now ready for review',
              viewResultsLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/lab-results/${labOrder.id}`,
              doctorName: 'Dr. Kwame Asante',
              facilityName: 'GhEHR Medical Center',
              facilityTagline: 'Your Health, Our Priority',
              facilityPhone: '+233 302 123 456',
              facilityEmail: 'info@ghehr.gh',
              facilityAddress: 'Accra, Ghana',
              followUpInstructions: 'Please schedule a follow-up appointment to discuss your results',
              emergencyPhone: '+233 302 123 456',
              privacyPolicyLink: '#',
              termsLink: '#',
              unsubscribeLink: '#'
            },
            priority: 'high'
          });
          console.log('✅ Lab results ready email queued successfully');
        }
      } catch (emailError) {
        console.error('❌ Failed to send lab results notification:', emailError);
      }
    }

    res.json({
      success: true,
      data: { labOrder: labOrders[orderIndex] }
    });
  } catch (error) {
    console.error('❌ Error updating lab order status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error updating lab order status' }
    });
  }
});

// Helper function to get test-specific preparation instructions
function getLabPreparationInstructions(testType: string): string[] {
  const instructions: { [key: string]: string[] } = {
    blood_test: [
      'Fast for 8-12 hours before the test (water is allowed)',
      'Avoid alcohol 24 hours before the test',
      'Take prescribed medications unless instructed otherwise',
      'Wear comfortable clothing with sleeves that can be rolled up easily'
    ],
    urine_test: [
      'Collect the first urine sample in the morning if possible',
      'Clean the genital area before collecting the sample',
      'Use the sterile container provided by the lab',
      'Bring the sample to the lab within 2 hours of collection'
    ],
    xray: [
      'Remove all jewelry and metal objects from the area to be X-rayed',
      'Wear comfortable, loose-fitting clothing',
      'Inform the technician if you might be pregnant',
      'Follow specific instructions for the type of X-ray being performed'
    ],
    ultrasound: [
      'For abdominal ultrasound: Fast for 8 hours before the test',
      'For pelvic ultrasound: Drink plenty of water 1 hour before (do not urinate)',
      'Wear loose, comfortable clothing',
      'Bring a list of current medications'
    ],
    ecg: [
      'Avoid oily or greasy skin products on chest and limbs',
      'Wear a shirt that can be easily removed or opened',
      'Inform the technician of any chest hair (may need to be trimmed)',
      'Relax and breathe normally during the test'
    ],
    stool_test: [
      'Collect a fresh stool sample using the provided container',
      'Avoid certain foods and medications as instructed',
      'Do not contaminate the sample with urine or water',
      'Bring the sample to the lab as soon as possible'
    ]
  };

  return instructions[testType] || [
    'Follow any specific instructions provided by your doctor',
    'Arrive 15 minutes early for your appointment',
    'Bring a valid ID and your patient card',
    'Contact the lab if you have any questions'
  ];
}

// Helper function to get expected results timeframe
function getResultsTimeframe(testType: string): string {
  const timeframes: { [key: string]: string } = {
    blood_test: '24-48 hours',
    urine_test: '24 hours',
    xray: '2-4 hours',
    ultrasound: 'Same day',
    ecg: 'Same day',
    stool_test: '48-72 hours'
  };

  return timeframes[testType] || '2-3 business days';
}

export default router;
