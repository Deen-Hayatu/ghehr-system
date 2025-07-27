import express, { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { emailService, EmailNotificationType } from '../services/EmailService';

const router = express.Router();

/**
 * Send a single email
 * POST /api/emails/send
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { to, cc, bcc, type, data, priority, sendAt, attachments } = req.body;

    // Validate required fields
    if (!to || !type || !data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, type, and data are required'
      });
    }

    // Validate email type
    if (!Object.values(EmailNotificationType).includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email type',
        validTypes: Object.values(EmailNotificationType)
      });
    }

    // Queue or send email immediately
    const emailId = await emailService.queueEmail({
      to,
      cc,
      bcc,
      type,
      data,
      priority: priority || 'normal',
      sendAt: sendAt ? new Date(sendAt) : undefined,
      attachments
    });

    return res.json({
      success: true,
      message: 'Email queued successfully',
      emailId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Send appointment confirmation email
 * POST /api/emails/appointment-confirmation
 */
router.post('/appointment-confirmation', authenticateToken, async (req, res) => {
  try {
    const {
      patientEmail,
      patientName,
      appointmentDate,
      appointmentTime,
      doctorName,
      department,
      appointmentType,
      appointmentNotes,
      facilityName,
      facilityPhone,
      facilityEmail,
      facilityAddress,
      rescheduleLink,
      cancelLink
    } = req.body;

    if (!patientEmail || !patientName || !appointmentDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientEmail, patientName, and appointmentDate are required'
      });
    }

    const emailId = await emailService.queueEmail({
      to: patientEmail,
      type: EmailNotificationType.APPOINTMENT_CONFIRMATION,
      data: {
        patientName,
        appointmentDate,
        appointmentTime: appointmentTime || 'TBD',
        doctorName: doctorName || 'To be assigned',
        department: department || 'General',
        appointmentType: appointmentType || 'Consultation',
        appointmentNotes,
        facilityName: facilityName || 'GhEHR Medical Center',
        facilityTagline: 'Your Health, Our Priority',
        facilityPhone: facilityPhone || '+233 XX XXX XXXX',
        facilityEmail: facilityEmail || 'info@ghehr.gh',
        facilityAddress: facilityAddress || 'Accra, Ghana',
        rescheduleLink: rescheduleLink || '#',
        cancelLink: cancelLink || '#',
        emergencyPhone: '+233 302 123 456',
        privacyPolicyLink: '#',
        termsLink: '#',
        unsubscribeLink: '#'
      },
      priority: 'normal'
    });

    return res.json({
      success: true,
      message: 'Appointment confirmation email sent successfully',
      emailId
    });

  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send appointment confirmation email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Send prescription ready notification
 * POST /api/emails/prescription-ready
 */
router.post('/prescription-ready', authenticateToken, async (req, res) => {
  try {
    const {
      patientEmail,
      patientName,
      prescriptionId,
      doctorName,
      prescriptionDate,
      readyDate,
      medications,
      totalCost,
      paymentStatus,
      pharmacyHours,
      pharmacyLocation,
      pharmacistName,
      pharmacyPhone,
      facilityName,
      facilityAddress,
      facilityPhone,
      facilityEmail,
      specialInstructions
    } = req.body;

    if (!patientEmail || !patientName || !prescriptionId || !medications) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patientEmail, patientName, prescriptionId, and medications are required'
      });
    }

    const emailId = await emailService.queueEmail({
      to: patientEmail,
      type: EmailNotificationType.PRESCRIPTION_READY,
      data: {
        patientName,
        prescriptionId,
        doctorName: doctorName || 'Unknown',
        prescriptionDate: prescriptionDate || new Date().toLocaleDateString(),
        readyDate: readyDate || new Date().toLocaleDateString(),
        medications,
        totalCost: totalCost || 'Contact pharmacy',
        paymentStatus: paymentStatus || 'Pending',
        pharmacyHours: pharmacyHours || 'Mon-Fri: 8AM-6PM, Sat: 8AM-2PM',
        pharmacyLocation: pharmacyLocation || 'Ground Floor',
        pharmacistName: pharmacistName || 'Pharmacy Team',
        pharmacyPhone: pharmacyPhone || facilityPhone || '+233 XX XXX XXXX',
        facilityName: facilityName || 'GhEHR Medical Center',
        facilityTagline: 'Your Health, Our Priority',
        facilityAddress: facilityAddress || 'Accra, Ghana',
        facilityPhone: facilityPhone || '+233 XX XXX XXXX',
        facilityEmail: facilityEmail || 'info@ghehr.gh',
        specialInstructions,
        directionsLink: '#',
        contactLink: '#',
        emergencyPhone: '+233 302 123 456'
      },
      priority: 'normal'
    });

    return res.json({
      success: true,
      message: 'Prescription ready notification sent successfully',
      emailId
    });

  } catch (error) {
    console.error('Error sending prescription notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send prescription ready notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get email logs with filtering
 * GET /api/emails/logs
 */
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const { type, status, from, to, limit = 50, offset = 0 } = req.query;

    const filter: any = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (from) filter.from = new Date(from as string);
    if (to) filter.to = new Date(to as string);

    const logs = emailService.getEmailLogs(filter);
    
    // Apply pagination
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedLogs = logs.slice(startIndex, endIndex);

    return res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        total: logs.length,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });

  } catch (error) {
    console.error('Error fetching email logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch email logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get email statistics
 * GET /api/emails/stats
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = emailService.getEmailStats();

    return res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching email stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch email statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test email configuration
 * POST /api/emails/test
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Test email address is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format'
      });
    }

    const success = await emailService.testEmailConfig(testEmail);

    if (success) {
      return res.json({
        success: true,
        message: 'Test email sent successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send test email. Please check your email configuration.'
      });
    }

  } catch (error) {
    console.error('Error testing email configuration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to test email configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update email configuration
 * PUT /api/emails/config
 */
router.put('/config', authenticateToken, async (req, res) => {
  try {
    const { host, port, secure, user, pass, from, fromName } = req.body;

    if (!host || !port || !user || !pass || !from) {
      return res.status(400).json({
        success: false,
        message: 'Missing required configuration fields'
      });
    }

    const newConfig = {
      host,
      port: parseInt(port),
      secure: secure === true || secure === 'true',
      auth: { user, pass },
      from,
      fromName: fromName || 'GhEHR System'
    };

    const success = await emailService.updateEmailConfig(newConfig);

    if (success) {
      return res.json({
        success: true,
        message: 'Email configuration updated successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to update email configuration'
      });
    }

  } catch (error) {
    console.error('Error updating email configuration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update email configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get available email notification types
 * GET /api/emails/types
 */
router.get('/types', authenticateToken, async (req, res) => {
  try {
    const types = Object.values(EmailNotificationType).map(type => ({
      value: type,
      label: type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ')
    }));

    return res.json({
      success: true,
      data: types
    });

  } catch (error) {
    console.error('Error fetching email types:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch email types',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Bulk email operations
 * POST /api/emails/bulk
 */
router.post('/bulk', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Emails array is required and must not be empty'
      });
    }

    if (emails.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 emails allowed per bulk operation'
      });
    }

    const emailIds: string[] = [];
    const errors: string[] = [];

    for (const email of emails) {
      try {
        const emailId = await emailService.queueEmail(email);
        emailIds.push(emailId);
      } catch (error) {
        errors.push(`Failed to queue email to ${email.to}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return res.json({
      success: true,
      message: `Successfully queued ${emailIds.length} emails`,
      data: {
        successCount: emailIds.length,
        errorCount: errors.length,
        emailIds,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Error processing bulk emails:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process bulk emails',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
