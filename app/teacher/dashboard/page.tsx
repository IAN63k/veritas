import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCourses } from '@/app/api/courses/actions'
import { BookOpen, Users, FileText, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboard() {
  const { data: courses } = await getCourses()
  const coursesCount = courses?.length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bienvenido Profesor</h1>
          <p className="text-muted-foreground">
            Aquí está el resumen de tus cursos
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Ver Cursos
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount}</div>
            <p className="text-xs text-muted-foreground">
              {coursesCount === 0 ? 'No hay cursos aún' : 'Total de cursos'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Ninguno inscrito</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No hay evaluaciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Sin datos</p>
          </CardContent>
        </Card>
      </div>

      {coursesCount === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Primeros Pasos</CardTitle>
            <CardDescription>
              Comienza a configurar tu plataforma de evaluaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Crea tu primer curso</li>
              <li>Agrega estudiantes al curso</li>
              <li>Diseña una evaluación</li>
              <li>Configura las medidas anti-copia</li>
            </ol>
            <Button asChild>
              <Link href="/teacher/courses">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Curso
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cursos Recientes</CardTitle>
            <CardDescription>Tus últimos cursos creados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses?.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.code} • {course.period}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/teacher/courses/${course.id}`}>Ver</Link>
                  </Button>
                </div>
              ))}
            </div>
            {coursesCount > 5 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/teacher/courses">Ver Todos los Cursos</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}