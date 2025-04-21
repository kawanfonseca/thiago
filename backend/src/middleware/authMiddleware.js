const authService = require('../services/authService');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token de autenticação mal formatado' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token de autenticação mal formatado' });
  }

  const decoded = authService.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Token de autenticação inválido' });
  }

  req.user = decoded;
  return next();
};

module.exports = authMiddleware; 