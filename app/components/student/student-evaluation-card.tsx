'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    Clock,
    Calendar,
    CheckCircle2,
    XCircle,
    PlayCircle,
    AlertTriangle,
    Shield,
} from 'lucide-react'
import { format, isPast, isFuture, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'

interface StudentEvaluationCardProps {
    evaluation: any
}

export function StudentEvaluationCard({ evaluation }: StudentEvaluationCardProps) {
    const now = new Date()
    const start = new Date(evaluation.start_date)
    const end = new Date(evaluation.end_date)

    const getStatusInfo = () => {
        const { student_status } = evaluation

        // Bloqueado
        if (student_status.blocked_count > 0) {
            return {
                badge: <Badge variant="destructive">Bloqueada</Badge>,
                icon: <XCircle className="h-5 w-5 text-destructive" />,
                message: 'Esta evaluación fue bloqueada por comportamiento inadecuado.',
                canStart: false,
                buttonText: 'Bloqueada',
                buttonVariant: 'destructive' as const,
            }
        }

        // En progreso
        if (student_status.has_in_progress) {
            return {
                badge: <Badge className="bg-blue-500">En Progreso</Badge>,
                icon: <PlayCircle className="h-5 w-5 text-blue-500" />,
                message: 'Tienes un intento en progreso.',
                canStart: true,
                buttonText: 'Continuar Evaluación',
                buttonVariant: 'default' as const,
            }
        }

        // Completada (todos los intentos usados)
        if (student_status.attempts_count >= evaluation.max_attempts) {
            return {
                badge: <Badge variant="secondary">Completada</Badge>,
                icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
                message: `Has usado todos tus intentos (${student_status.attempts_count}/${evaluation.max_attempts}).`,
                canStart: false,
                buttonText: 'Ver Resultados',
                buttonVariant: 'outline' as const,
            }
        }

        // Fuera de tiempo
        if (isFuture(start)) {
            return {
                badge: <Badge variant="outline">Programada</Badge>,
                icon: <Clock className="h-5 w-5 text-muted-foreground" />,
                message: `Disponible desde el ${format(start, 'PPp', { locale: es })}`,
                canStart: false,
                buttonText: 'No Disponible',
                buttonVariant: 'outline' as const,
            }
        }

        if (isPast(end)) {
            return {
                badge: <Badge variant="destructive">Finalizada</Badge>,
                icon: <XCircle className="h-5 w-5 text-destructive" />,
                message: 'El tiempo para realizar esta evaluación ha expirado.',
                canStart: false,
                buttonText: 'Finalizada',
                buttonVariant: 'outline' as const,
            }
        }

        // Disponible
        if (isWithinInterval(now, { start, end })) {
            const attemptText =
                student_status.attempts_count > 0
                    ? `Intento ${student_status.attempts_count + 1}/${evaluation.max_attempts}`
                    : 'Iniciar Evaluación'

            return {
                badge: <Badge className="bg-green-500">Disponible</Badge>,
                icon: <PlayCircle className="h-5 w-5 text-green-500" />,
                message:
                    student_status.attempts_count > 0
                        ? `Has usado ${student_status.attempts_count} de ${evaluation.max_attempts} intentos.`
                        : 'Puedes iniciar esta evaluación ahora.',
                canStart: true,
                buttonText: attemptText,
                buttonVariant: 'default' as const,
            }
        }

        return {
            badge: <Badge variant="secondary">No Disponible</Badge>,
            icon: <AlertTriangle className="h-5 w-5 text-muted-foreground" />,
            message: 'Esta evaluación no está disponible actualmente.',
            canStart: false,
            buttonText: 'No Disponible',
            buttonVariant: 'outline' as const,
        }
    }

    const statusInfo = getStatusInfo()
    const { student_status } = evaluation

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            {statusInfo.icon}
                            {statusInfo.badge}
                        </div>
                        <CardTitle className="text-xl">{evaluation.title}</CardTitle>
                        {evaluation.description && (
                            <CardDescription className="line-clamp-2">
                                {evaluation.description}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Información */}
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Hasta: {format(end, 'PPp', { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{evaluation.duration_minutes} minutos</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        <span className="capitalize">Protección: {evaluation.protection_level}</span>
                    </div>
                </div>

                {/* Mensaje de Estado */}
                <p className="text-sm text-muted-foreground">{statusInfo.message}</p>

                {/* Progreso de Intentos */}
                {evaluation.max_attempts > 1 && (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Intentos</span>
                            <span>
                                {student_status.attempts_count}/{evaluation.max_attempts}
                            </span>
                        </div>
                        <Progress
                            value={(student_status.attempts_count / evaluation.max_attempts) * 100}
                        />
                    </div>
                )}

                {/* Estadísticas */}
                {student_status.completed_count > 0 && (
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{student_status.completed_count} completado(s)</span>
                        </div>
                        {student_status.last_attempt?.score !== null && (
                            <div className="font-medium">
                                Última nota: {student_status.last_attempt.score}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter>
                <Button
                    variant={statusInfo.buttonVariant}
                    className="w-full"
                    disabled={!statusInfo.canStart}
                    asChild={statusInfo.canStart}
                >
                    {statusInfo.canStart ? (
                        <Link href={`/student/evaluation/${evaluation.id}`}>{statusInfo.buttonText}</Link>
                    ) : (
                        <span>{statusInfo.buttonText}</span>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}