const axios = require('axios');

/**
 * Verify a reCAPTCHA v3 token.
 * Returns true if score >= threshold (default 0.5).
 */
const verifyRecaptcha = async (token, threshold = 0.5) => {
  if (!token) return false;
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
    return success && score >= threshold;
  } catch (err) {
    console.error('reCAPTCHA verification error:', err.message);
    return false;
  }
};

module.exports = { verifyRecaptcha };
