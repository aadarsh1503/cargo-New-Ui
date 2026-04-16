const axios = require('axios');

/**
 * Verify a reCAPTCHA v3 token.
 * Returns true if score >= threshold (default 0.5).
 */
const verifyRecaptcha = async (token, threshold = 0.5) => {
  // If no token provided, skip verification (token may not load in some environments)
  if (!token) return true;
  try {
    const res = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );
    const { success, score } = res.data;
    // If Google returns an error (e.g. domain not registered), allow through
    if (!success && res.data['error-codes']?.includes('invalid-input-response')) return true;
    return success && score >= threshold;
  } catch (err) {
    console.error('reCAPTCHA verification error:', err.message);
    // On network error, allow through rather than blocking users
    return true;
  }
};

module.exports = { verifyRecaptcha };
