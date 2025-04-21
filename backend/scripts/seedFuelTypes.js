const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FUEL_TYPES = [
  { anpCode: '320102001', name: 'Gasolina C Comum', icmsRate: 0.25 },
  { anpCode: '320102002', name: 'Gasolina Aditivada', icmsRate: 0.25 },
  { anpCode: '820101034', name: 'Diesel S10', icmsRate: 0.12 },
  { anpCode: '810101001', name: 'Etanol', icmsRate: 0.25 },
  { anpCode: '320101002', name: 'Gasolina A Premium', icmsRate: 0.25 },
  { anpCode: '820101011', name: 'Óleo Diesel B S1800', icmsRate: 0.12 },
  { anpCode: '320101001', name: 'Gasolina A Comum', icmsRate: 0.25 },
  { anpCode: '820101029', name: 'Óleo Diesel B S50 Comum', icmsRate: 0.12 },
  { anpCode: '820101030', name: 'Óleo Diesel B20 S50 Comum', icmsRate: 0.12 },
  { anpCode: '210301001', name: 'Etanol Hid', icmsRate: 0.25 },
  { anpCode: '320102003', name: 'Gasolina C Premium', icmsRate: 0.25 },
  { anpCode: '820101012', name: 'Óleo Diesel B S500 - COMUM', icmsRate: 0.12 },
  { anpCode: '220101005', name: 'Gás Natural Veicular', icmsRate: 0.17 },
  { anpCode: '820101033', name: 'Óleo Diesel B S10 - Aditivado', icmsRate: 0.12 },
  { anpCode: '810102001', name: 'Etanol Anidro', icmsRate: 0.25 },
  { anpCode: '820101008', name: 'DIESEL B4 S500 - COMUM', icmsRate: 0.12 },
  { anpCode: '820101013', name: 'Diesel', icmsRate: 0.12 },
  { anpCode: '820101004', name: 'DIESEL B10', icmsRate: 0.12 },
  { anpCode: '220101003', name: 'GNV Comprimido', icmsRate: 0.17 }
];

async function seedFuelTypes() {
  console.log('Iniciando população dos tipos de combustível...');

  try {
    for (const fuelType of FUEL_TYPES) {
      const existingFuelType = await prisma.fuelType.findUnique({
        where: { anpCode: fuelType.anpCode }
      });

      if (!existingFuelType) {
        await prisma.fuelType.create({
          data: fuelType
        });
        console.log(`Tipo de combustível criado: ${fuelType.name}`);
      } else {
        console.log(`Tipo de combustível já existe: ${fuelType.name}`);
      }
    }

    console.log('População dos tipos de combustível concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao popular tipos de combustível:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFuelTypes(); 