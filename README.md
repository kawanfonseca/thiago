# Sistema de Restituição ICMS-ST Combustíveis

Sistema para processamento de arquivos SPED e cálculo de restituição de ICMS-ST para combustíveis.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Backend**: API Node.js com Express e Prisma para processamento de arquivos SPED e cálculos
- **Frontend**: Aplicação React com Material UI para interface do usuário

## Requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- Git

## Instalação

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
node scripts/seedFuelTypes.js
node scripts/importPmpfValues.js
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Funcionalidades

- Upload e processamento de arquivos SPED
- Identificação automática de combustíveis através dos códigos ANP
- Processamento de registros SPED (0200, 0206, C100, C170, C405, C420, C425)
- Cadastro e gerenciamento de valores PMPF por tipo de combustível
- Cálculo automático de restituição de ICMS-ST
- Interface intuitiva para visualização dos resultados

## Processamento de Arquivos SPED

O sistema processa os seguintes registros do SPED:

1. **Registro 0000**: Identifica o período do arquivo
2. **Registro 0200/0206**: Identifica os combustíveis através do código ANP
3. **Registro C100/C170**: Processa as notas fiscais de entrada
4. **Registro C405/C420/C425**: Processa as vendas por cupom fiscal

## Cálculo de Restituição

O cálculo de restituição é feito da seguinte forma:

1. Identifica o combustível vendido
2. Busca o valor PMPF do período
3. Calcula a diferença entre o PMPF e o valor de venda
4. Aplica a alíquota de ICMS-ST específica do combustível
5. Multiplica pelo volume vendido

## Configuração do Banco de Dados

O projeto utiliza SQLite com Prisma ORM. O banco de dados é criado automaticamente na primeira execução.

## Desenvolvimento

Para iniciar o desenvolvimento:

1. Clone o repositório
2. Instale as dependências do backend e frontend
3. Execute as migrações do banco de dados
4. Execute os scripts de seed para tipos de combustível e valores PMPF
5. Inicie os servidores de desenvolvimento

## Licença

Este projeto está licenciado sob a licença MIT. 