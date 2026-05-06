'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminOrWaiter, requireAdmin, handleAuthError } from '@/lib/auth-guard';

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
  try {
    // Check authorization - ADMIN or WAITER can create customers
    await requireAdminOrWaiter();

    const rawData = {
      name: formData.get('name'),
      email: formData.get('email') || null,
      phone: formData.get('phone') || null,
    };

    const validatedFields = CreateCustomer.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Faltan campos requeridos. Error al crear cliente.',
      };
    }

    const { name, email, phone } = validatedFields.data;

    await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
      },
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (!authError.success) {
      return authError;
    }
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
  try {
    // Check authorization
    await requireAdminOrWaiter();

    const rawData = {
      id: id,
      name: formData.get('name'),
      email: formData.get('email') || null,
      phone: formData.get('phone') || null,
    };

    const validatedFields = UpdateCustomer.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Faltan campos requeridos. Error al editar cliente.',
      };
    }

    const { name, email, phone } = validatedFields.data;

    await prisma.customer.update({
      where: { id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
      },
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (!authError.success) {
      return authError;
    }
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
    // Check authorization - only ADMIN can delete customers
    await requireAdmin();
    
    await prisma.customer.delete({
      where: { id },
    });
    revalidatePath('/customers');
    return { message: 'Cliente eliminado.' };
  } catch (error) {
    return handleAuthError(error);
  }
}
