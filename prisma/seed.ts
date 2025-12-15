import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.inventoryItem.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Categories
  const catEntrantes = await prisma.category.create({ data: { name: 'Entrantes' } })
  const catPrincipales = await prisma.category.create({ data: { name: 'Principales' } })
  const catBebidas = await prisma.category.create({ data: { name: 'Bebidas' } })

  // Products
  const prod1 = await prisma.product.create({
    data: {
      name: 'Empanadas',
      price: 5.50,
      description: 'Empanadas de carne cortada a cuchillo',
      categoryId: catEntrantes.id,
      image: 'https://images.unsplash.com/photo-1541544744-cc9735d465c?auto=format&fit=crop&q=80',
    }
  })

  const prod2 = await prisma.product.create({
    data: {
      name: 'Asado de Tira',
      price: 18.00,
      description: 'Costillar de ternera a la leña',
      categoryId: catPrincipales.id,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80',
    }
  })

  // Inventory
  await prisma.inventoryItem.create({
    data: { productId: prod1.id, quantity: 50, minStock: 10 }
  })
  await prisma.inventoryItem.create({
    data: { productId: prod2.id, quantity: 20, minStock: 5 }
  })

  // Users
  await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@sabor.com', role: 'ADMIN', status: 'active' }
  })
  await prisma.user.create({
    data: { name: 'Juan Camarero', email: 'juan@sabor.com', role: 'WAITER', status: 'active' }
  })

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
  })

  console.log('Seed completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
