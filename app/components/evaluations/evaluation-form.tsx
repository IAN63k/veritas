'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createEvaluation, updateEvaluation } from '@/app/api/evaluations/actions'
import { Evaluation } from '@/app/types'
import { Loader2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react'

interface EvaluationFormProps {
    courseId: string
    evaluation?: Evaluation
    onSuccess?: () => void
}

export function EvaluationForm({ courseId, evaluation, onSuccess }: EvaluationFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const result = evaluation
                ? await updateEvaluation(evaluation.id, courseId, formData)
                : await createEvaluation(courseId, formData)

            if (result.error) {
                setError(result.error)
                setLoading(false)
                return
            }

            if (onSuccess) {
                onSuccess()
            } else {
                router.push(`/teacher/courses/${courseId}/evaluations`)
                router.refresh()
            }
        } catch (err) {
            setError('Ocurrió un error inesperado')
            setLoading(false)
        }
    }

    // Formatear fechas UTC para el input datetime-local (mostrar en hora local)
    const formatDateForInput = (dateString?: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        // Restar el offset de zona horaria para mostrar la hora local correctamente
        const offset = date.getTimezoneOffset()
        const localDate = new Date(date.getTime() - offset * 60 * 1000)
        return localDate.toISOString().slice(0, 16)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Información Básica */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Básica</h3>

                <div className="space-y-2">
                    <Label htmlFor="title">Título de la Evaluación *</Label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="Ej: Examen Parcial 1"
                        defaultValue={evaluation?.title}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Descripción de los temas a evaluar..."
                        defaultValue={evaluation?.description || ''}
                        rows={3}
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Configuración de Tiempo */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuración de Tiempo</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start_date">Fecha y Hora de Inicio *</Label>
                        <Input
                            id="start_date"
                            name="start_date"
                            type="datetime-local"
                            defaultValue={formatDateForInput(evaluation?.start_date)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="end_date">Fecha y Hora de Fin *</Label>
                        <Input
                            id="end_date"
                            name="end_date"
                            type="datetime-local"
                            defaultValue={formatDateForInput(evaluation?.end_date)}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="duration_minutes">Duración (minutos) *</Label>
                        <Input
                            id="duration_minutes"
                            name="duration_minutes"
                            type="number"
                            min="1"
                            placeholder="60"
                            defaultValue={evaluation?.duration_minutes}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max_attempts">Intentos Máximos *</Label>
                        <Input
                            id="max_attempts"
                            name="max_attempts"
                            type="number"
                            min="1"
                            max="10"
                            placeholder="1"
                            defaultValue={evaluation?.max_attempts}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Nivel de Protección */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Nivel de Protección Anti-IA</h3>

                <div className="space-y-2 select-pd">
                    <Label htmlFor="protection_level">Nivel de Protección *</Label>
                    <Select
                        name="protection_level"
                        defaultValue={evaluation?.protection_level || 'medium'}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">
                                <div className="flex items-center gap-2 px-2 py-2">
                                    <Shield className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="font-medium">Bajo</p>
                                        <p className="text-xs text-muted-foreground">
                                            Advertencias básicas
                                        </p>
                                    </div>
                                </div>
                            </SelectItem>
                            <SelectItem value="medium">
                                <div className="flex items-center gap-2 px-2 py-2">
                                    <ShieldCheck className="h-4 w-4 text-yellow-500" />
                                    <div>
                                        <p className="font-medium">Medio</p>
                                        <p className="text-xs text-muted-foreground">
                                            Detección activa + registro
                                        </p>
                                    </div>
                                </div>
                            </SelectItem>
                            <SelectItem value="high">
                                <div className="flex items-center gap-2 px-2 py-2">
                                    <ShieldAlert className="h-4 w-4 text-red-500" />
                                    <div>
                                        <p className="font-medium">Alto</p>
                                        <p className="text-xs text-muted-foreground">
                                            Bloqueo automático tras 3 advertencias
                                        </p>
                                    </div>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Alert>
                    <AlertDescription className="text-xs">
                        <strong>Bajo:</strong> Registra eventos pero no bloquea.<br />
                        <strong>Medio:</strong> Advertencias visibles y registro detallado.<br />
                        <strong>Alto:</strong> Bloquea automáticamente tras 3 intentos sospechosos.
                    </AlertDescription>
                </Alert>
            </div>

            {/* Estado */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                    <Label htmlFor="is_active">Evaluación Activa</Label>
                    <p className="text-sm text-muted-foreground">
                        Los estudiantes podrán ver y realizar esta evaluación
                    </p>
                </div>
                <Switch
                    id="is_active"
                    name="is_active"
                    defaultChecked={evaluation?.is_active ?? true}
                    disabled={loading}
                    value="true"
                />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSuccess ? onSuccess() : router.back()}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {evaluation ? 'Actualizando...' : 'Creando...'}
                        </>
                    ) : (
                        evaluation ? 'Actualizar Evaluación' : 'Crear Evaluación'
                    )}
                </Button>
            </div>
        </form>
    )
}