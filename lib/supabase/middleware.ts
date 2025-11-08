import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  // Crear una respuesta inicial (puede ser modificada)
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Crear cliente Supabase para el middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Leer cookies del request
        getAll() {
          return request.cookies.getAll();
        },
        // Escribir cookies en la respuesta
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          // Actualizar la respuesta con las nuevas cookies
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANTE: No remover esta línea
  // Aunque parece que no hace nada, internamente refresca la sesión
  // y ejecuta el setAll() de arriba si la sesión cambió
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Retornar la respuesta (con cookies actualizadas si hubo cambios)
  return supabaseResponse;
}

/**
 * Actualiza la sesión de Supabase en el middleware de Next.js.
 *
 * El middleware se ejecuta en CADA request antes de que llegue a la página.
 * Esta función:
 * 1. Crea un cliente Supabase especial para el middleware
 * 2. Refresca la sesión del usuario si existe
 * 3. Actualiza las cookies si la sesión cambió
 * 4. Retorna la respuesta modificada con las cookies actualizadas
 *
 * ¿Por qué es importante?
 * - Las sesiones de Supabase expiran después de cierto tiempo
 * - Este código las refresca automáticamente en cada navegación
 * - Evita que el usuario tenga que hacer login constantemente
 *
 * @param request - El request entrante de Next.js
 * @returns NextResponse con cookies actualizadas
 *
 * Ejemplo de uso en middleware.ts:
 * ```typescript
 * import { updateSession } from '@lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request)
 * }
 * ```
 */
