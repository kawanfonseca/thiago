require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar se o usuário admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('Usuário admin já existe');
      return;
    }

    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('0000', salt);

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword
      }
    });

    console.log('Usuário admin criado com sucesso:', admin.username);
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 