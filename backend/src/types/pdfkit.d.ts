declare module 'pdfkit' {
  import { Readable } from 'stream';
  
  class PDFDocument extends Readable {
    constructor(options?: any);
    pipe(destination: any): any;
    text(text: string, options?: any): void;
    fontSize(size: number): PDFDocument;
    moveDown(lines?: number): PDFDocument;
    font(font: string): PDFDocument;
    fillColor(color: string): PDFDocument;
    rect(x: number, y: number, width: number, height: number): PDFDocument;
    fill(): PDFDocument;
    stroke(): PDFDocument;
    end(): void;
  }
  
  export = PDFDocument;
} 