'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: 'El nombre es obligatorio' }),
  price: z.number().min(0, { message: 'El precio debe ser positivo' }),
  categoryId: z.string().min(1, { message: 'La categoría es obligatoria' }),
  description: z.string().optional().or(z.literal('')).or(z.null()),
  image: z.string().url().optional().or(z.literal('')).or(z.null()),
});

const CreateProduct = ProductSchema.omit({ id: true });
const UpdateProduct = ProductSchema;

export type ProductState = {
  errors?: {
    name?: string[];
    price?: string[];
    categoryId?: string[];
  };
  message?: string | null;
};

export async function createProduct(prevState: ProductState | undefined, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    price: Number(formData.get('price')),
    categoryId: formData.get('categoryId'),
    description: formData.get('description') || null,
    image: formData.get('image') || null,
  };

  const validatedFields = CreateProduct.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Faltan campos requeridos.',
    };
  }

  const { name, price, categoryId, description, image } = validatedFields.data;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        price,
        categoryId,
        description: description || null,
        image: image || null,
        isAvailable: true
      }
    });
    
    // Create inventory entry
    await prisma.inventoryItem.create({
      data: {
        productId: product.id,
        quantity: 0,
        minStock: 10
      }
    });
  } catch (error) {
    console.error(error);
    return {
      message: 'Error al crear producto.',
    };
  }

  revalidatePath('/menu');
  return { message: 'Producto creado exitosamente.' };
}

export async function updateProduct(
  id: string,
  prevState: ProductState | undefined,
  formData: FormData
) {
  const rawData = {
    id: id,
    name: formData.get('name'),
    price: Number(formData.get('price')),
    categoryId: formData.get('categoryId'),
    description: formData.get('description') || null,
    image: formData.get('image') || null,
  };

  const validatedFields = UpdateProduct.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error de validación.',
    };
  }

  const { name, price, categoryId, description, image } = validatedFields.data;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        categoryId,
        description: description || null,
        image: image || null,
      }
    });
  } catch (error) {
    return { message: 'Error al actualizar producto.' };
  }

  revalidatePath('/menu');
  return { message: 'Producto actualizado.' };
}

export async function deleteProduct(id: string) {
  try {
    // Transaction to delete inventory first if needed, but cascade might handle it?
    // Prisma schema usually doesn't cascade delete unless specified.
    // InventoryItem has relation to Product.
    // Let's delete inventory item first manually to be safe or rely on logic.
    await prisma.inventoryItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    revalidatePath('/menu');
    return { message: 'Producto eliminado.' };
  } catch (error) {
    console.error(error);
    return { message: 'Error al eliminar producto.' };
  }
}

export async function toggleProductAvailability(id: string, currentStatus: boolean) {
  try {
    await prisma.product.update({
      where: { id },
      data: { isAvailable: !currentStatus }
    });
    revalidatePath('/menu');
    return { message: 'Estado actualizado.' };
  } catch (error) {
    return { message: 'Error al cambiar estado.' };
  }
}

export async function getCategories() {
  return await prisma.category.findMany();
}
