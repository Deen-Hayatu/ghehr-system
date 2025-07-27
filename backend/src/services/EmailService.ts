import nodemailer from 'nodemailer';
import { promises as fs } from 'fs';
import path from 'path';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  fromName: string;
}

// Email template interface
interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Email notification types for Ghana EHR
export enum EmailNotificationType {
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CANCELLATION = 'appointment_cancellation',
  PRESCRIPTION_READY = 'prescription_ready',
  LAB_RESULTS_READY = 'lab_results_ready',
  PATIENT_REGISTRATION = 'patient_registration',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  SYSTEM_ALERT = 'system_alert',
  WELCOME_EMAIL = 'welcome_email',
  PASSWORD_RESET = 'password_reset',
  MEDICATION_REMINDER = 'medication_reminder',
  FOLLOW_UP_REMINDER = 'follow_up_reminder'
}

// Email data interface
interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  type: EmailNotificationType;
  data: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  sendAt?: Date;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

// Email status tracking
interface EmailLog {
  id: string;
  to: string;
  type: EmailNotificationType;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sentAt?: Date;
  errorMessage?: string;
  data: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;
  private emailLogs: EmailLog[] = [];
  private emailQueue: EmailData[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize email service with configuration
   */
  private async initializeService() {
    try {
      // Load email configuration from environment or config file
      this.config = this.getEmailConfig();
      
      if (this.config) {
        this.transporter = nodemailer.createTransport({
          host: this.config.host,
          port: this.config.port,
          secure: this.config.secure,
          auth: this.config.auth,
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
        });

        // Verify connection
        await this.verifyConnection();
        console.log('✅ Email service initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Get email configuration from environment variables
   */
  private getEmailConfig(): EmailConfig {
    return {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      },
      from: process.env.EMAIL_FROM || 'noreply@ghehr.gh',
      fromName: process.env.EMAIL_FROM_NAME || 'GhEHR - Ghana Electronic Health Records'
    };
  }

  /**
   * Verify email connection
   */
  private async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection verification failed:', error);
      return false;
    }
  }

  /**
   * Load email template
   */
  private async loadTemplate(type: EmailNotificationType): Promise<EmailTemplate> {
    const templatePath = path.join(__dirname, '../templates/emails', `${type}.html`);
    
    try {
      const html = await fs.readFile(templatePath, 'utf-8');
      return {
        subject: this.getTemplateSubject(type),
        html,
        text: this.stripHtml(html)
      };
    } catch (error) {
      // Return default template if file not found
      return this.getDefaultTemplate(type);
    }
  }

  /**
   * Get template subject based on type
   */
  private getTemplateSubject(type: EmailNotificationType): string {
    const subjects: Record<EmailNotificationType, string> = {
      [EmailNotificationType.APPOINTMENT_CONFIRMATION]: 'Appointment Confirmed - {{facilityName}}',
      [EmailNotificationType.APPOINTMENT_REMINDER]: 'Appointment Reminder - {{appointmentDate}}',
      [EmailNotificationType.APPOINTMENT_CANCELLATION]: 'Appointment Cancelled - {{facilityName}}',
      [EmailNotificationType.PRESCRIPTION_READY]: 'Your Prescription is Ready for Pickup',
      [EmailNotificationType.LAB_RESULTS_READY]: 'Your Lab Results are Available',
      [EmailNotificationType.PATIENT_REGISTRATION]: 'Welcome to {{facilityName}}',
      [EmailNotificationType.PAYMENT_CONFIRMATION]: 'Payment Confirmation - {{amount}}',
      [EmailNotificationType.SYSTEM_ALERT]: 'Important System Notification',
      [EmailNotificationType.WELCOME_EMAIL]: 'Welcome to GhEHR',
      [EmailNotificationType.PASSWORD_RESET]: 'Password Reset Request',
      [EmailNotificationType.MEDICATION_REMINDER]: 'Medication Reminder - {{medicationName}}',
      [EmailNotificationType.FOLLOW_UP_REMINDER]: 'Follow-up Appointment Reminder'
    };

    return subjects[type] || 'Notification from GhEHR';
  }

  /**
   * Get default template when template file is not found
   */
  private getDefaultTemplate(type: EmailNotificationType): EmailTemplate {
    const subject = this.getTemplateSubject(type);
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #dc143c 0%, #ff8c00 30%, #ffd700 60%, #32cd32 100%); color: white; padding: 20px; text-align: center; }
          .logo { height: 50px; width: auto; margin-bottom: 10px; }
          .content { padding: 30px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #dc143c; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .alert { padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://i.imgur.com/b8WvnC0.png" alt="GhEHR" class="logo" onerror="this.style.display='none';">
            <h1>GhEHR - Ghana Electronic Health Records</h1>
            <p>Your Health, Our Priority</p>
          </div>
          <div class="content">
            <h2>${subject}</h2>
            <p>Dear {{patientName}},</p>
            <div class="alert">
              <p>This is a notification from GhEHR regarding your healthcare.</p>
            </div>
            <p>If you have any questions, please contact {{facilityName}} at {{facilityPhone}} or {{facilityEmail}}.</p>
            <p>Best regards,<br>{{facilityName}} Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 GhEHR - Ghana Electronic Health Records System</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      subject,
      html,
      text: this.stripHtml(html)
    };
  }

  /**
   * Replace template variables with actual data
   */
  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    let result = template;
    
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(data[key] || ''));
    });

    return result;
  }

  /**
   * Strip HTML tags for text version
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Generate unique email ID
   */
  private generateEmailId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add email to queue
   */
  public async queueEmail(emailData: EmailData): Promise<string> {
    const emailId = this.generateEmailId();
    
    // Add to email log with pending status
    this.emailLogs.push({
      id: emailId,
      to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
      type: emailData.type,
      status: 'pending',
      data: emailData.data
    });

    // Add to queue
    this.emailQueue.push({
      ...emailData,
      data: { ...emailData.data, emailId }
    });

    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processEmailQueue();
    }

    return emailId;
  }

  /**
   * Send email immediately
   */
  public async sendEmail(emailData: EmailData): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.error('Email service not properly configured');
      return false;
    }

    try {
      const template = await this.loadTemplate(emailData.type);
      const emailId = this.generateEmailId();

      // Replace template variables
      const subject = this.replaceTemplateVariables(template.subject, emailData.data);
      const html = this.replaceTemplateVariables(template.html, emailData.data);
      const text = template.text ? this.replaceTemplateVariables(template.text, emailData.data) : undefined;

      const mailOptions = {
        from: `${this.config.fromName} <${this.config.from}>`,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject,
        html,
        text,
        attachments: emailData.attachments,
        headers: {
          'X-Priority': emailData.priority === 'high' ? '1' : emailData.priority === 'low' ? '5' : '3',
          'X-Email-ID': emailId
        }
      };

      const result = await this.transporter.sendMail(mailOptions);

      // Update email log
      const logIndex = this.emailLogs.findIndex(log => log.data.emailId === emailId);
      if (logIndex !== -1) {
        this.emailLogs[logIndex].status = 'sent';
        this.emailLogs[logIndex].sentAt = new Date();
      } else {
        this.emailLogs.push({
          id: emailId,
          to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
          type: emailData.type,
          status: 'sent',
          sentAt: new Date(),
          data: emailData.data
        });
      }

      console.log(`✅ Email sent successfully: ${result.messageId}`);
      return true;

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      // Update email log with error
      const logIndex = this.emailLogs.findIndex(log => log.data.emailId === emailData.data.emailId);
      if (logIndex !== -1) {
        this.emailLogs[logIndex].status = 'failed';
        this.emailLogs[logIndex].errorMessage = error instanceof Error ? error.message : 'Unknown error';
      }

      return false;
    }
  }

  /**
   * Process email queue
   */
  private async processEmailQueue(): Promise<void> {
    if (this.isProcessingQueue || this.emailQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.emailQueue.length > 0) {
      const emailData = this.emailQueue.shift();
      if (emailData) {
        // Check if email should be sent now or scheduled
        if (emailData.sendAt && emailData.sendAt > new Date()) {
          // Put back in queue for later processing
          this.emailQueue.push(emailData);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          continue;
        }

        await this.sendEmail(emailData);
        
        // Small delay between emails to avoid overwhelming the SMTP server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Get email logs with filtering
   */
  public getEmailLogs(filter?: {
    type?: EmailNotificationType;
    status?: 'pending' | 'sent' | 'failed' | 'bounced';
    from?: Date;
    to?: Date;
  }): EmailLog[] {
    let logs = [...this.emailLogs];

    if (filter) {
      if (filter.type) {
        logs = logs.filter(log => log.type === filter.type);
      }
      if (filter.status) {
        logs = logs.filter(log => log.status === filter.status);
      }
      if (filter.from) {
        logs = logs.filter(log => log.sentAt && log.sentAt >= filter.from!);
      }
      if (filter.to) {
        logs = logs.filter(log => log.sentAt && log.sentAt <= filter.to!);
      }
    }

    return logs.sort((a, b) => {
      const dateA = a.sentAt || new Date(0);
      const dateB = b.sentAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Get email statistics
   */
  public getEmailStats(): Record<string, number> {
    const stats = {
      total: this.emailLogs.length,
      sent: 0,
      failed: 0,
      pending: 0,
      bounced: 0
    };

    this.emailLogs.forEach(log => {
      stats[log.status]++;
    });

    return stats;
  }

  /**
   * Test email configuration
   */
  public async testEmailConfig(testEmail: string): Promise<boolean> {
    try {
      await this.sendEmail({
        to: testEmail,
        type: EmailNotificationType.SYSTEM_ALERT,
        data: {
          patientName: 'Test User',
          facilityName: 'GhEHR System',
          facilityPhone: '+233 XX XXX XXXX',
          facilityEmail: 'support@ghehr.gh',
          message: 'This is a test email to verify your email configuration is working correctly.'
        }
      });
      return true;
    } catch (error) {
      console.error('Email test failed:', error);
      return false;
    }
  }

  /**
   * Update email configuration
   */
  public async updateEmailConfig(newConfig: EmailConfig): Promise<boolean> {
    try {
      this.config = newConfig;
      
      // Recreate transporter with new config
      this.transporter = nodemailer.createTransport({
        host: newConfig.host,
        port: newConfig.port,
        secure: newConfig.secure,
        auth: newConfig.auth,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });

      // Verify new connection
      const isConnected = await this.verifyConnection();
      if (isConnected) {
        console.log('✅ Email configuration updated successfully');
        return true;
      } else {
        throw new Error('Failed to verify new email configuration');
      }
    } catch (error) {
      console.error('❌ Failed to update email configuration:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default EmailService;
