"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Settings, User2, FileEdit, FileDown, LogOut } from "lucide-react"
import { Logo } from "@/components/logo"

interface SidebarProps {
  activeItem?: string
  onNavigate?: (tab: string) => void
}

export function StaffSidebar({ activeItem, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "GENERAL",
      items: [
        {
          id: "profile",
          label: "Mi Perfil",
          icon: User2,
          href: "/staff/profile",
          useCallback: true,
        },
      ],
    },
    {
      title: "INFORMES",
      items: [
        {
          id: "create",
          label: "Crear Informe",
          icon: LayoutDashboard,
          href: "/staff/dashboard",
          useCallback: true,
        },
        {
          id: "export",
          label: "Exportar Informe",
          icon: FileDown,
          href: "/staff/export",
          useCallback: false, // Usar Link directo para esta página
        },
      ],
    },
  ]

  return (
    <div className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-900 flex flex-col items-center">
        <Logo variant="light" padding="none" />
        <p className="text-sm text-slate-300 mt-3">Panel Administrativo</p>
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
                  const isActive = activeItem === item.id || pathname === item.href

                  return (
                    <li key={item.id}>
                      {item.useCallback && onNavigate ? (
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
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive ? "bg-green-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      )}
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
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Link>
      </div>
    </div>
  )
}

export default StaffSidebar
