'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: 'El nombre es obligatorio (mínimo 2 caracteres)' }),
  email: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')).or(z.null()),
  phone: z.string().optional().or(z.literal('')).or(z.null()),
});

const CreateCustomer = CustomerSchema.omit({ id: true });
const UpdateCustomer = CustomerSchema;

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
  };
  message?: string | null;
};

export async function createCustomer(prevState: State | undefined, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email') || null, // Convert empty string to null if needed or leave as is if handling empty string
    phone: formData.get('phone') || null,
  };
  
  // console.log('Create Raw:', rawData);

  const validatedFields = CreateCustomer.safeParse(rawData);

  if (!validatedFields.success) {
    // console.log('Create Validation Error:', validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos requeridos. Error al crear cliente.',
    };
  }

  const { name, email, phone } = validatedFields.data;

  try {
    await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
      },
    });
  } catch (error) {
    return {
      message: 'Base de datos Error: Fallo al crear cliente.',
    };
  }

  revalidatePath('/customers');
  return { message: 'Cliente creado exitosamente.' };
}

export async function updateCustomer(
  id: string,
  prevState: State | undefined,
  formData: FormData
) {
  const rawData = {
    id: id,
    name: formData.get('name'),
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
  };

  // console.log('Update Raw:', rawData);

  const validatedFields = UpdateCustomer.safeParse(rawData);

  if (!validatedFields.success) {
     // console.log('Update Validation Error:', validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos requeridos. Error al editar cliente.',
    };
  }

  const { name, email, phone } = validatedFields.data;

  try {
    await prisma.customer.update({
      where: { id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: 'Base de datos Error: Fallo al editar cliente.',
    };
  }

  revalidatePath('/customers');
  return { message: 'Cliente actualizado exitosamente.' };
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({
      where: { id },
    });
    revalidatePath('/customers');
    return { message: 'Cliente eliminado.' };
  } catch (error) {
    return { message: 'Base de datos Error: Fallo al eliminar cliente.' };
  }
}
