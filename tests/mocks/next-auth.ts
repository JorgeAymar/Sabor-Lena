
export class AuthError extends Error {
  type: string;
  constructor(type: string) {
    super(type);
    this.type = type;
  }
}

export default function NextAuth(config: any) {
  return {
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    handlers: { GET: jest.fn(), POST: jest.fn() },
  };
}
