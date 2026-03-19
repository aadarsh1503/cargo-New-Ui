/**
 * Smart email provider — reads EMAIL_PROVIDER from DB (smtp | aws)
 * and sends via the configured transport.
 * Falls back to env-based SMTP if DB is unavailable.
 */
const nodemailer = require('nodemailer');
const pool = require('../src/config/db');

// Cache settings for 60s to avoid hitting DB on every email
let _cache = null;
let _cacheAt = 0;
const CACHE_TTL = 60_000;

const getSettings = async () => {
  if (_cache && Date.now() - _cacheAt < CACHE_TTL) return _cache;
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM aws_settings');
    const cfg = {};
    rows.forEach(r => { cfg[r.setting_key] = r.setting_value; });
    _cache = cfg;
    _cacheAt = Date.now();
    return cfg;
  } catch {
    return null;
  }
};

/** Invalidate cache (call after admin saves settings) */
const invalidateCache = () => { _cache = null; };

const buildSmtpTransport = (cfg) => nodemailer.createTransport({
  host: cfg.SMTP_HOST || process.env.EMAIL_HOST,
  port: parseInt(cfg.SMTP_PORT || process.env.EMAIL_PORT || '465'),
  secure: (cfg.SMTP_SECURE || 'true') === 'true',
  auth: {
    user: cfg.SMTP_USER || process.env.EMAIL_USER,
    pass: cfg.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

const buildAwsTransport = (cfg) => {
  const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');
  const sesClient = new SESv2Client({
    region: cfg.AWS_REGION,
    credentials: {
      accessKeyId: cfg.AWS_ACCESS_KEY_ID,
      secretAccessKey: cfg.AWS_SECRET_ACCESS_KEY,
    },
  });
  // nodemailer v7 SES transport expects: { sesClient, SendEmailCommand }
  return nodemailer.createTransport({ SES: { sesClient, SendEmailCommand } });
};

/**
 * Send an email using the admin-configured provider.
 * @param {{ from?: string, to: string, subject: string, html: string }} mailOptions
 */
const sendMail = async (mailOptions) => {
  const cfg = await getSettings();
  const provider = cfg?.EMAIL_PROVIDER || 'smtp';

  let transport;
  let from;

  if (provider === 'aws' && cfg?.AWS_ACCESS_KEY_ID && cfg?.AWS_SECRET_ACCESS_KEY) {
    transport = buildAwsTransport(cfg);
    from = mailOptions.from || `${cfg.AWS_SES_FROM_NAME || 'GVS Cargo'} <${cfg.AWS_SES_FROM_EMAIL}>`;
  } else {
    // Default: SMTP
    transport = buildSmtpTransport(cfg || {});
    from = mailOptions.from || `${cfg?.SMTP_FROM_NAME || 'GVS Cargo'} <${cfg?.SMTP_FROM_EMAIL || process.env.EMAIL_FROM}>`;
  }

  return transport.sendMail({ ...mailOptions, from });
};

module.exports = { sendMail, invalidateCache, getSettings };
