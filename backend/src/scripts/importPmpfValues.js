require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Valores PMPF para cada tipo de combustível
// Formato: { anpCode: [{ value, startDate, endDate }] }
const pmpfValues = {
  // Gasolina C Comum
  '320102001': [
    { value: 4.33, startDate: new Date('2017-01-01'), endDate: new Date('2017-01-15') },
    { value: 4.33, startDate: new Date('2017-01-16'), endDate: new Date('2017-01-31') },
    { value: 4.33, startDate: new Date('2017-02-01'), endDate: new Date('2017-02-15') },
    { value: 4.33, startDate: new Date('2017-02-16'), endDate: new Date('2017-02-28') },
    { value: 4.33, startDate: new Date('2017-03-01'), endDate: new Date('2017-03-15') },
    { value: 4.33, startDate: new Date('2017-03-16'), endDate: new Date('2017-03-31') },
    { value: 4.33, startDate: new Date('2017-04-01'), endDate: new Date('2017-04-15') },
    { value: 4.33, startDate: new Date('2017-04-16'), endDate: new Date('2017-04-30') },
    { value: 4.33, startDate: new Date('2017-05-01'), endDate: new Date('2017-05-15') },
    { value: 4.33, startDate: new Date('2017-05-16'), endDate: new Date('2017-05-31') },
    { value: 4.33, startDate: new Date('2017-06-01'), endDate: new Date('2017-06-15') },
    { value: 4.33, startDate: new Date('2017-06-16'), endDate: new Date('2017-06-30') },
    { value: 4.33, startDate: new Date('2017-07-01'), endDate: new Date('2017-07-15') },
    { value: 4.33, startDate: new Date('2017-07-16'), endDate: new Date('2017-07-31') },
    { value: 4.33, startDate: new Date('2017-08-01'), endDate: new Date('2017-08-15') },
    { value: 4.33, startDate: new Date('2017-08-16'), endDate: new Date('2017-08-31') },
    { value: 4.33, startDate: new Date('2017-09-01'), endDate: new Date('2017-09-15') },
    { value: 4.33, startDate: new Date('2017-09-16'), endDate: new Date('2017-09-30') },
    { value: 4.33, startDate: new Date('2017-10-01'), endDate: new Date('2017-10-15') },
    { value: 4.33, startDate: new Date('2017-10-16'), endDate: new Date('2017-10-31') },
    { value: 4.33, startDate: new Date('2017-11-01'), endDate: new Date('2017-11-15') },
    { value: 4.33, startDate: new Date('2017-11-16'), endDate: new Date('2017-11-30') },
    { value: 4.33, startDate: new Date('2017-12-01'), endDate: new Date('2017-12-15') },
    { value: 4.33, startDate: new Date('2017-12-16'), endDate: new Date('2017-12-31') },
    { value: 4.33, startDate: new Date('2018-01-01'), endDate: new Date('2018-01-15') },
    { value: 4.33, startDate: new Date('2018-01-16'), endDate: new Date('2018-01-31') },
    { value: 4.33, startDate: new Date('2018-02-01'), endDate: new Date('2018-02-15') },
    { value: 4.33, startDate: new Date('2018-02-16'), endDate: new Date('2018-02-28') },
    { value: 4.33, startDate: new Date('2018-03-01'), endDate: new Date('2018-03-15') },
    { value: 4.33, startDate: new Date('2018-03-16'), endDate: new Date('2018-03-31') },
    { value: 4.33, startDate: new Date('2018-04-01'), endDate: new Date('2018-04-15') },
    { value: 4.33, startDate: new Date('2018-04-16'), endDate: new Date('2018-04-30') },
    { value: 4.33, startDate: new Date('2018-05-01'), endDate: new Date('2018-05-15') },
    { value: 4.33, startDate: new Date('2018-05-16'), endDate: new Date('2018-05-31') },
    { value: 4.33, startDate: new Date('2018-06-01'), endDate: new Date('2018-06-15') },
    { value: 4.33, startDate: new Date('2018-06-16'), endDate: new Date('2018-06-30') },
    { value: 4.33, startDate: new Date('2018-07-01'), endDate: new Date('2018-07-15') },
    { value: 4.33, startDate: new Date('2018-07-16'), endDate: new Date('2018-07-31') },
    { value: 4.33, startDate: new Date('2018-08-01'), endDate: new Date('2018-08-15') },
    { value: 4.33, startDate: new Date('2018-08-16'), endDate: new Date('2018-08-31') },
    { value: 4.33, startDate: new Date('2018-09-01'), endDate: new Date('2018-09-15') },
    { value: 4.33, startDate: new Date('2018-09-16'), endDate: new Date('2018-09-30') },
    { value: 4.33, startDate: new Date('2018-10-01'), endDate: new Date('2018-10-15') },
    { value: 4.33, startDate: new Date('2018-10-16'), endDate: new Date('2018-10-31') },
    { value: 4.33, startDate: new Date('2018-11-01'), endDate: new Date('2018-11-15') },
    { value: 4.33, startDate: new Date('2018-11-16'), endDate: new Date('2018-11-30') },
    { value: 4.33, startDate: new Date('2018-12-01'), endDate: new Date('2018-12-15') },
    { value: 4.33, startDate: new Date('2018-12-16'), endDate: new Date('2018-12-31') }
  ],
  // Gasolina Aditivada
  '320102002': [
    { value: 4.43, startDate: new Date('2017-01-01'), endDate: new Date('2017-01-15') },
    { value: 4.43, startDate: new Date('2017-01-16'), endDate: new Date('2017-01-31') },
    // ... Adicione valores para todos os períodos
  ],
  // Diesel S10
  '820101034': [
    { value: 3.33, startDate: new Date('2017-01-01'), endDate: new Date('2017-01-15') },
    { value: 3.33, startDate: new Date('2017-01-16'), endDate: new Date('2017-01-31') },
    // ... Adicione valores para todos os períodos
  ],
  // Etanol
  '810101001': [
    { value: 3.33, startDate: new Date('2017-01-01'), endDate: new Date('2017-01-15') },
    { value: 3.33, startDate: new Date('2017-01-16'), endDate: new Date('2017-01-31') },
    // ... Adicione valores para todos os períodos
  ],
  // Gás Natural Veicular
  '220101005': [
    { value: 3.33, startDate: new Date('2017-01-01'), endDate: new Date('2017-01-15') },
    { value: 3.33, startDate: new Date('2017-01-16'), endDate: new Date('2017-01-31') },
    // ... Adicione valores para todos os períodos
  ]
};

async function importPmpfValues() {
  try {
    console.log('Iniciando importação de valores PMPF...');

    for (const [anpCode, values] of Object.entries(pmpfValues)) {
      // Buscar o tipo de combustível pelo código ANP
      const fuelType = await prisma.fuelType.findUnique({
        where: { anpCode }
      });

      if (!fuelType) {
        console.log(`Tipo de combustível com código ANP ${anpCode} não encontrado`);
        continue;
      }

      console.log(`Importando valores PMPF para ${fuelType.name} (${anpCode})`);

      for (const pmpfValue of values) {
        // Verificar se o valor PMPF já existe para o período
        const existingValue = await prisma.pmpfValue.findFirst({
          where: {
            fuelTypeId: fuelType.id,
            startDate: pmpfValue.startDate,
            endDate: pmpfValue.endDate
          }
        });

        if (existingValue) {
          console.log(`Valor PMPF para ${fuelType.name} no período ${pmpfValue.startDate.toISOString()} a ${pmpfValue.endDate.toISOString()} já existe`);
          continue;
        }

        // Criar o valor PMPF
        const newPmpfValue = await prisma.pmpfValue.create({
          data: {
            value: pmpfValue.value,
            startDate: pmpfValue.startDate,
            endDate: pmpfValue.endDate,
            fuelTypeId: fuelType.id
          }
        });

        console.log(`Valor PMPF criado: ${newPmpfValue.value} para ${fuelType.name} no período ${newPmpfValue.startDate.toISOString()} a ${newPmpfValue.endDate.toISOString()}`);
      }
    }

    console.log('Importação de valores PMPF concluída com sucesso');
  } catch (error) {
    console.error('Erro ao importar valores PMPF:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importPmpfValues(); 