const jwt = require('jsonwebtoken');

// Middleware for ADMIN routes
const protectAdmin = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;


  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
 
      token = authHeader.substring(7, authHeader.length);

  
      if (!token || token === 'null' || token === 'undefined') {
         
          return res.status(401).json({ message: 'Not authorized, malformed token' });
      }



      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = decoded;
      
 
      next();

    } catch (error) {

      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
      
      return res.status(401).json({ message: 'Not authorized, no token' });
  }
};


module.exports = { protectAdmin };