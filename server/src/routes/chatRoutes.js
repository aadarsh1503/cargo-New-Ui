const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { notifyUserOTP } = require('../../utils/freightMailer');

// Hugging Face Inference API — no extra package needed
const HF_API_URL = 'https://router.huggingface.co/novita/v3/openai/chat/completions';

async function askHuggingFace(systemPrompt, messages) {
  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.HF_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct',
      messages: [{ role: 'system', content: systemPrompt }].concat(messages),
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error('HF API error: ' + err);
  }

  const data = await response.json();
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content.trim();
  }
  throw new Error('Unexpected HF response format');
}

const chatOtpStore = new Map();
const chatSessions = new Map();

const STATUS_LABEL = {
  submitted: 'Pending Review', admin_review: 'Under Review',
  forwarded_to_agent: 'Pending', agent_priced: 'Pending',
  sent_to_user: 'Quote Ready', user_approved: 'Confirmed',
  payment_requested: 'Payment Required', payment_proof_submitted: 'Proof Submitted',
  payment_completed: 'Paid', agent_payment_requested: 'Processing',
  agent_payment_sent: 'In Progress', in_progress: 'In Progress',
  completed: 'Delivered', cancelled: 'Cancelled',
};

const SYSTEM_PROMPT = `You are GVS Cargo AI assistant - helpful, friendly, professional.

ABOUT GVS CARGO:
- Full-service freight and logistics company in Bahrain, Saudi Arabia, UAE, Kuwait, Qatar, Oman
- Services: Air Freight, Sea Freight (FCL & LCL), Road Freight, Customs Clearance, Warehousing, Cargo Insurance, DGR, Inspection, Packaging, Stuffing & Unloading, Commercial Services, Incoterms advisory

BOOKING WORKFLOW:
1. User submits freight request (POL/POD, commodity, weight)
2. Admin reviews and forwards to agent
3. Agent submits price
4. Admin adds commission, sends quote to user
5. User approves and pays (PayPal or bank transfer)
6. Shipment begins, agent marks delivered when done

STATUS MEANINGS:
- Pending: Being reviewed by admin
- Quote Ready: Your quote is ready, log in to approve and pay
- Confirmed: Quote approved, awaiting payment
- Paid: Payment received, shipment being arranged
- In Progress: Shipment underway
- Delivered: Completed successfully
- Cancelled: Booking cancelled

USEFUL PAGE LINKS (use markdown link format when relevant):
- Submit a freight request: [Submit Request](/contactUs)
- Track bookings: [My Bookings](/my-bookings)
- View our services: [Services](/seaFreight)
- Careers/Jobs: [Careers](/careers)
- Gallery: [Gallery](/gallery)
- Contact us: [Contact](/contactUs)
- Ocean freight rates: [Ocean Freight Rates](/special-offers)

BOOKING LOOKUP RULE: If user asks about their booking or shipment status AND they are not yet verified, ask for their email. An OTP will be sent. Never show booking details without verification. If they ARE verified, answer from their booking context directly.

RULES:
- Be concise and helpful, max 3-4 sentences per reply
- For pricing: explain quotes depend on route/commodity/weight, direct to [Submit Request](/contactUs)
- For careers: direct to [Careers](/careers)
- Always respond in English only, regardless of what language the user writes in
- IMPORTANT: For any payment-related actions (paying for a booking, PayPal, bank transfer), NEVER describe the payment process here. Always direct the user to [My Bookings](/my-bookings) to complete payment. Say something like "Please visit your [My Bookings](/my-bookings) page to complete the payment."
- Never instruct users to pay via PayPal or bank transfer in this chat — that happens on the bookings page only
- When sharing links, use markdown format: [Link Text](/path)`;

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const sessionId = body.sessionId;
    const action = body.action;
    const email = body.email;
    const otp = body.otp;
    const messages = body.messages;

    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    if (action === 'send_otp') {
      if (!email) return res.status(400).json({ message: 'Email required' });
      const rows = await pool.query('SELECT id FROM freight_requests WHERE email=? LIMIT 1', [email.toLowerCase()]);
      if (!rows[0].length) {
        return res.json({
          reply: 'I could not find any bookings for ' + email + '. Please make sure you are using the same email you submitted your freight request with.',
          noBookings: true,
        });
      }
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      chatOtpStore.set(email.toLowerCase(), { otp: otpCode, expires: Date.now() + 10 * 60 * 1000 });
      await notifyUserOTP(email, otpCode);
      return res.json({
        reply: 'I have sent a 6-digit verification code to **' + email + '**. Please enter it to view your bookings.',
        awaitOtp: true,
        email: email,
      });
    }

    if (action === 'verify_otp') {
      if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
      const entry = chatOtpStore.get(email.toLowerCase());
      if (!entry) return res.json({ reply: 'No code found. Please request a new one.', otpFailed: true });
      if (Date.now() > entry.expires) {
        chatOtpStore.delete(email.toLowerCase());
        return res.json({ reply: 'Your code has expired. Please request a new one.', otpFailed: true });
      }
      if (entry.otp !== otp.trim()) {
        return res.json({ reply: 'That code is incorrect. Please try again.', otpFailed: true });
      }
      chatOtpStore.delete(email.toLowerCase());

      const bookingRows = await pool.query(
        'SELECT reference_id, status, port_of_loading_city, port_of_discharge_city, commodity, final_price, final_currency, created_at, updated_at FROM freight_requests WHERE email=? ORDER BY updated_at DESC',
        [email.toLowerCase()]
      );
      const bookings = bookingRows[0];
      chatSessions.set(sessionId, { email: email.toLowerCase(), bookings: bookings, verified: true });

      if (!bookings.length) {
        return res.json({ reply: 'Verified! No bookings found for ' + email + ' yet.', verified: true, bookings: [] });
      }

      const list = bookings.map(function(b) {
        const price = b.final_price ? ' | USD ' + parseFloat(b.final_price).toLocaleString() : '';
        return '- ' + b.reference_id + ' | ' + (b.port_of_loading_city || '?') + ' to ' + (b.port_of_discharge_city || '?') + ' | ' + (b.commodity || '-') + ' | Status: ' + (STATUS_LABEL[b.status] || b.status) + price;
      }).join('\n');

      return res.json({
        reply: 'Verified! Here are your bookings:\n\n' + list + '\n\nWould you like more details on any of these?',
        verified: true,
        bookings: bookings,
      });
    }

    if (!messages || !Array.isArray(messages)) return res.status(400).json({ message: 'messages required' });

    let systemPrompt = SYSTEM_PROMPT;
    const session = chatSessions.get(sessionId);
    if (session && session.verified && session.bookings && session.bookings.length) {
      const bookingContext = session.bookings.map(function(b) {
        return 'Ref: ' + b.reference_id + ' | Route: ' + b.port_of_loading_city + ' to ' + b.port_of_discharge_city + ' | Commodity: ' + b.commodity + ' | Status: ' + (STATUS_LABEL[b.status] || b.status) + (b.final_price ? ' | Price: USD ' + parseFloat(b.final_price).toLocaleString() : '');
      }).join('\n');
      systemPrompt += '\n\nVERIFIED USER: ' + session.email + '\nTHEIR BOOKINGS:\n' + bookingContext + '\n\nYou can now answer questions about these specific bookings.';
    }

    const reply = await askHuggingFace(systemPrompt, messages.slice(-10));

    res.json({ reply: reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ reply: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
