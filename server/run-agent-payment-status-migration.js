const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: '92.112.181.224', user: 'gvs_db_ac',
    password: 'GVSP@ss123', database: 'gvs_cargo_promotions', port: 3306
  });

  // Modify the status ENUM to add the two new values
  try {
    await c.execute(`
      ALTER TABLE freight_requests
      MODIFY COLUMN status ENUM(
        'submitted',
        'admin_review',
        'forwarded_to_agent',
        'agent_priced',
        'commission_added',
        'sent_to_user',
        'user_approved',
        'payment_requested',
        'payment_completed',
        'agent_payment_requested',
        'agent_payment_completed',
        'in_progress',
        'completed',
        'cancelled'
      ) DEFAULT 'submitted'
    `);
    console.log('Status ENUM updated with agent_payment_requested + agent_payment_completed');
  } catch (e) {
    console.error('Failed:', e.message);
  }

  await c.end();
})();
