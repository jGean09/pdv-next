// create-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@pdv.com';
  const plainPassword = 'admin'; // Senha provisória para o seu primeiro acesso
  
  // O motor de criptografia embaralha a senha 10 vezes (Salt)
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // O upsert garante que se você rodar o script 2 vezes, ele não duplica o usuário
  const user = await prisma.user.upsert({
    where: { email: email },
    update: {},
    create: {
      name: 'Administrador Mestre',
      email: email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`\n✅ COFRE INICIADO. Chave Mestra criada com sucesso!`);
  console.log(`--------------------------------------------------`);
  console.log(`Email de acesso: ${user.email}`);
  console.log(`Senha de acesso: ${plainPassword}`);
  console.log(`Nível de Acesso: ${user.role}`);
  console.log(`Hash Salvo no BD: ${user.password.substring(0, 20)}...\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });