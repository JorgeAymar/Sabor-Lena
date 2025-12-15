
const path = require('path');
// Add app node_modules to path explicitly just in case
module.paths.push('/app/node_modules');

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');


const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'admin@sabor.com';
    const password = 'password123';
    
    console.log(`Updating password for ${email}...`);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    
    console.log(`Successfully updated password for ${user.email}`);
  } catch (error) {
    if (error.code === 'P2025') {
        console.error('User not found!');
    } else {
        console.error('Error updating password:', error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
