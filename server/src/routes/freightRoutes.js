const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const crypto = require('crypto');
const multer = require('multer');
const imagekit = require('../config/imagekit');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const { protectAdmin } = require('../middleware/authMiddleware');
const { protectAgent } = require('../middleware/agentAuthMiddleware');
const { sendMail, getSettings } = require('../../utils/emailProvider');
const { verifyRecaptcha } = require('../../utils/recaptcha');
const {
  submitFreightRequest,
  getLeads, getBookings, getFreightRequest,
  forwardToAgent, addCommissionAndSendToUser,
  sendPaymentRequest, markPaymentCompleted, userConfirmPayment, userCancelBooking,
  agentRequestPayment, adminPayAgent, agentMarkDelivered,
  updateStatus, deleteFreightRequest,
  agentLogin, getAgentRequests, agentSubmitPrice,
  getAgents, createAgent, updateAgent, deleteAgent, toggleAgent, cancelBooking
} = require('../controllers/freightController');

// ── Public ──────────────────────────────────────────────────────────────────
router.post('/submit', submitFreightRequest);

// ── Save partial draft (user filled Step 1+ but didn't submit) ───────────────
router.post('/draft', async (req, res) => {
  try {
    const {
      name, email, telephone, company,
      portOfLoading, portOfLoadingCity, portOfDischarge, portOfDischargeCity,
      modeOfShipment, commodity, grossWeight, weightUnit,
      boxesPallets, boxPalletSize, boxPalletUnit,
      length, width, height, dimensionUnit, message
    } = req.body;

    if (!name || !email) return res.status(400).json({ message: 'Name and email required' });

    const [existing] = await pool.query(
      `SELECT id FROM freight_requests WHERE email = ? AND status = 'draft' LIMIT 1`,
      [email.toLowerCase()]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE freight_requests SET
          name=?, telephone=?, company=?,
          port_of_loading=?, port_of_loading_city=?,
          port_of_discharge=?, port_of_discharge_city=?,
          mode_of_shipment=?, commodity=?,
          gross_weight=?, weight_unit=?,
          boxes_pallets=?, box_pallet_size=?, box_pallet_unit=?,
          length_dim=?, width_dim=?, height_dim=?, dimension_unit=?,
          message=?, updated_at=NOW()
        WHERE id=?`,
        [
          name, telephone || '', company || '',
          portOfLoading || '', portOfLoadingCity || '',
          portOfDischarge || '', portOfDischargeCity || '',
          modeOfShipment || '', commodity || '',
          grossWeight || null, weightUnit || 'kg',
          boxesPallets || null, boxPalletSize || null, boxPalletUnit || 'cm',
          length || null, width || null, height || null, dimensionUnit || 'cm',
          message || '',
          existing[0].id
        ]
      );
      return res.json({ success: true, updated: true });
    }

    const referenceId = 'DFT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    await pool.query(
      `INSERT INTO freight_requests
        (reference_id, company, name, telephone, email,
         port_of_loading, port_of_loading_city, port_of_discharge, port_of_discharge_city,
         mode_of_shipment, commodity, status, request_type)
       VALUES (?,?,?,?,?, '','','','', '','', 'draft','lead')`,
      [referenceId, company || '', name, telephone || '', email.toLowerCase()]
    );
    res.json({ success: true, created: true });
  } catch (err) {
    console.error('Draft save error:', err);
    res.status(500).json({ message: 'Failed to save draft' });
  }
});

// ── In-memory OTP store: { email -> { otp, expires } } ───────────────────────
const otpStore = new Map();

// ── User: send OTP ────────────────────────────────────────────────────────────
router.post('/user/send-otp', async (req, res) => {
  try {
    const { email, recaptchaToken } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    // Verify reCAPTCHA v3
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });

    // Check if this email has any bookings in the system
    const pool = require('../config/db');
    const [rows] = await pool.query(
      'SELECT id FROM freight_requests WHERE email=? LIMIT 1',
      [email.toLowerCase()]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'No bookings found for this email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email.toLowerCase(), { otp, expires: Date.now() + 10 * 60 * 1000 });
    const { notifyUserOTP } = require('../../utils/freightMailer');
    await notifyUserOTP(email, otp);
    res.json({ success: true });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send code' });
  }
});

// ── User: verify OTP ──────────────────────────────────────────────────────────
router.post('/user/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and code required' });
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return res.status(400).json({ message: 'No code found. Please request a new one.' });
  if (Date.now() > entry.expires) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ message: 'Code expired. Please request a new one.' });
  }
  if (entry.otp !== otp.trim()) return res.status(400).json({ message: 'Invalid code' });
  otpStore.delete(email.toLowerCase());
  res.json({ success: true });
});

// ── User: lookup own bookings by email ───────────────────────────────────────
router.get('/user/bookings', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const pool = require('../config/db');
    const [rows] = await pool.query(
      'SELECT * FROM freight_requests WHERE email=? ORDER BY created_at DESC',
      [email]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// ── User: approve quote ───────────────────────────────────────────────────────
router.patch('/user/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const pool = require('../config/db');
    const [rows] = await pool.query('SELECT id FROM freight_requests WHERE id=? AND email=? AND status=?', [id, email, 'sent_to_user']);
    if (!rows.length) return res.status(403).json({ message: 'Not authorized or invalid status' });
    await pool.query("UPDATE freight_requests SET status='user_approved', updated_at=NOW() WHERE id=?", [id]);
    res.json({ success: true });
    // Notify admin + agent
    const pool2 = require('../config/db');
    const { notifyUserApproved } = require('../../utils/freightMailer');
    const [full] = await pool2.query(
      `SELECT fr.*, a.name AS agent_name, a.email AS agent_email FROM freight_requests fr LEFT JOIN agents a ON fr.assigned_agent_id=a.id WHERE fr.id=?`, [id]
    );
    if (full.length) notifyUserApproved(full[0]).catch(console.error);
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({ message: 'Error approving booking' });
  }
});

// ── User: confirm payment ─────────────────────────────────────────────────────
router.patch('/user/confirm-payment/:id', userConfirmPayment);

// ── User: cancel booking ──────────────────────────────────────────────────────
router.patch('/user/cancel/:id', userCancelBooking);

// ── User: upload bank transfer proof ─────────────────────────────────────────
router.post('/user/payment-proof/:id', upload.single('proof'), async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!email || !req.file) return res.status(400).json({ message: 'Email and file required' });

    const [rows] = await pool.query(
      `SELECT id FROM freight_requests WHERE id=? AND email=? AND status IN ('sent_to_user','payment_requested')`,
      [id, email]
    );
    if (!rows.length) return res.status(403).json({ message: 'Not authorized or invalid status' });

    const ext = req.file.originalname.split('.').pop();
    const uploadRes = await imagekit.upload({
      file: req.file.buffer,
      fileName: `payment_proof_${id}_${Date.now()}.${ext}`,
      folder: '/payment_proofs',
    });

    await pool.query(
      `UPDATE freight_requests SET payment_proof_url=?, status='payment_proof_submitted', request_type='booking', updated_at=NOW() WHERE id=?`,
      [uploadRes.url, id]
    );
    res.json({ success: true, url: uploadRes.url });
  } catch (e) {
    console.error('Proof upload error:', e);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// ── Admin: get/set own payment details (bank + PayPal) ────────────────────────
router.get('/admin/payment-details', async (req, res) => {
  // Public endpoint — user side needs this to show bank transfer details
  try {
    const keys = ['admin_bank_name','admin_branch_name','admin_account_holder','admin_account_number','admin_iban','admin_swift_code','admin_payment_instructions','admin_paypal_email'];
    const [rows] = await pool.query(`SELECT setting_key, setting_value FROM settings WHERE setting_key IN (${keys.map(() => '?').join(',')})`, keys);
    const obj = {};
    rows.forEach(r => { obj[r.setting_key.replace('admin_', '')] = r.setting_value; });
    res.json(obj);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.put('/admin/payment-details', protectAdmin, async (req, res) => {
  try {
    const map = {
      admin_bank_name: req.body.bankName,
      admin_branch_name: req.body.branchName,
      admin_account_holder: req.body.accountHolder,
      admin_account_number: req.body.accountNumber,
      admin_iban: req.body.iban,
      admin_swift_code: req.body.swiftCode,
      admin_payment_instructions: req.body.paymentInstructions,
      admin_paypal_email: req.body.paypalEmail,
    };
    for (const [key, value] of Object.entries(map)) {
      await pool.query(
        'INSERT INTO settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value=?',
        [key, value || '', value || '']
      );
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Error saving' }); }
});

// ── Admin: confirm user payment (proof verified) ──────────────────────────────
router.patch('/:id/confirm-user-payment', protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE freight_requests SET status='payment_completed', request_type='booking', updated_at=NOW() WHERE id=? AND status IN ('payment_proof_submitted','sent_to_user','payment_requested')`,
      [id]
    );
    res.json({ success: true });
    const { notifyPaymentCompleted } = require('../../utils/freightMailer');
    const [rows] = await pool.query(`SELECT fr.*, a.name AS agent_name, a.email AS agent_email FROM freight_requests fr LEFT JOIN agents a ON fr.assigned_agent_id=a.id WHERE fr.id=?`, [id]);
    if (rows.length) notifyPaymentCompleted(rows[0]).catch(console.error);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// ── Admin: pay agent (PayPal notify or bank proof upload) ─────────────────────
router.post('/:id/pay-agent-proof', protectAdmin, upload.single('proof'), async (req, res) => {
  try {
    const { id } = req.params;
    const { method } = req.body; // 'paypal' or 'bank'
    let proofUrl = null;

    if (method === 'bank') {
      if (!req.file) return res.status(400).json({ message: 'Proof file required for bank transfer' });
      const ext = req.file.originalname.split('.').pop();
      const uploadRes = await imagekit.upload({
        file: req.file.buffer,
        fileName: `agent_payment_proof_${id}_${Date.now()}.${ext}`,
        folder: '/agent_payment_proofs',
      });
      proofUrl = uploadRes.url;
    }

    await pool.query(
      `UPDATE freight_requests SET status='agent_payment_sent', agent_payment_method=?, agent_payment_proof_url=?, updated_at=NOW() WHERE id=? AND status='agent_payment_requested'`,
      [method, proofUrl, id]
    );

    // Notify agent
    const [rows] = await pool.query(`SELECT fr.*, a.name AS agent_name, a.email AS agent_email FROM freight_requests fr LEFT JOIN agents a ON fr.assigned_agent_id=a.id WHERE fr.id=?`, [id]);
    if (rows.length) {
      const b = rows[0];
      const GVS_LOGO = 'https://res.cloudinary.com/ds1dt3qub/image/upload/v1771406257/internship_resumes/nxo9sunwlizs6nhorhcp.png';
      const proofSection = method === 'bank' && proofUrl
        ? `<p>Please find the bank transfer proof attached: <a href="${proofUrl}" style="color:#e11d48">View Proof</a></p>`
        : `<p>Payment has been sent via <strong>PayPal</strong>. Please check your PayPal account.</p>`;
      sendMail({
        to: b.agent_email,
        subject: `Payment Sent — ${b.reference_id}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <img src="${GVS_LOGO}" style="height:50px;margin-bottom:16px" />
          <h2 style="color:#e11d48">Payment Sent</h2>
          <p>Hi ${b.agent_name},</p>
          <p>Admin has sent your payment for booking <strong>${b.reference_id}</strong>.</p>
          ${proofSection}
          <p>Please confirm receipt in your agent dashboard.</p>
        </div>`,
      }).catch(console.error);
    }

    res.json({ success: true });
  } catch (e) {
    console.error('Pay agent proof error:', e);
    res.status(500).json({ message: 'Error' });
  }
});

// ── Agent auth ───────────────────────────────────────────────────────────────
router.post('/agent/login', agentLogin);

// ── Agent: forgot password ───────────────────────────────────────────────────
router.post('/agent/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const pool = require('../config/db');
    const crypto = require('crypto');
    const [rows] = await pool.query('SELECT id, name FROM agents WHERE email=?', [email]);
    // Always return success to avoid email enumeration
    if (!rows.length) return res.json({ message: 'If that email exists, a reset link has been sent.' });
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await pool.query('UPDATE agents SET reset_token=?, reset_token_expires=? WHERE id=?', [token, expires, rows[0].id]);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/agent/${token}`;
    await sendMail({
      to: email,
      subject: 'Agent Password Reset',
      html: `<p>Hi ${rows[0].name},</p><p>Click to reset your password:</p><a href="${resetUrl}">${resetUrl}</a><p>Expires in 1 hour.</p>`,
    });
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Agent forgot password error:', error);
    res.status(500).json({ message: 'Error sending reset email' });
  }
});

// ── Agent protected ──────────────────────────────────────────────────────────
router.get('/agent/requests', protectAgent, getAgentRequests);
router.patch('/agent/requests/:id/price', protectAgent, agentSubmitPrice);
router.patch('/agent/requests/:id/request-payment', protectAgent, agentRequestPayment);
router.patch('/agent/requests/:id/mark-delivered', protectAgent, agentMarkDelivered);
router.patch('/agent/requests/:id/confirm-payment-received', protectAgent, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT id FROM freight_requests WHERE id=? AND assigned_agent_id=? AND status='agent_payment_sent'`,
      [id, req.agent.id]
    );
    if (!rows.length) return res.status(403).json({ message: 'Not authorized or invalid status' });
    await pool.query(
      `UPDATE freight_requests SET status='in_progress', agent_payment_rejection_reason=NULL, updated_at=NOW() WHERE id=?`, [id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// ── Agent: reject payment (sends back to agent_payment_requested + notifies admin) ──
router.patch('/agent/requests/:id/reject-payment', protectAgent, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason?.trim()) return res.status(400).json({ message: 'Reason is required' });

    const [rows] = await pool.query(
      `SELECT fr.*, a.name AS agent_name, a.email AS agent_email FROM freight_requests fr LEFT JOIN agents a ON fr.assigned_agent_id=a.id WHERE fr.id=? AND fr.assigned_agent_id=? AND fr.status='agent_payment_sent'`,
      [id, req.agent.id]
    );
    if (!rows.length) return res.status(403).json({ message: 'Not authorized or invalid status' });

    await pool.query(
      `UPDATE freight_requests SET status='agent_payment_requested', agent_payment_rejection_reason=?, agent_payment_proof_url=NULL, agent_payment_method=NULL, updated_at=NOW() WHERE id=?`,
      [reason.trim(), id]
    );

    res.json({ success: true });

    // Notify admin by email (fire-and-forget)
    const b = rows[0];
    const GVS_LOGO = 'https://res.cloudinary.com/ds1dt3qub/image/upload/v1771406257/internship_resumes/nxo9sunwlizs6nhorhcp.png';
    const cfg = await getSettings();
    const adminEmail = cfg?.EMAIL_PROVIDER === 'aws' ? cfg.AWS_SES_FROM_EMAIL : (cfg?.SMTP_FROM_EMAIL || process.env.EMAIL_FROM);
    sendMail({
      to: adminEmail,
      subject: `⚠️ Agent Rejected Payment — ${b.reference_id}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <img src="${GVS_LOGO}" style="height:50px;margin-bottom:16px" />
        <h2 style="color:#e11d48">Payment Rejected by Agent</h2>
        <p>Agent <strong>${b.agent_name}</strong> has rejected the payment for booking <strong>${b.reference_id}</strong>.</p>
        <div style="background:#fff1f2;border:1px solid #fecdd3;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;font-weight:600;color:#be123c">Rejection Reason:</p>
          <p style="margin:8px 0 0;color:#374151">${reason.trim()}</p>
        </div>
        <p>Please log in to the admin panel to review and resend the payment.</p>
      </div>`,
    }).catch(console.error);
  } catch (e) {
    console.error('Reject payment error:', e);
    res.status(500).json({ message: 'Error' });
  }
});


// ── Agent: payment details ────────────────────────────────────────────────────
router.get('/agent/payment-details', protectAgent, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT bank_name, branch_name, account_holder, account_number, iban, swift_code, payment_instructions, paypal_email FROM agents WHERE id=?',
      [req.agent.id]
    );
    res.json(rows[0] || {});
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

router.put('/agent/payment-details', protectAgent, async (req, res) => {
  try {
    const { bankName, branchName, accountHolder, accountNumber, iban, swiftCode, paymentInstructions, paypalEmail } = req.body;
    await pool.query(
      `UPDATE agents SET bank_name=?, branch_name=?, account_holder=?, account_number=?, iban=?, swift_code=?, payment_instructions=?, paypal_email=?, updated_at=NOW() WHERE id=?`,
      [bankName||null, branchName||null, accountHolder||null, accountNumber||null, iban||null, swiftCode||null, paymentInstructions||null, paypalEmail||null, req.agent.id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Error saving payment details' }); }
});

// ── Agent: ocean freight ─────────────────────────────────────────────────────
const { getOceanFreight, createOceanFreight, updateOceanFreight, toggleOceanFreight, getAllOceanFreight, adminToggleOceanFreight, adminUpdateOceanFreight, getPublicOceanFreight } = require('../controllers/oceanFreightController');
router.get('/ocean-freight/public', getPublicOceanFreight);
router.get('/ocean-freight/my', protectAgent, getOceanFreight);
router.post('/ocean-freight', protectAgent, createOceanFreight);
router.put('/ocean-freight/:id', protectAgent, updateOceanFreight);
router.patch('/ocean-freight/:id/toggle', protectAgent, toggleOceanFreight);
router.get('/ocean-freight/all', protectAdmin, getAllOceanFreight);
router.patch('/ocean-freight/:id/admin-toggle', protectAdmin, adminToggleOceanFreight);
router.put('/ocean-freight/:id/admin-update', protectAdmin, adminUpdateOceanFreight);

// ── Admin: agent management (MUST be before /:id to avoid route conflict) ────
router.get('/agents/list', protectAdmin, getAgents);
router.post('/agents/create', protectAdmin, createAgent);
router.get('/agents/:id/payment-details', protectAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT bank_name, branch_name, account_holder, account_number, iban, swift_code, payment_instructions, paypal_email FROM agents WHERE id=?',
      [req.params.id]
    );
    res.json(rows[0] || {});
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});
router.put('/agents/:id', protectAdmin, updateAgent);
router.patch('/agents/:id/toggle', protectAdmin, toggleAgent);
router.delete('/agents/:id', protectAdmin, deleteAgent);

// ── Admin: notification counts ───────────────────────────────────────────────
router.get('/admin/counts', protectAdmin, async (req, res) => {
  try {
    const [[{ inquiry }]] = await pool.query(
      `SELECT COUNT(*) AS inquiry FROM freight_requests WHERE request_type='inquiry' AND status='submitted'`
    );
    const [[{ leads }]] = await pool.query(
      `SELECT COUNT(*) AS leads FROM freight_requests WHERE request_type='inquiry' AND status NOT IN ('submitted','cancelled')`
    );
    const [[{ bookings }]] = await pool.query(
      `SELECT COUNT(*) AS bookings FROM freight_requests WHERE request_type='booking' AND status NOT IN ('completed','cancelled')`
    );
    const [[{ agentPay }]] = await pool.query(
      `SELECT COUNT(*) AS agentPay FROM freight_requests WHERE status='agent_payment_requested'`
    );
    res.json({ inquiry: Number(inquiry), leads: Number(leads), bookings: Number(bookings), agentPay: Number(agentPay) });
  } catch (e) {
    console.error('counts error', e);
    res.status(500).json({ inquiry: 0, leads: 0, bookings: 0, agentPay: 0 });
  }
});

// ── Admin: freight requests ──────────────────────────────────────────────────
router.get('/leads', protectAdmin, getLeads);
router.get('/bookings', protectAdmin, getBookings);
router.patch('/:id/forward-to-agent', protectAdmin, forwardToAgent);
router.patch('/:id/add-commission', protectAdmin, addCommissionAndSendToUser);
router.patch('/:id/send-payment-request', protectAdmin, sendPaymentRequest);
router.patch('/:id/mark-payment-completed', protectAdmin, markPaymentCompleted);
router.patch('/:id/pay-agent', protectAdmin, adminPayAgent);
router.patch('/:id/status', protectAdmin, updateStatus);
router.patch('/:id/cancel', protectAdmin, cancelBooking);
router.delete('/:id', protectAdmin, deleteFreightRequest);
router.get('/:id', protectAdmin, getFreightRequest);

module.exports = router;
