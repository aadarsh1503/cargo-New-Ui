const { sendMail, getSettings } = require('./emailProvider');

const LOGO = 'https://res.cloudinary.com/ds1dt3qub/image/upload/v1771406257/internship_resumes/nxo9sunwlizs6nhorhcp.png';

// Get admin notification email dynamically from DB (falls back to env)
const getAdminEmail = async () => {
  try {
    const cfg = await getSettings();
    if (cfg?.EMAIL_PROVIDER === 'aws') return cfg.AWS_SES_FROM_EMAIL || process.env.EMAIL_FROM;
    return cfg?.SMTP_FROM_EMAIL || process.env.EMAIL_FROM;
  } catch {
    return process.env.EMAIL_FROM;
  }
};

// ─── Branded HTML wrapper ─────────────────────────────────────────────────────
const wrap = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#243670;padding:28px 40px;text-align:center;">
            <img src="${LOGO}" alt="GVS Cargo" style="height:56px;max-width:200px;object-fit:contain;" />
          </td>
        </tr>
        <!-- Title bar -->
        <tr>
          <td style="background:#f8f0ff;padding:18px 40px;border-bottom:1px solid #e8e0f0;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#243670;">${title}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;color:#374151;font-size:14px;line-height:1.7;">
            ${bodyHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f4f6fb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} GVS Cargo. All rights reserved.</p>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">This is an automated notification — please do not reply.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ─── Info row helper ──────────────────────────────────────────────────────────
const row = (label, value) => value
  ? `<tr><td style="padding:4px 0;color:#6b7280;width:160px;font-size:13px;">${label}</td><td style="padding:4px 0;font-weight:600;color:#111827;font-size:13px;">${value}</td></tr>`
  : '';

const table = (rows) => `<table cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;">${rows}</table>`;

// ─── Send to multiple recipients, never throw ─────────────────────────────────
const send = async (recipients, subject, html) => {
  await Promise.allSettled(
    recipients.filter(Boolean).map(to =>
      sendMail({ to, subject, html })
    )
  );
};

// ─── Send to admin (resolves email from DB) ───────────────────────────────────
const sendAdmin = async (subject, html) => {
  const adminEmail = await getAdminEmail();
  if (adminEmail) await sendMail({ to: adminEmail, subject, html }).catch(console.error);
};

// ─── Status label map ─────────────────────────────────────────────────────────
const STATUS_LABEL = {
  submitted:          'Request Submitted',
  forwarded_to_agent: 'Forwarded to Agent',
  agent_priced:       'Agent Submitted Price',
  sent_to_user:       'Quote Sent to Customer',
  user_approved:      'Customer Approved Quote',
  payment_requested:  'Payment Requested',
  payment_completed:  'Payment Completed',
  in_progress:        'Shipment In Progress',
  completed:          'Shipment Completed',
  cancelled:          'Booking Cancelled',
};

// ─── Shared booking info block ────────────────────────────────────────────────
const bookingInfo = (b) => table([
  row('Reference', b.reference_id),
  row('Route', `${b.port_of_loading_city || ''} → ${b.port_of_discharge_city || ''}`),
  row('Company', b.company),
  row('Commodity', b.commodity),
  b.final_price ? row('Final Price', `${b.final_currency || 'USD'} ${parseFloat(b.final_price).toLocaleString()}`) : '',
].join(''));

// ═══════════════════════════════════════════════════════════════════════════════
// 1. New request submitted
// ═══════════════════════════════════════════════════════════════════════════════
const notifyNewRequest = async (b) => {
  const subject = `New Freight Request — ${b.reference_id}`;
  const html = wrap('New Freight Request Received', `
    <p>A new freight request has been submitted.</p>
    ${bookingInfo(b)}
    ${table([
      row('Customer', b.name),
      row('Email', b.email),
      row('Phone', b.telephone),
      row('Mode', b.mode_of_shipment),
      row('Weight', b.gross_weight ? `${b.gross_weight} ${b.weight_unit}` : '—'),
      b.message ? row('Message', b.message) : '',
    ].join(''))}
    <p style="margin-top:24px;">Please log in to the admin panel to review and forward this request.</p>
  `);
  await sendAdmin(subject, html);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Forwarded to agent
// ═══════════════════════════════════════════════════════════════════════════════
const notifyForwardedToAgent = async (b) => {
  const subject = `New Assignment — ${b.reference_id}`;

  // To agent
  if (b.agent_email) {
    await send([b.agent_email], subject, wrap('You Have a New Assignment', `
      <p>Hi ${b.agent_name || 'Agent'},</p>
      <p>A new freight request has been assigned to you. Please review and submit your price.</p>
      ${bookingInfo(b)}
      ${b.admin_notes ? `<p><strong>Admin Notes:</strong> ${b.admin_notes}</p>` : ''}
      <p style="margin-top:24px;">Please log in to your agent portal to submit your price.</p>
    `));
  }

  // To admin confirmation
  await sendAdmin(`Request Forwarded — ${b.reference_id}`, wrap('Request Forwarded to Agent', `
    <p>Request <strong>${b.reference_id}</strong> has been forwarded to agent <strong>${b.agent_name || '—'}</strong>.</p>
    ${bookingInfo(b)}
  `));
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Agent submitted price
// ═══════════════════════════════════════════════════════════════════════════════
const notifyAgentPriced = async (b) => {
  const subject = `Agent Submitted Price — ${b.reference_id}`;
  await sendAdmin(subject, wrap('Agent Has Submitted a Price', `
    <p>Agent <strong>${b.agent_name || '—'}</strong> has submitted a price for request <strong>${b.reference_id}</strong>.</p>
    ${bookingInfo(b)}
    ${table([
      row('Agent Price', `${b.agent_currency || 'USD'} ${parseFloat(b.agent_price || 0).toLocaleString()}`),
      b.agent_notes ? row('Agent Notes', b.agent_notes) : '',
    ].join(''))}
    <p style="margin-top:24px;">Please log in to add your commission and send the quote to the customer.</p>
  `));
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Quote sent to user
// ═══════════════════════════════════════════════════════════════════════════════
const notifyQuoteSentToUser = async (b) => {
  const subject = `Your Freight Quote is Ready — ${b.reference_id}`;

  // To customer
  await send([b.email], subject, wrap('Your Freight Quote is Ready', `
    <p>Dear ${b.name || 'Customer'},</p>
    <p>Your freight quote is ready. Please review the details below and approve if you'd like to proceed.</p>
    ${bookingInfo(b)}
    <p style="margin-top:24px;">
      <a href="${process.env.FRONTEND_URL}/my-bookings" 
         style="background:#243670;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
        View & Approve Quote
      </a>
    </p>
    <p style="margin-top:16px;font-size:12px;color:#9ca3af;">If you have questions, please contact us.</p>
  `));

  // To agent — only show their submitted price, no commission or final price
  if (b.agent_email) {
    await send([b.agent_email], `Quote Sent to Customer — ${b.reference_id}`, wrap('Quote Has Been Sent to Customer', `
      <p>Hi ${b.agent_name || 'Agent'},</p>
      <p>The quote for request <strong>${b.reference_id}</strong> has been reviewed and sent to the customer.</p>
      ${table([
        row('Reference', b.reference_id),
        row('Route', `${b.port_of_loading_city || ''} → ${b.port_of_discharge_city || ''}`),
        row('Company', b.company),
        row('Commodity', b.commodity),
        row('Your Submitted Price', `${b.agent_currency || 'USD'} ${parseFloat(b.agent_price || 0).toLocaleString()}`),
        b.agent_notes ? row('Your Notes', b.agent_notes) : '',
      ].join(''))}
      <p style="margin-top:16px;font-size:13px;color:#6b7280;">You will be notified once the customer approves and completes payment.</p>
    `));
  }

  // To admin
  await sendAdmin(`Quote Sent to Customer — ${b.reference_id}`, wrap('Quote Sent to Customer', `
    <p>Quote for <strong>${b.reference_id}</strong> has been sent to customer <strong>${b.email}</strong>.</p>
    ${bookingInfo(b)}
  `));
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. User approved quote
// ═══════════════════════════════════════════════════════════════════════════════
const notifyUserApproved = async (b) => {
  const subject = `Customer Approved Quote — ${b.reference_id}`;
  const body = wrap('Customer Has Approved the Quote', `
    <p>The customer has approved the quote for <strong>${b.reference_id}</strong>.</p>
    ${bookingInfo(b)}
    <p style="margin-top:24px;">Please proceed with sending the payment request.</p>
  `);
  await Promise.allSettled([
    sendAdmin(subject, body),
    b.agent_email ? send([b.agent_email], subject, body) : null,
  ]);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Payment requested
// ═══════════════════════════════════════════════════════════════════════════════
const notifyPaymentRequested = async (b) => {
  // To customer
  await send([b.email], `Payment Request — ${b.reference_id}`, wrap('Payment Required', `
    <p>Dear ${b.name || 'Customer'},</p>
    <p>Your booking <strong>${b.reference_id}</strong> is confirmed and payment is now required to proceed.</p>
    ${bookingInfo(b)}
    <p style="margin-top:24px;">Please contact us to complete your payment.</p>
  `));

  // To admin
  await sendAdmin(`Payment Request Sent — ${b.reference_id}`, wrap('Payment Request Sent to Customer', `
    <p>Payment request has been sent to <strong>${b.email}</strong> for booking <strong>${b.reference_id}</strong>.</p>
    ${bookingInfo(b)}
  `));
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Payment completed
// ═══════════════════════════════════════════════════════════════════════════════
const notifyPaymentCompleted = async (b) => {
  const subject = `Payment Confirmed — ${b.reference_id}`;

  // To customer
  await send([b.email], subject, wrap('Payment Confirmed — Booking Active', `
    <p>Dear ${b.name || 'Customer'},</p>
    <p>We have received your payment. Your booking is now <strong>active</strong> and the shipment process has begun.</p>
    ${bookingInfo(b)}
    <p style="margin-top:24px;">
      <a href="${process.env.FRONTEND_URL}/my-bookings"
         style="background:#243670;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
        Track Your Booking
      </a>
    </p>
  `));

  // To admin + agent
  await Promise.allSettled([
    sendAdmin(`Payment Received — ${b.reference_id}`, wrap('Payment Received', `
      <p>Payment has been confirmed for booking <strong>${b.reference_id}</strong>.</p>
      ${bookingInfo(b)}
    `)),
    b.agent_email ? send([b.agent_email], `Payment Received — ${b.reference_id}`, wrap('Payment Received', `
      <p>Payment has been confirmed for booking <strong>${b.reference_id}</strong>.</p>
      ${bookingInfo(b)}
    `)) : null,
  ]);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Status update (in_progress / completed)
// ═══════════════════════════════════════════════════════════════════════════════
const notifyStatusUpdate = async (b, newStatus) => {
  const label = STATUS_LABEL[newStatus] || newStatus;
  const subject = `Booking Update — ${b.reference_id}`;

  const customerMsg = {
    in_progress: 'Your shipment is now <strong>in progress</strong>. We will keep you updated.',
    completed:   'Your shipment has been <strong>delivered successfully</strong>. Thank you for choosing GVS Cargo!',
  }[newStatus] || `Your booking status has been updated to <strong>${label}</strong>.`;

  // To customer
  await send([b.email], subject, wrap(`Booking Status: ${label}`, `
    <p>Dear ${b.name || 'Customer'},</p>
    <p>${customerMsg}</p>
    ${bookingInfo(b)}
    <p style="margin-top:24px;">
      <a href="${process.env.FRONTEND_URL}/my-bookings"
         style="background:#243670;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
        Track Your Booking
      </a>
    </p>
  `));

  // To admin + agent
  await Promise.allSettled([
    sendAdmin(`Status Updated: ${label} — ${b.reference_id}`, wrap(`Status Updated: ${label}`, `
      <p>Booking <strong>${b.reference_id}</strong> status changed to <strong>${label}</strong>.</p>
      ${bookingInfo(b)}
    `)),
    b.agent_email ? send([b.agent_email], `Status Updated: ${label} — ${b.reference_id}`, wrap(`Status Updated: ${label}`, `
      <p>Booking <strong>${b.reference_id}</strong> status changed to <strong>${label}</strong>.</p>
      ${bookingInfo(b)}
    `)) : null,
  ]);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Cancelled (with reason)
// ═══════════════════════════════════════════════════════════════════════════════
const notifyCancelled = async (b, reason) => {
  const subject = `Booking Cancelled — ${b.reference_id}`;

  const feeBlock = (b.cancellation_fee != null)
    ? `<table cellpadding="0" cellspacing="0" style="width:100%;margin:16px 0;background:#fff7f7;border:1px solid #fecaca;border-radius:8px;padding:12px;">
        ${row('Total Paid', `${b.final_currency || 'USD'} ${parseFloat(b.final_price).toLocaleString()}`)}
        ${row('Cancellation Fee', `${b.final_currency || 'USD'} ${parseFloat(b.cancellation_fee).toLocaleString()}`)}
        ${row('Refund Amount', `<strong style="color:#16a34a;">${b.final_currency || 'USD'} ${parseFloat(b.refund_amount).toLocaleString()}</strong>`)}
      </table>`
    : '';

  const html = (name) => wrap('Booking Cancelled', `
    <p>Dear ${name},</p>
    <p>Booking <strong>${b.reference_id}</strong> has been <strong>cancelled</strong>.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    ${bookingInfo(b)}
    ${feeBlock}
    <p style="margin-top:16px;">If you have questions, please contact GVS Cargo.</p>
  `);

  await Promise.allSettled([
    send([b.email], subject, html(b.name || 'Customer')),
    b.agent_email ? send([b.agent_email], subject, html(b.agent_name || 'Agent')) : null,
    sendAdmin(subject, html('Admin')),
  ]);
};

// ═══════════════════════════════════════════════════════════════════════════════
// 10. OTP verification email
// ═══════════════════════════════════════════════════════════════════════════════
const notifyUserOTP = async (email, otp) => {
  await send([email], 'Your GVS Cargo Verification Code', wrap('Email Verification Code', `
    <p>Use the code below to verify your email and view your bookings.</p>
    <div style="text-align:center;margin:32px 0;">
      <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#243670;background:#f0f4ff;padding:16px 32px;border-radius:12px;display:inline-block;">${otp}</span>
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
  `));
};

// ═══════════════════════════════════════════════════════════════════════════════
// 11. Agent requested payment from admin
// ═══════════════════════════════════════════════════════════════════════════════
const notifyAgentPaymentRequested = async (b) => {
  const subject = `Agent Payment Request — ${b.reference_id}`;
  await sendAdmin(subject, wrap('Agent Has Requested Payment', `
    <p>Agent <strong>${b.agent_name || '—'}</strong> has requested payment for booking <strong>${b.reference_id}</strong>.</p>
    ${bookingInfo(b)}
    ${table([
      row('Agent', b.agent_name),
      row('Agent Email', b.agent_email),
      row('Agent Price', b.agent_price ? `${b.agent_currency || 'USD'} ${parseFloat(b.agent_price).toLocaleString()}` : '—'),
    ].join(''))}
    <p style="margin-top:24px;">Please log in to the admin panel to review and process the payment.</p>
  `));
};

module.exports = {
  notifyNewRequest,
  notifyForwardedToAgent,
  notifyAgentPriced,
  notifyQuoteSentToUser,
  notifyUserApproved,
  notifyPaymentRequested,
  notifyPaymentCompleted,
  notifyStatusUpdate,
  notifyCancelled,
  notifyUserOTP,
  notifyAgentPaymentRequested,
};
