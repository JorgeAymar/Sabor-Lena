/**
 * Security guard functions for authentication and authorization
 * Every server action must use these to validate user session and permissions
 */

import { auth } from '@/auth';
import type { UserRole } from '@prisma/client';

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Validates that a user is authenticated
 * Throws UnauthorizedError if not logged in
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }
  
  return session.user;
}

/**
 * Validates that user has specific role(s)
 * Throws ForbiddenError if user lacks required role
 */
export async function requireRole(...allowedRoles: UserRole[]) {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new ForbiddenError(
      `This action requires one of these roles: ${allowedRoles.join(', ')}`
    );
  }
  
  return user;
}

/**
 * Validates that user is ADMIN
 */
export async function requireAdmin() {
  return requireRole('ADMIN');
}

/**
 * Validates that user is ADMIN or WAITER
 */
export async function requireAdminOrWaiter() {
  return requireRole('ADMIN', 'WAITER');
}

/**
 * Validates that user is ADMIN or KITCHEN
 */
export async function requireAdminOrKitchen() {
  return requireRole('ADMIN', 'KITCHEN');
}

/**
 * Helper to handle auth/permission errors in server actions
 */
export function handleAuthError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return { success: false, error: 'You must be logged in' };
  }
  
  if (error instanceof ForbiddenError) {
    return { success: false, error: 'You do not have permission for this action' };
  }
  
  // Don't expose internal error details to client
  console.error('Unexpected error:', error);
  return { success: false, error: 'An error occurred' };
}
