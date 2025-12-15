'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { OrderStatus } from '@prisma/client';

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });
    revalidatePath('/orders');
    revalidatePath('/'); // Update Dashboard too
    return { success: true };
  } catch (error) {
    console.error('Failed to update order status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}
