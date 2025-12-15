'use client';

import React, { useState } from 'react';
import Modal from '@/components/Modal';
import { createUser } from '@/app/actions/users';

const UsersClient: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    await createUser(formData);
    setIsLoading(false);
    setIsModalOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">person_add</span>
        Añadir Usuario
      </button>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Crear Nuevo Usuario"
      >
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input 
              name="name" 
              required 
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Juan Pérez"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="juan@ejemplo.com"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">Rol</label>
             <select 
               name="role" 
               className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
             >
               <option value="WAITER">Camarero</option>
               <option value="KITCHEN">Cocina</option>
               <option value="ADMIN">Administrador</option>
             </select>
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
              Crear Usuario
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UsersClient;
