const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FUEL_TYPES = {
  '320102001': { name: 'Gasolina C Comum', icmsRate: 0.25 },
  '320102002': { name: 'Gasolina Aditivada', icmsRate: 0.25 },
  '820101034': { name: 'Diesel S10', icmsRate: 0.12 },
  '810101001': { name: 'Etanol', icmsRate: 0.25 },
  '320101002': { name: 'Gasolina A Premium', icmsRate: 0.25 },
  '820101011': { name: 'Óleo Diesel B S1800', icmsRate: 0.12 },
  '320101001': { name: 'Gasolina A Comum', icmsRate: 0.25 },
  '820101029': { name: 'Óleo Diesel B S50 Comum', icmsRate: 0.12 },
  '820101030': { name: 'Óleo Diesel B20 S50 Comum', icmsRate: 0.12 },
  '210301001': { name: 'Etanol Hid', icmsRate: 0.25 },
  '320102003': { name: 'Gasolina C Premium', icmsRate: 0.25 },
  '820101012': { name: 'Óleo Diesel B S500 - COMUM', icmsRate: 0.12 },
  '220101005': { name: 'Gás Natural Veicular', icmsRate: 0.17 },
  '820101033': { name: 'Óleo Diesel B S10 - Aditivado', icmsRate: 0.12 },
  '810102001': { name: 'Etanol Anidro', icmsRate: 0.25 },
  '820101008': { name: 'DIESEL B4 S500 - COMUM', icmsRate: 0.12 },
  '820101013': { name: 'Diesel', icmsRate: 0.12 },
  '820101004': { name: 'DIESEL B10', icmsRate: 0.12 },
  '220101003': { name: 'GNV Comprimido', icmsRate: 0.17 }
};

class SpedProcessor {
  constructor() {
    this.currentFile = null;
    this.fuelProducts = new Map();
    this.processedRecords = {
      total: 0,
      ignored: 0,
      processed: 0
    };
  }

  async processFile(content, filename) {
    console.log(`Iniciando processamento do arquivo: ${filename}`);
    
    this.currentFile = await prisma.spedFile.create({
      data: { filename, content }
    });
    console.log(`Arquivo salvo com ID: ${this.currentFile.id}`);

    const lines = content.split('\n');
    console.log(`Total de linhas no arquivo: ${lines.length}`);
    
    let currentProduct = null;
    let productCount = 0;
    let anpCount = 0;

    for (const line of lines) {
      const fields = line.split('|');
      const recordType = fields[1];

      if (recordType === '0200') {
        currentProduct = { code: fields[2] };
        productCount++;
      }

      if (recordType === '0206' && currentProduct) {
        const anpCode = fields[2];
        if (FUEL_TYPES[anpCode]) {
          this.fuelProducts.set(currentProduct.code, anpCode);
          anpCount++;
          console.log(`Produto ${currentProduct.code} mapeado para ANP ${anpCode} (${FUEL_TYPES[anpCode].name})`);
        }
      }

      if (recordType === 'C425') {
        this.processedRecords.total++;
        await this.processC425Record(fields);
      }
    }

    console.log(`
      Resumo do processamento:
      - Produtos encontrados: ${productCount}
      - Códigos ANP válidos: ${anpCount}
      - Registros C425 totais: ${this.processedRecords.total}
      - Registros C425 ignorados: ${this.processedRecords.ignored}
      - Registros C425 processados: ${this.processedRecords.processed}
    `);

    return await this.calculateRefund();
  }

  async processC425Record(fields) {
    if (fields.length < 6) {
      console.log(`Registro C425 ignorado: campos insuficientes`);
      this.processedRecords.ignored++;
      return;
    }

    const productCode = fields[2];
    const fuelAnpCode = this.fuelProducts.get(productCode);
    
    if (!fuelAnpCode) {
      console.log(`Registro C425 ignorado: produto ${productCode} sem código ANP`);
      this.processedRecords.ignored++;
      return;
    }

    if (!FUEL_TYPES[fuelAnpCode]) {
      console.log(`Registro C425 ignorado: código ANP ${fuelAnpCode} não cadastrado`);
      this.processedRecords.ignored++;
      return;
    }

    const quantity = parseFloat(fields[3]);
    const value = parseFloat(fields[5]);

    if (isNaN(quantity) || isNaN(value) || quantity <= 0 || value <= 0) {
      console.log(`Registro C425 ignorado: valores inválidos (quantidade: ${quantity}, valor: ${value})`);
      this.processedRecords.ignored++;
      return;
    }

    await this.saveRecord('C425', fields.join('|'));
    this.processedRecords.processed++;
  }

  async saveRecord(type, content) {
    return prisma.record.create({
      data: {
        type,
        content,
        spedFileId: this.currentFile.id
      }
    });
  }

  async calculateRefund() {
    console.log('Iniciando cálculo de restituição...');
    
    const records = await prisma.record.findMany({
      where: {
        spedFileId: this.currentFile.id,
        type: 'C425'
      }
    });

    console.log(`Encontrados ${records.length} registros para cálculo`);

    const results = [];
    for (const record of records) {
      const fields = record.content.split('|');
      const productCode = fields[2];
      const fuelAnpCode = this.fuelProducts.get(productCode);
      
      if (!fuelAnpCode || !FUEL_TYPES[fuelAnpCode]) {
        console.log(`Ignorando registro no cálculo: código ANP inválido para produto ${productCode}`);
        continue;
      }

      const quantity = parseFloat(fields[3]);
      const value = parseFloat(fields[5]);

      // Buscar o valor PMPF do banco de dados
      const pmpfValue = await this.getPmpfValue(fuelAnpCode);
      if (!pmpfValue) {
        console.log(`Valor PMPF não encontrado para combustível ${FUEL_TYPES[fuelAnpCode].name}`);
        continue;
      }

      const unitValue = value / quantity;
      const difference = pmpfValue - unitValue;
      const refundAmount = difference > 0 ? difference * quantity * FUEL_TYPES[fuelAnpCode].icmsRate : 0;

      results.push({
        fuelType: FUEL_TYPES[fuelAnpCode].name,
        period: this.extractPeriodFromRecord(fields),
        quantity,
        value,
        pmpf: pmpfValue,
        icmsRate: FUEL_TYPES[fuelAnpCode].icmsRate,
        refundAmount
      });
    }

    console.log(`Cálculo finalizado: ${results.length} resultados gerados`);
    return results;
  }

  async getPmpfValue(fuelAnpCode) {
    // Buscar o tipo de combustível
    const fuelType = await prisma.fuelType.findFirst({
      where: { anpCode: fuelAnpCode }
    });

    if (!fuelType) {
      return null;
    }

    // Buscar o valor PMPF mais recente para o tipo de combustível
    const pmpfValue = await prisma.pmpfValue.findFirst({
      where: {
        fuelTypeId: fuelType.id,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      orderBy: { startDate: 'desc' }
    });

    return pmpfValue ? pmpfValue.value : null;
  }

  extractPeriodFromRecord(fields) {
    // Implementar a extração do período do registro SPED
    // Por enquanto, retornando a data atual
    return new Date().toISOString().split('T')[0];
  }
}

module.exports = SpedProcessor; 