import { useRef } from 'react';

const GVS_LOGO = 'https://res.cloudinary.com/ds1dt3qub/image/upload/v1771434866/internship_resumes/dnqtsc5sltem7knc0ukm.png';

const INVOICE_STATUSES = [
  'payment_completed', 'agent_payment_requested', 'agent_payment_completed', 'in_progress', 'completed',
];

const Row = ({ label, value }) => value ? (
  <tr className="border-b border-gray-100">
    <td className="py-2 pr-4 text-xs text-gray-500 font-medium w-40">{label}</td>
    <td className="py-2 text-xs text-gray-800 font-semibold">{value}</td>
  </tr>
) : null;

const BookingInvoice = ({ booking }) => {
  const printRef = useRef();

  if (!booking || !INVOICE_STATUSES.includes(booking.status)) return null;

  const invoiceNo = `INV-${booking.reference_id}`;
  const paidDate = new Date(booking.updated_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; color: #1f2937; background: #fff; padding: 40px; }
            .invoice-wrap { max-width: 780px; margin: 0 auto; }
            img { max-height: 60px; object-fit: contain; }
            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 8px 12px; font-size: 12px; }
            th { background: #f9fafb; font-weight: 600; text-align: left; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
            .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
            .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="invoice-wrap">${content}</div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm font-bold text-gray-700">Invoice</p>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Save PDF
        </button>
      </div>

      {/* Invoice body — also used for print */}
      <div ref={printRef} className="p-6 space-y-5">
        {/* Company header */}
        <div className="flex items-start justify-between">
          <div>
            <img src={GVS_LOGO} alt="GVS Cargo" className="h-14 object-contain mb-2" />
            <p className="text-xs text-gray-500">GVS Cargo & Logistics</p>
            <p className="text-xs text-gray-500">Bahrain | UAE | Saudi Arabia</p>
            <p className="text-xs text-gray-500">info@gvscargo.com</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-800">INVOICE</p>
            <p className="text-xs text-gray-500 mt-1">Invoice No: <span className="font-semibold text-gray-700">{invoiceNo}</span></p>
            <p className="text-xs text-gray-500">Date: <span className="font-semibold text-gray-700">{paidDate}</span></p>
            <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">PAID</span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Bill to */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</p>
          <p className="text-sm font-bold text-gray-800">{booking.company}</p>
          <p className="text-xs text-gray-600">{booking.name}</p>
          <p className="text-xs text-gray-500">{booking.email}</p>
          {booking.telephone && <p className="text-xs text-gray-500">{booking.telephone}</p>}
        </div>

        {/* Shipment details table */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Shipment Details</p>
          <table className="w-full text-xs">
            <tbody>
              <Row label="Reference ID" value={booking.reference_id} />
              <Row label="Port of Loading" value={`${booking.port_of_loading_city}${booking.port_of_loading ? ` (${booking.port_of_loading})` : ''}`} />
              <Row label="Port of Discharge" value={`${booking.port_of_discharge_city}${booking.port_of_discharge ? ` (${booking.port_of_discharge})` : ''}`} />
              <Row label="Mode of Shipment" value={booking.mode_of_shipment} />
              <Row label="Commodity" value={booking.commodity} />
              {booking.gross_weight && (
                <Row label="Gross Weight" value={`${booking.gross_weight} ${booking.weight_unit || 'kg'}`} />
              )}
              {booking.boxes_pallets && (
                <Row label="Boxes / Pallets" value={booking.boxes_pallets} />
              )}
            </tbody>
          </table>
        </div>

        {/* Payment summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Summary</p>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
            <span className="text-xs text-gray-600">Freight Charges</span>
            <span className="text-xs font-semibold text-gray-800">
              USD {parseFloat(booking.final_price || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800">Total Paid</span>
            <span className="text-sm font-bold text-green-600">
              USD {parseFloat(booking.final_price || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
          Thank you for choosing GVS Cargo & Logistics. For queries, contact info@gvscargo.com
        </p>
      </div>
    </div>
  );
};

export default BookingInvoice;
