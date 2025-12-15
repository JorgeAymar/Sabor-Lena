'use client';

import React, { useState } from 'react';
import Modal from '@/components/Modal';
import { createProduct } from '@/app/actions/products';

interface Category {
  id: string;
  name: string;
}

interface MenuClientProps {
  categories: Category[];
}

const MenuClient: React.FC<MenuClientProps> = ({ categories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    await createProduct(formData);
    setIsLoading(false);
    setIsModalOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Nuevo Producto
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Producto"
      >
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input 
              name="name" 
              required 
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Ej. Paella de Marisco"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio</label>
              <input 
                name="price" 
                type="number" 
                step="0.01" 
                required 
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categoría</label>
              <select 
                name="categoryId" 
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Imagen URL</label>
            <input 
              name="image" 
              type="url"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="https://..."
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Descripción</label>
             <textarea 
               name="description"
               rows={3}
               className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
               placeholder="Descripción del plato..."
             />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {isLoading && <span className="animate-spin text-white material-symbols-outlined text-sm">progress_activity</span>}
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default MenuClient;
