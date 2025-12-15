
import { createUser } from '@/app/actions/users';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('User Actions', () => {
  describe('createUser', () => {
    it('should return error if fields are missing', async () => {
      const formData = new FormData();
      // Missing fields

      const result = await createUser(formData);

      expect(result).toEqual({ success: false, error: 'Missing fields' });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should create user and revalidate path on success', async () => {
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@user.com');
      formData.append('role', 'WAITER');

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'Test User',
        email: 'test@user.com',
        role: 'WAITER',
        status: 'active',
      });

      const result = await createUser(formData);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@user.com',
          role: 'WAITER',
          status: 'active',
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/users');
      expect(result).toEqual({
        success: true,
        user: expect.objectContaining({ email: 'test@user.com' }),
      });
    });

    it('should return error if creation fails', async () => {
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@user.com');
      formData.append('role', 'WAITER');

      (prisma.user.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await createUser(formData);

      expect(result).toEqual({ success: false, error: 'Failed to create user' });
    });
  });
});
