export const siteConfig = {
  name: "HI - Mood Tracker",
  shortName: "HI-MT",
  description:
    "Aplicación del semillero HUELLAS INDUSTRIALES para registrar estados de ánimo, llevar una bitácora personal y planear actividades en equipo.",
  author: "Semillero Huellas Industriales - Universidad de Córdoba",
  locale: "es-CO",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // Configuración de rutas principales (por convención)
  routes: {
    login: "/login",
    register: "/register",
    verify: "/verify",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    home: "/home",
  },

  // Configuración del correo institucional
  emailDomain: "@unicordoba.edu.co",
} as const;

export type SiteConfig = typeof siteConfig;
