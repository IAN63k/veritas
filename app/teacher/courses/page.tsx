import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCourses, getCourseStats } from '@/app/api/courses/actions'
import { CourseCard } from '@/app/components/courses/course-card'
import { CourseDialog } from '@/app/components/courses/course-dialog'
import { Plus } from 'lucide-react'
import { CreateCourseButton } from '@/app/components/courses/create-course-button'

export const dynamic = 'force-dynamic'

async function CoursesList() {
    const { data: courses, error } = await getCourses()

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Error al cargar los cursos: {error}</p>
            </div>
        )
    }

    if (!courses || courses.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No hay cursos aún</h3>
                <p className="text-muted-foreground mb-6">
                    Comienza creando tu primer curso
                </p>
                <CreateCourseButton />
            </div>
        )
    }

    // Obtener estadísticas para cada curso
    const coursesWithStats = await Promise.all(
        courses.map(async (course) => {
            const stats = await getCourseStats(course.id)
            return { course, stats }
        })
    )

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coursesWithStats.map(({ course, stats }) => (
                <CourseCard key={course.id} course={course} stats={stats} />
            ))}
        </div>
    )
}

function CoursesListSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-lg" />
                </div>
            ))}
        </div>
    )
}

export default function CoursesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Mis Cursos</h1>
                    <p className="text-muted-foreground">
                        Administra todos tus cursos y evaluaciones
                    </p>
                </div>
                <CreateCourseButton />
            </div>

            <Suspense fallback={<CoursesListSkeleton />}>
                <CoursesList />
            </Suspense>
        </div>
    )
}