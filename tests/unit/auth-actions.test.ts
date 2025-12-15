
import { authenticate } from '@/app/actions/auth';
import { logout } from '@/app/actions/auth-actions';
import { signIn, signOut } from '../../auth';
import { AuthError } from 'next-auth';

jest.mock('../../auth', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe('Auth Actions', () => {
  describe('authenticate', () => {
    it('should call signIn with correct credentials', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password');

      await authenticate(undefined, formData);

      expect(signIn).toHaveBeenCalledWith('credentials', formData);
    });

    it('should return error message on CredentialsSignin failure', async () => {
      (signIn as jest.Mock).mockRejectedValue(new AuthError('CredentialsSignin'));

      const formData = new FormData();
      const result = await authenticate(undefined, formData);

      expect(result).toBe('Invalid credentials.');
    });
    
    it('should throw other errors', async () => {
       const error = new Error('Some other error');
       (signIn as jest.Mock).mockRejectedValue(error);
       
       const formData = new FormData();
       
       await expect(authenticate(undefined, formData)).rejects.toThrow('Some other error');
    });
  });

  describe('logout', () => {
    it('should call signOut', async () => {
      await logout();
      expect(signOut).toHaveBeenCalled();
    });
  });
});
