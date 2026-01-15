import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Shield, BarChart, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-primary rounded-full">
                <GraduationCap className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              Veritas
            </h1>
            <p className="text-xl text-muted-foreground">
              Plataforma de evaluaciones con protección anti-IA para garantizar la integridad académica
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Crear Cuenta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Características</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Protección Anti-IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sistema avanzado de detección y prevención de uso de herramientas de IA durante las evaluaciones
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Monitoreo en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualiza el comportamiento de los estudiantes durante las evaluaciones en tiempo real
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Gestión Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Administra cursos, estudiantes y evaluaciones desde una interfaz intuitiva
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}