import { notFound, redirect } from 'next/navigation'
import { getEvaluation } from '@/app/api/evaluations/actions'
import { getQuestions } from '@/app/api/questions/actions'
import { startEvaluationAttempt, getStudentAttempt } from '@/app/api/attempts/actions'
import { EvaluationInterface } from '@/app/components/exam/evaluation-interface'
import { EvaluationInstructions } from '@/app/components/exam/evaluation-instructions'
import { Evaluation } from '@/app/types'

export const dynamic = 'force-dynamic'

export default async function StudentEvaluationPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const { data: evaluation, error } = await getEvaluation(id)

    if (error || !evaluation) {
        notFound()
    }

    const evaluationData = evaluation as Evaluation

    // Verificar si está activa y en tiempo
    if (!evaluationData.is_active) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Evaluación No Disponible</h1>
                    <p className="text-muted-foreground">
                        Esta evaluación no está activa actualmente.
                    </p>
                </div>
            </div>
        )
    }

    const now = new Date()
    const start = new Date(evaluationData.start_date)
    const end = new Date(evaluationData.end_date)

    if (now < start) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Evaluación No Iniciada</h1>
                    <p className="text-muted-foreground">
                        Esta evaluación estará disponible a partir del{' '}
                        {start.toLocaleString('es')}
                    </p>
                </div>
            </div>
        )
    }

    if (now > end) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Evaluación Finalizada</h1>
                    <p className="text-muted-foreground">
                        El tiempo para realizar esta evaluación ha expirado.
                    </p>
                </div>
            </div>
        )
    }

    // Verificar si ya tiene un intento en progreso
    const { data: existingAttempt } = await getStudentAttempt(evaluationData.id)

    // Si no hay intento, mostrar instrucciones
    if (!existingAttempt) {
        const { data: questions } = await getQuestions(evaluationData.id)

        return (
            <EvaluationInstructions
                evaluation={evaluationData}
                questionsCount={questions?.length || 0}
            />
        )
    }

    // Cargar preguntas
    const { data: questions } = await getQuestions(evaluationData.id)

    if (!questions || questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Sin Preguntas</h1>
                    <p className="text-muted-foreground">
                        Esta evaluación no tiene preguntas configuradas.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <EvaluationInterface
            evaluation={evaluationData}
            questions={questions}
            attempt={existingAttempt}
        />
    )
}