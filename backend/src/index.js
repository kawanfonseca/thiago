require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const SpedProcessor = require('./spedProcessor');
const authRoutes = require('./routes/auth');
const spedRoutes = require('./routes/sped');
const pmpfRoutes = require('./routes/pmpf');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const prisma = new PrismaClient();
const upload = multer();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas públicas
app.use('/api/auth', authRoutes);

// Middleware de autenticação para rotas protegidas
// Comentando temporariamente para facilitar o desenvolvimento
// app.use('/api', authMiddleware);

// Rotas protegidas
app.use('/api/sped', spedRoutes);
app.use('/api/pmpf', pmpfRoutes);

// Rota para upload de arquivo SPED (mantida para compatibilidade)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const content = req.file.buffer.toString('utf-8');
    const processor = new SpedProcessor();
    const result = await processor.processFile(content, req.file.originalname);

    res.json(result);
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    res.status(500).json({ error: 'Erro ao processar arquivo' });
  }
});

// Rota para listar tipos de combustível
app.get('/api/fuel-types', async (req, res) => {
  try {
    const fuelTypes = await prisma.fuelType.findMany();
    res.json(fuelTypes);
  } catch (error) {
    console.error('Erro ao buscar tipos de combustível:', error);
    res.status(500).json({ error: 'Erro ao buscar tipos de combustível' });
  }
});

// Rota para cadastrar tipo de combustível
app.post('/api/fuel-types', async (req, res) => {
  try {
    const { anpCode, name, icmsRate } = req.body;
    
    if (!anpCode || !name || typeof icmsRate !== 'number') {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const fuelType = await prisma.fuelType.create({
      data: { anpCode, name, icmsRate }
    });

    res.json(fuelType);
  } catch (error) {
    console.error('Erro ao cadastrar tipo de combustível:', error);
    res.status(500).json({ error: 'Erro ao cadastrar tipo de combustível' });
  }
});

// Rota para buscar valores PMPF
app.get('/api/pmpf-values', async (req, res) => {
  try {
    const { startDate, endDate, fuelTypeId } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.startDate = { lte: new Date(endDate) };
      where.endDate = { gte: new Date(startDate) };
    }
    
    if (fuelTypeId) {
      where.fuelTypeId = parseInt(fuelTypeId);
    }

    const values = await prisma.pmpfValue.findMany({
      where,
      include: { fuelType: true }
    });
    
    res.json(values);
  } catch (error) {
    console.error('Erro ao buscar valores PMPF:', error);
    res.status(500).json({ error: 'Erro ao buscar valores PMPF' });
  }
});

// Rota para cadastrar valor PMPF
app.post('/api/pmpf-values', async (req, res) => {
  try {
    const { fuelTypeId, startDate, endDate, value } = req.body;
    
    if (!fuelTypeId || !startDate || !endDate || typeof value !== 'number') {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const pmpfValue = await prisma.pmpfValue.create({
      data: {
        fuelTypeId: parseInt(fuelTypeId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        value
      }
    });

    res.json(pmpfValue);
  } catch (error) {
    console.error('Erro ao cadastrar valor PMPF:', error);
    res.status(500).json({ error: 'Erro ao cadastrar valor PMPF' });
  }
});

// Rota para verificar o status do servidor
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando corretamente' });
});

// Iniciar o servidor
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Conectado ao banco de dados');
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer(); 