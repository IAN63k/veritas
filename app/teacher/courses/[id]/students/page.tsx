import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCourse } from '@/app/api/courses/actions'
import { getEnrolledStudents } from '@/app/api/enrollments/actions'
import { EnrolledStudentsTable } from '@/app/components/enrollments/enrolled-students-table'
import { AddStudentButton } from '@/app/components/enrollments/add-student-button'
import { BulkEnrollmentButton } from '@/app/components/enrollments/bulk-enrollment-button'
import { ArrowLeft, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CourseStudentsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: course, error } = await getCourse(id)

    if (error || !course) {
        notFound()
    }

    const { data: enrollments } = await getEnrolledStudents(course.id)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/teacher/courses/${course.id}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{course.name}</h1>
                    <p className="text-muted-foreground">Gestión de estudiantes inscritos</p>
                </div>
                <div className="flex gap-2">
                    <BulkEnrollmentButton courseId={course.id} />
                    <AddStudentButton courseId={course.id} />
                </div>
            </div>

            {/* Stats Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Estudiantes Inscritos</CardTitle>
                            <CardDescription>
                                Total de estudiantes en este curso
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <span className="text-2xl font-bold">
                                {enrollments?.length || 0}
                            </span>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Students Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Estudiantes</CardTitle>
                    <CardDescription>
                        Todos los estudiantes inscritos en {course.code}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EnrolledStudentsTable
                        enrollments={enrollments || []}
                        courseId={course.id}
                    />
                </CardContent>
            </Card>
        </div>
    )
}