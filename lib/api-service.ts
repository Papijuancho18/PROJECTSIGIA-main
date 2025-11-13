class ApiService {
  private baseUrl: string
  private currentUser: any
  private accessToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.currentUser = null
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser")
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser)
        } catch (error) {
          console.error("Error parsing stored user:", error)
          localStorage.removeItem("currentUser")
        }
      }
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    const config = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      return (await response.json()) as T
    } catch (error: any) {
      console.error("Request failed:", error)
      throw error
    }
  }

  getCurrentUser() {
    return this.currentUser
  }

  clearUserCache(): void {
    this.accessToken = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
      console.log("🗑️ Auth data cleared")
    }
  }

  async getProfile(): Promise<any> {
    return this.request<any>("/auth/me/")
  }

  async updateProfile(userData: any): Promise<any> {
    return this.request<any>("/auth/me/update/", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }
}

export default ApiService
