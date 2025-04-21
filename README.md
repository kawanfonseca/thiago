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
- Cadastro e gerenciamento de valores PMPF por tipo de combustível
- Cálculo automático de restituição de ICMS-ST
- Interface intuitiva para visualização dos resultados

## Configuração do Banco de Dados

O projeto utiliza SQLite com Prisma ORM. O banco de dados é criado automaticamente na primeira execução.

## Desenvolvimento

Para iniciar o desenvolvimento:

1. Clone o repositório
2. Instale as dependências do backend e frontend
3. Execute as migrações do banco de dados
4. Inicie os servidores de desenvolvimento

## Licença

Este projeto está licenciado sob a licença MIT. 