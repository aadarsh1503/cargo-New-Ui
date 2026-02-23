// File: src/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); 

console.log('🔄 Initializing MySQL connection pool...');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000, // 20 seconds timeout for initial connection
    acquireTimeout: 20000, // 20 seconds timeout for acquiring connection from pool
    timeout: 20000, // 20 seconds query timeout
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    idleTimeout: 60000 
});

// Test connection with retry logic
const testConnection = async (retries = 3, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`🔄 Attempting to connect to MySQL (attempt ${i + 1}/${retries})...`);
            const connection = await pool.getConnection();
            console.log('✅ MySQL connection pool is active and ready.');
            connection.release();
            return true;
        } catch (error) {
            console.error(`❌ Connection attempt ${i + 1} failed:`, error.message);
            if (i < retries - 1) {
                console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error('❌ FATAL: Failed to connect to MySQL database after multiple attempts.');
    console.error('⚠️  Please check:');
    console.error('   - Database server is running');
    console.error('   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env are correct');
    console.error('   - Network/firewall allows connection to database');
    process.exit(1);
};

testConnection();

module.exports = pool;