'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/actions/auth';

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={dispatch} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className="mb-3 text-2xl">
          Please log in to continue.
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-2 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-2 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
          </div>
        </div>
        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
        <button
            className="mt-4 w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center gap-2"
            aria-disabled={isPending}
        >
          Log in 
        </button>
      </div>
    </form>
  );
}
