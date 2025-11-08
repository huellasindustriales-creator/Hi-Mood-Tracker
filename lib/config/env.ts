import { z } from "zod";

/**
 * Schema de validación para variables de entorno
 *
 * Define todas las variables de entorno requeridas y sus tipos.
 * Si alguna variable falta o es inválida, la app no iniciará
 * y mostrará un error descriptivo.
 *
 * Beneficios:
 * - Detectar errores de configuración tempranamente
 * - Autocompletar y type-safety en TypeScript
 * - Documentación clara de qué variables se necesitan
 */
const envSchema = z.object({
  // Variables públicas de Supabase (expuestas al cliente)
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida")
    .min(1, "NEXT_PUBLIC_SUPABASE_URL es requerida"),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY es requerida"),

  // URL de la aplicación (para redirects y emails)
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL debe ser una URL válida")
    .default("http://localhost:3000"),

  // Service Role Key (opcional por ahora, se usará para operaciones admin)
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

/**
 * Función que valida las variables de entorno
 *
 * @throws Error si alguna variable falta o es inválida
 * @returns Objeto con las variables validadas y tipadas
 */
function validateEnv() {
  try {
    // Parsear y validar
    const parsed = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Error en las variables de entorno:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      console.error("\n💡 Verifica tu archivo .env.local\n");
    }

    throw new Error("Configuración de variables de entorno inválida");
  }
}

/**
 * Variables de entorno validadas
 *
 * Exportamos el resultado de la validación para usarlo en toda la app.
 * TypeScript conocerá los tipos exactos de cada variable.
 *
 * Uso en otros archivos:
 * ```typescript
 * import { env } from '@lib/config/env'
 *
 * console.log(env.NEXT_PUBLIC_SUPABASE_URL) // ✅ TypeScript sabe que es string
 * ```
 */
export const env = validateEnv();

/**
 * Tipo inferido de las variables de entorno
 * Útil para extender tipado en otros lugares
 */
export type Env = z.infer<typeof envSchema>;
