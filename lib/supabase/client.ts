import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Crea un cliente de Supabase para Client Components.
 *
 * Este cliente se ejecuta en el navegador y maneja automáticamente
 * las cookies de sesión del lado del cliente.
 *
 * Úsalo SOLO en:
 * - Client Components (archivos con 'use client')
 * - Componentes con interactividad (onClick, onChange, etc.)
 * - useEffect hooks
 *
 * NO lo uses en:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 *
 * Ejemplo de uso:
 * ```typescript
 * 'use client'
 *
 * import { createClient } from '@lib/supabase/client'
 *
 * export function LoginForm() {
 *   const supabase = createClient()
 *
 *   const handleLogin = async () => {
 *     const { data, error } = await supabase.auth.signInWithPassword({
 *       email: '...',
 *       password: '...'
 *     })
 *   }
 * }
 * ```
 */
