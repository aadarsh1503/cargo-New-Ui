require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  const sql = `ALTER TABLE freight_requests MODIFY COLUMN status ENUM(
    'draft','submitted','admin_review','forwarded_to_agent','agent_priced',
    'commission_added','sent_to_user','user_approved','payment_requested',
    'payment_proof_submitted','payment_completed','agent_payment_requested',
    'agent_payment_sent','agent_payment_completed','in_progress','completed','cancelled'
  ) DEFAULT 'submitted'`;

  await conn.execute(sql);
  console.log('✅ draft status added to freight_requests');
  await conn.end();
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
