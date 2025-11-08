import { z } from "zod";

/**
 * Mensajes de error personalizados en español
 * Estos se mostrarán en los formularios cuando la validación falle
 */
const VALIDATION_MESSAGES = {
  email: {
    required: "El correo electrónico es requerido",
    invalid: "El correo electrónico no es válido",
  },
  password: {
    required: "La contraseña es requerida",
    minLength: "La contraseña debe tener al menos 8 caracteres",
    pattern:
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
  },
  fullName: {
    required: "El nombre completo es requerido",
    minLength: "El nombre debe tener al menos 3 caracteres",
  },
  confirmPassword: {
    required: "Debes confirmar la contraseña",
    noMatch: "Las contraseñas no coinciden",
  },
};

/**
 * Schema para validar emails
 * Reutilizable en múltiples formularios
 */
const emailSchema = z
  .string()
  .min(1, VALIDATION_MESSAGES.email.required)
  .email(VALIDATION_MESSAGES.email.invalid);

/**
 * Schema para validar contraseñas
 *
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula
 * - Al menos una minúscula
 * - Al menos un número
 */
const passwordSchema = z
  .string()
  .min(8, VALIDATION_MESSAGES.password.minLength)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    VALIDATION_MESSAGES.password.pattern
  );

/**
 * Schema de Login
 *
 * Campos: email, password
 *
 * Uso:
 * ```typescript
 * const result = loginSchema.safeParse({ email: '...', password: '...' })
 * if (result.success) {
 *   // Datos válidos en result.data
 * } else {
 *   // Errores en result.error
 * }
 * ```
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, VALIDATION_MESSAGES.password.required),
});

/**
 * Schema de Register
 *
 * Campos: fullName, email, password, confirmPassword
 *
 * Validación adicional:
 * - confirmPassword debe coincidir con password
 */
export const registerSchema = z
  .object({
    fullName: z.string().min(3, VALIDATION_MESSAGES.fullName.minLength).trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, VALIDATION_MESSAGES.confirmPassword.required),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: VALIDATION_MESSAGES.confirmPassword.noMatch,
    path: ["confirmPassword"],
  });

/**
 * Schema de Forgot Password
 *
 * Solo necesita el email para enviar el link de recuperación
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Schema de Reset Password
 *
 * Campos: password, confirmPassword
 *
 * Usado cuando el usuario accede al link de recuperación
 * y establece una nueva contraseña
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, VALIDATION_MESSAGES.confirmPassword.required),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: VALIDATION_MESSAGES.confirmPassword.noMatch,
    path: ["confirmPassword"],
  });

/**
 * Tipos TypeScript inferidos de los schemas
 *
 * Estos tipos se generan automáticamente desde los schemas
 * y aseguran que los datos validados tengan el tipo correcto
 *
 * Uso:
 * ```typescript
 * function handleLogin(data: LoginInput) {
 *   // TypeScript sabe que data tiene { email: string, password: string }
 * }
 * ```
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
