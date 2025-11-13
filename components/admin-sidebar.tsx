"use client"
import { cn } from "@/lib/utils"
import { UserCircle, Users, FileEdit, LogOut } from "lucide-react"
import { Logo } from "@/components/logo"
import { useRouter } from "next/navigation"

interface AdminSidebarProps {
  activeItem: string
  onNavigate: (item: string) => void
}

export function AdminSidebar({ activeItem, onNavigate }: AdminSidebarProps) {
  const router = useRouter()

  const menuItems = [
    {
      title: "GENERAL",
      items: [{ id: "profile", label: "Mi Perfil", icon: UserCircle }],
    },
    {
      title: "GESTIÓN",
      items: [
        { id: "users", label: "Gestionar Usuarios", icon: Users },
        { id: "templates", label: "Gestionar Plantillas", icon: FileEdit },
      ],
    },
  ]

  const handleLogout = () => {
    // Perform logout logic here, e.g., clearing cookies, local storage, etc.
    // For demonstration purposes, we'll just redirect to the login page.
    router.push("/login")
  }

  return (
    <div className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-900 flex flex-col items-center">
        <Logo variant="light" padding="none" />
        <p className="text-sm text-slate-300 mt-3">Panel de Administrador</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-6">
          {menuItems.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{section.title}</h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeItem === item.id

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive ? "bg-green-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer - Cerrar sesión */}
      <div className="p-4 border-t border-slate-700 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
