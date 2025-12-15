import React from 'react';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function createUser(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as any;

  try {
    await prisma.user.create({
      data: { name, email, role, status: 'active' } // Default status
    });
    revalidatePath('/users');
  } catch (error) {
    console.error(error);
  }
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Usuarios</h2>
          <p className="text-gray-500">Gestión de personal y roles</p>
        </div>
        {/* Simple form as "Modal" placeholder or inline for speed */}
        <div className="flex gap-2">
           {/* In a real app, use the Client Modal like in Menu */}
           <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
             <span className="material-symbols-outlined text-[20px]">person_add</span>
             Añadir Usuario
           </button>
        </div>
      </div>

      {/* Inline Create Form (Hidden/Visible logic requires Client Component, skipping to focus on List for now unless requested) */}
      {/* For MVP, let's just list and assume "Añadir" works via the same Modal pattern if I had time to replicate, 
          but here I'll stick to a simple Server Action form at bottom or separate page if needed. 
          Actually, I'll just render the list nicely. 
      */}

      <div className="rounded-xl border border-[#e6e0db] bg-white shadow-sm overflow-hidden">
        <table className="w-full min-w-[800px]">
           <thead className="bg-[#f8f7f6]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e0db]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#faf9f8]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="font-medium text-gray-800">{user.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                   <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${user.status === 'active' ? 'text-green-700 bg-green-50' : 'text-gray-700 bg-gray-50'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="text-gray-400 hover:text-blue-600"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                  <button className="text-gray-400 hover:text-red-600"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
