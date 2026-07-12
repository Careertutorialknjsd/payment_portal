const PDFDocument = require('pdfkit');

/**
 * Generates a receipt PDF and returns it as a Buffer.
 */
const generateReceiptPDF = ({ receiptId, studentName, course, amount, date, status, email, monthLabel }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const brand = process.env.UPI_PAYEE_NAME || 'Career Tutorial';

      // Header band
      doc.rect(0, 0, doc.page.width, 110).fill('#6366f1');
      doc
        .fillColor('#ffffff')
        .fontSize(26)
        .font('Helvetica-Bold')
        .text(brand, 50, 35);
      doc
        .fontSize(12)
        .font('Helvetica')
        .text('Official Fee Payment Receipt', 50, 68);

      doc.fillColor('#111827');

      // Receipt meta box
      doc.roundedRect(50, 140, doc.page.width - 100, 90, 8).stroke('#e5e7eb');
      doc.fontSize(10).fillColor('#6b7280').text('RECEIPT ID', 65, 155);
      doc.fontSize(13).fillColor('#111827').font('Helvetica-Bold').text(receiptId, 65, 170);

      doc.fontSize(10).fillColor('#6b7280').font('Helvetica').text('DATE', 320, 155);
      doc.fontSize(13).fillColor('#111827').font('Helvetica-Bold').text(new Date(date).toLocaleString('en-IN'), 320, 170);

      doc.fontSize(10).fillColor('#6b7280').font('Helvetica').text('STATUS', 65, 200);
      doc.fontSize(13).fillColor('#059669').font('Helvetica-Bold').text(status, 65, 215);

      // Details table
      let y = 260;
      const rows = [
        ['Student Name', studentName],
        ['Email', email || '-'],
        ['Course', course],
        ['Fee Month', monthLabel || '-'],
        ['Amount Paid', `Rs. ${amount}`],
      ];

      doc.fontSize(14).fillColor('#111827').font('Helvetica-Bold').text('Payment Details', 50, y);
      y += 30;

      rows.forEach(([label, value], idx) => {
        const bg = idx % 2 === 0 ? '#f9fafb' : '#ffffff';
        doc.rect(50, y, doc.page.width - 100, 34).fill(bg);
        doc.fillColor('#374151').fontSize(11).font('Helvetica').text(label, 65, y + 11);
        doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text(String(value), 300, y + 11);
        y += 34;
      });

      // Total box
      y += 20;
      doc.roundedRect(50, y, doc.page.width - 100, 50, 8).fill('#ecfdf5');
      doc.fillColor('#065f46').fontSize(12).font('Helvetica').text('Total Amount Received', 65, y + 17);
      doc.fillColor('#065f46').fontSize(18).font('Helvetica-Bold').text(`Rs. ${amount}`, doc.page.width - 200, y + 12, {
        width: 130,
        align: 'right',
      });

      // Footer
      doc
        .fontSize(9)
        .fillColor('#9ca3af')
        .font('Helvetica')
        .text(
          'This is a system-generated receipt and does not require a physical signature.',
          50,
          doc.page.height - 80,
          { align: 'center', width: doc.page.width - 100 }
        );
      doc.text(`${brand} | Generated on ${new Date().toLocaleString('en-IN')}`, 50, doc.page.height - 65, {
        align: 'center',
        width: doc.page.width - 100,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateReceiptPDF };
