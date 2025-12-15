
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'admin@sabor.com';
    // Pre-calculated hash for 'password123'
    const hashedPassword = '$2b$10$rw5pUNu5vgVqzz8LaxvYguoYftPc2JSe6R67G/uczmyhS6Qv2iFFe';
    
    console.log(`Updating password for ${email}...`);
    
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
