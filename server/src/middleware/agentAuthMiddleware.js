const jwt = require('jsonwebtoken');

const protectAgent = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'agent') {
      return res.status(403).json({ message: 'Access denied' });
    }
    req.agent = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protectAgent };
