'use client';

import { useActionState, useState, useEffect } from 'react';
import { authenticate } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined,
  );
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted && !isPending && !errorMessage) {
      router.push('/');
    }
  }, [submitted, isPending, errorMessage, router]);

  const handleSubmit = (payload: FormData) => {
    setSubmitted(true);
    dispatch(payload);
  };

  return (
    <form action={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Correo Electrónico
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@sabor.com"
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Contraseña
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500 sm:text-sm transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md w-full border border-red-100">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full justify-center rounded-lg border border-transparent bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Ingresando...
            </span>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </div>
    </form>
  );
}
