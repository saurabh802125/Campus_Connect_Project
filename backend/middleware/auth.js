const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  try {
    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Check if token exists and is not empty
      if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ 
          message: 'Not authorized, no valid token provided',
          clearToken: true // Signal frontend to clear token
        });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Not authorized, user not found',
          clearToken: true
        });
      }
      
      next();
    } else {
      return res.status(401).json({ 
        message: 'Not authorized, no token provided',
        clearToken: true
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    // Handle different JWT errors
    let message = 'Not authorized, token failed';
    
    if (error.name === 'JsonWebTokenError') {
      message = 'Not authorized, invalid token format';
    } else if (error.name === 'TokenExpiredError') {
      message = 'Not authorized, token expired';
    } else if (error.name === 'NotBeforeError') {
      message = 'Not authorized, token not active';
    }
    
    return res.status(401).json({ 
      message,
      clearToken: true // Signal frontend to clear corrupted token
    });
  }
};

module.exports = { protect };