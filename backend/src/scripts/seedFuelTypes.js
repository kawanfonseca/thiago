require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Lista de tipos de combustível com códigos ANP e alíquotas de ICMS
const fuelTypes = [
  { name: 'Gasolina C Comum', anpCode: '320102001', icmsRate: 0.25 },
  { name: 'Gasolina Aditivada', anpCode: '320102002', icmsRate: 0.25 },
  { name: 'Diesel S10', anpCode: '820101034', icmsRate: 0.12 },
  { name: 'Etanol', anpCode: '810101001', icmsRate: 0.25 },
  { name: 'Gasolina A Premium', anpCode: '320101002', icmsRate: 0.25 },
  { name: 'Óleo Diesel B S1800', anpCode: '820101011', icmsRate: 0.12 },
  { name: 'Gasolina A Comum', anpCode: '320101001', icmsRate: 0.25 },
  { name: 'Óleo Diesel B S50 Comum', anpCode: '820101029', icmsRate: 0.12 },
  { name: 'Óleo Diesel B20 S50 Comum', anpCode: '820101030', icmsRate: 0.12 },
  { name: 'Etanol Hid', anpCode: '210301001', icmsRate: 0.25 },
  { name: 'Gasolina C Premium', anpCode: '320102003', icmsRate: 0.25 },
  { name: 'Óleo Diesel B S500 - COMUM', anpCode: '820101012', icmsRate: 0.12 },
  { name: 'Gás Natural Veicular', anpCode: '220101005', icmsRate: 0.17 },
  { name: 'Óleo Diesel B S10 - Aditivado', anpCode: '820101033', icmsRate: 0.12 },
  { name: 'Etanol Anidro', anpCode: '810102001', icmsRate: 0.25 },
  { name: 'DIESEL B4 S500 - COMUM', anpCode: '820101008', icmsRate: 0.12 },
  { name: 'Diesel', anpCode: '820101013', icmsRate: 0.12 },
  { name: 'DIESEL B10', anpCode: '820101004', icmsRate: 0.12 },
  { name: 'GNV Comprimido', anpCode: '220101003', icmsRate: 0.17 }
];

async function seedFuelTypes() {
  try {
    console.log('Iniciando importação de tipos de combustível...');

    for (const fuelType of fuelTypes) {
      // Verificar se o tipo de combustível já existe
      const existingFuelType = await prisma.fuelType.findUnique({
        where: { anpCode: fuelType.anpCode }
      });

      if (existingFuelType) {
        console.log(`Tipo de combustível ${fuelType.name} (${fuelType.anpCode}) já existe`);
        continue;
      }

      // Criar o tipo de combustível
      const newFuelType = await prisma.fuelType.create({
        data: {
          name: fuelType.name,
          anpCode: fuelType.anpCode,
          icmsRate: fuelType.icmsRate
        }
      });

      console.log(`Tipo de combustível criado: ${newFuelType.name} (${newFuelType.anpCode})`);
    }

    console.log('Importação de tipos de combustível concluída com sucesso');
  } catch (error) {
    console.error('Erro ao importar tipos de combustível:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFuelTypes(); 