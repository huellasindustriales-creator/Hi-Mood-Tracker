import { createClient } from "@lib/supabase/server";
import {
  AuthResult,
  AuthSession,
  AuthErrorType,
  createAuthError,
  mapSupabaseSession,
  mapSupabaseUser,
  type User,
} from "./auth.types";

/**
 * Repositorio de Autenticación
 *
 * Capa de acceso a datos para todas las operaciones de auth.
 * Encapsula la lógica de Supabase y expone una API limpia.
 *
 * Responsabilidades:
 * - Comunicarse con Supabase Auth
 * - Mapear respuestas de Supabase a nuestros tipos
 * - Manejar errores de forma consistente
 * - NO contiene lógica de negocio (eso va en controllers)
 */
export const authRepository = {
  /**
   * Obtener el usuario actual de la sesión
   *
   * @returns Usuario si hay sesión activa, null si no
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      return mapSupabaseUser(user);
    } catch (error) {
      console.error("Error al obtener usuario actual:", error);
      return null;
    }
  },

  /**
   * Obtener la sesión actual
   *
   * @returns Sesión si está activa, null si no
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const supabase = await createClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      return mapSupabaseSession(session);
    } catch (error) {
      console.error("Error al obtener sesión actual:", error);
      return null;
    }
  },

  /**
   * Iniciar sesión con email y contraseña
   *
   * @param email - Correo del usuario
   * @param password - Contraseña
   * @returns AuthResult con la sesión o error
   */
  async signInWithPassword(
    email: string,
    password: string
  ): Promise<AuthResult<AuthSession>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Mapear errores de Supabase a nuestros tipos
        if (error.message.includes("Invalid login credentials")) {
          return {
            success: false,
            error: createAuthError(AuthErrorType.INVALID_CREDENTIALS),
          };
        }

        if (error.message.includes("Email not confirmed")) {
          return {
            success: false,
            error: createAuthError(AuthErrorType.EMAIL_NOT_VERIFIED),
          };
        }

        return {
          success: false,
          error: createAuthError(AuthErrorType.UNKNOWN_ERROR, error.message),
        };
      }

      if (!data.session) {
        return {
          success: false,
          error: createAuthError(AuthErrorType.UNKNOWN_ERROR),
        };
      }

      return {
        success: true,
        data: mapSupabaseSession(data.session),
      };
    } catch (error) {
      console.error("Error en signInWithPassword:", error);
      return {
        success: false,
        error: createAuthError(AuthErrorType.NETWORK_ERROR),
      };
    }
  },

  /**
   * Registrar nuevo usuario
   *
   * @param email - Correo del usuario
   * @param password - Contraseña
   * @param fullName - Nombre completo
   * @returns AuthResult con la sesión o error
   */
  async signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResult<AuthSession>> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        // Mapear errores comunes
        if (error.message.includes("User already registered")) {
          return {
            success: false,
            error: createAuthError(AuthErrorType.USER_ALREADY_EXISTS),
          };
        }

        if (error.message.includes("Password")) {
          return {
            success: false,
            error: createAuthError(AuthErrorType.WEAK_PASSWORD),
          };
        }

        return {
          success: false,
          error: createAuthError(AuthErrorType.UNKNOWN_ERROR, error.message),
        };
      }

      if (!data.session) {
        return {
          success: false,
          error: createAuthError(AuthErrorType.UNKNOWN_ERROR),
        };
      }

      return {
        success: true,
        data: mapSupabaseSession(data.session),
      };
    } catch (error) {
      console.error("Error en signUp:", error);
      return {
        success: false,
        error: createAuthError(AuthErrorType.NETWORK_ERROR),
      };
    }
  },

  /**
   * Cerrar sesión
   *
   * @returns AuthResult indicando éxito o error
   */
  async signOut(): Promise<AuthResult> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: createAuthError(AuthErrorType.UNKNOWN_ERROR, error.message),
        };
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error en signOut:", error);
      return {
        success: false,
        error: createAuthError(AuthErrorType.NETWORK_ERROR),
      };
    }
  },

  /**
   * Solicitar recuperación de contraseña
   *
   * @param email - Correo del usuario
   * @returns AuthResult indicando éxito o error
   */
  async resetPasswordRequest(email: string): Promise<AuthResult> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: createAuthError(AuthErrorType.UNKNOWN_ERROR, error.message),
        };
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error en resetPasswordRequest:", error);
      return {
        success: false,
        error: createAuthError(AuthErrorType.NETWORK_ERROR),
      };
    }
  },

  /**
   * Actualizar contraseña
   *
   * @param newPassword - Nueva contraseña
   * @returns AuthResult indicando éxito o error
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        if (error.message.includes("token")) {
          return {
            success: false,
            error: createAuthError(AuthErrorType.INVALID_TOKEN),
          };
        }

        return {
          success: false,
          error: createAuthError(AuthErrorType.UNKNOWN_ERROR, error.message),
        };
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error en updatePassword:", error);
      return {
        success: false,
        error: createAuthError(AuthErrorType.NETWORK_ERROR),
      };
    }
  },
};
