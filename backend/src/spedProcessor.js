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

// Valores PMPF de exemplo para 2017
const PMPF_VALUES = {
  '320102001': 4.33, // Gasolina C Comum
  '320102002': 4.45, // Gasolina Aditivada
  '820101034': 3.85, // Diesel S10
  '810101001': 3.92, // Etanol
  '220101005': 2.85  // Gás Natural Veicular
};

class SpedProcessor {
  constructor() {
    this.initialDate = null;
    this.finalDate = null;
    this.totalValue = 0;
    this.records = [];
    this.productCodes = new Map();
    this.currentDate = null;
    this.currentProductCode = null;
  }

  async processFile(fileContent, fileName) {
    try {
      console.log('Iniciando processamento do arquivo SPED...');
      
      const lines = fileContent.split('\n');
      console.log(`Total de linhas no arquivo: ${lines.length}`);
      
      // Primeiro passo: processar registros 0000 para obter o período
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const record = this.parseLine(line);
        if (!record) continue;
        
        if (record.type === '0000') {
          await this.process0000(record);
          break;
        }
      }
      
      // Segundo passo: processar registros 0200 e 0206 para mapear códigos de produtos
      console.log('Processando registros 0200 e 0206...');
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const record = this.parseLine(line);
        if (!record) continue;
        
        if (record.type === '0200' || record.type === '0206') {
          await this.processProductCode(record);
        }
      }
      
      console.log(`Mapeamento de códigos de produtos: ${JSON.stringify(Array.from(this.productCodes.entries()))}`);
      
      // Terceiro passo: processar os registros C405 e C425
      console.log('Processando registros C405 e C425...');
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const record = this.parseLine(line);
        if (!record) continue;
        
        if (record.type === 'C405') {
          await this.processC405(record);
        } else if (record.type === 'C425') {
          await this.processC425(record);
        }
      }
      
      console.log(`Total de registros processados: ${this.records.length}`);
      
      await this.calculateRefunds();
      
      console.log('Processamento do arquivo SPED concluído com sucesso');
      
      // Formatar o resultado para o frontend
      const formattedRecords = await this.formatRecords();
      const totalRefund = formattedRecords.reduce((sum, record) => sum + record.refund, 0);
      
      return {
        id: Date.now(),
        fileName: fileName,
        processedAt: new Date().toISOString(),
        totalRefund: totalRefund,
        details: formattedRecords
      };
    } catch (error) {
      console.error('Erro ao processar arquivo SPED:', error);
      throw error;
    }
  }

  async formatRecords() {
    const formattedRecords = [];
    
    for (const record of this.records) {
      const fuelType = FUEL_TYPES[record.anpCode];
      if (!fuelType) continue;

      formattedRecords.push({
        fuelType: fuelType.name,
        referenceMonth: this.currentDate ? 
          this.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) :
          'N/A',
        pmpfValue: record.pmpfValue,
        quantity: record.quantity,
        totalSaleValue: record.totalValue,
        unitSaleValue: record.unitValue,
        difference: record.difference,
        refund: record.refundValue
      });
    }

    return formattedRecords;
  }

  parseLine(line) {
    const fields = line.split('|');
    if (fields.length < 2) return null;

    return {
      type: fields[1],
      fields: fields.slice(2)
    };
  }

  async processProductCode(record) {
    if (record.type === '0200') {
      const productCode = record.fields[0];
      this.currentProductCode = productCode;
      console.log(`Processando código de produto: ${productCode}`);
    } else if (record.type === '0206' && this.currentProductCode) {
      const anpCode = record.fields[0];
      this.productCodes.set(this.currentProductCode, anpCode);
      console.log(`Mapeado código de produto ${this.currentProductCode} para código ANP ${anpCode}`);
    }
  }

  async process0000(record) {
    try {
      // Formato da data no SPED: DDMMAAAA
      const initialDateStr = record.fields[4];
      const finalDateStr = record.fields[5];
      
      this.initialDate = new Date(
        parseInt(initialDateStr.substring(4, 8)),
        parseInt(initialDateStr.substring(2, 4)) - 1,
        parseInt(initialDateStr.substring(0, 2))
      );
      
      this.finalDate = new Date(
        parseInt(finalDateStr.substring(4, 8)),
        parseInt(finalDateStr.substring(2, 4)) - 1,
        parseInt(finalDateStr.substring(0, 2))
      );
      
      console.log(`Período do arquivo: ${this.initialDate.toLocaleDateString()} a ${this.finalDate.toLocaleDateString()}`);
    } catch (error) {
      console.error('Erro ao processar datas do registro 0000:', error);
    }
  }

  async processC405(record) {
    try {
      this.totalValue = parseFloat(record.fields[4].replace(',', '.'));
      const dateStr = record.fields[1];
      
      this.currentDate = new Date(
        parseInt(dateStr.substring(4, 8)),
        parseInt(dateStr.substring(2, 4)) - 1,
        parseInt(dateStr.substring(0, 2))
      );
      
      console.log(`Data atual: ${this.currentDate.toLocaleDateString()}`);
    } catch (error) {
      console.error('Erro ao processar registro C405:', error);
    }
  }

  async processC425(record) {
    try {
      const productCode = record.fields[0];
      const anpCode = this.productCodes.get(productCode);
      
      if (!anpCode) {
        console.log(`Código ANP não encontrado para o código de produto: ${productCode}`);
        return;
      }

      const fuelType = FUEL_TYPES[anpCode];
      if (!fuelType) {
        console.log(`Tipo de combustível não encontrado para o código ANP: ${anpCode}`);
        return;
      }

      const quantity = parseFloat(record.fields[1].replace(',', '.'));
      const totalValue = parseFloat(record.fields[3].replace(',', '.'));
      const unitValue = totalValue / quantity;

      // Usando valores PMPF de exemplo
      const pmpfValue = PMPF_VALUES[anpCode] || 0;
      if (!pmpfValue) {
        console.log(`Valor PMPF não encontrado para o tipo ${fuelType.name}`);
        return;
      }

      const difference = pmpfValue - unitValue;
      const refundValue = difference * quantity * fuelType.icmsRate;

      this.records.push({
        anpCode,
        quantity,
        unitValue,
        totalValue,
        pmpfValue,
        difference,
        refundValue,
        date: this.currentDate
      });

      console.log(`Processado registro C425: ${fuelType.name} - Quantidade: ${quantity}, Valor Unitário: ${unitValue}, PMPF: ${pmpfValue}, Diferença: ${difference}, Ressarcimento: ${refundValue}`);
    } catch (error) {
      console.error('Erro ao processar registro C425:', error);
    }
  }

  async calculateRefunds() {
    let totalRefund = 0;
    
    for (const record of this.records) {
      const fuelType = FUEL_TYPES[record.anpCode];
      if (!fuelType) continue;

      totalRefund += record.refundValue;
      
      console.log(`Ressarcimento calculado para ${fuelType.name}: R$ ${record.refundValue.toFixed(2)}`);
    }
    
    console.log(`Total de ressarcimento: R$ ${totalRefund.toFixed(2)}`);
    return totalRefund;
  }
}

module.exports = SpedProcessor; 