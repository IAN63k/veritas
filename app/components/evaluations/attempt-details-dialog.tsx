'use client'

import { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getSuspiciousEvents } from '@/app/api/attempts/actions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertTriangle, Clock, Calendar } from 'lucide-react'

interface AttemptDetailsDialogProps {
    attempt: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AttemptDetailsDialog({
    attempt,
    open,
    onOpenChange,
}: AttemptDetailsDialogProps) {
    const [events, setEvents] = useState<any[]>([])

    useEffect(() => {
        if (open && attempt) {
            loadEvents()
        }
    }, [open, attempt])

    const loadEvents = async () => {
        const { data } = await getSuspiciousEvents(attempt.id)
        setEvents(data || [])
    }

    const getEventLabel = (type: string) => {
        const labels: Record<string, string> = {
            copy: 'Intento de Copiar',
            paste: 'Intento de Pegar',
            cut: 'Intento de Cortar',
            keycombo: 'Atajo de Teclado',
            blur: 'Cambio de Ventana',
            devtools: 'DevTools Abierto',
            context_menu: 'Clic Derecho',
            selection: 'Selección de Texto',
        }
        return labels[type] || type
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detalles del Intento</DialogTitle>
                    <DialogDescription>
                        {attempt.students.name} - Intento #{attempt.attempt_number}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Información General */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Información General</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Estudiante</p>
                                <p className="font-medium">{attempt.students.name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Código</p>
                                <p className="font-medium">{attempt.students.student_code}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Estado</p>
                                <Badge>{attempt.status}</Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Intento</p>
                                <p className="font-medium">#{attempt.attempt_number}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Inicio</p>
                                <p className="font-medium">
                                    {format(new Date(attempt.start_time), 'PPp', { locale: es })}
                                </p>
                            </div>
                            {attempt.end_time && (
                                <div>
                                    <p className="text-muted-foreground">Fin</p>
                                    <p className="font-medium">
                                        {format(new Date(attempt.end_time), 'PPp', { locale: es })}
                                    </p>
                                </div>
                            )}
                            {attempt.score !== null && (
                                <div>
                                    <p className="text-muted-foreground">Calificación</p>
                                    <p className="font-medium text-lg">{attempt.score}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Eventos Sospechosos */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Eventos Sospechosos</h3>
                            <Badge variant={events.length > 0 ? 'destructive' : 'secondary'}>
                                {events.length} eventos
                            </Badge>
                        </div>

                        {events.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No se detectaron eventos sospechosos durante este intento.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-75 overflow-y-auto">
                                {events.map((event, index) => (
                                    <div
                                        key={event.id}
                                        className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50"
                                    >
                                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">
                                                    {getEventLabel(event.event_type)}
                                                </p>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(event.timestamp), 'HH:mm:ss')}
                                                </span>
                                            </div>
                                            {event.metadata && (
                                                <p className="text-xs text-muted-foreground">
                                                    {JSON.stringify(event.metadata)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Respuestas */}
                    {attempt.answers && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="font-semibold">Respuestas</h3>
                                <div className="text-sm text-muted-foreground">
                                    <p>
                                        Total de respuestas:{' '}
                                        {Object.keys(attempt.answers).length}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}