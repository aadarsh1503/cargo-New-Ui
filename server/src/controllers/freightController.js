const pool = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyRecaptcha } = require('../../utils/recaptcha');
const {
  notifyNewRequest, notifyForwardedToAgent, notifyAgentPriced,
  notifyQuoteSentToUser, notifyUserApproved, notifyPaymentRequested,
  notifyPaymentCompleted, notifyStatusUpdate, notifyCancelled, notifyAgentPaymentRequested,
} = require('../../utils/freightMailer');

// ─── Helper: fetch full request with agent info ────────────────────────────────
const fetchFull = async (id) => {
  const [rows] = await pool.query(
    `SELECT fr.*, a.name AS agent_name, a.email AS agent_email
     FROM freight_requests fr
     LEFT JOIN agents a ON fr.assigned_agent_id = a.id
     WHERE fr.id = ?`, [id]
  );
  return rows[0] || null;
};

// ─── USER: Submit a new freight request ───────────────────────────────────────
const submitFreightRequest = async (req, res) => {
  try {
    const {
      company, name, telephone, email,
      portOfLoading, portOfLoadingCity, portOfDischarge, portOfDischargeCity,
      modeOfShipment, commodity, grossWeight, weightUnit,
      boxesPallets, boxPalletSize, boxPalletUnit,
      length, width, height, dimensionUnit, message
    } = req.body;

    const referenceId = 'GVS-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    await pool.query(
      `INSERT INTO freight_requests
        (reference_id, company, name, telephone, email,
         port_of_loading, port_of_loading_city, port_of_discharge, port_of_discharge_city,
         mode_of_shipment, commodity, gross_weight, weight_unit,
         boxes_pallets, box_pallet_size, box_pallet_unit,
         length_dim, width_dim, height_dim, dimension_unit, message, status, request_type)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'submitted','lead')`,
      [referenceId, company, name, telephone, email,
       portOfLoading, portOfLoadingCity, portOfDischarge, portOfDischargeCity,
       modeOfShipment, commodity, grossWeight || null, weightUnit || 'kg',
       boxesPallets || null, boxPalletSize || null, boxPalletUnit || 'cm',
       length || null, width || null, height || null, dimensionUnit || 'cm', message || '']
    );

    res.status(201).json({ success: true, referenceId });
    // Delete any draft for this email now that they fully submitted
    pool.query(`DELETE FROM freight_requests WHERE email=? AND status='draft'`, [email]).catch(() => {});
    // Fire-and-forget email to admin
    notifyNewRequest({
      reference_id: referenceId, company, name, email,
      telephone, port_of_loading_city: portOfLoadingCity,
      port_of_discharge_city: portOfDischargeCity,
      mode_of_shipment: modeOfShipment, commodity,
      gross_weight: grossWeight, weight_unit: weightUnit || 'kg',
      message: message || '',
    }).catch(console.error);
  } catch (error) {
    console.error('Error submitting freight request:', error);
    res.status(500).json({ message: 'Error submitting request' });
  }
};

// ─── ADMIN: Get all leads ──────────────────────────────────────────────────────
const getLeads = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT fr.*, a.name AS agent_name, a.email AS agent_email
       FROM freight_requests fr
       LEFT JOIN agents a ON fr.assigned_agent_id = a.id
       WHERE fr.request_type = 'lead'
       ORDER BY fr.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Error fetching leads' });
  }
};

// ─── ADMIN: Get all bookings ───────────────────────────────────────────────────
const getBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT fr.*, a.name AS agent_name, a.email AS agent_email
       FROM freight_requests fr
       LEFT JOIN agents a ON fr.assigned_agent_id = a.id
       WHERE fr.request_type = 'booking'
          OR fr.status IN ('user_approved', 'payment_requested', 'payment_completed', 'in_progress', 'completed', 'cancelled')
       ORDER BY fr.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

// ─── ADMIN: Get single request ─────────────────────────────────────────────────
const getFreightRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT fr.*, a.name AS agent_name, a.email AS agent_email
       FROM freight_requests fr
       LEFT JOIN agents a ON fr.assigned_agent_id = a.id
       WHERE fr.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Request not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ message: 'Error fetching request' });
  }
};

// ─── ADMIN: Forward to agent ───────────────────────────────────────────────────
const forwardToAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId, adminNotes } = req.body;

    await pool.query(
      `UPDATE freight_requests SET status='forwarded_to_agent', assigned_agent_id=?, admin_notes=?, updated_at=NOW() WHERE id=?`,
      [agentId, adminNotes || null, id]
    );
    res.json({ success: true, message: 'Forwarded to agent' });
    fetchFull(id).then(b => b && notifyForwardedToAgent(b)).catch(console.error);
  } catch (error) {
    console.error('Error forwarding to agent:', error);
    res.status(500).json({ message: 'Error forwarding to agent' });
  }
};

// ─── ADMIN: Add commission and send to user ────────────────────────────────────
const addCommissionAndSendToUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionType, commissionValue, finalPrice, finalCurrency, adminNotes } = req.body;

    await pool.query(
      `UPDATE freight_requests
       SET commission_type=?, commission_value=?, final_price=?, final_currency=?,
           admin_notes=?, status='sent_to_user', updated_at=NOW()
       WHERE id=?`,
      [commissionType, commissionValue, finalPrice, finalCurrency || 'USD', adminNotes || null, id]
    );
    res.json({ success: true, message: 'Commission added and sent to user' });
    fetchFull(id).then(b => b && notifyQuoteSentToUser(b)).catch(console.error);
  } catch (error) {
    console.error('Error adding commission:', error);
    res.status(500).json({ message: 'Error adding commission' });
  }
};

// ─── ADMIN: Send payment request to user ──────────────────────────────────────
const sendPaymentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE freight_requests SET status='payment_requested', updated_at=NOW() WHERE id=?`,
      [id]
    );
    res.json({ success: true, message: 'Payment request sent' });
    fetchFull(id).then(b => b && notifyPaymentRequested(b)).catch(console.error);
  } catch (error) {
    console.error('Error sending payment request:', error);
    res.status(500).json({ message: 'Error sending payment request' });
  }
};

// ─── ADMIN: Mark payment completed (kept for backward compat but no longer used in UI) ──
const markPaymentCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE freight_requests SET status='payment_completed', request_type='booking', updated_at=NOW() WHERE id=?`,
      [id]
    );
    res.json({ success: true, message: 'Payment marked as completed' });
    fetchFull(id).then(b => b && notifyPaymentCompleted(b)).catch(console.error);
  } catch (error) {
    console.error('Error marking payment:', error);
    res.status(500).json({ message: 'Error marking payment' });
  }
};

// ─── USER: Confirm payment ─────────────────────────────────────────────────────
const userConfirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, paypalOrderId } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    // User can pay when status is sent_to_user (direct) or payment_requested (legacy)
    const [rows] = await pool.query(
      `SELECT id FROM freight_requests WHERE id=? AND email=? AND status IN ('sent_to_user','payment_requested')`,
      [id, email]
    );
    if (!rows.length) return res.status(403).json({ message: 'Not authorized or invalid status' });

    await pool.query(
      `UPDATE freight_requests SET status='payment_completed', request_type='booking', paypal_order_id=?, updated_at=NOW() WHERE id=?`,
      [paypalOrderId || null, id]
    );
    res.json({ success: true });
    fetchFull(id).then(b => b && notifyPaymentCompleted(b)).catch(console.error);
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Error confirming payment' });
  }
};

// ─── USER: Cancel booking ─────────────────────────────────────────────────────
const userCancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, reason } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const CANCELLABLE = ['submitted', 'admin_review', 'forwarded_to_agent', 'agent_priced', 'commission_added', 'sent_to_user', 'user_approved', 'payment_completed'];
    const [rows] = await pool.query(
      `SELECT fr.*, a.email AS agent_email, a.name AS agent_name
       FROM freight_requests fr LEFT JOIN agents a ON fr.assigned_agent_id = a.id
       WHERE fr.id=? AND fr.email=?`,
      [id, email]
    );
    if (!rows.length) return res.status(403).json({ message: 'Not authorized' });
    const booking = rows[0];
    if (!CANCELLABLE.includes(booking.status)) return res.status(400).json({ message: 'This booking cannot be cancelled' });

    let cancellationFee = null;
    let refundAmount = null;
    const hasPaid = booking.status === 'payment_completed';
    if (hasPaid && booking.final_price) {
      const feeStr = await getSetting('cancellation_fees');
      const feeTypeStr = await getSetting('cancellation_fees_type');
      const feeVal = parseFloat(feeStr) || 0;
      const total = parseFloat(booking.final_price);
      cancellationFee = feeTypeStr === 'percentage'
        ? parseFloat(((feeVal / 100) * total).toFixed(2))
        : feeVal;
      refundAmount = Math.max(0, parseFloat((total - cancellationFee).toFixed(2)));
    }

    await pool.query(
      `UPDATE freight_requests SET status='cancelled', admin_notes=?, cancellation_fee=?, refund_amount=?, updated_at=NOW() WHERE id=?`,
      [reason || null, cancellationFee, refundAmount, id]
    );

    booking.cancellation_fee = cancellationFee;
    booking.refund_amount = refundAmount;
    notifyCancelled(booking, reason).catch(console.error);
    res.json({ success: true, cancellationFee, refundAmount });
  } catch (error) {
    console.error('Error cancelling booking (user):', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
};

// ─── AGENT: Request payment from admin ────────────────────────────────────────
const agentRequestPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.agent.id;

    // Block if agent has no payment details saved
    const [agentRows] = await pool.query(
      'SELECT bank_name, iban, swift_code, paypal_email FROM agents WHERE id=?', [agentId]
    );
    const a = agentRows[0] || {};
    const hasBankDetails = a.bank_name && a.iban && a.swift_code;
    const hasPaypal = !!a.paypal_email;
    if (!hasBankDetails && !hasPaypal) {
      return res.status(400).json({ message: 'Please add your payment details (bank or PayPal) before requesting payment.' });
    }

    const [rows] = await pool.query(
      `SELECT id FROM freight_requests WHERE id=? AND assigned_agent_id=? AND status='payment_completed'`,
      [id, agentId]
    );
    if (!rows.length) return res.status(403).json({ message: 'Not authorized or invalid status' });

    await pool.query(
      `UPDATE freight_requests SET status='agent_payment_requested', updated_at=NOW() WHERE id=?`,
      [id]
    );
    res.json({ success: true });
    fetchFull(id).then(b => b && notifyAgentPaymentRequested(b)).catch(console.error);
  } catch (error) {
    console.error('Error requesting agent payment:', error);
    res.status(500).json({ message: 'Error requesting payment' });
  }
};

// ─── ADMIN: Mark agent payment done → in_progress ─────────────────────────────
const adminPayAgent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE freight_requests SET status='in_progress', request_type='booking', updated_at=NOW() WHERE id=? AND status='agent_payment_requested'`,
      [id]
    );
    res.json({ success: true });
    fetchFull(id).then(b => b && notifyStatusUpdate(b, 'in_progress')).catch(console.error);
  } catch (error) {
    console.error('Error paying agent:', error);
    res.status(500).json({ message: 'Error paying agent' });
  }
};

// ─── Helper: read a single setting value ──────────────────────────────────────
const getSetting = async (key) => {
  const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key=?', [key]);
  return rows.length ? rows[0].setting_value : null;
};

// ─── ADMIN: Cancel booking with reason (emails all parties) ───────────────────
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Fetch the request + agent info
    const [rows] = await pool.query(
      `SELECT fr.*, a.email AS agent_email, a.name AS agent_name
       FROM freight_requests fr
       LEFT JOIN agents a ON fr.assigned_agent_id = a.id
       WHERE fr.id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const booking = rows[0];

    // Calculate cancellation fee & refund only if user already paid
    let cancellationFee = null;
    let refundAmount = null;
    const hasPaid = ['payment_completed', 'agent_payment_requested', 'agent_payment_completed', 'in_progress'].includes(booking.status);

    if (hasPaid && booking.final_price) {
      const feeStr = await getSetting('cancellation_fees');
      const feeTypeStr = await getSetting('cancellation_fees_type');
      const feeVal = parseFloat(feeStr) || 0;
      const total = parseFloat(booking.final_price);
      cancellationFee = feeTypeStr === 'percentage'
        ? parseFloat(((feeVal / 100) * total).toFixed(2))
        : feeVal;
      refundAmount = Math.max(0, parseFloat((total - cancellationFee).toFixed(2)));
    }

    await pool.query(
      `UPDATE freight_requests SET status='cancelled', admin_notes=?, cancellation_fee=?, refund_amount=?, updated_at=NOW() WHERE id=?`,
      [reason || null, cancellationFee, refundAmount, id]
    );

    // Attach fee info to booking object for email
    booking.cancellation_fee = cancellationFee;
    booking.refund_amount = refundAmount;

    notifyCancelled(booking, reason).catch(console.error);
    res.json({ success: true, cancellationFee, refundAmount });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
};

// ─── AGENT: Mark shipment as delivered (in_progress → completed) ──────────────
const agentMarkDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.agent.id;
    const [rows] = await pool.query(
      `SELECT id FROM freight_requests WHERE id=? AND assigned_agent_id=? AND status='in_progress'`,
      [id, agentId]
    );
    if (!rows.length) return res.status(403).json({ message: 'Not authorized or invalid status' });
    await pool.query(
      `UPDATE freight_requests SET status='completed', updated_at=NOW() WHERE id=?`, [id]
    );
    res.json({ success: true });
    fetchFull(id).then(b => b && notifyStatusUpdate(b, 'completed')).catch(console.error);
  } catch (error) {
    console.error('Error marking delivered:', error);
    res.status(500).json({ message: 'Error marking delivered' });
  }
};

// ─── ADMIN: Update status manually ────────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    await pool.query(
      `UPDATE freight_requests SET status=?, admin_notes=?, updated_at=NOW() WHERE id=?`,
      [status, adminNotes || null, id]
    );
    res.json({ success: true });
    // Send notification for trackable statuses
    if (['in_progress', 'completed'].includes(status)) {
      fetchFull(id).then(b => b && notifyStatusUpdate(b, status)).catch(console.error);
    }
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
};

// ─── ADMIN: Delete request ─────────────────────────────────────────────────────
const deleteFreightRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM freight_requests WHERE id=?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Error deleting request' });
  }
};

// ─── AGENT: Login ──────────────────────────────────────────────────────────────
const agentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if agent exists at all first
    const [allRows] = await pool.query('SELECT * FROM agents WHERE email=?', [email]);
    if (!allRows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const agent = allRows[0];
    // Check if deactivated before checking password
    if (!agent.is_active) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact the admin.' });
    }

    const isMatch = await bcrypt.compare(password, agent.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: agent.id, email: agent.email, name: agent.name, role: 'agent' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ success: true, agentToken: token, agent: { id: agent.id, name: agent.name, email: agent.email, company: agent.company } });
  } catch (error) {
    console.error('Agent login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── AGENT: Get assigned requests ─────────────────────────────────────────────
const getAgentRequests = async (req, res) => {
  try {
    const agentId = req.agent.id;
    const [rows] = await pool.query(
      `SELECT * FROM freight_requests WHERE assigned_agent_id=? ORDER BY created_at DESC`,
      [agentId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching agent requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

// ─── AGENT: Submit price ───────────────────────────────────────────────────────
const agentSubmitPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentPrice, agentCurrency, agentNotes } = req.body;
    const agentId = req.agent.id;

    // Verify this request belongs to this agent
    const [rows] = await pool.query('SELECT id FROM freight_requests WHERE id=? AND assigned_agent_id=?', [id, agentId]);
    if (!rows.length) return res.status(403).json({ message: 'Not authorized' });

    await pool.query(
      `UPDATE freight_requests SET agent_price=?, agent_currency=?, agent_notes=?, status='agent_priced', updated_at=NOW() WHERE id=?`,
      [agentPrice, agentCurrency || 'USD', agentNotes || null, id]
    );
    res.json({ success: true, message: 'Price submitted to admin' });
    fetchFull(id).then(b => b && notifyAgentPriced(b)).catch(console.error);
  } catch (error) {
    console.error('Error submitting price:', error);
    res.status(500).json({ message: 'Error submitting price' });
  }
};

// ─── ADMIN: Get all agents ─────────────────────────────────────────────────────
const getAgents = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, plain_password, company, phone, is_active, created_at FROM agents ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Error fetching agents' });
  }
};

// ─── ADMIN: Create agent ───────────────────────────────────────────────────────
const createAgent = async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const [result] = await pool.query(
      'INSERT INTO agents (name, email, password_hash, plain_password, company, phone) VALUES (?,?,?,?,?,?)',
      [name, email, password_hash, password, company || null, phone || null]
    );
    res.status(201).json({ success: true, agentId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists' });
    console.error('Error creating agent:', error);
    res.status(500).json({ message: 'Error creating agent' });
  }
};

// ─── ADMIN: Update agent ───────────────────────────────────────────────────────
const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company, phone, password } = req.body;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      await pool.query(
        'UPDATE agents SET name=?, email=?, company=?, phone=?, password_hash=?, plain_password=? WHERE id=?',
        [name, email, company || null, phone || null, password_hash, password, id]
      );
    } else {
      await pool.query(
        'UPDATE agents SET name=?, email=?, company=?, phone=? WHERE id=?',
        [name, email, company || null, phone || null, id]
      );
    }
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists' });
    console.error('Error updating agent:', error);
    res.status(500).json({ message: 'Error updating agent' });
  }
};

// ─── ADMIN: Toggle agent active/inactive ──────────────────────────────────────
const toggleAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT is_active FROM agents WHERE id=?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Agent not found' });
    const newState = !rows[0].is_active;
    await pool.query('UPDATE agents SET is_active=? WHERE id=?', [newState, id]);
    res.json({ success: true, is_active: newState });
  } catch (error) {
    console.error('Error toggling agent:', error);
    res.status(500).json({ message: 'Error toggling agent' });
  }
};

// ─── ADMIN: Delete agent ───────────────────────────────────────────────────────
const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM agents WHERE id=?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ message: 'Error deleting agent' });
  }
};

module.exports = {
  submitFreightRequest,
  getLeads, getBookings, getFreightRequest,
  forwardToAgent, addCommissionAndSendToUser,
  sendPaymentRequest, markPaymentCompleted, userConfirmPayment, userCancelBooking,
  agentRequestPayment, adminPayAgent, agentMarkDelivered,
  updateStatus, deleteFreightRequest,
  agentLogin, getAgentRequests, agentSubmitPrice,
  getAgents, createAgent, updateAgent, deleteAgent, toggleAgent, cancelBooking
};
