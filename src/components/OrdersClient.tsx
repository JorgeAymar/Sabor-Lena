'use client';

import React from 'react';
import { Order, OrderItem, Product, OrderStatus } from '@prisma/client';
import { updateOrderStatus } from '@/app/actions/orders';

type FullOrder = Order & {
  items: (OrderItem & { product: Product })[];
};

interface OrdersClientProps {
  orders: FullOrder[];
}

const COLUMNS = [
  { id: 'PENDING', label: 'Pendiente', color: 'bg-gray-100 text-gray-700', border: 'border-gray-200' },
  { id: 'COOKING', label: 'Cocinando', color: 'bg-orange-100 text-orange-800', border: 'border-orange-200' },
  { id: 'READY', label: 'Listo', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200' },
  { id: 'DELIVERED', label: 'Entregado', color: 'bg-green-100 text-green-800', border: 'border-green-200' },
];

export default function OrdersClient({ orders }: OrdersClientProps) {
  
  const handleStatusChange = async (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus | null = null;
    if (currentStatus === 'PENDING') nextStatus = 'COOKING';
    else if (currentStatus === 'COOKING') nextStatus = 'READY';
    else if (currentStatus === 'READY') nextStatus = 'DELIVERED';
    
    if (nextStatus) {
      await updateOrderStatus(orderId, nextStatus);
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-140px)]">
      {COLUMNS.map((col) => {
        const columnOrders = orders.filter(o => o.status === col.id);
        
        return (
          <div key={col.id} className="min-w-[300px] flex-1 flex flex-col rounded-xl bg-gray-50/50 border border-[#e6e0db] h-full">
            {/* Header */}
            <div className={`p-4 border-b border-[#e6e0db] flex justify-between items-center bg-white rounded-t-xl`}>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${col.color}`}>
                  {columnOrders.length}
                </span>
                <h3 className="font-bold text-gray-700">{col.label}</h3>
              </div>
            </div>

            {/* List */}
            <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
              {columnOrders.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-xl border border-[#e6e0db] shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-sm font-bold text-gray-800">Mesa {order.tableNumber}</span>
                      <p className="text-xs text-gray-500">#{order.id.slice(0, 8)}</p>
                    </div>
                    <span className="text-sm font-bold">${order.total.toFixed(2)}</span>
                  </div>

                  <div className="space-y-1 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.quantity}x {item.product.name}</span>
                      </div>
                    ))}
                  </div>

                  {col.id !== 'DELIVERED' && (
                    <button 
                      onClick={() => handleStatusChange(order.id, order.status)}
                      className="w-full py-2 rounded-lg bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors"
                    >
                      Avanzar Etapa
                    </button>
                  )}
                </div>
              ))}
              
              {columnOrders.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm italic">
                  No hay pedidos
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
