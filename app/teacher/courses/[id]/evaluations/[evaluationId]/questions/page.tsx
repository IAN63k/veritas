import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCourse } from '@/app/api/courses/actions'
import { getEvaluation } from '@/app/api/evaluations/actions'
import { getQuestions } from '@/app/api/questions/actions'
import { QuestionsList } from '@/app/components/questions/questions-list'
import { AddQuestionButton } from '@/app/components/questions/add-question-button'
import { ArrowLeft } from 'lucide-react'
import { Evaluation } from '@/app/types'

export const dynamic = 'force-dynamic'

export default async function QuestionsPage({
    params,
}: {
    params: Promise<{ id: string; evaluationId: string }>
}) {
    const { id, evaluationId } = await params

    const { data: course, error: courseError } = await getCourse(id)
    const { data: evaluation, error: evalError } = await getEvaluation(evaluationId) as { data: Evaluation | null; error: any } 
    const { data: questions } = await getQuestions(evaluationId)

    if (courseError || !course || evalError || !evaluation) {
        notFound()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/teacher/courses/${course.id}/evaluations`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{evaluation.title}</h1>
                    <p className="text-muted-foreground">Gestión de preguntas</p>
                </div>
                <AddQuestionButton evaluationId={evaluation.id} />
            </div>

            {/* Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Preguntas de la Evaluación</CardTitle>
                    <CardDescription>
                        Agrega, edita y organiza las preguntas de esta evaluación
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <QuestionsList questions={questions || []} evaluationId={evaluation.id} />
                </CardContent>
            </Card>
        </div>
    )
}