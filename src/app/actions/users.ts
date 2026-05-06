'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { requireAdmin, handleAuthError } from '@/lib/auth-guard';

// Validate role enum strictly
const UserCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['ADMIN', 'WAITER', 'KITCHEN'], {
    error: 'Invalid role',
  }),
});

export async function createUser(formData: FormData) {
  try {
    // Check authorization - only ADMIN can create users
    await requireAdmin();

    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
    };

    // Validate input strictly
    const validatedData = UserCreateSchema.parse(rawData);

    const user = await prisma.user.create({
      data: { 
        name: validatedData.name, 
        email: validatedData.email, 
        role: validatedData.role as UserRole, 
        status: 'active' 
      }
    });
    
    revalidatePath('/users');
    return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  } catch (error) {
    return handleAuthError(error);
  }
}
