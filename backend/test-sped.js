const SpedProcessor = require('./src/spedProcessor');
const fs = require('fs');

async function testSpedProcessing() {
  try {
    const processor = new SpedProcessor();
    const fileContent = fs.readFileSync('./tests/test.txt', 'utf8');
    
    console.log('=== Iniciando teste de processamento do arquivo SPED ===\n');
    
    const result = await processor.processFile(fileContent, 'sample_sped.txt');
    
    console.log('\n=== Resultado do processamento ===');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n=== Erro no processamento ===');
    console.error(error);
  }
}

testSpedProcessing(); 