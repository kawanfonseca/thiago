const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const authService = require('../services/authService');

const router = express.Router();
const prisma = new PrismaClient();

// Validação para o login
const loginValidation = [
  body('username').notEmpty().withMessage('Nome de usuário é obrigatório'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

/**
 * Rota de login
 * POST /api/auth/login
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const result = authService.authenticate(username, password);

  if (result.success) {
    return res.json(result);
  }

  return res.status(401).json({ error: 'Usuário ou senha inválidos' });
});

module.exports = router; 