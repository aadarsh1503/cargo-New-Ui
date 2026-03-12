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
const galleryRoutes = require('./src/routes/galleryRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const employmentRoutes = require('./src/routes/employmentRoutes');
const awsSettingsRoutes = require('./src/routes/awsSettingsRoutes');   

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
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/employment', employmentRoutes);
app.use('/api/aws-settings', awsSettingsRoutes);

// -----------------
const DEFAULT_REGION = 'bahrain'; 

// Simple in-memory cache for IP-to-region mapping
const regionCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Country code to region mapping
const COUNTRY_TO_REGION = {
  'BH': 'bahrain',
  'SA': 'saudi',
  'AE': 'uae',
  'KW': 'kuwait',
  'QA': 'qatar',
  'OM': 'oman',
};

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

    // For localhost, use actual localhost IP (will default to bahrain)
    const finalIp = ip;
    
    // Check cache first
    const cached = regionCache.get(finalIp);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    let detectedCountryCode = null;
    let country = null;
    let detectionMethod = 'none';

    // 2. Try CloudFlare header first (instant, 0ms)
    const cfCountry = req.headers['cf-ipcountry'];
    if (cfCountry && cfCountry !== 'XX') {
      detectedCountryCode = cfCountry;
      country = cfCountry;
      detectionMethod = 'CloudFlare';
    } else {
      // 3. Fallback to ipapi.co (faster than ip-api.com)
      try {
        const geoApiResponse = await axios.get(`https://ipapi.co/${finalIp}/json/`, {
          timeout: 2000 // 2 second timeout
        });
        const geoData = geoApiResponse.data;
        
        if (geoData.country_code) {
          detectedCountryCode = geoData.country_code;
          country = geoData.country_name;
          detectionMethod = 'ipapi.co';
        }
      } catch (error) {
        // 4. Final fallback to ip-api.com
        try {
          const geoApiResponse = await axios.get(`http://ip-api.com/json/${finalIp}`, {
            timeout: 2000
          });
          const geoData = geoApiResponse.data;
          
          if (geoData.status === 'success') {
            detectedCountryCode = geoData.countryCode;
            country = geoData.country;
            detectionMethod = 'ip-api.com';
          }
        } catch (fallbackError) {
          // All APIs failed, will use default
        }
      }
    }

    let matchedRegionCode = DEFAULT_REGION;

    if (detectedCountryCode) {
      // Check if we have a direct mapping
      if (COUNTRY_TO_REGION[detectedCountryCode]) {
        matchedRegionCode = COUNTRY_TO_REGION[detectedCountryCode];
      } else {
        const emojiStartTime = Date.now();
        const flagEmoji = countryCodeEmoji(detectedCountryCode);
        console.log(`⏱️  Emoji Conversion: ${Date.now() - emojiStartTime}ms | ${detectedCountryCode} -> ${flagEmoji}`);
        
        if (flagEmoji) {
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
      }
    }
    
    // 5. Send the final response to the frontend
    const responsePayload = {
      ip: finalIp,
      countryCode: detectedCountryCode,
      country: country,
      matchedRegionCode: matchedRegionCode,
      detectionMethod: detectionMethod
    };

    // Cache the result
    regionCache.set(finalIp, {
      data: responsePayload,
      timestamp: Date.now()
    });

    res.json(responsePayload);
  } catch (error) {
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