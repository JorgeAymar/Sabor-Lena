
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  // Clean up
  try {
      await prisma.orderItem.deleteMany();
      await prisma.order.deleteMany();
      await prisma.inventoryItem.deleteMany();
      await prisma.product.deleteMany();
      await prisma.category.deleteMany();
      await prisma.customer.deleteMany();
      await prisma.user.deleteMany();
      console.log('Cleaned up database');
  } catch (e) {
      console.log('Cleanup non-fatal error (tables might be empty):', e.message);
  }

  // Categories
  const catEntrantes = await prisma.category.create({ data: { name: 'Entrantes' } });
  const catPrincipales = await prisma.category.create({ data: { name: 'Principales' } });
  const catBebidas = await prisma.category.create({ data: { name: 'Bebidas' } });

  // Products
  const prod1 = await prisma.product.create({
    data: {
      name: 'Empanadas',
      price: 5.50,
      description: 'Empanadas de carne cortada a cuchillo (2 un)',
      categoryId: catEntrantes.id,
      image: 'https://images.unsplash.com/photo-1541544744-cc9735d465c?auto=format&fit=crop&q=80',
    }
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Asado de Tira',
      price: 18.00,
      description: 'Costillar de ternera a la leña con guarnición',
      categoryId: catPrincipales.id,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80',
    }
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'Vino Malbec',
      price: 22.00,
      description: 'Botella de vino tinto reserva',
      categoryId: catBebidas.id,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80',
    }
  });

  // Inventory
  await prisma.inventoryItem.create({ data: { productId: prod1.id, quantity: 50, minStock: 10 } });
  await prisma.inventoryItem.create({ data: { productId: prod2.id, quantity: 20, minStock: 5 } });
  await prisma.inventoryItem.create({ data: { productId: prod3.id, quantity: 30, minStock: 5 } });

  // Users
  // Pre-calculated hash for 'password123'
  const passwordHash = '$2b$10$rw5pUNu5vgVqzz8LaxvYguoYftPc2JSe6R67G/uczmyhS6Qv2iFFe';

  await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@sabor.com', password: passwordHash, role: 'ADMIN', status: 'active' }
  });
  await prisma.user.create({
    data: { name: 'Juan Camarero', email: 'juan@sabor.com', password: passwordHash, role: 'WAITER', status: 'active' }
  });
  await prisma.user.create({
    data: { name: 'Maria Cocina', email: 'maria@sabor.com', password: passwordHash, role: 'KITCHEN', status: 'active' }
  });

  // Customers
  await prisma.customer.create({
    data: { 
      name: 'Carlos Gomez', 
      email: 'carlos@example.com', 
      phone: '555-0101', 
      totalSpent: 120.50,
      // lastVisit: 2 days ago
      lastVisit: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  });
  await prisma.customer.create({
    data: { 
      name: 'Ana Martinez', 
      email: 'ana@example.com',
      totalSpent: 450.00,
      lastVisit: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  });
  await prisma.customer.create({
    data: { 
      name: 'Luis Rodriguez', 
      email: 'luis@example.com', 
      phone: '555-0202',
      totalSpent: 45.00,
      lastVisit: new Date().toISOString()
    }
  });

  // Orders
  await prisma.order.create({
    data: {
      tableNumber: 1,
      status: 'PENDING',
      total: 23.50,
      items: {
        create: [
          { productId: prod1.id, quantity: 1, price: 5.50 },
          { productId: prod2.id, quantity: 1, price: 18.00 }
        ]
      }
    }
  });
  
  await prisma.order.create({
    data: {
      tableNumber: 5,
      status: 'READY',
      total: 44.00,
      items: {
        create: [
          { productId: prod2.id, quantity: 2, price: 36.00 },
          { productId: prod3.id, quantity: 1, price: 8.00 }
        ]
      }
    }
  });

  console.log('Seed completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
