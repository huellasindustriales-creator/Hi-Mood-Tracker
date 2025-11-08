import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Crea un cliente de Supabase para Server Components y Server Actions.
 *
 * Este cliente maneja automáticamente las cookies de sesión de forma segura.
 * Úsalo en:
 * - Server Components (app/page.tsx con async)
 * - Server Actions (funciones con 'use server')
 * - Route Handlers (app/api/...)
 *
 * Ejemplo de uso:
 * ```typescript
 * const supabase = await createClient()
 * const { data: { user } } = await supabase.auth.getUser()
 * ```
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Obtener todas las cookies (lectura)
        getAll() {
          return cookieStore.getAll();
        },
        // Establecer cookies (escritura)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // La llamada `setAll` puede fallar en Server Components
            // cuando intenta modificar cookies después del renderizado inicial.
            // Esto es normal y se ignora de forma segura.
          }
        },
      },
    }
  );
}
