// server.js

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const axios = require('axios');
const pool = require('./src/config/db');
const db = require('./src/config/db'); // Note: 'db' and 'pool' are likely the same, you might only need one.
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const contentRoutes = require('./src/routes/contentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const excelRoutes = require('./src/routes/excelRoutes');   

// --- THE FIX ---
// Destructure the 'default' export from the library to get the function directly.
const { default: countryCodeEmoji } = require('country-code-emoji'); 
// --- END OF FIX ---

const app = express();

// --- Middleware Setup ---
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// --- API Routes ---
app.use('/api', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/excels', excelRoutes);

// -----------------
const DEFAULT_REGION = 'bahrain'; 

// Simple in-memory cache for IP-to-region mapping
const regionCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// --- /api/detect-region ROUTE ---
app.get('/api/detect-region', async (req, res) => {
  const startTime = Date.now();
  console.log('\n🔍 ===== REGION DETECTION STARTED =====');
  
  try {
    // Set caching headers to prevent stale responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // 1. Robust IP Detection
    const ipStartTime = Date.now();
    const ip = req.headers['x-vercel-forwarded-for'] 
               || req.headers['x-forwarded-for']?.split(',').shift() 
               || req.socket.remoteAddress;

    // Use a public IP for local testing, otherwise use the detected IP
    const finalIp = (ip === '::1' || ip === '127.0.0.1') ? '177.54.157.16' : ip; // Test IP for Brazil
    console.log(`⏱️  IP Detection: ${Date.now() - ipStartTime}ms | IP: ${finalIp}`);
    
    // Check cache first
    const cacheStartTime = Date.now();
    const cached = regionCache.get(finalIp);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`✅ Cache Hit: ${Date.now() - cacheStartTime}ms`);
      console.log(`⏱️  TOTAL TIME: ${Date.now() - startTime}ms (from cache)`);
      console.log('🔍 ===== REGION DETECTION COMPLETED =====\n');
      return res.json(cached.data);
    }
    console.log(`⏱️  Cache Check: ${Date.now() - cacheStartTime}ms (cache miss)`);

    // 2. Call the Geolocation API with timeout
    const geoApiStartTime = Date.now();
    console.log('🌐 Calling external IP geolocation API...');
    const geoApiResponse = await axios.get(`http://ip-api.com/json/${finalIp}`, {
      timeout: 2000 // 2 second timeout
    });
    const geoData = geoApiResponse.data;
    console.log(`⏱️  Geolocation API: ${Date.now() - geoApiStartTime}ms`);

    if (geoData.status === 'success') {
      const detectedCountryCode = geoData.countryCode; // e.g., 'BR'
      let matchedRegionCode = DEFAULT_REGION; // Default fallback

      // 3. Convert Text Code to Emoji for DB Query
      const emojiStartTime = Date.now();
      const flagEmoji = countryCodeEmoji(detectedCountryCode); 
      console.log(`⏱️  Emoji Conversion: ${Date.now() - emojiStartTime}ms | ${detectedCountryCode} -> ${flagEmoji}`);
      
      if (flagEmoji) {
        // 4. Query the database using the EMOJI in the 'country_flag' column
        const dbStartTime = Date.now();
        console.log('🗄️  Querying database...');
        const query = "SELECT code FROM regions WHERE country_flag = ? AND is_active = 1";
        const [rows] = await pool.query(query, [flagEmoji]);
        console.log(`⏱️  Database Query: ${Date.now() - dbStartTime}ms | Rows found: ${rows.length}`);

        if (rows.length > 0) {
          matchedRegionCode = rows[0].code;
          console.log(`✅ Matched Region: ${matchedRegionCode}`);
        } else {
          console.log(`⚠️  No region found for ${flagEmoji}, using default: ${DEFAULT_REGION}`);
        }
      }
      
      // 5. Send the final response to the frontend
      const responsePayload = {
        ip: finalIp,
        countryCode: detectedCountryCode,
        country: geoData.country,
        matchedRegionCode: matchedRegionCode
      };

      // Cache the result
      regionCache.set(finalIp, {
        data: responsePayload,
        timestamp: Date.now()
      });

      console.log(`⏱️  TOTAL TIME: ${Date.now() - startTime}ms`);
      console.log('🔍 ===== REGION DETECTION COMPLETED =====\n');
      res.json(responsePayload);
    } else {
      // Handle cases where the geo-API fails
      console.log(`❌ Geolocation API failed: ${geoData.message || 'Unknown error'}`);
      const fallbackPayload = {
        ip: finalIp,
        error: 'Could not determine location from the API.',
        matchedRegionCode: DEFAULT_REGION
      };
      console.log(`⏱️  TOTAL TIME: ${Date.now() - startTime}ms (fallback)`);
      console.log('🔍 ===== REGION DETECTION COMPLETED =====\n');
      res.json(fallbackPayload);
    }
  } catch (error) {
    // Handle server-level or database connection errors
    console.error(`❌ Critical error in /detect-region: ${error.message}`);
    console.log(`⏱️  TOTAL TIME: ${Date.now() - startTime}ms (error)`);
    console.log('🔍 ===== REGION DETECTION COMPLETED =====\n');
    res.status(500).json({ 
        error: 'An error occurred during region detection.',
        matchedRegionCode: DEFAULT_REGION
    });
  }
});
// --- END OF NEW ROUTE ---

app.get('/', (req, res) => {
    res.send('GVS Cargo Merged API is running...');
});

// --- Global Error Handler ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    // The server will start and listen on the specified port.
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1); 
  }
})();