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
    this.referenceMonth = null;
  }

  async processFile(fileContent, fileName) {
    try {
      console.log('Iniciando processamento do arquivo SPED...');
      
      const lines = fileContent.split('\n');
      console.log(`Total de linhas no arquivo: ${lines.length}`);
      
      // Primeiro passo: processar registros 0000 para obter o período
      console.log('\nBuscando registro 0000...');
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const record = this.parseLine(line);
        if (!record) {
          console.log('Linha inválida:', line);
          continue;
        }
        
        console.log(`Tipo de registro encontrado: ${record.type}`);
        if (record.type === '0000') {
          console.log('Registro 0000 encontrado:', line);
          await this.process0000(record);
          break;
        }
      }
      
      // Segundo passo: processar registros 0200 e 0206 para mapear códigos de produtos
      console.log('\nProcessando registros 0200 e 0206...');
      for (const line of lines) {
        if (!line.trim()) continue;
        
        const record = this.parseLine(line);
        if (!record) continue;
        
        if (record.type === '0200' || record.type === '0206') {
          await this.processProductCode(record);
        }
      }
      
      console.log(`\nMapeamento de códigos de produtos: ${JSON.stringify(Array.from(this.productCodes.entries()))}`);
      
      // Terceiro passo: processar os registros C405 e C425
      console.log('\nProcessando registros C405 e C425...');
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
      
      console.log(`\nTotal de registros processados: ${this.records.length}`);
      
      await this.calculateRefunds();
      
      console.log('\nProcessamento do arquivo SPED concluído com sucesso');
      
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
      console.error('\nErro ao processar arquivo SPED:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  async formatRecords() {
    const formattedRecords = [];
    
    // Formata o mês de referência como MM/YYYY
    const referenceMonthStr = this.referenceMonth instanceof Date
        ? `${String(this.referenceMonth.getMonth() + 1).padStart(2, '0')}/${this.referenceMonth.getFullYear()}`
        : 'N/A';

    for (const record of this.records) {
      const fuelType = FUEL_TYPES[record.anpCode];
      if (!fuelType) continue;
      
      console.log(`- Registro para ${fuelType.name}:`);
      console.log(`  * Mês de referência: ${referenceMonthStr}`);
      console.log(`  * Quantidade: ${record.quantity}`);
      console.log(`  * Valor unitário: ${record.unitValue}`);
      console.log(`  * PMPF: ${record.pmpfValue}`);
      console.log(`  * Diferença: ${record.difference}`);
      console.log(`  * Ressarcimento: ${record.refundValue}`);
      
      formattedRecords.push({
        fuelType: fuelType.name,
        referenceMonth: referenceMonthStr,
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
    console.log('\nProcessando linha:', line);
    
    // Remove campos vazios no início da linha
    const fields = line.split('|').filter(field => field.trim() !== '');
    console.log('Campos após split e filter:', fields);
    
    if (fields.length < 1) {
      console.log('Linha inválida - campos insuficientes');
      return null;
    }

    const result = {
      type: fields[0],
      fields: fields.slice(1)
    };
    
    console.log('Resultado do parse:', result);
    return result;
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
    console.log('Processando registro 0000:', record);
    const fields = record.fields;
    
    // Verifica se há campos suficientes
    if (fields.length < 4) {
        console.error('Registro 0000 inválido: campos insuficientes');
        return;
    }

    // Extrai as datas dos campos corretos (índices 2 e 3)
    const initialDateStr = fields[2];
    const finalDateStr = fields[3];

    console.log('Datas encontradas:', { initialDateStr, finalDateStr });

    // Verifica se as strings de data são válidas
    if (!initialDateStr || initialDateStr.length !== 8 || !finalDateStr || finalDateStr.length !== 8) {
        console.error('Registro 0000 inválido: formato de data inválido');
        return;
    }

    try {
        // Converte as strings de data para objetos Date
        const initialDate = new Date(
            parseInt(initialDateStr.substring(4, 8)), // ano
            parseInt(initialDateStr.substring(2, 4)) - 1, // mês (0-11)
            parseInt(initialDateStr.substring(0, 2)) // dia
        );

        const finalDate = new Date(
            parseInt(finalDateStr.substring(4, 8)),
            parseInt(finalDateStr.substring(2, 4)) - 1,
            parseInt(finalDateStr.substring(0, 2))
        );

        this.initialDate = initialDate;
        this.finalDate = finalDate;
        
        // Define o mês de referência como o mês da data inicial
        this.referenceMonth = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
        
        console.log('Datas processadas:', {
            initialDate: initialDate.toISOString(),
            finalDate: finalDate.toISOString(),
            referenceMonth: this.referenceMonth.toISOString()
        });

    } catch (error) {
        console.error('Erro ao processar datas do registro 0000:', error);
        console.error('Detalhes do erro:', error.stack);
    }
  }

  async processC405(record) {
    try {
      this.totalValue = parseFloat(record.fields[4].replace(',', '.'));
      const dateStr = record.fields[0];
      
      console.log(`Processando registro C405 - Data: ${dateStr}`);
      
      // Verificar se a string de data tem o formato correto
      if (dateStr.length !== 8) {
        console.error(`Formato de data inválido no C405: ${dateStr}`);
        return;
      }
      
      this.currentDate = new Date(
        parseInt(dateStr.substring(4, 8)),
        parseInt(dateStr.substring(2, 4)) - 1,
        parseInt(dateStr.substring(0, 2))
      );
      
      console.log(`Data atual: ${this.currentDate.toLocaleDateString()}`);
    } catch (error) {
      console.error('Erro ao processar registro C405:', error);
      console.error('Stack trace:', error.stack);
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