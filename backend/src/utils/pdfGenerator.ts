import PDFDocument from 'pdfkit';
import { Response } from 'express';

// Types
interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  logo?: string;
  date?: string;
  user?: {
    name: string;
    role: string;
  };
}

interface ReportContentProps {
  sections: {
    title: string;
    content: string | string[] | { [key: string]: any }[];
    type?: 'text' | 'list' | 'table';
  }[];
}

class PDFGenerator {
  /**
   * Generate a PDF report
   * @param res Express response object
   * @param header Report header information
   * @param content Report content
   * @param filename PDF filename
   */
  static generateReport(
    res: Response,
    header: ReportHeaderProps,
    content: ReportContentProps,
    filename: string
  ): void {
    // Create a document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add GhEHR logo and title
    doc.fontSize(25).text('GhEHR', { align: 'center' });
    doc.fontSize(18).text(header.title, { align: 'center' });
    
    if (header.subtitle) {
      doc.fontSize(12).text(header.subtitle, { align: 'center' });
    }
    
    // Add date and user info
    doc.moveDown();
    doc.fontSize(10).text(`Date: ${header.date || new Date().toLocaleDateString('en-GH')}`, { align: 'right' });
    
    if (header.user) {
      doc.fontSize(10).text(`Generated by: ${header.user.name} (${header.user.role})`, { align: 'right' });
    }
    
    // Add horizontal line
    doc.moveDown();
    doc.moveTo(50, doc.y)
       .lineTo(doc.page.width - 50, doc.y)
       .stroke();
    doc.moveDown();
    
    // Add content sections
    content.sections.forEach(section => {
      // Add section title
      doc.fontSize(14).text(section.title);
      doc.moveDown(0.5);
      
      // Add section content based on type
      switch (section.type) {
        case 'list':
          if (Array.isArray(section.content)) {
            section.content.forEach(item => {
              doc.fontSize(10).text(`• ${item}`);
            });
          }
          break;
          
        case 'table':
          if (Array.isArray(section.content) && section.content.length > 0) {
            // Simple table implementation
            const tableData = section.content as Record<string, any>[];
            const keys = Object.keys(tableData[0]);
            
            // Table header
            doc.fontSize(10);
            let xPos = 50;
            const columnWidth = (doc.page.width - 100) / keys.length;
            
            keys.forEach(key => {
              doc.text(key.charAt(0).toUpperCase() + key.slice(1), xPos, doc.y);
              xPos += columnWidth;
            });
            
            doc.moveDown(0.5);
            
            // Table rows
            tableData.forEach(item => {
              xPos = 50;
              keys.forEach(key => {
                doc.text(String(item[key]), xPos, doc.y);
                xPos += columnWidth;
              });
              doc.moveDown(0.5);
            });
          }
          break;
          
        case 'text':
        default:
          doc.fontSize(10).text(section.content as string);
          break;
      }
      
      doc.moveDown();
    });
    
    // Add page numbers
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(
        `Page ${i + 1} of ${totalPages}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
    }
    
    // Finalize PDF
    doc.end();
  }
}

export default PDFGenerator;
