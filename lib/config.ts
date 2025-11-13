// Configuración centralizada
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
}

// Verificar que la URL esté configurada
if (typeof window !== "undefined") {
  console.log("🔧 API Configuration:", API_CONFIG)
}
