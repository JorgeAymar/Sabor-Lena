'use client';

import React, { useState } from 'react';
import Modal from '@/components/Modal';
import { createCustomer, updateCustomer, deleteCustomer } from '@/app/actions/customers';
import { Customer } from '@prisma/client';

interface CustomersClientProps {
  customers: Customer[];
}

export default function CustomersClient({ customers }: CustomersClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    setErrors({});
  };

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setErrors({});

    let result;
    if (editingCustomer) {
      result = await updateCustomer(editingCustomer.id, undefined, formData);
    } else {
      result = await createCustomer(undefined, formData);
    }

    setIsLoading(false);

    if (result.errors) {
      setErrors(result.errors);
    } else if (result.message) {
      // Could show toast success here
      handleClose();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    await deleteCustomer(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Nuevo Cliente
        </button>
      </div>

      <div className="rounded-xl border border-[#e6e0db] bg-white shadow-sm overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay clientes registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-[#f8f7f6] text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Teléfono</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e0db]">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#faf9f8]">
                    <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4">{customer.email || '-'}</td>
                    <td className="px-6 py-4">{customer.phone || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(customer)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-orange-500"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(customer.id)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleClose}
        title={editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input 
              name="name" 
              defaultValue={editingCustomer?.name}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
              }`}
              placeholder="Ej: Carlos Gómez"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email (Opcional)</label>
            <input 
              name="email" 
              type="email" 
              defaultValue={editingCustomer?.email || ''}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'
              }`}
              placeholder="ejemplo@correo.com"
            />
             {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
            <input 
              name="phone" 
              defaultValue={editingCustomer?.phone || ''}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="+56 9 1234 5678"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
               {isLoading && <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>}
              {editingCustomer ? 'Guardar Cambios' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
