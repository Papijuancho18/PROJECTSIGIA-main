import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, FileText, TrendingUp } from "lucide-react"
import { Logo } from "@/components/logo"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-primary/20 py-6 bg-primary">
        <div className="container mx-auto px-6 flex items-center">
          <Logo variant="light" size="lg" padding="none" alt="Logotipo de SIGIA" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center space-y-6 w-full max-w-4xl">
          <div className="flex flex-col items-center mb-12">
            <Logo size="xl" className="mb-6" padding="none" alt="Logotipo de SIGIA" />
            <h2 className="text-4xl font-bold text-primary">Sistema de Informes de Gestión Académica</h2>
          </div>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plataforma integral para la creación, análisis y visualización de informes académicos con datos
            estructurados
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="border rounded-lg p-6 bg-highlight shadow-md border-primary/20 hover:shadow-lg transition-all">
              <div className="bg-secondary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart2 className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-primary">Visualización de Datos</h3>
              <p className="text-gray-600">
                Gráficos interactivos y tablas dinámicas para representar indicadores académicos
              </p>
            </div>

            <div className="border rounded-lg p-6 bg-highlight shadow-md border-primary/20 hover:shadow-lg transition-all">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-primary">Informes Estructurados</h3>
              <p className="text-gray-600">
                Plantillas predefinidas con secciones organizadas para diferentes tipos de informes
              </p>
            </div>

            <div className="border rounded-lg p-6 bg-highlight shadow-md border-primary/20 hover:shadow-lg transition-all">
              <div className="bg-accent/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-primary">Análisis de Tendencias</h3>
              <p className="text-gray-600">Seguimiento de indicadores clave y comparativas entre períodos académicos</p>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary-hover px-10 py-6 text-lg font-medium rounded-lg shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
            >
              <Link href="/login">
                Iniciar sesión <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-primary/20 py-6 bg-primary mt-12">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <p className="text-sm">© {new Date().getFullYear()} Sistema de Informes de Gestión Académica</p>
          <p className="text-xs mt-1 text-primary-foreground/70">
            Desarrollado para la gestión eficiente de datos académicos
          </p>
        </div>
      </footer>
    </div>
  )
}
