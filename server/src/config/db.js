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
    
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    idleTimeout: 60000 
});


(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL connection pool is active and ready.');
        connection.release();
    } catch (error) {
        console.error('❌ FATAL: Failed to connect to MySQL database on startup.', error);
        process.exit(1);
    }
})();

module.exports = pool;