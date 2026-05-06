import { createCustomer, updateCustomer, deleteCustomer } from '@/app/actions/customers';
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
    customer: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

// ── Helpers ────────────────────────────────────────────────────────────────────

const { requireAdmin, requireAdminOrWaiter } = jest.requireMock('@/lib/auth-guard');
const { UnauthorizedError: MockUnauthorized, ForbiddenError: MockForbidden } = jest.requireMock('@/lib/auth-guard');

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

const mockCustomer = {
  id: 'cust-uuid-1',
  name: 'Carlos Gómez',
  email: 'carlos@example.com',
  phone: '+56912345678',
  totalSpent: 0,
  lastVisit: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Test Suites ────────────────────────────────────────────────────────────────

describe('Customer Actions', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    requireAdmin.mockResolvedValue({ id: 'user-1', role: 'ADMIN' });
    requireAdminOrWaiter.mockResolvedValue({ id: 'user-1', role: 'ADMIN' });
  });

  // ── createCustomer ─────────────────────────────────────────────────────────

  describe('createCustomer', () => {

    it('U-CUST-01 | rejects name shorter than 2 chars', async () => {
      const fd = makeFormData({ name: 'A' });
      const result = await createCustomer(undefined, fd);
      expect(result).toHaveProperty('errors.name');
      expect(prisma.customer.create).not.toHaveBeenCalled();
    });

    it('U-CUST-02 | rejects invalid email format', async () => {
      const fd = makeFormData({ name: 'Carlos', email: 'noesmail' });
      const result = await createCustomer(undefined, fd);
      expect(result).toHaveProperty('errors.email');
      expect(prisma.customer.create).not.toHaveBeenCalled();
    });

    it('U-CUST-03 | accepts customer without email', async () => {
      (prisma.customer.create as jest.Mock).mockResolvedValue(mockCustomer);
      const fd = makeFormData({ name: 'Carlos Gómez' });
      const result = await createCustomer(undefined, fd);
      expect(result).toEqual({ message: 'Cliente creado exitosamente.' });
    });

    it('U-CUST-04 | accepts customer without phone', async () => {
      (prisma.customer.create as jest.Mock).mockResolvedValue(mockCustomer);
      const fd = makeFormData({ name: 'Carlos Gómez', email: 'carlos@example.com' });
      const result = await createCustomer(undefined, fd);
      expect(result).toEqual({ message: 'Cliente creado exitosamente.' });
    });

    it('U-CUST-05 | blocks unauthenticated creation', async () => {
      requireAdminOrWaiter.mockRejectedValue(new MockUnauthorized());
      const fd = makeFormData({ name: 'Carlos Gómez' });
      const result = await createCustomer(undefined, fd);
      expect(result).toEqual({ success: false, error: 'You must be logged in' });
      expect(prisma.customer.create).not.toHaveBeenCalled();
    });

    it('blocks KITCHEN role from creating customers', async () => {
      requireAdminOrWaiter.mockRejectedValue(new MockForbidden());
      const fd = makeFormData({ name: 'Carlos' });
      const result = await createCustomer(undefined, fd);
      expect(result).toEqual({ success: false, error: 'You do not have permission for this action' });
    });

    it('creates customer with all fields successfully', async () => {
      (prisma.customer.create as jest.Mock).mockResolvedValue(mockCustomer);
      const fd = makeFormData({
        name: 'Carlos Gómez',
        email: 'carlos@example.com',
        phone: '+56912345678',
      });
      const result = await createCustomer(undefined, fd);
      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: {
          name: 'Carlos Gómez',
          email: 'carlos@example.com',
          phone: '+56912345678',
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/customers');
      expect(result).toEqual({ message: 'Cliente creado exitosamente.' });
    });

    it('rejects empty name (empty string)', async () => {
      const fd = makeFormData({ name: '' });
      const result = await createCustomer(undefined, fd);
      expect(result).toHaveProperty('errors.name');
    });
  });

  // ── updateCustomer ─────────────────────────────────────────────────────────

  describe('updateCustomer', () => {

    it('U-CUST-06 | updates customer with valid data', async () => {
      (prisma.customer.update as jest.Mock).mockResolvedValue({ ...mockCustomer, name: 'Carlos Updated' });
      const fd = makeFormData({ name: 'Carlos Updated', email: 'carlos@example.com' });
      const result = await updateCustomer('cust-uuid-1', undefined, fd);
      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'cust-uuid-1' },
        data: expect.objectContaining({ name: 'Carlos Updated' }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/customers');
      expect(result).toEqual({ message: 'Cliente actualizado exitosamente.' });
    });

    it('rejects update with invalid email', async () => {
      const fd = makeFormData({ name: 'Carlos', email: 'bademail' });
      const result = await updateCustomer('cust-uuid-1', undefined, fd);
      expect(result).toHaveProperty('errors.email');
      expect(prisma.customer.update).not.toHaveBeenCalled();
    });

    it('rejects update with name too short', async () => {
      const fd = makeFormData({ name: 'C' });
      const result = await updateCustomer('cust-uuid-1', undefined, fd);
      expect(result).toHaveProperty('errors.name');
    });

    it('blocks unauthenticated update', async () => {
      requireAdminOrWaiter.mockRejectedValue(new MockUnauthorized());
      const fd = makeFormData({ name: 'Carlos' });
      const result = await updateCustomer('cust-uuid-1', undefined, fd);
      expect(result).toEqual({ success: false, error: 'You must be logged in' });
    });
  });

  // ── deleteCustomer ─────────────────────────────────────────────────────────

  describe('deleteCustomer', () => {

    it('U-CUST-07 | deletes customer with valid id', async () => {
      (prisma.customer.delete as jest.Mock).mockResolvedValue(mockCustomer);
      const result = await deleteCustomer('cust-uuid-1');
      expect(prisma.customer.delete).toHaveBeenCalledWith({ where: { id: 'cust-uuid-1' } });
      expect(revalidatePath).toHaveBeenCalledWith('/customers');
      expect(result).toEqual({ message: 'Cliente eliminado.' });
    });

    it('blocks WAITER from deleting (requires ADMIN)', async () => {
      requireAdmin.mockRejectedValue(new MockForbidden());
      const result = await deleteCustomer('cust-uuid-1');
      expect(result).toEqual({ success: false, error: 'You do not have permission for this action' });
      expect(prisma.customer.delete).not.toHaveBeenCalled();
    });

    it('blocks unauthenticated delete', async () => {
      requireAdmin.mockRejectedValue(new MockUnauthorized());
      const result = await deleteCustomer('cust-uuid-1');
      expect(result).toEqual({ success: false, error: 'You must be logged in' });
      expect(prisma.customer.delete).not.toHaveBeenCalled();
    });
  });
});
