// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://gvs-cargo-dynamic.vercel.app',
    'https://gvscargo.com',
    'https://cargo-new-ui.vercel.app',
    'https://cargo-backend-black.vercel.app',
    'https://gvs-bahrain-pa25.vercel.app',
    'https://duplicate-cargo-qd4w.vercel.app'
  ],
  credentials: true 
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// --- API Routes ---
app.use('/api', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/excels', excelRoutes);

// -----------------
const DEFAULT_REGION = 'bahrain'; 

// --- /api/detect-region ROUTE ---
app.get('/api/detect-region', async (req, res) => {
  try {
   

    // Set caching headers to prevent stale responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // 1. Robust IP Detection
    const ip = req.headers['x-vercel-forwarded-for'] 
               || req.headers['x-forwarded-for']?.split(',').shift() 
               || req.socket.remoteAddress;

    // Use a public IP for local testing, otherwise use the detected IP
    const finalIp = (ip === '::1' || ip === '127.0.0.1') ? '177.54.157.16' : ip; // Test IP for Brazil
    

    // 2. Call the Geolocation API
    const geoApiResponse = await axios.get(`http://ip-api.com/json/${finalIp}`);
    const geoData = geoApiResponse.data;

    if (geoData.status === 'success') {
      const detectedCountryCode = geoData.countryCode; // e.g., 'BR'
      let matchedRegionCode = DEFAULT_REGION; // Default fallback

      // 3. Convert Text Code to Emoji for DB Query
      // This will now work correctly because countryCodeEmoji is a function.
      const flagEmoji = countryCodeEmoji(detectedCountryCode); 
      
      if (flagEmoji) {
       

        // 4. Query the database using the EMOJI in the 'country_flag' column
        const query = "SELECT code FROM regions WHERE country_flag = ? AND is_active = 1";
        const [rows] = await pool.query(query, [flagEmoji]);

        if (rows.length > 0) {
          matchedRegionCode = rows[0].code;
      
        } else {
          
        }
      } else {
          
      }
      
      // 5. Send the final response to the frontend
      const responsePayload = {
        ip: finalIp,
        countryCode: detectedCountryCode,
        country: geoData.country,
        matchedRegionCode: matchedRegionCode
      };

      res.json(responsePayload);
     
      
    } else {
      // Handle cases where the geo-API fails
     
      res.json({
        ip: finalIp,
        error: 'Could not determine location from the API.',
        matchedRegionCode: DEFAULT_REGION
      });
    }
  } catch (error) {
    // Handle server-level or database connection errors
    console.error("❌ Critical error in /detect-region:", error.message);
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