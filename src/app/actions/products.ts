'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const categoryId = formData.get('categoryId') as string;
  const description = formData.get('description') as string;
  const image = formData.get('image') as string;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        price,
        categoryId,
        description,
        image: image || null,
        isAvailable: true
      }
    });
    
    // Also create inventory entry
    await prisma.inventoryItem.create({
      data: {
        productId: product.id,
        quantity: 0,
        minStock: 10
      }
    });

    revalidatePath('/menu');
    return { success: true, product };
  } catch (error) {
    console.error('Failed to create product:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function getCategories() {
  return await prisma.category.findMany();
}
