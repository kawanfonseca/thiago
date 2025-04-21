const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'icms-st-combustiveis-secret-key';
const JWT_EXPIRES_IN = '24h';

const authService = {
  generateToken: (username) => {
    return jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  authenticate: (username, password) => {
    if (username === 'admin' && password === '0000') {
      return {
        success: true,
        token: authService.generateToken(username),
        user: { username }
      };
    }
    return { success: false };
  }
};

module.exports = authService; 