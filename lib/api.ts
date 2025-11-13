// 1. CONFIGURACIÓN BÁSICA
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const IS_DEVELOPMENT = process.env.NODE_ENV === "development"

// 2. TIPOS DE DATOS
export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: {
    id: number
    username: string
    email: string
    role: "admin" | "staff" // Eliminar 'committee' de aquí
    first_name: string
    last_name: string
  }
}

export interface User {
  id: number
  username: string
  email: string
  role: "admin" | "staff" // Eliminar 'committee' de aquí
  first_name: string
  last_name: string
  department?: string
  phone?: string
  is_active: boolean
  created_at?: string
}

export interface Template {
  id: number
  name: string
  content: string
  category: string
  created_at: string
  updated_at: string
  created_by: number
}

// NUEVOS TIPOS PARA LA INTERFAZ AVANZADA
export interface ContentElement {
  id: string
  type: "text" | "heading1" | "heading2" | "list" | "chart" | "table" | "image"
  content: any
  order: number
}

export interface EnhancedReportSection {
  id: string
  title: string
  elements: ContentElement[]
  order: number
  isRequired: boolean
  parentId?: string
  subsections?: EnhancedReportSection[]
  isExpanded?: boolean
}

export interface EnhancedReportTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  sections: EnhancedReportSection[]
  createdAt: string
  lastModified: string
  created_by?: number
  created_by_name?: string
  template_type?: string
  is_active?: boolean
  is_public?: boolean
}

export interface Report {
  id: number
  title: string
  content: string
  status: string
  created_at: string
  updated_at: string
  created_by: number
}

export interface Chart {
  id: number
  title: string
  type: string
  data: any
  report_id?: number
}

export interface Table {
  id: number
  title: string
  data: any
  report_id?: number
}

export interface Department {
  id: number
  name: string
  description: string
}

export interface ExportConfig {
  id: number
  name: string
  format: string
  options: any
}

export interface SearchParams {
  query: string
  page?: number
  limit?: number
  filters?: Record<string, any>
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// 3. CLASE PRINCIPAL
class ApiService {
  private baseURL: string
  private accessToken: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
    if (IS_DEVELOPMENT) {
      console.log("🔧 API Service initialized with URL:", this.baseURL)
      console.log("🔧 Environment check:", {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        window: typeof window !== "undefined" ? "available" : "not available",
      })
    }

    // Cargar token del navegador si existe
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token")
      if (IS_DEVELOPMENT) {
        console.log("🔑 Token status:", this.accessToken ? "Found" : "Not found")
      }
    }
  }

  // 4. MÉTODO BASE PARA PETICIONES
  private async request<T>(endpoint: string, options: RequestInit = {}, isLoginRequest = false): Promise<T> {
    // Construir URL completa
    const url = `${this.baseURL}${endpoint}`
    if (IS_DEVELOPMENT) {
      console.log("🌐 Making request to:", url)
    }

    // Configuración de la petición
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Agregar token de autorización si existe (pero no para login)
    if (this.accessToken && !endpoint.includes("/auth/login/")) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      }
    }

    if (IS_DEVELOPMENT) {
      console.log("⚙️ Request config:", {
        url,
        method: config.method || "GET",
        headers: config.headers,
        hasBody: !!config.body,
      })
    }

    try {
      // Hacer la petición
      if (IS_DEVELOPMENT) {
        console.log("📡 Sending fetch request...")
      }

      const response = await fetch(url, config)

      if (IS_DEVELOPMENT) {
        console.log("✅ Response received:", {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
        })
      }

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        let errorText = ""
        let errorData: any = null

        try {
          errorText = await response.text()
          if (IS_DEVELOPMENT) {
            console.log("📄 Raw error response:", errorText)
          }

          // Intentar parsear como JSON
          if (errorText) {
            try {
              errorData = JSON.parse(errorText)
              if (IS_DEVELOPMENT) {
                console.log("📋 Parsed error data:", errorData)
              }
            } catch (e) {
              if (IS_DEVELOPMENT) {
                console.log("⚠️ Error response is not JSON, treating as text")
              }
              errorData = { message: errorText }
            }
          }
        } catch (e) {
          if (IS_DEVELOPMENT) {
            console.error("❌ Error reading response text:", e)
          }
          errorText = "Could not read error response"
          errorData = { message: "Could not read error response" }
        }

        // Solo mostrar errores detallados en desarrollo
        if (IS_DEVELOPMENT) {
          const errorInfo = {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            parsedData: errorData,
            url: url,
            method: config.method || "GET",
            headers: Object.fromEntries(response.headers.entries()),
          }

          console.error("❌ HTTP Error Response:")
          console.error("Status:", errorInfo.status)
          console.error("Status Text:", errorInfo.statusText)
          console.error("URL:", errorInfo.url)
          console.error("Method:", errorInfo.method)
          console.error("Body:", errorInfo.body)
          console.error("Parsed Data:", errorInfo.parsedData)
        }

        if (response.status === 401) {
          // Distinguir entre login fallido y sesión expirada
          if (isLoginRequest) {
            // Es un error de login, usar el mensaje del servidor
            const errorMessage = errorData?.error || errorData?.detail || errorData?.message || "Credenciales inválidas"
            throw new Error(errorMessage)
          } else {
            // Token expirado en una petición autenticada, limpiar datos
            this.clearAuth()
            throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.")
          }
        }

        if (response.status === 403) {
          throw new Error("No tienes permisos para realizar esta acción")
        }

        if (response.status === 404) {
          throw new Error("El recurso solicitado no fue encontrado")
        }

        if (response.status === 405) {
          throw new Error("Método no permitido para este endpoint")
        }

        if (response.status === 500) {
          throw new Error("Error interno del servidor")
        }

        // Usar el mensaje de error del servidor si está disponible
        const errorMessage =
          errorData?.detail ||
          errorData?.message ||
          errorData?.error ||
          errorText ||
          `Error HTTP ${response.status}: ${response.statusText}`

        throw new Error(errorMessage)
      }

      // Para DELETE requests, puede que no haya contenido
      if (config.method === "DELETE" && response.status === 204) {
        if (IS_DEVELOPMENT) {
          console.log("✅ DELETE successful, no content returned")
        }
        return {} as T
      }

      // Verificar si la respuesta tiene contenido
      const contentType = response.headers.get("content-type")
      if (IS_DEVELOPMENT) {
        console.log("📋 Response content-type:", contentType)
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        if (IS_DEVELOPMENT) {
          console.log("📦 Response data:", data)

          // Verificar si la respuesta tiene la estructura esperada
          if (endpoint.includes("save-enhanced") && data) {
            console.log("✅ Save-enhanced response structure:", {
              hasId: !!data.id,
              hasName: !!data.name,
              hasSections: !!data.sections,
              sectionsCount: data.sections?.length || 0,
            })
          }
        }

        return data
      } else {
        // Si no es JSON, devolver texto
        const text = await response.text()
        if (IS_DEVELOPMENT) {
          console.log("📄 Response text:", text)
        }
        return text as unknown as T
      }
    } catch (error) {
      // Solo mostrar errores detallados en desarrollo
      if (IS_DEVELOPMENT) {
        console.error("❌ API request failed:", error)
        console.error("❌ Error details:", {
          url,
          method: config.method || "GET",
          errorType: error?.constructor?.name,
          errorMessage: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        })
      }

      // Verificar si es un error de red
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `No se puede conectar al servidor en ${this.baseURL}. Verifica que el servidor Django esté ejecutándose.`,
        )
      }

      throw error
    }
  }

  // 5. AUTENTICACIÓN
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (IS_DEVELOPMENT) {
      console.log("🔐 Attempting login with:", { username: credentials.username })
    }

    // Limpiar tokens expirados antes del login
    this.clearAuth()

    const response = await this.request<AuthResponse>(
      "/auth/login/",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
      true,
    ) // Marcar como petición de login

    // Guardar tokens en el navegador
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", response.access)
      localStorage.setItem("refresh_token", response.refresh)
      localStorage.setItem("user", JSON.stringify(response.user))
      if (IS_DEVELOPMENT) {
        console.log("💾 Tokens saved successfully")
      }
    }

    this.accessToken = response.access
    return response
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null
      if (refreshToken) {
        await this.request("/auth/logout/", {
          method: "POST",
          body: JSON.stringify({ refresh: refreshToken }),
        })
      }
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error("Logout error:", error)
      }
    } finally {
      this.clearAuth()
    }
  }

  clearAuth(): void {
    this.accessToken = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
      if (IS_DEVELOPMENT) {
        console.log("🗑️ Auth data cleared")
      }
    }
  }

  // 6. MÉTODOS DE UTILIDAD
  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // 7. ENDPOINTS ESPECÍFICOS - USUARIOS
  async getUsers(): Promise<PaginatedResponse<User>> {
    if (IS_DEVELOPMENT) {
      console.log("🔍 Fetching users...")
    }
    return this.request<PaginatedResponse<User>>("/auth/users/")
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.request<User>("/auth/users/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/auth/users/${id}/`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/auth/users/${id}/`, {
      method: "DELETE",
    })
  }

  async getProfile(): Promise<User> {
    return this.request<User>("/auth/me/")
  }

  async searchUsers(query: string, page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>(`/auth/users/search/?q=${query}&page=${page}&limit=${limit}`)
  }

  async bulkDeleteUsers(ids: number[]): Promise<void> {
    return this.request<void>("/auth/users/bulk-delete/", {
      method: "POST",
      body: JSON.stringify({ ids }),
    })
  }

  async bulkUpdateUsers(ids: number[], data: Partial<User>): Promise<void> {
    return this.request<void>("/auth/users/bulk-update/", {
      method: "POST",
      body: JSON.stringify({ ids, data }),
    })
  }

  // 8. ENDPOINTS ESPECÍFICOS - TEMPLATES (CORREGIDOS)
  async getTemplates(params?: {
    enhanced?: boolean
    type?: string
    category?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<EnhancedReportTemplate>> {
    const queryParams = new URLSearchParams()

    if (params?.enhanced) queryParams.append("enhanced", "true")
    if (params?.type) queryParams.append("type", params.type)
    if (params?.category) queryParams.append("category", params.category)
    if (params?.search) queryParams.append("search", params.search)
    if (params?.page) queryParams.append("page", params.page.toString())
    if (params?.limit) queryParams.append("limit", params.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = `/templates/templates/${queryString ? `?${queryString}` : ""}`

    return this.request<PaginatedResponse<EnhancedReportTemplate>>(endpoint)
  }

  async getTemplate(id: string | number, enhanced = true): Promise<EnhancedReportTemplate> {
    const queryParam = enhanced ? "?enhanced=true" : ""
    return this.request<EnhancedReportTemplate>(`/templates/templates/${id}/${queryParam}`)
  }

  async createTemplate(templateData: Partial<EnhancedReportTemplate>): Promise<EnhancedReportTemplate> {
    return this.request<EnhancedReportTemplate>("/templates/templates/", {
      method: "POST",
      body: JSON.stringify(templateData),
    })
  }

  async updateTemplate(
    id: string | number,
    templateData: Partial<EnhancedReportTemplate>,
  ): Promise<EnhancedReportTemplate> {
    return this.request<EnhancedReportTemplate>(`/templates/templates/${id}/`, {
      method: "PUT",
      body: JSON.stringify(templateData),
    })
  }

  async saveEnhancedTemplate(
    id: string | number,
    templateData: EnhancedReportTemplate,
  ): Promise<EnhancedReportTemplate> {
    if (IS_DEVELOPMENT) {
      console.log("🔄 API: Guardando plantilla enhanced:", {
        id,
        templateName: templateData.name,
        sectionsCount: templateData.sections?.length || 0,
        dataKeys: Object.keys(templateData),
        endpoint: `/templates/templates/${id}/save-enhanced/`,
      })
    }

    try {
      // Asegurar que el ID sea válido
      if (!id || id === "undefined" || id === "null") {
        throw new Error("ID de plantilla inválido")
      }

      const response = await this.request<EnhancedReportTemplate>(`/templates/templates/${id}/save-enhanced/`, {
        method: "POST",
        body: JSON.stringify(templateData),
      })

      if (IS_DEVELOPMENT) {
        console.log("✅ API: Plantilla guardada exitosamente:", {
          responseId: response.id,
          responseName: response.name,
          sectionsCount: response.sections?.length || 0,
        })
      }
      return response
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error("❌ API: Error al guardar plantilla:", {
          error,
          id,
          templateName: templateData.name,
          endpoint: `/templates/templates/${id}/save-enhanced/`,
          errorMessage: error instanceof Error ? error.message : "Error desconocido",
        })
      }
      throw error
    }
  }

  async deleteTemplate(id: string | number): Promise<void> {
    if (IS_DEVELOPMENT) {
      console.log(`🗑️ Attempting to delete template with ID: ${id}`)
    }
    return this.request<void>(`/templates/templates/${id}/`, {
      method: "DELETE",
    })
  }

  async duplicateTemplate(id: string | number): Promise<EnhancedReportTemplate> {
    return this.request<EnhancedReportTemplate>(`/templates/templates/${id}/duplicate/`, {
      method: "POST",
    })
  }

  async createPersonalCopy(id: string | number): Promise<EnhancedReportTemplate> {
    return this.request<EnhancedReportTemplate>(`/templates/templates/${id}/create-personal-copy/`, {
      method: "POST",
    })
  }

  async searchTemplates(query: string, page = 1, limit = 10): Promise<PaginatedResponse<EnhancedReportTemplate>> {
    return this.request<PaginatedResponse<EnhancedReportTemplate>>(
      `/templates/templates/?search=${query}&page=${page}&limit=${limit}&enhanced=true`,
    )
  }

  // Agregar nuevo método para obtener plantillas disponibles para informes
  async getAvailableTemplatesForReports(): Promise<PaginatedResponse<EnhancedReportTemplate>> {
    if (IS_DEVELOPMENT) {
      console.log("🔍 Fetching available templates for reports...")
    }
    return this.request<PaginatedResponse<EnhancedReportTemplate>>("/templates/templates/available-for-reports/")
  }

  // 9. ENDPOINTS ESPECÍFICOS - TEMPLATE SECTIONS
  async getTemplateSections(templateId: string | number): Promise<EnhancedReportSection[]> {
    return this.request<EnhancedReportSection[]>(`/templates/sections/?template=${templateId}`)
  }

  async createTemplateSection(sectionData: Partial<EnhancedReportSection>): Promise<EnhancedReportSection> {
    return this.request<EnhancedReportSection>("/templates/sections/", {
      method: "POST",
      body: JSON.stringify(sectionData),
    })
  }

  async updateTemplateSection(
    id: string | number,
    sectionData: Partial<EnhancedReportSection>,
  ): Promise<EnhancedReportSection> {
    return this.request<EnhancedReportSection>(`/templates/sections/${id}/`, {
      method: "PUT",
      body: JSON.stringify(sectionData),
    })
  }

  async deleteTemplateSection(id: string | number): Promise<void> {
    return this.request<void>(`/templates/sections/${id}/`, {
      method: "DELETE",
    })
  }

  // 10. ENDPOINTS ESPECÍFICOS - CONTENT ELEMENTS
  async getContentElements(sectionId: string | number): Promise<ContentElement[]> {
    return this.request<ContentElement[]>(`/templates/elements/?section=${sectionId}`)
  }

  async createContentElement(elementData: Partial<ContentElement>): Promise<ContentElement> {
    return this.request<ContentElement>("/templates/elements/", {
      method: "POST",
      body: JSON.stringify(elementData),
    })
  }

  async updateContentElement(id: string | number, elementData: Partial<ContentElement>): Promise<ContentElement> {
    return this.request<ContentElement>(`/templates/elements/${id}/`, {
      method: "PUT",
      body: JSON.stringify(elementData),
    })
  }

  async deleteContentElement(id: string | number): Promise<void> {
    return this.request<void>(`/templates/elements/${id}/`, {
      method: "DELETE",
    })
  }

  // 11. ENDPOINTS ESPECÍFICOS - REPORTS
  async getReports(): Promise<PaginatedResponse<Report>> {
    return this.request<PaginatedResponse<Report>>("/reports/")
  }

  async getReport(id: number): Promise<Report> {
    return this.request<Report>(`/reports/${id}/`)
  }

  async createReport(reportData: Partial<Report>): Promise<Report> {
    return this.request<Report>("/reports/", {
      method: "POST",
      body: JSON.stringify(reportData),
    })
  }

  async updateReport(id: number, reportData: Partial<Report>): Promise<Report> {
    return this.request<Report>(`/reports/${id}/`, {
      method: "PUT",
      body: JSON.stringify(reportData),
    })
  }

  async deleteReport(id: number): Promise<void> {
    return this.request<void>(`/reports/${id}/`, {
      method: "DELETE",
    })
  }

  async publishReport(id: number): Promise<Report> {
    return this.request<Report>(`/reports/${id}/publish/`, {
      method: "POST",
    })
  }

  async archiveReport(id: number): Promise<Report> {
    return this.request<Report>(`/reports/${id}/archive/`, {
      method: "POST",
    })
  }

  async searchReports(query: string, page = 1, limit = 10): Promise<PaginatedResponse<Report>> {
    return this.request<PaginatedResponse<Report>>(`/reports/search/?q=${query}&page=${page}&limit=${limit}`)
  }

  // 12. ENDPOINTS ESPECÍFICOS - CHARTS
  async getCharts(): Promise<PaginatedResponse<Chart>> {
    return this.request<PaginatedResponse<Chart>>("/charts/")
  }

  async getChart(id: number): Promise<Chart> {
    return this.request<Chart>(`/charts/${id}/`)
  }

  async createChart(chartData: Partial<Chart>): Promise<Chart> {
    return this.request<Chart>("/charts/", {
      method: "POST",
      body: JSON.stringify(chartData),
    })
  }

  async updateChart(id: number, chartData: Partial<Chart>): Promise<Chart> {
    return this.request<Chart>(`/charts/${id}/`, {
      method: "PUT",
      body: JSON.stringify(chartData),
    })
  }

  async deleteChart(id: number): Promise<void> {
    return this.request<void>(`/charts/${id}/`, {
      method: "DELETE",
    })
  }

  async getChartsByReport(reportId: number): Promise<Chart[]> {
    return this.request<Chart[]>(`/charts/?report_id=${reportId}`)
  }

  // 13. ENDPOINTS ESPECÍFICOS - TABLES
  async getTables(): Promise<PaginatedResponse<Table>> {
    return this.request<PaginatedResponse<Table>>("/tables/")
  }

  async getTable(id: number): Promise<Table> {
    return this.request<Table>(`/tables/${id}/`)
  }

  async createTable(tableData: Partial<Table>): Promise<Table> {
    return this.request<Table>("/tables/", {
      method: "POST",
      body: JSON.stringify(tableData),
    })
  }

  async updateTable(id: number, tableData: Partial<Table>): Promise<Table> {
    return this.request<Table>(`/tables/${id}/`, {
      method: "PUT",
      body: JSON.stringify(tableData),
    })
  }

  async deleteTable(id: number): Promise<void> {
    return this.request<void>(`/tables/${id}/`, {
      method: "DELETE",
    })
  }

  async getTablesByReport(reportId: number): Promise<Table[]> {
    return this.request<Table[]>(`/tables/?report_id=${reportId}`)
  }

  // 14. ENDPOINTS ESPECÍFICOS - DEPARTMENTS
  async getDepartments(): Promise<Department[]> {
    return this.request<Department[]>("/departments/")
  }

  async getDepartment(id: number): Promise<Department> {
    return this.request<Department>(`/departments/${id}/`)
  }

  async createDepartment(departmentData: Partial<Department>): Promise<Department> {
    return this.request<Department>("/departments/", {
      method: "POST",
      body: JSON.stringify(departmentData),
    })
  }

  async updateDepartment(id: number, departmentData: Partial<Department>): Promise<Department> {
    return this.request<Department>(`/departments/${id}/`, {
      method: "PUT",
      body: JSON.stringify(departmentData),
    })
  }

  async deleteDepartment(id: number): Promise<void> {
    return this.request<void>(`/departments/${id}/`, {
      method: "DELETE",
    })
  }

  // 15. ENDPOINTS ESPECÍFICOS - EXPORTS
  async getExportConfigs(): Promise<ExportConfig[]> {
    return this.request<ExportConfig[]>("/exports/configs/")
  }

  async exportReport(reportId: number, format: string, options: any = {}): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/exports/reports/${reportId}/`, {
      method: "POST",
      body: JSON.stringify({ format, options }),
    })
  }

  async exportTemplate(templateId: number, format: string, options: any = {}): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/exports/templates/${templateId}/`, {
      method: "POST",
      body: JSON.stringify({ format, options }),
    })
  }

  // 16. ENDPOINTS ESPECÍFICOS - ESTADÍSTICAS
  async getDashboardStats(): Promise<any> {
    return this.request<any>("/stats/dashboard/")
  }

  async getUserStats(): Promise<any> {
    return this.request<any>("/stats/users/")
  }

  async getSystemStats(): Promise<any> {
    return this.request<any>("/stats/system/")
  }

  // 17. MÉTODO DE DIAGNÓSTICO
  async testConnection(): Promise<{ status: string; message: string; details?: any }> {
    try {
      // Primero intentar un endpoint simple sin autenticación
      const healthResponse = await fetch(`${this.baseURL.replace("/api", "")}/health/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (healthResponse.ok) {
        return {
          status: "success",
          message: "Servidor Django conectado correctamente",
          details: {
            url: this.baseURL,
            health_check: "OK",
          },
        }
      }

      // Si no hay endpoint de health, intentar con el endpoint de usuarios
      const response = await fetch(`${this.baseURL}/auth/users/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        },
      })

      if (response.ok) {
        return {
          status: "success",
          message: "API connection successful",
          details: {
            url: this.baseURL,
            authenticated: !!this.accessToken,
          },
        }
      } else if (response.status === 401) {
        return {
          status: "auth_required",
          message: "Servidor conectado, se requiere autenticación",
          details: {
            url: this.baseURL,
            status: response.status,
          },
        }
      } else {
        return {
          status: "error",
          message: `Servidor respondió con error ${response.status}`,
          details: {
            url: this.baseURL,
            status: response.status,
            statusText: response.statusText,
          },
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return {
        status: "error",
        message: `No se puede conectar al servidor: ${errorMessage}`,
        details: {
          url: this.baseURL,
          error: errorMessage,
          suggestion: "Verifica que el servidor Django esté ejecutándose en el puerto correcto",
        },
      }
    }
  }
}

// 18. CREAR Y EXPORTAR INSTANCIA SINGLETON
let apiServiceInstance: ApiService | null = null

// Función para obtener la instancia
export function getApiService(): ApiService {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService()
    if (IS_DEVELOPMENT) {
      console.log("🎯 New ApiService instance created")
    }
  }
  return apiServiceInstance
}

// Exportar instancia por defecto (se crea cuando se importa)
export const apiService = getApiService()

// También exportar como default
export default apiService
