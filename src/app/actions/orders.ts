'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { OrderStatus } from '@prisma/client';
import { requireAdminOrKitchen, handleAuthError } from '@/lib/auth-guard';

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    // Check authorization - ADMIN or KITCHEN can update order status
    await requireAdminOrKitchen();

    // Verify order exists before updating
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    });
    revalidatePath('/orders');
    revalidatePath('/'); // Update Dashboard too
    return { success: true };
  } catch (error) {
    return handleAuthError(error);
  }
}
