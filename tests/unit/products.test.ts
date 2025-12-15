
import { createProduct, updateProduct, deleteProduct, toggleProductAvailability } from '@/app/actions/products';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    inventoryItem: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    }
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Product Actions', () => {
  const mockProduct = {
    id: 'prod-1',
    name: 'Test Product',
    price: 10.5,
    categoryId: 'cat-1',
    description: 'Desc',
    image: null,
    isAvailable: true,
  };

  describe('createProduct', () => {
    it('should create product and inventory item', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Product');
      formData.append('price', '10.5');
      formData.append('categoryId', 'cat-1');
      formData.append('description', 'Desc');

      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await createProduct(undefined, formData);

      expect(prisma.product.create).toHaveBeenCalled();
      expect(prisma.inventoryItem.create).toHaveBeenCalledWith({
        data: {
          productId: 'prod-1',
          quantity: 0,
          minStock: 10
        }
      });
      expect(revalidatePath).toHaveBeenCalledWith('/menu');
      expect(result).toEqual({ message: 'Producto creado exitosamente.' });
    });

    it('should validation fail if name missing', async () => {
      const formData = new FormData();
      formData.append('price', '10');

      const result = await createProduct(undefined, formData);
      expect(result).toHaveProperty('errors.name');
      expect(prisma.product.create).not.toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    it('should update product', async () => {
      const formData = new FormData();
      formData.append('name', 'Updated Name');
      formData.append('price', '20');
      formData.append('categoryId', 'cat-1');

      (prisma.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, name: 'Updated Name', price: 20 });

      const result = await updateProduct('prod-1', undefined, formData);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: expect.objectContaining({ name: 'Updated Name', price: 20 })
      });
      expect(revalidatePath).toHaveBeenCalledWith('/menu');
    });
  });

  describe('deleteProduct', () => {
    it('should delete inventory and product', async () => {
      const result = await deleteProduct('prod-1');
      
      expect(prisma.inventoryItem.deleteMany).toHaveBeenCalledWith({ where: { productId: 'prod-1' } });
      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } });
      expect(revalidatePath).toHaveBeenCalledWith('/menu');
    });
  });
});
