'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Eye, CheckCircle2, XCircle, Clock, ShieldAlert } from 'lucide-react'
import { AttemptDetailsDialog } from './attempt-details-dialog'

interface EvaluationAttemptsTableProps {
    attempts: any[]
}

export function EvaluationAttemptsTable({ attempts }: EvaluationAttemptsTableProps) {
    const [selectedAttempt, setSelectedAttempt] = useState<any>(null)

    if (attempts.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">
                    No hay intentos registrados para esta evaluación.
                </p>
            </div>
        )
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Completado
                    </Badge>
                )
            case 'in_progress':
                return (
                    <Badge className="bg-blue-500">
                        <Clock className="mr-1 h-3 w-3" />
                        En Progreso
                    </Badge>
                )
            case 'blocked':
                return (
                    <Badge variant="destructive">
                        <ShieldAlert className="mr-1 h-3 w-3" />
                        Bloqueado
                    </Badge>
                )
            case 'abandoned':
                return (
                    <Badge variant="secondary">
                        <XCircle className="mr-1 h-3 w-3" />
                        Abandonado
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Estudiante</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Intento #</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Inicio</TableHead>
                            <TableHead>Calificación</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attempts.map((attempt) => (
                            <TableRow key={attempt.id}>
                                <TableCell className="font-medium">
                                    {attempt.students.name}
                                </TableCell>
                                <TableCell>{attempt.students.student_code}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{attempt.attempt_number}</Badge>
                                </TableCell>
                                <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                                <TableCell>
                                    {format(new Date(attempt.start_time), 'PPp', { locale: es })}
                                </TableCell>
                                <TableCell>
                                    {attempt.score !== null ? (
                                        <span className="font-semibold">{attempt.score}</span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedAttempt(attempt)}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Ver
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedAttempt && (
                <AttemptDetailsDialog
                    attempt={selectedAttempt}
                    open={!!selectedAttempt}
                    onOpenChange={(open) => !open && setSelectedAttempt(null)}
                />
            )}
        </>
    )
}