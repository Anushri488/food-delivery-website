const PDFDocument = require('pdfkit');

const generateInvoice = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Response ko PDF ki tarah set karo
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

  doc.pipe(res);

  // Header
  doc.fontSize(20).text('Food Delivery App', { align: 'center' });
  doc.fontSize(12).text('Order Invoice', { align: 'center' });
  doc.moveDown(2);

  // Order Info
  doc.fontSize(10);
  doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Delivery Address: ${order.deliveryAddress}`);
  doc.text(`Phone: ${order.phone}`);
  doc.text(`Payment Status: ${order.paymentStatus}`);
  doc.moveDown(1.5);

  // Table Header
  doc.fontSize(11).font('Helvetica-Bold');
  doc.text('Item', 50, doc.y, { continued: true, width: 200 });
  doc.text('Qty', 260, doc.y, { continued: true, width: 60 });
  doc.text('Price', 330, doc.y, { continued: true, width: 80 });
  doc.text('Subtotal', 420, doc.y);
  doc.moveDown(0.5);

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Table Rows
  doc.font('Helvetica').fontSize(10);
  order.items.forEach((item) => {
    const subtotal = item.price * item.quantity;
    const rowY = doc.y;
    doc.text(item.name, 50, rowY, { width: 200 });
    doc.text(String(item.quantity), 260, rowY, { width: 60 });
    doc.text(`Rs. ${item.price}`, 330, rowY, { width: 80 });
    doc.text(`Rs. ${subtotal}`, 420, rowY);
    doc.moveDown(0.7);
  });

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // Totals
  const itemsTotal = order.totalAmount - order.deliveryFee;
  doc.font('Helvetica').text(`Items Total: Rs. ${itemsTotal}`, { align: 'right' });
  doc.text(`Delivery Fee: Rs. ${order.deliveryFee}`, { align: 'right' });
  doc.font('Helvetica-Bold').fontSize(12).text(`Grand Total: Rs. ${order.totalAmount}`, { align: 'right' });

  doc.moveDown(2);
  doc.fontSize(9).font('Helvetica').text('Thank you for ordering with us!', { align: 'center' });

  doc.end();
};

module.exports = generateInvoice;