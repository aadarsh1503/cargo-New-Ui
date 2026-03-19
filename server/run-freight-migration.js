const fs = require('fs');
const path = require('path');
const pool = require('./src/config/db');

async function runMigration() {
  try {
    console.log('🔄 Running freight requests migration...');
    
    const migrationPath = path.join(__dirname, 'migrations', 'add_freight_requests.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon and filter out empty statements and comments
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 60) + '...');
      await pool.query(statement);
    }
    
    console.log('✅ Freight migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
