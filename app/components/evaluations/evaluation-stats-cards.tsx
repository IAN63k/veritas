import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Evaluation } from '@/app/types'
import { Users, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react'

interface EvaluationStatsCardsProps {
    stats: {
        questions: number
        attempts: number
        completed: number
    }
    questionsCount: number
    evaluation: Evaluation
}

export function EvaluationStatsCards({
    stats,
    questionsCount,
    evaluation,
}: EvaluationStatsCardsProps) {
    const totalPoints = questionsCount * 5 // Estimado, puedes calcularlo real sumando points de cada pregunta
    const completionRate =
        stats.attempts > 0 ? Math.round((stats.completed / stats.attempts) * 100) : 0

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Intentos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.attempts}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.attempts === 0 ? 'Ninguno aún' : 'Estudiantes participando'}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completados</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.completed}</div>
                    <p className="text-xs text-muted-foreground">
                        {completionRate}% tasa de completado
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {stats.attempts - stats.completed}
                    </div>
                    <p className="text-xs text-muted-foreground">Intentos activos</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Preguntas</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{questionsCount}</div>
                    <p className="text-xs text-muted-foreground">
                        {totalPoints} puntos totales (est.)
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}