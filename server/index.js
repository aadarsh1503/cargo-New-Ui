require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const geoip = require('geoip-lite');


const db = require('./src/config/db');


const errorHandler = require('./src/middleware/errorHandler');


const contentRoutes = require('./src/routes/contentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const excelRoutes = require('./src/routes/excelRoutes');   
const dotenv = require('dotenv');
const app = express();
dotenv.config();

app.use(cors({

  origin: [
    'http://localhost:5173',
    'https://gvs-cargo-dynamic.vercel.app',
    'https://gvscargo.com',
    'https://cargo-backend-black.vercel.app',
    'https://gvs-bahrain-pa25.vercel.app'
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

app.get('/api/detect-region', (req, res) => {
  const ip = req.ip === '::1' || req.ip === '127.0.0.1' ? '202.83.21.11' : req.ip; 
  const geo = geoip.lookup(ip);
  if (geo) {
      res.json({ ip, countryCode: geo.country, region: geo.region, city: geo.city });
  } else {
      res.status(404).json({ ip, error: 'Could not determine location.' });
  }
});


app.get('/', (req, res) => {
    res.send('GVS Cargo Merged API is running...');
});


app.use(errorHandler);

const PORT = process.env.PORT || 5000;


(async () => {
  try {

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1); 
  }
})();