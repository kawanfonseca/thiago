const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const pmpfValues = [
  {
    fuelType: 'Gasolina C Comum',
    anpCode: '210203001',
    values: [
      { startDate: '2024-01-01', endDate: '2024-01-31', value: 0.50 },
      { startDate: '2024-02-01', endDate: '2024-02-29', value: 0.52 },
      { startDate: '2024-03-01', endDate: '2024-03-31', value: 0.51 }
    ]
  },
  {
    fuelType: 'Gasolina Aditivada',
    anpCode: '210203002',
    values: [
      { startDate: '2024-01-01', endDate: '2024-01-31', value: 0.52 },
      { startDate: '2024-02-01', endDate: '2024-02-29', value: 0.54 },
      { startDate: '2024-03-01', endDate: '2024-03-31', value: 0.53 }
    ]
  },
  {
    fuelType: 'Diesel S10',
    anpCode: '210203003',
    values: [
      { startDate: '2024-01-01', endDate: '2024-01-31', value: 0.45 },
      { startDate: '2024-02-01', endDate: '2024-02-29', value: 0.47 },
      { startDate: '2024-03-01', endDate: '2024-03-31', value: 0.46 }
    ]
  },
  {
    fuelType: 'Etanol',
    anpCode: '210203004',
    values: [
      { startDate: '2024-01-01', endDate: '2024-01-31', value: 0.48 },
      { startDate: '2024-02-01', endDate: '2024-02-29', value: 0.50 },
      { startDate: '2024-03-01', endDate: '2024-03-31', value: 0.49 }
    ]
  },
  {
    fuelType: 'Gás Natural Veicular',
    anpCode: '210203005',
    values: [
      { startDate: '2024-01-01', endDate: '2024-01-31', value: 0.40 },
      { startDate: '2024-02-01', endDate: '2024-02-29', value: 0.42 },
      { startDate: '2024-03-01', endDate: '2024-03-31', value: 0.41 }
    ]
  }
];

async function importPmpfValues() {
  try {
    console.log('Iniciando importação dos valores PMPF...');

    for (const fuel of pmpfValues) {
      const fuelType = await prisma.fuelType.findUnique({
        where: { anpCode: fuel.anpCode }
      });

      if (!fuelType) {
        console.log(`Tipo de combustível não encontrado: ${fuel.fuelType}`);
        continue;
      }

      for (const value of fuel.values) {
        const existingValue = await prisma.pmpfValue.findFirst({
          where: {
            fuelTypeId: fuelType.id,
            startDate: new Date(value.startDate),
            endDate: new Date(value.endDate)
          }
        });

        if (existingValue) {
          console.log(`Valor PMPF já existe para ${fuel.fuelType} no período ${value.startDate} a ${value.endDate}`);
          continue;
        }

        await prisma.pmpfValue.create({
          data: {
            fuelTypeId: fuelType.id,
            startDate: new Date(value.startDate),
            endDate: new Date(value.endDate),
            value: value.value
          }
        });

        console.log(`Valor PMPF criado para ${fuel.fuelType} no período ${value.startDate} a ${value.endDate}`);
      }
    }

    console.log('Importação dos valores PMPF concluída com sucesso');
  } catch (error) {
    console.error('Erro ao importar valores PMPF:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importPmpfValues(); 