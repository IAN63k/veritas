import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getCourse, getCourseStats } from '@/app/api/courses/actions'
import { ArrowLeft, Users, FileText, Calendar, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: course, error } = await getCourse(id)

    if (error || !course) {
        notFound()
    }

    const stats = await getCourseStats(course.id)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/teacher/courses">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{course.code}</Badge>
                        <Badge variant="outline">{course.period}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold">{course.name}</h1>
                    {course.description && (
                        <p className="text-muted-foreground mt-2">{course.description}</p>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.students}</div>
                        <p className="text-xs text-muted-foreground">Inscritos actualmente</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.evaluations}</div>
                        <p className="text-xs text-muted-foreground">Total creadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Período</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{course.period}</div>
                        <p className="text-xs text-muted-foreground">Actual</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Código</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{course.code}</div>
                        <p className="text-xs text-muted-foreground">Identificador</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Estudiantes</CardTitle>
                        <CardDescription>Gestiona los estudiantes inscritos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            {stats.students === 0 ? (
                                <p>No hay estudiantes inscritos aún</p>
                            ) : (
                                <p>{stats.students} estudiantes inscritos</p>
                            )}
                        </div>
                        <Button className="w-full" variant="outline" asChild>
                            <Link href={`/teacher/courses/${course.id}/students`}>
                                Ver Estudiantes
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Evaluaciones</CardTitle>
                        <CardDescription>Administra las evaluaciones del curso</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            {stats.evaluations === 0 ? (
                                <p>No hay evaluaciones creadas</p>
                            ) : (
                                <p>{stats.evaluations} evaluaciones creadas</p>
                            )}
                        </div>
                        <Button className="w-full" variant="outline" asChild>
                            <Link href={`/teacher/courses/${course.id}/evaluations`}>
                                Ver Evaluaciones
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Course Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Información del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium mb-1">Fecha de Creación</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(course.created_at), "PPP 'a las' p", { locale: es })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">Última Actualización</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(course.updated_at), "PPP 'a las' p", { locale: es })}
                            </p>
                        </div>
                    </div>
                    <Separator />
                    {course.description && (
                        <div>
                            <p className="text-sm font-medium mb-2">Descripción</p>
                            <p className="text-sm text-muted-foreground">{course.description}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}