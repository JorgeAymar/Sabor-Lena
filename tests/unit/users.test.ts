import { createUser } from '@/app/actions/users';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { UnauthorizedError, ForbiddenError } from '@/lib/auth-guard';

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('@/lib/auth-guard', () => ({
  requireAdmin: jest.fn(),
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
    user: {
      create: jest.fn(),
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

const mockCreatedUser = {
  id: 'user-uuid-1',
  name: 'María López',
  email: 'maria@sabor.com',
  role: 'WAITER',
  status: 'active',
  password: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Test Suites ────────────────────────────────────────────────────────────────

describe('User Actions', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
  });

  // ── createUser ─────────────────────────────────────────────────────────────

  describe('createUser', () => {

    it('U-USR-01 | blocks WAITER role from creating users', async () => {
      requireAdmin.mockRejectedValue(new MockForbidden());
      const fd = makeFormData({ name: 'Test', email: 'test@test.com', role: 'WAITER' });
      const result = await createUser(fd);
      expect(result).toEqual({ success: false, error: 'You do not have permission for this action' });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('U-USR-02 | rejects invalid email', async () => {
      const fd = makeFormData({ name: 'María López', email: 'noesmail', role: 'WAITER' });
      const result = await createUser(fd);
      expect(result).toEqual({ success: false, error: expect.any(String) });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('U-USR-03 | rejects invalid role enum', async () => {
      const fd = makeFormData({ name: 'María López', email: 'maria@test.com', role: 'SUPERADMIN' });
      const result = await createUser(fd);
      expect(result).toEqual({ success: false, error: expect.any(String) });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('U-USR-04 | response does NOT contain password or sensitive fields', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      const fd = makeFormData({ name: 'María López', email: 'maria@sabor.com', role: 'WAITER' });
      const result = await createUser(fd) as { success: boolean; user: Record<string, unknown> };
      expect(result.success).toBe(true);
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('status');
      expect(result.user).not.toHaveProperty('createdAt');
      expect(result.user).not.toHaveProperty('updatedAt');
    });

    it('U-USR-05 | rejects empty name', async () => {
      const fd = makeFormData({ name: '', email: 'test@test.com', role: 'WAITER' });
      const result = await createUser(fd);
      expect(result).toEqual({ success: false, error: expect.any(String) });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('U-USR-06 | accepts all valid roles: WAITER', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      const fd = makeFormData({ name: 'María López', email: 'maria@sabor.com', role: 'WAITER' });
      const result = await createUser(fd);
      expect(result).toMatchObject({ success: true });
    });

    it('accepts role KITCHEN', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue({ ...mockCreatedUser, role: 'KITCHEN' });
      const fd = makeFormData({ name: 'Chef Pedro', email: 'pedro@sabor.com', role: 'KITCHEN' });
      const result = await createUser(fd);
      expect(result).toMatchObject({ success: true });
    });

    it('accepts role ADMIN', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue({ ...mockCreatedUser, role: 'ADMIN' });
      const fd = makeFormData({ name: 'Admin Ana', email: 'ana@sabor.com', role: 'ADMIN' });
      const result = await createUser(fd);
      expect(result).toMatchObject({ success: true });
    });

    it('blocks unauthenticated user creation', async () => {
      requireAdmin.mockRejectedValue(new MockUnauthorized());
      const fd = makeFormData({ name: 'Test', email: 'test@test.com', role: 'WAITER' });
      const result = await createUser(fd);
      expect(result).toEqual({ success: false, error: 'You must be logged in' });
    });

    it('calls prisma.user.create with correct data', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      const fd = makeFormData({ name: 'María López', email: 'maria@sabor.com', role: 'WAITER' });
      await createUser(fd);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'María López',
          email: 'maria@sabor.com',
          role: 'WAITER',
          status: 'active',
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/users');
    });

    it('returns safe fields only in success response', async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      const fd = makeFormData({ name: 'María López', email: 'maria@sabor.com', role: 'WAITER' });
      const result = await createUser(fd) as { success: boolean; user: Record<string, unknown> };
      expect(result.user).toEqual({
        id: 'user-uuid-1',
        name: 'María López',
        email: 'maria@sabor.com',
        role: 'WAITER',
      });
    });
  });
});
