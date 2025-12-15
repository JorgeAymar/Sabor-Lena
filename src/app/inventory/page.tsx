import React from 'react';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function updateStock(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const quantity = parseInt(formData.get('quantity') as string);
  
  await prisma.inventoryItem.update({
    where: { id },
    data: { quantity }
  });
  revalidatePath('/inventory');
}

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  const inventory = await prisma.inventoryItem.findMany({
    include: { product: true },
    orderBy: { product: { name: 'asc' } }
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
          <p className="text-gray-500">Gestión de stock de productos</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
          <span className="material-symbols-outlined text-[20px]">download</span>
          Exportar CSV
        </button>
      </div>

      <div className="rounded-xl border border-[#e6e0db] bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
             <thead className="bg-[#f8f7f6]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Actual</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mínimo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e0db]">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-[#faf9f8]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-200 overflow-hidden">
                         {item.product.image && <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="font-medium text-gray-800">{item.product.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {/* Ideally fetch Category name too, or include in query */}
                    Producto
                  </td>
                  <td className="px-6 py-4">
                    <form action={updateStock} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={item.id} />
                      <input 
                        name="quantity"
                        type="number"
                        defaultValue={item.quantity}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm text-center"
                      />
                      <button type="submit" className="text-orange-500 hover:text-orange-700">
                        <span className="material-symbols-outlined text-[18px]">save</span>
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.minStock}</td>
                   <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                        ${item.quantity <= item.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {item.quantity <= item.minStock ? 'Bajo Stock' : 'OK'}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm font-semibold text-gray-500 hover:text-orange-500">Historial</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
