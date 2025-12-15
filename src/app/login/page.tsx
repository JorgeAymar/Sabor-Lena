
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full">
      {/* Visual Side (Hidden on mobile, 50% on desktop) */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2669&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
        <div className="relative z-10 p-12 text-white">
          <h1 className="text-6xl font-bold tracking-tight mb-4 font-serif">Sabor & Leña</h1>
          <p className="text-xl text-gray-200 font-light max-w-sm">
            Gestión integral para experiencias gastronómicas memorables.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-xs text-gray-400">© 2024 Sabor & Leña Admin</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Bienvenido de nuevo</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tus credenciales para acceder al panel.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
