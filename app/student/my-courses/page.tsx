import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getStudentCourses } from '@/app/api/enrollments/actions'
import { BookOpen, FileText, Clock, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

async function CoursesList() {
    const { data: result, error } = await getStudentCourses()

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Error al cargar los cursos: {error}</p>
            </div>
        )
    }

    if (!result || result.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No estás inscrito en ningún curso</h3>
                <p className="text-muted-foreground mb-6">
                    Tu profesor te inscribirá en los cursos correspondientes
                </p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {result.map((enrollment: any) => {
                const course = enrollment.courses
                const teacher = course.teachers

                return (
                    <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="space-y-2">
                                <CardTitle className="text-xl">{course.name}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{course.code}</Badge>
                                    <Badge variant="outline">{course.period}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>Prof. {teacher.name}</span>
                                </div>
                            </div>
                            {course.description && (
                                <CardDescription className="line-clamp-2 mt-2">
                                    {course.description}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span>{course.evaluations_count || 0} evaluaciones</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{course.pending_evaluations_count || 0} pendientes</span>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/student/courses/${course.id}`}>
                                        Ver Curso
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

function CoursesListSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-62.5 rounded-lg" />
            ))}
        </div>
    )
}

export default function StudentCoursesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Mis Cursos</h1>
                <p className="text-muted-foreground">
                    Aquí verás todos los cursos en los que estás inscrito
                </p>
            </div>

            <Suspense fallback={<CoursesListSkeleton />}>
                <CoursesList />
            </Suspense>
        </div>
    )
}