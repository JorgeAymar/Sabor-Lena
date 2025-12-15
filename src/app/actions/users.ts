'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as Role;

  if (!name || !email || !role) {
      return { success: false, error: 'Missing fields' };
  }

  try {
    const user = await prisma.user.create({
      data: { name, email, role, status: 'active' }
    });
    revalidatePath('/users');
    return { success: true, user };
  } catch (error) {
    console.error('Failed to create user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}
