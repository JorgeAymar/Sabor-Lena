
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting realistic seed (10x)...');
  
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
      console.log('Cleanup non-fatal error:', e.message);
  }

  // --- Categories (10) ---
  const categoriesData = [
      'Entrantes', 'Carnes a la Brasa', 'Pastas Caseras', 'Ensaladas Frescas', 
      'Pizzas a la Leña', 'Postres', 'Bebidas sin Alcohol', 'Vinos Tintos', 
      'Vinos Blancos', 'Cafetería'
  ];
  
  const categories = [];
  for (const name of categoriesData) {
      const cat = await prisma.category.create({ data: { name } });
      categories.push(cat);
  }
  console.log('Created 10 Categories');

  // --- Products (10+) ---
  // Distribute products across categories
  const productsData = [
      { name: 'Empanadas Criollas', price: 3.50, desc: 'Carne cortada a cuchillo, receta tradicional', catIdx: 0 },
      { name: 'Provoleta Asada', price: 12.00, desc: 'Queso provolone fundido con orégano y ají', catIdx: 0 },
      { name: 'Asado de Tira', price: 18.50, desc: 'Costillar de ternera premium a la leña', catIdx: 1 },
      { name: 'Ojo de Bife', price: 24.00, desc: 'Corte tierno de 400g con guarnición', catIdx: 1 },
      { name: 'Sorrentinos de Jamón y Queso', price: 14.00, desc: 'Pasta rellena con salsa rosa', catIdx: 2 },
      { name: 'Ensalada César', price: 11.50, desc: 'Lechuga, crutones, parmesano y aderezo especial', catIdx: 3 },
      { name: 'Pizza Margarita', price: 10.00, desc: 'Tomate, mozzarella y albahaca fresca', catIdx: 4 },
      { name: 'Flan Casero', price: 6.00, desc: 'Con dulce de leche y crema', catIdx: 5 },
      { name: 'Malbec Reserva', price: 28.00, desc: 'Vino tinto de cuerpo, 750ml', catIdx: 7 },
      { name: 'Café Cortado', price: 2.20, desc: 'Espresso con un toque de leche', catIdx: 9 }
  ];

  const products = [];
  for (const p of productsData) {
      const prod = await prisma.product.create({
          data: {
              name: p.name,
              price: p.price,
              description: p.desc,
              categoryId: categories[p.catIdx].id,
              isAvailable: true,
              image: `https://source.unsplash.com/random/400x300/?food,restaurant,${p.name.split(' ')[0]}` // Random food image
          }
      });
      products.push(prod);
      
      // Create inventory for each
      await prisma.inventoryItem.create({
          data: { productId: prod.id, quantity: Math.floor(Math.random() * 50) + 10, minStock: 5 }
      });
  }
  console.log('Created 10 Products with Inventory');

  // --- Users (10) ---
  const passwordHash = '$2b$10$rw5pUNu5vgVqzz8LaxvYguoYftPc2JSe6R67G/uczmyhS6Qv2iFFe'; // 'password123'
  
  const usersData = [
      { name: 'Admin Principal', email: 'admin@sabor.com', role: 'ADMIN' },
      { name: 'Juan Camarero', email: 'juan@sabor.com', role: 'WAITER' },
      { name: 'Maria Cocina', email: 'maria@sabor.com', role: 'KITCHEN' },
      { name: 'Carlos Gerente', email: 'carlos@sabor.com', role: 'ADMIN' },
      { name: 'Sofia Mesera', email: 'sofia@sabor.com', role: 'WAITER' },
      { name: 'Pedro Chef', email: 'pedro@sabor.com', role: 'KITCHEN' },
      { name: 'Laura Barra', email: 'laura@sabor.com', role: 'WAITER' },
      { name: 'Diego Logistica', email: 'diego@sabor.com', role: 'ADMIN' },
      { name: 'Ana Ayudante', email: 'ana@sabor.com', role: 'KITCHEN' },
      { name: 'Lucas Mesero', email: 'lucas@sabor.com', role: 'WAITER' }
  ];

  for (const u of usersData) {
      await prisma.user.create({
          data: {
              name: u.name,
              email: u.email,
              password: passwordHash,
              role: u.role,
              status: 'active'
          }
      });
  }
  console.log('Created 10 Users');

  // --- Customers (10) ---
  const customerNames = [
      'Antonio Lopez', 'Beatriz Garcia', 'Carlos Ruiz', 'Diana Mendez', 
      'Eduardo Fernandez', 'Fernanda Torres', 'Gabriel Diaz', 'Helena Romero', 
      'Ignacio Vasquez', 'Julia Silva'
  ];

  const customers = [];
  for (let i = 0; i < customerNames.length; i++) {
      const cust = await prisma.customer.create({
          data: {
              name: customerNames[i],
              email: `cliente${i+1}@test.com`,
              phone: `555-010${i}`,
              totalSpent: Math.floor(Math.random() * 500),
              lastVisit: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString()
          }
      });
      customers.push(cust);
  }
  console.log('Created 10 Customers');

  // --- Orders (10) ---
  const orderStatuses = ['PENDING', 'COOKING', 'READY', 'DELIVERED', 'CANCELLED'];
  
  for (let i = 1; i <= 10; i++) {
      // Randomly select products for this order
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      let orderTotal = 0;
      
      const orderItemsData = [];
      
      for (let j = 0; j < itemCount; j++) {
          const randProd = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 2) + 1;
          const itemPrice = randProd.price * qty;
          
          orderTotal += itemPrice;
          orderItemsData.push({
              productId: randProd.id,
              quantity: qty,
              price: randProd.price
          });
      }

      await prisma.order.create({
          data: {
              tableNumber: i,
              status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
              total: orderTotal,
              items: {
                  create: orderItemsData
              }
          }
      });
  }
  console.log('Created 10 Orders');

  console.log('Seed completed successfully!');
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

