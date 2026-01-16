'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Evaluation } from '@/app/types'
import { deleteEvaluation, toggleEvaluationStatus } from '@/app/api/evaluations/actions'
import {
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    Clock,
    Calendar,
    Shield,
    ShieldCheck,
    ShieldAlert,
    ListChecks,
} from 'lucide-react'
import { format, isPast, isFuture, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface EvaluationCardProps {
    evaluation: Evaluation
    courseId: string
    stats?: {
        questions: number
        attempts: number
        completed: number
    }
}

export function EvaluationCard({ evaluation, courseId, stats }: EvaluationCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [isActive, setIsActive] = useState(evaluation.is_active)
    const router = useRouter()

    const getStatusBadge = () => {
        const now = new Date()
        const start = new Date(evaluation.start_date)
        const end = new Date(evaluation.end_date)

        if (!evaluation.is_active) {
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

    const getProtectionIcon = () => {
        switch (evaluation.protection_level) {
            case 'low':
                return <Shield className="h-4 w-4 text-green-500" />
            case 'medium':
                return <ShieldCheck className="h-4 w-4 text-yellow-500" />
            case 'high':
                return <ShieldAlert className="h-4 w-4 text-red-500" />
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        const result = await deleteEvaluation(evaluation.id, courseId)

        if (result.error) {
            toast.error('Error al eliminar', { description: result.error })
            setDeleting(false)
            return
        }

        toast.success('Evaluación eliminada')
        setShowDeleteDialog(false)
        router.refresh()
    }

    const handleToggleStatus = async (checked: boolean) => {
        const result = await toggleEvaluationStatus(evaluation.id, courseId, checked)

        if (result.error) {
            toast.error('Error al cambiar estado', { description: result.error })
            return
        }

        setIsActive(checked)
        toast.success(checked ? 'Evaluación activada' : 'Evaluación desactivada')
        router.refresh()
    }

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xl">{evaluation.title}</CardTitle>
                                {getStatusBadge()}
                            </div>
                            {evaluation.description && (
                                <CardDescription className="line-clamp-2">
                                    {evaluation.description}
                                </CardDescription>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => router.push(`/teacher/courses/${courseId}/evaluations/${evaluation.id}`)}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.push(`/teacher/courses/${courseId}/evaluations/${evaluation.id}/edit`)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.push(`/teacher/courses/${courseId}/evaluations/${evaluation.id}/questions`)}
                                >
                                    <ListChecks className="mr-2 h-4 w-4" />
                                    Gestionar Preguntas
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Inicio</p>
                                <p className="font-medium">
                                    {format(new Date(evaluation.start_date), 'PPp', { locale: es })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">Fin</p>
                                <p className="font-medium">
                                    {format(new Date(evaluation.end_date), 'PPp', { locale: es })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{evaluation.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {getProtectionIcon()}
                            <span className="capitalize">{evaluation.protection_level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ListChecks className="h-4 w-4" />
                            <span>{stats?.questions || 0} preguntas</span>
                        </div>
                    </div>

                    {/* Toggle Activo */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-medium">Estado</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {isActive ? 'Activa' : 'Inactiva'}
                            </span>
                            <Switch checked={isActive} onCheckedChange={handleToggleStatus} />
                        </div>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                        <a href={`/teacher/courses/${courseId}/evaluations/${evaluation.id}`}>
                            Ver Evaluación
                        </a>
                    </Button>
                </CardFooter>
            </Card>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente la evaluación "{evaluation.title}" y todos
                            sus datos asociados (preguntas, intentos, etc.). Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}