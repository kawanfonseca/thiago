const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const SpedProcessor = require('./spedProcessor');

const app = express();
const prisma = new PrismaClient();
const upload = multer();

app.use(cors());
app.use(express.json());

// Rota para upload de arquivo SPED
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
    const { fuelTypeId, value, startDate, endDate } = req.body;
    
    if (!fuelTypeId || typeof value !== 'number' || !startDate || !endDate) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Validar se o tipo de combustível existe
    const fuelType = await prisma.fuelType.findUnique({
      where: { id: fuelTypeId }
    });

    if (!fuelType) {
      return res.status(404).json({ error: 'Tipo de combustível não encontrado' });
    }

    // Validar se já existe um valor PMPF para o período
    const existingValue = await prisma.pmpfValue.findFirst({
      where: {
        fuelTypeId,
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) }
          }
        ]
      }
    });

    if (existingValue) {
      return res.status(400).json({ error: 'Já existe um valor PMPF cadastrado para este período' });
    }

    const pmpfValue = await prisma.pmpfValue.create({
      data: {
        fuelTypeId,
        value,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      include: { fuelType: true }
    });

    res.json(pmpfValue);
  } catch (error) {
    console.error('Erro ao cadastrar valor PMPF:', error);
    res.status(500).json({ error: 'Erro ao cadastrar valor PMPF' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 