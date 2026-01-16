import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getCourseForStudent, getStudentEvaluations } from '@/app/api/evaluations/actions'
import { StudentEvaluationCard } from '@/app/components/student/student-evaluation-card'
import { ArrowLeft, User, Mail, BookOpen, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StudentCoursePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const { data: course, error: courseError } = await getCourseForStudent(id)
    
    // Si no está autenticado, redirigir a login
    if (courseError === 'No autenticado') {
        redirect('/login')
    }
    
    // Si no está inscrito o el curso no existe, mostrar error específico
    if (courseError || !course) {
        return (
            <div className="container max-w-2xl py-12">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">
                        {courseError === 'No estás inscrito en este curso' 
                            ? 'No tienes acceso a este curso. Verifica que estés inscrito correctamente.'
                            : 'No se encontró el curso o no tienes acceso a él.'}
                    </AlertDescription>
                </Alert>
                <div className="mt-6">
                    <Button asChild>
                        <Link href="/student/my-courses">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a Mis Cursos
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    const { data: evaluations, error: evalsError } = await getStudentEvaluations(id)

    const teacher = (course as any).teachers

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/student/my-courses">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{course.code}</Badge>
                        <Badge variant="outline">{course.period}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold">{course.name}</h1>
                    {course.description && (
                        <p className="text-muted-foreground mt-2">{course.description}</p>
                    )}
                </div>
            </div>

            {/* Información del Profesor */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Información del Curso</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Profesor</p>
                                <p className="font-medium">{teacher.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Contacto</p>
                                <p className="font-medium">{teacher.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Código</p>
                                <p className="font-medium">{course.code}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Evaluaciones */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Evaluaciones</h2>

                {evalsError && (
                    <div className="text-center py-12 border rounded-lg">
                        <p className="text-destructive">Error al cargar evaluaciones: {evalsError}</p>
                    </div>
                )}

                {!evalsError && (!evaluations || evaluations.length === 0) && (
                    <div className="text-center py-12 border rounded-lg">
                        <p className="text-muted-foreground">
                            No hay evaluaciones disponibles en este momento.
                        </p>
                    </div>
                )}

                {evaluations && evaluations.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {evaluations.map((evaluation: any) => (
                            <StudentEvaluationCard key={evaluation.id} evaluation={evaluation} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}