import React from 'react';
import { prisma } from '@/lib/prisma';
import SalesChart from '@/components/SalesChart';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    totalRevenue,
    activeOrderCount,
    recentOrders,
    topProducts
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: today } }
    }),
    prisma.order.count({ where: { status: { in: ['PENDING', 'COOKING', 'READY'] } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    }),
    prisma.product.findMany({ take: 4 }) // Mock "Top" for now, ideally aggregate OrderItems
  ]);

  return {
    totalOrders,
    revenue: totalRevenue._sum.total || 0,
    activeOrderCount,
    recentOrders,
    topProducts
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();
  
  // Mock chart data - in real app, aggregate Sales by hour
  const chartData = [
    { time: '10:00', sales: 0 },
    { time: '12:00', sales: 120 },
    { time: '14:00', sales: 450 },
    { time: '16:00', sales: 300 },
    { time: '18:00', sales: 50 },
    { time: '20:00', sales: data.revenue }, // Use current revenue for last point
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
          <p className="text-gray-500">Resumen de actividad del restaurante</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-green-600">Cocina Activa</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders */}
        <div className="rounded-xl border border-[#e6e0db] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Pedidos Hoy</p>
            <p className="text-2xl font-bold text-gray-800">{data.totalOrders}</p>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-[#e6e0db] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Ventas Hoy</p>
            <p className="text-2xl font-bold text-gray-800">${data.revenue.toFixed(2)}</p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="rounded-xl border border-[#e6e0db] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <span className="material-symbols-outlined">restaurant</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">En Cocina</p>
            <p className="text-2xl font-bold text-gray-800">{data.activeOrderCount}</p>
          </div>
        </div>

        {/* Satisfaction (Mock) */}
        <div className="rounded-xl border border-[#e6e0db] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500">Satisfacción</p>
            <p className="text-2xl font-bold text-gray-800">4.8/5</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <div className="rounded-xl border border-[#e6e0db] bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Rendimiento de Ventas</h3>
          <SalesChart data={chartData} />
        </div>

        {/* Top Products */}
        <div className="rounded-xl border border-[#e6e0db] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Platos Destacados</h3>
          <div className="flex flex-col gap-4">
            {data.topProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gray-200 overflow-hidden">
                  {product.image && <img src={product.image} alt={product.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-sm font-bold text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
            <Link href="/menu" className="mt-2 text-center w-full rounded-lg border border-[#e6e0db] bg-[#f8f7f6] py-2 text-sm font-bold text-orange-600 hover:bg-[#eceae8]">
              Ver Menú Completo
            </Link>
          </div>
        </div>
      </div>
      
       {/* Active Orders Table */}
       <div className="rounded-xl border border-[#e6e0db] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#e6e0db] px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">Pedidos Recientes</h3>
          <Link href="/orders" className="text-sm font-bold text-orange-600 hover:underline">Ver todos</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#f8f7f6]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mesa</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e0db]">
              {data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay pedidos recientes.</td>
                </tr>
              ) : (
                data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#faf9f8]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">Mesa {order.tableNumber}</div>
                      <div className="text-xs text-gray-500">#{order.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.items.map(i => `${i.quantity}x ${i.product?.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                        ${order.status === 'PENDING' ? 'bg-gray-100 text-gray-800' : 
                          order.status === 'COOKING' ? 'bg-orange-100 text-orange-800' :
                          order.status === 'READY' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
