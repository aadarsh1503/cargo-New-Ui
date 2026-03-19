const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: '92.112.181.224', user: 'gvs_db_ac',
    password: 'GVSP@ss123', database: 'gvs_cargo_promotions', port: 3306
  });
  try {
    await c.execute("ALTER TABLE freight_requests ADD COLUMN agent_payment_status ENUM('pending','paid') DEFAULT NULL");
    console.log('agent_payment_status column added');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('already exists');
    else throw e;
  }
  await c.end();
})();
