import { createProduct, updateProduct, deleteProduct, toggleProductAvailability, getCategories } from '@/app/actions/products';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UnauthorizedError, ForbiddenError } from '@/lib/auth-guard';

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('@/lib/auth-guard', () => ({
  requireAdmin: jest.fn(),
  requireAdminOrWaiter: jest.fn(),
  handleAuthError: jest.fn((error: unknown) => {
    if (error instanceof UnauthorizedError) return { success: false, error: 'You must be logged in' };
    if (error instanceof ForbiddenError) return { success: false, error: 'You do not have permission for this action' };
    return { success: false, error: 'An error occurred' };
  }),
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(msg = 'Unauthorized') { super(msg); this.name = 'UnauthorizedError'; }
  },
  ForbiddenError: class ForbiddenError extends Error {
    constructor(msg = 'Forbidden') { super(msg); this.name = 'ForbiddenError'; }
  },
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    inventoryItem: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

// ── Helpers ────────────────────────────────────────────────────────────────────

const { requireAdmin } = jest.requireMock('@/lib/auth-guard');
const { UnauthorizedError: MockUnauthorized, ForbiddenError: MockForbidden } = jest.requireMock('@/lib/auth-guard');

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

const mockProduct = {
  id: 'prod-uuid-1',
  name: 'Lomo Saltado',
  price: 12.50,
  categoryId: 'cat-uuid-1',
  description: 'Plato tradicional peruano',
  image: 'https://example.com/lomo.jpg',
  isAvailable: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Test Suites ────────────────────────────────────────────────────────────────

describe('Product Actions', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    requireAdmin.mockResolvedValue({ id: 'user-1', role: 'ADMIN' });
  });

  // ── createProduct ──────────────────────────────────────────────────────────

  describe('createProduct', () => {

    it('U-MENU-01 | rejects name shorter than 2 chars', async () => {
      const fd = makeFormData({ name: 'A', price: '10', categoryId: 'cat-uuid-1' });
      const result = await createProduct(undefined, fd);
      expect(result).toHaveProperty('errors.name');
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('U-MENU-02 | rejects negative price', async () => {
      const fd = makeFormData({ name: 'Plato', price: '-1', categoryId: 'cat-uuid-1' });
      const result = await createProduct(undefined, fd);
      expect(result).toHaveProperty('errors.price');
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('U-MENU-03 | rejects missing categoryId', async () => {
      const fd = makeFormData({ name: 'Plato', price: '10', categoryId: '' });
      const result = await createProduct(undefined, fd);
      expect(result).toHaveProperty('errors.categoryId');
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('U-MENU-04 | accepts valid image URL', async () => {
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);
      const fd = makeFormData({
        name: 'Lomo Saltado',
        price: '12.50',
        categoryId: 'cat-uuid-1',
        image: 'https://example.com/lomo.jpg',
      });
      const result = await createProduct(undefined, fd);
      expect(result).toEqual({ message: 'Producto creado exitosamente.' });
    });

    it('U-MENU-05 | rejects invalid image URL', async () => {
      const fd = makeFormData({
        name: 'Lomo Saltado',
        price: '12.50',
        categoryId: 'cat-uuid-1',
        image: 'no-es-una-url',
      });
      const result = await createProduct(undefined, fd);
      expect(result).toHaveProperty('errors');
      expect(prisma.product.create).not.toHaveBeenCalled();
    });

    it('U-MENU-06 | throws UnauthorizedError when no session', async () => {
      requireAdmin.mockRejectedValue(new MockUnauthorized());
      const fd = makeFormData({ name: 'Plato', price: '10', categoryId: 'cat-1' });
      const result = await createProduct(undefined, fd);
      expect(result).toEqual({ success: false, error: 'You must be logged in' });
    });

    it('U-MENU-07 | throws ForbiddenError for WAITER role', async () => {
      requireAdmin.mockRejectedValue(new MockForbidden());
      const fd = makeFormData({ name: 'Plato', price: '10', categoryId: 'cat-1' });
      const result = await createProduct(undefined, fd);
      expect(result).toEqual({ success: false, error: 'You do not have permission for this action' });
    });

    it('creates product successfully and creates inventory item', async () => {
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);
      const fd = makeFormData({
        name: 'Lomo Saltado',
        price: '12.50',
        categoryId: 'cat-uuid-1',
        description: 'Plato peruano',
      });
      const result = await createProduct(undefined, fd);
      expect(prisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ name: 'Lomo Saltado', price: 12.50 }) })
      );
      expect(prisma.inventoryItem.create).toHaveBeenCalledWith({
        data: { productId: 'prod-uuid-1', quantity: 0, minStock: 10 },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/menu');
      expect(result).toEqual({ message: 'Producto creado exitosamente.' });
    });

    it('accepts price of zero', async () => {
      (prisma.product.create as jest.Mock).mockResolvedValue({ ...mockProduct, price: 0 });
      const fd = makeFormData({ name: 'Agua', price: '0', categoryId: 'cat-uuid-1' });
      const result = await createProduct(undefined, fd);
      expect(result).toEqual({ message: 'Producto creado exitosamente.' });
    });

    it('accepts product without optional fields', async () => {
      (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);
      const fd = makeFormData({ name: 'Ceviche', price: '15', categoryId: 'cat-uuid-1' });
      const result = await createProduct(undefined, fd);
      expect(result).toEqual({ message: 'Producto creado exitosamente.' });
    });
  });

  // ── updateProduct ──────────────────────────────────────────────────────────

  describe('updateProduct', () => {

    it('U-MENU-08 | updates product with valid data', async () => {
      (prisma.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, name: 'Lomo Updated', price: 20 });
      const fd = makeFormData({ name: 'Lomo Updated', price: '20', categoryId: 'cat-uuid-1' });
      const result = await updateProduct('prod-uuid-1', undefined, fd);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-uuid-1' },
        data: expect.objectContaining({ name: 'Lomo Updated', price: 20 }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/menu');
    });

    it('fails if name is too short on update', async () => {
      const fd = makeFormData({ name: 'X', price: '10', categoryId: 'cat-uuid-1' });
      const result = await updateProduct('prod-uuid-1', undefined, fd);
      expect(result).toHaveProperty('errors.name');
      expect(prisma.product.update).not.toHaveBeenCalled();
    });

    it('fails if price is negative on update', async () => {
      const fd = makeFormData({ name: 'Plato', price: '-5', categoryId: 'cat-uuid-1' });
      const result = await updateProduct('prod-uuid-1', undefined, fd);
      expect(result).toHaveProperty('errors.price');
    });

    it('blocks WAITER from updating', async () => {
      requireAdmin.mockRejectedValue(new MockForbidden());
      const fd = makeFormData({ name: 'Plato', price: '10', categoryId: 'cat-uuid-1' });
      const result = await updateProduct('prod-uuid-1', undefined, fd);
      expect(result).toEqual({ success: false, error: 'You do not have permission for this action' });
    });
  });

  // ── deleteProduct ──────────────────────────────────────────────────────────

  describe('deleteProduct', () => {

    it('U-MENU-09 | deletes inventory item then product', async () => {
      const result = await deleteProduct('prod-uuid-1');
      expect(prisma.inventoryItem.deleteMany).toHaveBeenCalledWith({ where: { productId: 'prod-uuid-1' } });
      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-uuid-1' } });
      expect(revalidatePath).toHaveBeenCalledWith('/menu');
    });

    it('blocks unauthenticated delete', async () => {
      requireAdmin.mockRejectedValue(new MockUnauthorized());
      const result = await deleteProduct('prod-uuid-1');
      expect(result).toEqual({ success: false, error: 'You must be logged in' });
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });
  });

  // ── toggleProductAvailability ──────────────────────────────────────────────
  // Signature: toggleProductAvailability(id: string, currentStatus: boolean)
  // It uses !currentStatus — no DB read needed

  describe('toggleProductAvailability', () => {

    it('U-MENU-10 | toggles isAvailable from true to false', async () => {
      (prisma.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, isAvailable: false });
      await toggleProductAvailability('prod-uuid-1', true);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-uuid-1' },
        data: { isAvailable: false },
      });
    });

    it('toggles isAvailable from false to true', async () => {
      (prisma.product.update as jest.Mock).mockResolvedValue({ ...mockProduct, isAvailable: true });
      await toggleProductAvailability('prod-uuid-1', false);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-uuid-1' },
        data: { isAvailable: true },
      });
    });
  });

  // ── getCategories ──────────────────────────────────────────────────────────

  describe('getCategories', () => {

    it('U-MENU-11 | returns categories when authenticated', async () => {
      const mockCats = [{ id: 'c1', name: 'Entradas' }, { id: 'c2', name: 'Fondos' }];
      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCats);
      const result = await getCategories();
      expect(result).toEqual(mockCats);
    });

    it('blocks unauthenticated getCategories', async () => {
      requireAdmin.mockRejectedValue(new MockUnauthorized());
      await expect(getCategories()).rejects.toThrow();
    });
  });
});
