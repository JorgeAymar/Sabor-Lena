import React from 'react';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function updateSettings(formData: FormData) {
  'use server';
  const restaurantName = formData.get('restaurantName') as string;
  const currency = formData.get('currency') as string;
  const taxRate = formData.get('taxRate') as string;

  // Dictionary approach for simple key-value store
  const settings = [
    { key: 'restaurantName', value: restaurantName },
    { key: 'currency', value: currency },
    { key: 'taxRate', value: taxRate },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
  }
  
  revalidatePath('/settings');
}

export default async function SettingsPage() {
  const settingsData = await prisma.setting.findMany();
  const settings = settingsData.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
        <p className="text-gray-500">Ajustes generales del sistema</p>
      </div>

      <div className="rounded-xl border border-[#e6e0db] bg-white p-6 shadow-sm">
        <form action={updateSettings} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Restaurante</label>
            <input 
              name="restaurantName"
              defaultValue={settings.restaurantName || 'Sabor & Leña'}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Moneda</label>
              <select 
                name="currency"
                defaultValue={settings.currency || 'USD'}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="CLP">CLP ($)</option>
                <option value="MXN">MXN ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Impuesto (%)</label>
              <input 
                name="taxRate"
                type="number"
                defaultValue={settings.taxRate || '19'}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
             <button 
              type="submit" 
              className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
