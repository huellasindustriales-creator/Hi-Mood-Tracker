import {
  User as SupabaseUser,
  Session as SupabaseSession,
} from "@supabase/supabase-js";

/**
 * Usuario de la aplicación
 *
 * Extiende el User de Supabase con campos personalizados
 * que podríamos necesitar en el futuro
 */
export interface User {
  id: string;
  email: string;
  fullName?: string;
  createdAt: string;
  emailVerified: boolean;
}

/**
 * Sesión de autenticación
 *
 * Wrapper alrededor de la sesión de Supabase
 */
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Resultado de operaciones de autenticación
 *
 * Patrón Result para manejo de errores explícito
 */
export type AuthResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: AuthError };

/**
 * Tipos de errores de autenticación
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  INVALID_TOKEN = "INVALID_TOKEN",
}

/**
 * Error de autenticación estructurado
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: string;
}

/**
 * Helpers para convertir tipos de Supabase a nuestros tipos
 */

/**
 * Convierte un User de Supabase a nuestro tipo User
 */
export function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email!,
    fullName: supabaseUser.user_metadata?.full_name,
    createdAt: supabaseUser.created_at,
    emailVerified: supabaseUser.email_confirmed_at !== null,
  };
}

/**
 * Convierte una Session de Supabase a nuestro tipo AuthSession
 */
export function mapSupabaseSession(
  supabaseSession: SupabaseSession
): AuthSession {
  return {
    user: mapSupabaseUser(supabaseSession.user),
    accessToken: supabaseSession.access_token,
    refreshToken: supabaseSession.refresh_token,
    expiresAt: supabaseSession.expires_at || 0,
  };
}

/**
 * Mensajes de error en español para cada tipo
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
  [AuthErrorType.INVALID_CREDENTIALS]: "Correo o contraseña incorrectos",
  [AuthErrorType.USER_ALREADY_EXISTS]: "Ya existe una cuenta con este correo",
  [AuthErrorType.EMAIL_NOT_VERIFIED]:
    "Por favor verifica tu correo electrónico",
  [AuthErrorType.WEAK_PASSWORD]: "La contraseña es demasiado débil",
  [AuthErrorType.NETWORK_ERROR]: "Error de conexión. Verifica tu internet",
  [AuthErrorType.UNKNOWN_ERROR]: "Ocurrió un error inesperado",
  [AuthErrorType.SESSION_EXPIRED]:
    "Tu sesión ha expirado. Inicia sesión nuevamente",
  [AuthErrorType.INVALID_TOKEN]:
    "El enlace de recuperación es inválido o ha expirado",
};

/**
 * Helper para crear errores de autenticación
 */
export function createAuthError(
  type: AuthErrorType,
  details?: string
): AuthError {
  return {
    type,
    message: AUTH_ERROR_MESSAGES[type],
    details,
  };
}
