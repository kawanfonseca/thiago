const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SpedProcessor {
  constructor() {
    this.currentSpedFile = null;
    this.currentProduct = null;
    this.currentNF = null;
    this.currentDate = null;
    this.currentC405 = null;
  }

  async processSpedFile(fileId) {
    const spedFile = await prisma.spedFile.findUnique({
      where: { id: fileId },
      include: { records: true }
    });

    if (!spedFile) {
      throw new Error('Arquivo SPED não encontrado');
    }

    this.currentSpedFile = spedFile;
    const records = spedFile.records;

    // Processa registros na ordem
    for (const record of records) {
      const [type, ...fields] = record.content.split('|');
      
      switch (type) {
        case '0000':
          await this.process0000(fields);
          break;
        case '0200':
          await this.process0200(fields);
          break;
        case '0206':
          await this.process0206(fields);
          break;
        case 'C100':
          await this.processC100(fields);
          break;
        case 'C170':
          await this.processC170(fields);
          break;
        case 'C405':
          await this.processC405(fields);
          break;
        case 'C420':
          await this.processC420(fields);
          break;
        case 'C425':
          await this.processC425(fields);
          break;
      }
    }

    return this.calculateRestitution();
  }

  async process0000(fields) {
    const [_, startDate, endDate] = fields;
    await prisma.spedFile.update({
      where: { id: this.currentSpedFile.id },
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });
  }

  async process0200(fields) {
    const [_, productCode] = fields;
    this.currentProduct = {
      code: productCode,
      anpCode: null
    };
  }

  async process0206(fields) {
    const [_, anpCode] = fields;
    if (this.currentProduct) {
      this.currentProduct.anpCode = anpCode;
    }
  }

  async processC100(fields) {
    const [operationType, emissionType, nfKey] = fields;
    if (operationType === '0' && emissionType === '1') {
      this.currentNF = nfKey;
    }
  }

  async processC170(fields) {
    if (!this.currentNF || !this.currentProduct) return;

    const [_, productCode, quantity, unit, value] = fields;
    if (productCode === this.currentProduct.code) {
      const fuelType = await prisma.fuelType.findFirst({
        where: { anpCode: this.currentProduct.anpCode }
      });

      if (fuelType) {
        await prisma.purchase.create({
          data: {
            date: this.currentSpedFile.startDate,
            quantity: parseFloat(quantity),
            unitPrice: parseFloat(value) / parseFloat(quantity),
            totalValue: parseFloat(value),
            nfKey: this.currentNF,
            fuelTypeId: fuelType.id,
            spedFileId: this.currentSpedFile.id
          }
        });
      }
    }
  }

  async processC405(fields) {
    const [date] = fields;
    this.currentDate = new Date(date);
  }

  async processC420(fields) {
    const [type] = fields;
    this.currentC420Type = type;
  }

  async processC425(fields) {
    if (this.currentC420Type?.startsWith('F')) {
      const [productCode, quantity, unit, value] = fields;
      const fuelType = await prisma.fuelType.findFirst({
        where: { anpCode: productCode }
      });

      if (fuelType) {
        await prisma.sale.create({
          data: {
            date: this.currentDate,
            quantity: parseFloat(quantity),
            unitPrice: parseFloat(value) / parseFloat(quantity),
            totalValue: parseFloat(value),
            fuelTypeId: fuelType.id,
            spedFileId: this.currentSpedFile.id
          }
        });
      }
    }
  }

  async calculateRestitution() {
    const sales = await prisma.sale.findMany({
      where: { spedFileId: this.currentSpedFile.id },
      include: { fuelType: true }
    });

    const results = [];
    for (const sale of sales) {
      const pmpfValue = await prisma.pmpfValue.findFirst({
        where: {
          fuelTypeId: sale.fuelTypeId,
          startDate: { lte: sale.date },
          endDate: { gte: sale.date }
        }
      });

      if (pmpfValue) {
        const difference = pmpfValue.value - sale.unitPrice;
        const restitution = difference * sale.fuelType.icmsRate * sale.quantity;
        
        results.push({
          fuelType: sale.fuelType.name,
          date: sale.date,
          quantity: sale.quantity,
          pmpfValue: pmpfValue.value,
          salePrice: sale.unitPrice,
          difference,
          icmsRate: sale.fuelType.icmsRate,
          restitution
        });
      }
    }

    return results;
  }

  async processFile(content) {
    try {
      console.log('Iniciando processamento do arquivo SPED...');
      
      // Salvar o arquivo SPED
      const spedFile = await prisma.spedFile.create({
        data: {
          content,
          filename: `SPED_${new Date().toISOString()}.txt`
        }
      });

      // Processar cada linha do arquivo
      const lines = content.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;

        const fields = line.split('|');
        const recordType = fields[1];

        // Salvar o registro
        await prisma.record.create({
          data: {
            type: recordType,
            content: line,
            spedFileId: spedFile.id
          }
        });

        // Processar o registro de acordo com seu tipo
        switch (recordType) {
          case '0000':
            await this.process0000Record(fields);
            break;
          case 'C405':
            await this.processC405Record(fields);
            break;
          case 'C425':
            await this.processC425Record(fields);
            break;
        }
      }

      console.log('Processamento do arquivo SPED concluído com sucesso');
      return spedFile;
    } catch (error) {
      console.error('Erro ao processar arquivo SPED:', error);
      throw error;
    }
  }

  async process0000Record(fields) {
    // Extrair a data inicial do arquivo
    const dateStr = fields[4];
    this.currentDate = new Date(
      dateStr.substring(4, 8), // ano
      parseInt(dateStr.substring(2, 4)) - 1, // mês (0-11)
      dateStr.substring(0, 2) // dia
    );
    console.log(`Data inicial do arquivo: ${this.currentDate.toISOString()}`);
  }

  async processC405Record(fields) {
    // Extrair a data do registro C405
    const dateStr = fields[2];
    this.currentC405 = {
      date: new Date(
        dateStr.substring(4, 8), // ano
        parseInt(dateStr.substring(2, 4)) - 1, // mês (0-11)
        dateStr.substring(0, 2) // dia
      ),
      total: parseFloat(fields[3])
    };
    console.log(`Registro C405 processado - Data: ${this.currentC405.date.toISOString()}, Total: ${this.currentC405.total}`);
  }

  async processC425Record(fields) {
    if (!this.currentC405 || !this.currentC405.date) {
      console.log('Ignorando registro C425 - Data do C405 não encontrada');
      return;
    }

    // Validar campos necessários
    if (fields.length < 7) {
      console.log('Ignorando registro C425 - Campos insuficientes');
      return;
    }

    const productCode = fields[2];
    const quantity = parseFloat(fields[5]);
    const value = parseFloat(fields[6]);

    // Buscar o tipo de combustível pelo código ANP
    const fuelType = await prisma.fuelType.findUnique({
      where: { anpCode: productCode },
      include: { pmpfValues: true }
    });

    if (!fuelType) {
      console.log(`Ignorando registro C425 - Tipo de combustível não encontrado para código ANP ${productCode}`);
      return;
    }

    // Encontrar o valor PMPF para a data do registro
    const pmpfValue = fuelType.pmpfValues.find(pv => 
      pv.startDate <= this.currentC405.date && 
      pv.endDate >= this.currentC405.date
    );

    if (!pmpfValue) {
      console.log(`Ignorando registro C425 - Valor PMPF não encontrado para a data ${this.currentC405.date.toISOString()}`);
      return;
    }

    // Calcular o estorno
    const refund = this.calculateRefund(quantity, value, pmpfValue.value, fuelType.icmsRate);
    console.log(`Estorno calculado para ${fuelType.name}: R$ ${refund.toFixed(2)}`);

    return {
      fuelType: fuelType.name,
      date: this.currentC405.date,
      quantity,
      value,
      pmpfValue: pmpfValue.value,
      icmsRate: fuelType.icmsRate,
      refund
    };
  }

  calculateRefund(quantity, value, pmpfValue, icmsRate) {
    // Fórmula do estorno: (PMPF - Preço de Venda) * Quantidade * (1 - Alíquota ICMS)
    const refund = (pmpfValue - (value / quantity)) * quantity * (1 - icmsRate);
    return Math.max(0, refund); // Não permite estorno negativo
  }
}

module.exports = new SpedProcessor(); 