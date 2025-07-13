import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Mock billing data
let invoices = [
  {
    id: 'INV-001',
    patientId: '1',
    appointmentId: 'APT-001',
    amount: 150.00,
    currency: 'GHS',
    services: [
      { name: 'Consultation', amount: 100.00 },
      { name: 'Blood Pressure Check', amount: 50.00 },
    ],
    status: 'paid',
    paymentMethod: 'cash',
    issuedDate: '2025-06-30',
    paidDate: '2025-06-30',
    facilityId: 'facility_1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'INV-002',
    patientId: '2',
    appointmentId: 'APT-002',
    amount: 200.00,
    currency: 'GHS',
    services: [
      { name: 'Follow-up Consultation', amount: 120.00 },
      { name: 'Inhaler Prescription', amount: 80.00 },
    ],
    status: 'pending',
    paymentMethod: null,
    issuedDate: '2025-06-30',
    paidDate: null,
    facilityId: 'facility_1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'INV-003',
    patientId: '3',
    appointmentId: 'APT-003',
    amount: 350.00,
    currency: 'GHS',
    services: [
      { name: 'Diabetes Consultation', amount: 150.00 },
      { name: 'Blood Sugar Test', amount: 100.00 },
      { name: 'Medication Prescription', amount: 100.00 },
    ],
    status: 'paid',
    paymentMethod: 'mobile_money',
    issuedDate: '2025-07-01',
    paidDate: '2025-07-01',
    facilityId: 'facility_1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'INV-004',
    patientId: '4',
    appointmentId: 'APT-004',
    amount: 120.00,
    currency: 'GHS',
    services: [
      { name: 'Pediatric Consultation', amount: 80.00 },
      { name: 'Vaccination', amount: 40.00 },
    ],
    status: 'pending',
    paymentMethod: null,
    issuedDate: '2025-07-02',
    paidDate: null,
    facilityId: 'facility_1',
    createdAt: new Date().toISOString(),
  },
];

// Get invoices
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, patientId, startDate, endDate } = req.query;
    const facilityId = req.user?.facilityId;

    console.log('💰 Fetching invoices with filters:', { status, patientId, startDate, endDate });
    console.log('🏥 User facility ID:', facilityId);

    let filteredInvoices = invoices.filter(inv => 
      inv.facilityId === facilityId
    );

    console.log('📋 Total invoices for facility:', filteredInvoices.length);

    // Apply filters
    if (status) {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
      console.log('📋 Invoices after status filter:', filteredInvoices.length);
    }
    if (patientId) {
      filteredInvoices = filteredInvoices.filter(inv => inv.patientId === patientId);
      console.log('📋 Invoices after patient filter:', filteredInvoices.length);
    }
    if (startDate) {
      filteredInvoices = filteredInvoices.filter(inv => 
        new Date(inv.issuedDate) >= new Date(startDate.toString())
      );
      console.log('📋 Invoices after start date filter:', filteredInvoices.length);
    }
    if (endDate) {
      filteredInvoices = filteredInvoices.filter(inv => 
        new Date(inv.issuedDate) <= new Date(endDate.toString())
      );
      console.log('📋 Invoices after end date filter:', filteredInvoices.length);
    }

    console.log('✅ Returning', filteredInvoices.length, 'invoices');

    res.json({
      success: true,
      data: { invoices: filteredInvoices },
    });
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching invoices' },
    });
  }
});

// Get invoice by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const facilityId = req.user?.facilityId;

    const invoice = invoices.find(inv => inv.id === id && inv.facilityId === facilityId);
    
    if (!invoice) {
      res.status(404).json({
        success: false,
        error: { message: 'Invoice not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: { invoice },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching invoice' },
    });
  }
});

// Create invoice
router.post('/', [
  authenticateToken,
  body('patientId').notEmpty(),
  body('services').isArray().notEmpty(),
  body('services.*.name').notEmpty(),
  body('services.*.amount').isNumeric(),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Invoice creation validation errors:', errors.array());
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input', details: errors.array() },
      });
      return;
    }

    const facilityId = req.user?.facilityId;
    const newInvoiceId = `INV-${(invoices.length + 1).toString().padStart(3, '0')}`;

    console.log('💰 Creating new invoice:', {
      id: newInvoiceId,
      patientId: req.body.patientId,
      services: req.body.services,
      facilityId
    });

    // Calculate total amount
    const totalAmount = req.body.services.reduce((sum: number, service: any) => 
      sum + parseFloat(service.amount), 0
    );

    const newInvoice = {
      id: newInvoiceId,
      ...req.body,
      amount: totalAmount,
      currency: 'GHS',
      status: 'pending',
      paymentMethod: null,
      issuedDate: new Date().toISOString().split('T')[0],
      paidDate: null,
      facilityId,
      createdAt: new Date().toISOString(),
    };

    console.log('📋 New invoice details:', newInvoice);

    invoices.push(newInvoice);

    console.log('✅ Invoice created successfully. Total invoices:', invoices.length);

    res.status(201).json({
      success: true,
      data: { invoice: newInvoice },
    });
  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error creating invoice' },
    });
  }
});

// Update payment status
router.patch('/:id/payment', [
  authenticateToken,
  body('status').isIn(['paid', 'pending', 'cancelled']),
  body('paymentMethod').optional().isIn(['cash', 'mobile_money', 'card', 'bank_transfer']),
], async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Payment update validation errors:', errors.array());
      res.status(400).json({
        success: false,
        error: { message: 'Invalid input', details: errors.array() },
      });
      return;
    }

    const { id } = req.params;
    const { status, paymentMethod } = req.body;
    const facilityId = req.user?.facilityId;

    console.log('💳 Processing payment for invoice:', {
      invoiceId: id,
      status,
      paymentMethod,
      facilityId
    });

    const invoiceIndex = invoices.findIndex(inv => 
      inv.id === id && inv.facilityId === facilityId
    );

    if (invoiceIndex === -1) {
      console.log('❌ Invoice not found:', id);
      res.status(404).json({
        success: false,
        error: { message: 'Invoice not found' },
      });
      return;
    }

    const oldStatus = invoices[invoiceIndex].status;
    invoices[invoiceIndex].status = status;
    if (paymentMethod) {
      invoices[invoiceIndex].paymentMethod = paymentMethod;
    }
    if (status === 'paid') {
      invoices[invoiceIndex].paidDate = new Date().toISOString().split('T')[0];
    }

    console.log('✅ Payment processed successfully:', {
      invoiceId: id,
      oldStatus,
      newStatus: status,
      paymentMethod,
      amount: invoices[invoiceIndex].amount
    });

    res.json({
      success: true,
      data: { invoice: invoices[invoiceIndex] },
    });
  } catch (error) {
    console.error('❌ Error updating payment status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error updating payment status' },
    });
  }
});

// Download invoice as PDF
router.get('/:id/pdf', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const facilityId = req.user?.facilityId;
    
    console.log('📄 PDF request for invoice:', id, 'from facility:', facilityId);
    
    const invoice = invoices.find(inv => inv.id === id && inv.facilityId === facilityId);
    if (!invoice) {
      console.log('❌ Invoice not found:', id);
      res.status(404).json({ success: false, error: { message: 'Invoice not found' } });
      return;
    }

    console.log('✅ Generating PDF for invoice:', invoice.id);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.id}.pdf`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Cache-Control', 'no-cache');
    
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('GhEHR Invoice', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(12)
       .text(`Invoice ID: ${invoice.id}`)
       .text(`Patient ID: ${invoice.patientId}`)
       .text(`Issued Date: ${invoice.issuedDate}`)
       .text(`Status: ${invoice.status.toUpperCase()}`);
    
    if (invoice.paidDate) {
      doc.text(`Paid Date: ${invoice.paidDate}`);
    }
    
    doc.text(`Facility ID: ${invoice.facilityId}`)
       .moveDown();

    // Services table header
    doc.fontSize(14).text('Services:', { underline: true });
    doc.moveDown(0.5);
    
    // Services list
    doc.fontSize(12);
    invoice.services.forEach((service, index) => {
      doc.text(`${index + 1}. ${service.name}: GHS ${service.amount.toFixed(2)}`);
    });
    
    doc.moveDown();
    
    // Total
    doc.fontSize(14)
       .text(`Total Amount: GHS ${invoice.amount.toFixed(2)}`, { align: 'right' })
       .fontSize(12)
       .text(`Payment Method: ${invoice.paymentMethod || 'Not specified'}`, { align: 'right' });
    
    doc.moveDown(2);
    doc.fontSize(10).text('Thank you for choosing GhEHR Healthcare Services!', { align: 'center' });
    
    console.log('✅ PDF generated successfully for invoice:', invoice.id);
    doc.end();
  } catch (error) {
    console.error('❌ Error generating invoice PDF:', error);
    res.status(500).json({ success: false, error: { message: 'Error generating PDF' } });
  }
});

export default router;
