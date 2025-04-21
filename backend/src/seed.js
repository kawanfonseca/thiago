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

async function main() {
  console.log('Iniciando seed do banco de dados...');

  for (const fuelType of FUEL_TYPES) {
    await prisma.fuelType.upsert({
      where: { anpCode: fuelType.anpCode },
      update: fuelType,
      create: fuelType,
    });
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 