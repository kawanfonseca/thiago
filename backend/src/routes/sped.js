const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const SpedProcessor = require('../spedProcessor');

const prisma = new PrismaClient();
const upload = multer();

// Rota para processar arquivo SPED
router.post('/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log(`Processando arquivo SPED: ${req.file.originalname}`);
    
    const content = req.file.buffer.toString('utf-8');
    const processor = new SpedProcessor();
    const result = await processor.processFile(content, req.file.originalname);

    console.log(`Arquivo SPED processado com sucesso: ${req.file.originalname}`);
    console.log(`Total de registros processados: ${result.details.length}`);
    console.log(`Valor total a restituir: R$ ${result.totalRefund.toFixed(2)}`);

    res.json(result);
  } catch (error) {
    console.error('Erro ao processar arquivo SPED:', error);
    res.status(500).json({ error: 'Erro ao processar arquivo SPED' });
  }
});

// Rota para listar cálculos de restituição
router.get('/calculations', async (req, res) => {
  try {
    const calculations = await prisma.refundCalculation.findMany({
      include: { fuelType: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(calculations);
  } catch (error) {
    console.error('Erro ao buscar cálculos:', error);
    res.status(500).json({ error: 'Erro ao buscar cálculos' });
  }
});

// Rota para obter detalhes de um cálculo específico
router.get('/calculations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const calculation = await prisma.refundCalculation.findUnique({
      where: { id: parseInt(id) },
      include: { fuelType: true }
    });
    
    if (!calculation) {
      return res.status(404).json({ error: 'Cálculo não encontrado' });
    }
    
    res.json(calculation);
  } catch (error) {
    console.error('Erro ao buscar cálculo:', error);
    res.status(500).json({ error: 'Erro ao buscar cálculo' });
  }
});

module.exports = router; 