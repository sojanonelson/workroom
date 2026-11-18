const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'workroom_jwt_super_secret_key_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = decodedUser;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
  }
  next();
};

const requireCustomerOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'customer' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Forbidden. Authorized role required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireCustomerOrAdmin,
  JWT_SECRET,
};
