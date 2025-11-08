// app/(public)/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

type Props = {
  children: ReactNode;
};

export default function PublicLayout({ children }: Props) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <div className="min-h-screen flex flex-col">
          {/* Header simplificado — sin lógica */}
          <header className="w-full border-b bg-white">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="inline-flex items-center gap-2">
                  <img
                    src="/images/logo.png"
                    alt={`${siteConfig.name} logo`}
                    className="w-10 h-10 object-contain"
                  />
                  <span className="font-bold text-lg">{siteConfig.name}</span>
                </Link>
              </div>

              <nav className="flex items-center gap-4">
                <Link href="/login" className="text-sm underline-offset-4">
                  Iniciar sesión
                </Link>
                <Link href="/register" className="text-sm">
                  Registrarse
                </Link>
              </nav>
            </div>
          </header>

          {/* Contenido */}
          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-4 py-10">{children}</div>
          </main>

          {/* Footer simple */}
          <footer className="w-full border-t bg-white">
            <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-600">
              © {new Date().getFullYear()} {siteConfig.name} —{" "}
              {siteConfig.author}
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
