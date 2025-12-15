
import { createCustomer, updateCustomer, deleteCustomer } from '@/app/actions/customers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    customer: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Customer Actions', () => {
  const mockCustomer = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    totalSpent: 0,
    lastVisit: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createCustomer', () => {
    it('should return errors if name is missing', async () => {
      const formData = new FormData();
      formData.append('email', 'john@example.com'); // Missing name

      const result = await createCustomer(undefined, formData);

      expect(result).toHaveProperty('errors.name');
      expect(prisma.customer.create).not.toHaveBeenCalled();
    });

    it('should create customer and revalidate path on success', async () => {
      const formData = new FormData();
      formData.append('name', 'John Doe');
      formData.append('email', 'john@example.com');
      formData.append('phone', '1234567890');

      (prisma.customer.create as jest.Mock).mockResolvedValue(mockCustomer);

      const result = await createCustomer(undefined, formData);

      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/customers');
      expect(result).toEqual({ message: 'Cliente creado exitosamente.' });
    });
  });

  describe('updateCustomer', () => {
    it('should update customer and revalidate path', async () => {
        const formData = new FormData();
        formData.append('name', 'John Smith');
        formData.append('email', 'john@example.com');
  
        (prisma.customer.update as jest.Mock).mockResolvedValue(mockCustomer);

        const result = await updateCustomer('1', undefined, formData);
  
        expect(prisma.customer.update).toHaveBeenCalledWith({
          where: { id: '1' },
          data: {
            name: 'John Smith',
            email: 'john@example.com',
            phone: null,
          },
        });
        expect(revalidatePath).toHaveBeenCalledWith('/customers');
        expect(result).toEqual({ message: 'Cliente actualizado exitosamente.' });
      });
  });

  describe('deleteCustomer', () => {
    it('should delete customer and revalidate', async () => {
      (prisma.customer.delete as jest.Mock).mockResolvedValue(mockCustomer);

      const result = await deleteCustomer('1');

      expect(prisma.customer.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/customers');
      expect(result).toEqual({ message: 'Cliente eliminado.' });
    });
  });
});
