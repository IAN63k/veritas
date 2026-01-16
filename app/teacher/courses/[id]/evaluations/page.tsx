import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getCourse } from '@/app/api/courses/actions'
import { getEvaluations, getEvaluationStats } from '@/app/api/evaluations/actions'
import { EvaluationCard } from '@/app/components/evaluations/evaluation-card'
import { ArrowLeft, Plus } from 'lucide-react'
import { Evaluation } from '@/app/types'

export const dynamic = 'force-dynamic'

async function EvaluationsList({ courseId }: { courseId: string }) {
    const { data: evaluations, error } = await getEvaluations(courseId)

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Error al cargar evaluaciones: {error}</p>
            </div>
        )
    }

    if (!evaluations || evaluations.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No hay evaluaciones</h3>
                <p className="text-muted-foreground mb-6">
                    Comienza creando tu primera evaluación
                </p>
                <Button asChild>
                    <Link href={`/teacher/courses/${courseId}/evaluations/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Evaluación
                    </Link>
                </Button>
            </div>
        )
    }

    const evaluationsWithStats = await Promise.all(
        (evaluations as Evaluation[]).map(async (evaluation) => {
            const stats = await getEvaluationStats(evaluation.id)
            return { evaluation, stats }
        })
    )

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {evaluationsWithStats.map(({ evaluation, stats }) => (
                <EvaluationCard
                    key={evaluation.id}
                    evaluation={evaluation}
                    courseId={courseId}
                    stats={stats}
                />
            ))}
        </div>
    )
}

function EvaluationsListSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-75 rounded-lg" />
            ))}
        </div>
    )
}

export default async function CourseEvaluationsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { data: course, error } = await getCourse(id)

    if (error || !course) {
        notFound()
    }

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
                    <p className="text-muted-foreground">Gestión de evaluaciones</p>
                </div>
                <Button asChild>
                    <Link href={`/teacher/courses/${course.id}/evaluations/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Evaluación
                    </Link>
                </Button>
            </div>

            {/* Evaluations List */}
            <Suspense fallback={<EvaluationsListSkeleton />}>
                <EvaluationsList courseId={course.id} />
            </Suspense>
        </div>
    )
}