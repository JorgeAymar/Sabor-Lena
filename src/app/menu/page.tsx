import React from 'react';
import { prisma } from '@/lib/prisma';
import MenuClient from '@/components/MenuClient';

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });
  
  const categories = await prisma.category.findMany();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Menú</h2>
          <p className="text-gray-500">Gestión de productos y categorías</p>
        </div>
        <MenuClient categories={categories} />
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="group overflow-hidden rounded-xl border border-[#e6e0db] bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="aspect-video w-full bg-gray-100 overflow-hidden relative">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl">restaurant</span>
                </div>
              )}
              <span className="absolute top-2 right-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-gray-800 backdrop-blur-sm">
                ${product.price.toFixed(2)}
              </span>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                   <span className="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 mb-1">
                    {product.category.name}
                  </span>
                  <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                </div>
                <button className="text-gray-400 hover:text-orange-500">
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-4">
                {product.description || 'Sin descripción'}
              </p>

              <div className="flex items-center gap-2 border-t border-[#e6e0db] pt-3">
                 <button className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  Editar
                 </button>
                 <button className={`flex-1 rounded-lg py-1.5 text-xs font-semibold 
                   ${product.isAvailable 
                     ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                     : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                    {product.isAvailable ? 'Disponible' : 'Agotado'}
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
