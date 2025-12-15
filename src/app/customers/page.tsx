import React from 'react';
import { prisma } from '@/lib/prisma';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
      <div className="rounded-xl border border-[#e6e0db] bg-white p-6 shadow-sm">
        <p className="text-gray-500">Módulo de clientes en construcción.</p>
        <div className="mt-4">
           {customers.length === 0 ? <p>No hay clientes registrados.</p> : (
             <ul>{customers.map(c => <li key={c.id}>{c.name}</li>)}</ul>
           )}
        </div>
      </div>
    </div>
  );
}
