import { authenticate } from '@/app/actions/auth';
import { logout } from '@/app/actions/auth-actions';
import { AuthError } from 'next-auth'; // resolved via moduleNameMapper to tests/mocks/next-auth.ts

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('@/auth', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { signIn, signOut } = require('@/auth');

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

// ── Test Suites ────────────────────────────────────────────────────────────────

describe('Auth Actions', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  // ── authenticate ───────────────────────────────────────────────────────────

  describe('authenticate', () => {

    it('U-AUTH-01 | calls signIn with credentials and correct fields', async () => {
      signIn.mockResolvedValue(undefined);
      const fd = makeFormData({ email: 'admin@sabor.com', password: 'password123' });
      await authenticate(undefined, fd);
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'admin@sabor.com',
        password: 'password123',
        redirectTo: '/',
      });
    });

    it('U-AUTH-02 | returns "Invalid credentials." on CredentialsSignin error', async () => {
      signIn.mockRejectedValue(new AuthError('CredentialsSignin'));
      const fd = makeFormData({ email: 'admin@sabor.com', password: 'wrongpass' });
      const result = await authenticate(undefined, fd);
      expect(result).toBe('Invalid credentials.');
    });

    it('returns "Something went wrong." on other AuthError types', async () => {
      signIn.mockRejectedValue(new AuthError('CallbackRouteError'));
      const fd = makeFormData({ email: 'admin@sabor.com', password: 'pass' });
      const result = await authenticate(undefined, fd);
      expect(result).toBe('Something went wrong.');
    });

    it('re-throws non-auth errors', async () => {
      const boom = new Error('DB connection failed');
      signIn.mockRejectedValue(boom);
      const fd = makeFormData({ email: 'admin@sabor.com', password: 'pass' });
      await expect(authenticate(undefined, fd)).rejects.toThrow('DB connection failed');
    });

    it('does not expose server internals in CredentialsSignin error', async () => {
      signIn.mockRejectedValue(new AuthError('CredentialsSignin'));
      const fd = makeFormData({ email: 'bad@bad.com', password: 'bad' });
      const result = await authenticate(undefined, fd);
      expect(typeof result).toBe('string');
      expect(result).not.toContain('prisma');
      expect(result).not.toContain('bcrypt');
      expect(result).not.toContain('password');
    });

    it('passes redirectTo "/" in signIn call', async () => {
      signIn.mockResolvedValue(undefined);
      const fd = makeFormData({ email: 'admin@sabor.com', password: 'pass' });
      await authenticate(undefined, fd);
      expect(signIn).toHaveBeenCalledWith('credentials', expect.objectContaining({ redirectTo: '/' }));
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {

    it('U-AUTH-08 | calls signOut', async () => {
      await logout();
      expect(signOut).toHaveBeenCalled();
    });
  });
});
