import React from 'react';
import { prisma } from '@/lib/prisma';
import OrdersClient from '@/components/OrdersClient';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    where: { status: { not: 'CANCELLED' } } // Hide cancelled for now
  });

  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Tablero de Pedidos</h2>
        <p className="text-gray-500">Gestión de flujo de cocina y servicio</p>
      </div>
      
      <OrdersClient orders={orders} />
    </div>
  );
}
