import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCourse } from '@/app/api/courses/actions'
import { getEvaluation } from '@/app/api/evaluations/actions'
import { EvaluationForm } from '@/app/components/evaluations/evaluation-form'
import { ArrowLeft } from 'lucide-react'
import { Evaluation } from '@/app/types'

export default async function EditEvaluationPage({
    params,
}: {
    params: Promise<{ id: string; evaluationId: string }>
}) {
    const { id, evaluationId } = await params

    const { data: course, error: courseError } = await getCourse(id)
    const { data: evaluation, error: evalError } = await getEvaluation(evaluationId) as { data: Evaluation | null; error: any }

    if (courseError || !course || evalError || !evaluation) {
        notFound()
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/teacher/courses/${course.id}/evaluations`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Editar Evaluación</h1>
                    <p className="text-muted-foreground">{course.name} • {evaluation.title}</p>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Actualizar Evaluación</CardTitle>
                    <CardDescription>
                        Modifica los detalles de la evaluación y el nivel de protección anti-IA
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EvaluationForm courseId={course.id} evaluation={evaluation} />
                </CardContent>
            </Card>
        </div>
    )
}