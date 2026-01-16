import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCourse } from '@/app/api/courses/actions'
import { getEvaluation, getEvaluationStats } from '@/app/api/evaluations/actions'
import { getQuestions } from '@/app/api/questions/actions'
import { getEvaluationAttempts } from '@/app/api/attempts/actions'
import { EvaluationAttemptsTable } from '@/app/components/evaluations/evaluation-attempts-table'
import { EvaluationStatsCards } from '@/app/components/evaluations/evaluation-stats-cards'
import { Evaluation } from '@/app/types'
import {
    ArrowLeft,
    Calendar,
    Clock,
    Shield,
    Users,
    FileText,
    Pencil,
    Settings,
} from 'lucide-react'
import { format, isPast, isFuture, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function EvaluationDetailPage({
    params,
}: {
    params: Promise<{ id: string; evaluationId: string }>
}) {
    const { id, evaluationId } = await params

    const { data: course, error: courseError } = await getCourse(id)
    const { data: evaluation, error: evalError } = await getEvaluation(evaluationId)
    const { data: questions } = await getQuestions(evaluationId)
    const stats = await getEvaluationStats(evaluationId)
    const { data: attempts } = await getEvaluationAttempts(evaluationId)

    if (courseError || !course || evalError || !evaluation) {
        notFound()
    }

    // Type assertion after null check
    const evaluationData = evaluation as Evaluation

    const now = new Date()
    const start = new Date(evaluationData.start_date)
    const end = new Date(evaluationData.end_date)

    const getStatusBadge = () => {
        if (!evaluationData.is_active) {
            return <Badge variant="secondary">Inactiva</Badge>
        }
        if (isFuture(start)) {
            return <Badge variant="outline">Programada</Badge>
        }
        if (isPast(end)) {
            return <Badge variant="destructive">Finalizada</Badge>
        }
        if (isWithinInterval(now, { start, end })) {
            return <Badge className="bg-green-500">En Curso</Badge>
        }
        return <Badge>Activa</Badge>
    }

    const getProtectionBadge = () => {
        const colors: Record<string, string> = {
            low: 'bg-green-500',
            medium: 'bg-yellow-500',
            high: 'bg-red-500',
        }
        return (
            <Badge className={colors[evaluationData.protection_level]}>
                {evaluationData.protection_level === 'low'
                    ? 'Baja'
                    : evaluationData.protection_level === 'medium'
                        ? 'Media'
                        : 'Alta'}
            </Badge>
        )
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
                    <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge()}
                        {getProtectionBadge()}
                    </div>
                    <h1 className="text-3xl font-bold">{evaluationData.title}</h1>
                    <p className="text-muted-foreground">{course.name}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/teacher/courses/${course.id}/evaluations/${evaluationData.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/teacher/courses/${course.id}/evaluations/${evaluationData.id}/questions`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Preguntas
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            <EvaluationStatsCards
                stats={stats}
                questionsCount={questions?.length || 0}
                evaluation={evaluationData}
            />

            {/* Información Detallada */}
            <Card>
                <CardHeader>
                    <CardTitle>Información de la Evaluación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {evaluationData.description && (
                        <>
                            <div>
                                <p className="text-sm font-medium mb-2">Descripción</p>
                                <p className="text-sm text-muted-foreground">{evaluationData.description}</p>
                            </div>
                            <Separator />
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Inicio</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(start, "PPP 'a las' p", { locale: es })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Duración</p>
                                    <p className="text-sm text-muted-foreground">
                                        {evaluationData.duration_minutes} minutos
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Preguntas</p>
                                    <p className="text-sm text-muted-foreground">
                                        {questions?.length || 0} preguntas
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Fin</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(end, "PPP 'a las' p", { locale: es })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Intentos Máximos</p>
                                    <p className="text-sm text-muted-foreground">
                                        {evaluationData.max_attempts}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Protección</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {evaluationData.protection_level === 'low'
                                            ? 'Baja'
                                            : evaluationData.protection_level === 'medium'
                                                ? 'Media'
                                                : 'Alta'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs de Intentos */}
            <Tabs defaultValue="attempts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="attempts">
                        Intentos ({attempts?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="analytics">Análisis</TabsTrigger>
                </TabsList>

                <TabsContent value="attempts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Intentos de Estudiantes</CardTitle>
                            <CardDescription>
                                Todos los intentos realizados en esta evaluación
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <EvaluationAttemptsTable attempts={attempts || []} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Análisis de Resultados</CardTitle>
                            <CardDescription>
                                Estadísticas y métricas de rendimiento
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Funcionalidad en desarrollo - Próximamente: gráficas de rendimiento,
                                análisis por pregunta, y más.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}