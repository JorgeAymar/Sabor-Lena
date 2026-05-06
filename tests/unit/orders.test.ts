import { updateOrderStatus } from '@/app/actions/orders';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UnauthorizedError, ForbiddenError } from '@/lib/auth-guard';
import { OrderStatus } from '@prisma/client';

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('@/lib/auth-guard', () => ({
  requireAdminOrKitchen: jest.fn(),
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
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

// ── Helpers ────────────────────────────────────────────────────────────────────

const { requireAdminOrKitchen } = jest.requireMock('@/lib/auth-guard');
const { UnauthorizedError: MockUnauthorized, ForbiddenError: MockForbidden } = jest.requireMock('@/lib/auth-guard');

const mockOrder = {
  id: 'order-uuid-1',
  tableNumber: 5,
  status: 'PENDING' as OrderStatus,
  total: 45.00,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Test Suites ────────────────────────────────────────────────────────────────

describe('Order Actions', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    requireAdminOrKitchen.mockResolvedValue({ id: 'user-1', role: 'ADMIN' });
    (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
    (prisma.order.update as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'COOKING' });
  });

  // ── updateOrderStatus ──────────────────────────────────────────────────────

  describe('updateOrderStatus', () => {

    it('U-ORD-01 | blocks unauthenticated status change', async () => {
      requireAdminOrKitchen.mockRejectedValue(new MockUnauthorized());
      const result = await updateOrderStatus('order-uuid-1', 'COOKING');
      expect(result).toEqual({ success: false, error: 'You must be logged in' });
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('U-ORD-02 | ADMIN can update order status', async () => {
      requireAdminOrKitchen.mockResolvedValue({ id: 'user-1', role: 'ADMIN' });
      const result = await updateOrderStatus('order-uuid-1', 'COOKING');
      expect(result).toEqual({ success: true });
    });

    it('U-ORD-03 | KITCHEN can update order status', async () => {
      requireAdminOrKitchen.mockResolvedValue({ id: 'user-2', role: 'KITCHEN' });
      const result = await updateOrderStatus('order-uuid-1', 'READY');
      expect(result).toEqual({ success: true });
    });

    it('U-ORD-04 | WAITER cannot update order status', async () => {
      requireAdminOrKitchen.mockRejectedValue(new MockForbidden());
      const result = await updateOrderStatus('order-uuid-1', 'DELIVERED');
      expect(result).toEqual({ success: false, error: 'You do not have permission for this action' });
    });

    it('returns error when order does not exist', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await updateOrderStatus('nonexistent-id', 'COOKING');
      expect(result).toEqual({ success: false, error: 'Order not found' });
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('advances PENDING to COOKING', async () => {
      await updateOrderStatus('order-uuid-1', 'COOKING');
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-uuid-1' },
        data: { status: 'COOKING' },
      });
    });

    it('advances COOKING to READY', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'COOKING' });
      await updateOrderStatus('order-uuid-1', 'READY');
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-uuid-1' },
        data: { status: 'READY' },
      });
    });

    it('advances READY to DELIVERED', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({ ...mockOrder, status: 'READY' });
      await updateOrderStatus('order-uuid-1', 'DELIVERED');
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-uuid-1' },
        data: { status: 'DELIVERED' },
      });
    });

    it('revalidates /orders and / on success', async () => {
      await updateOrderStatus('order-uuid-1', 'COOKING');
      expect(revalidatePath).toHaveBeenCalledWith('/orders');
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });
  });
});
