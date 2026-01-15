'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { startEvaluationAttempt } from '@/app/api/attempts/actions'
import { Evaluation } from '@/app/types'
import {
    Clock,
    FileText,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface EvaluationInstructionsProps {
    evaluation: Evaluation
    questionsCount: number
}

export function EvaluationInstructions({
    evaluation,
    questionsCount,
}: EvaluationInstructionsProps) {
    const [accepted, setAccepted] = useState(false)
    const [starting, setStarting] = useState(false)
    const router = useRouter()

    const handleStart = async () => {
        if (!accepted) {
            toast.error('Debes aceptar las condiciones para continuar')
            return
        }

        setStarting(true)
        const { data, error } = await startEvaluationAttempt(evaluation.id)

        if (error) {
            toast.error('Error al iniciar', { description: error })
            setStarting(false)
            return
        }

        // Recargar la página para mostrar la evaluación
        router.refresh()
    }

    const getProtectionDescription = () => {
        switch (evaluation.protection_level) {
            case 'low':
                return 'Se registrarán eventos pero no se bloqueará automáticamente.'
            case 'medium':
                return 'Se mostrarán advertencias visibles por comportamiento sospechoso.'
            case 'high':
                return 'La evaluación se bloqueará automáticamente tras 3 advertencias.'
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-slate-50 to-slate-100">
            <Card className="w-full max-w-3xl">
                <CardHeader>
                    <CardTitle className="text-3xl">{evaluation.title}</CardTitle>
                    {evaluation.description && (
                        <CardDescription className="text-base">
                            {evaluation.description}
                        </CardDescription>
                    )}
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Información de la Evaluación */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Duración</p>
                                <p className="font-semibold">{evaluation.duration_minutes} minutos</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Preguntas</p>
                                <p className="font-semibold">{questionsCount} preguntas</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Protección</p>
                                <p className="font-semibold capitalize">{evaluation.protection_level}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Intentos</p>
                                <p className="font-semibold">{evaluation.max_attempts} permitido(s)</p>
                            </div>
                        </div>
                    </div>

                    {/* Instrucciones */}
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong className="block mb-2">Instrucciones Importantes:</strong>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Una vez iniciada, el tiempo comenzará a correr automáticamente</li>
                                <li>No podrás pausar la evaluación una vez iniciada</li>
                                <li>Todas tus respuestas se guardan automáticamente</li>
                                <li>
                                    Al finalizar el tiempo, la evaluación se enviará automáticamente
                                </li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {/* Advertencia de Protección */}
                    <Alert variant={evaluation.protection_level === 'high' ? 'destructive' : 'default'}>
                        <ShieldAlert className="h-4 w-4" />
                        <AlertDescription>
                            <strong className="block mb-2">Sistema Anti-Copia Activo:</strong>
                            <p className="text-sm mb-2">{getProtectionDescription()}</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>No intentes copiar o pegar contenido</li>
                                <li>No cambies de pestaña o aplicación durante la evaluación</li>
                                <li>Mantén las herramientas de desarrollo cerradas</li>
                                <li>No uses el clic derecho</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {/* Aceptar Condiciones */}
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                        <Checkbox
                            id="accept"
                            checked={accepted}
                            onCheckedChange={(checked) => setAccepted(checked as boolean)}
                        />
                        <label htmlFor="accept" className="text-sm cursor-pointer">
                            He leído y acepto las condiciones. Entiendo que cualquier intento de hacer
                            trampa será registrado y reportado al profesor. Estoy listo para comenzar
                            la evaluación.
                        </label>
                    </div>

                    {/* Botón Iniciar */}
                    <Button
                        onClick={handleStart}
                        disabled={!accepted || starting}
                        size="lg"
                        className="w-full"
                    >
                        {starting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Iniciando Evaluación...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Iniciar Evaluación
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}