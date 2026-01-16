'use client'

import { useRouter } from 'next/navigation'
import { useAntiCopy } from '@/app/hooks/use-anti-copy'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, AlertTriangle } from 'lucide-react'
import { ProtectionLevel } from '@/lib/anti-copy/detectors'

interface AntiCopyWrapperProps {
    attemptId: string
    protectionLevel: ProtectionLevel
    maxWarnings?: number
    children: React.ReactNode
}

export function AntiCopyWrapper({
    attemptId,
    protectionLevel,
    maxWarnings = 3,
    children,
}: AntiCopyWrapperProps) {
    const router = useRouter()

    const { warnings, isBlocked } = useAntiCopy({
        attemptId,
        protectionLevel,
        maxWarnings,
        onBlock: () => {
            // Redirigir después de bloqueo
            setTimeout(() => {
                router.push('/student/my-courses')
            }, 3000)
        },
    })

    if (isBlocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="max-w-md text-center space-y-4">
                    <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-10 w-10 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold text-destructive">Evaluación Bloqueada</h1>
                    <p className="text-muted-foreground">
                        Se detectaron múltiples intentos de comportamiento inadecuado durante la evaluación.
                        El intento ha sido bloqueado y reportado al profesor.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Serás redirigido a tus cursos en unos segundos...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background select-none">
            {/* Barra de Advertencias */}
            {warnings > 0 && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
                    <div className="container mx-auto px-4 py-3">
                        <Alert variant={warnings >= maxWarnings - 1 ? 'destructive' : 'default'}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription className="flex items-center justify-between">
                                <span>
                                    {warnings >= maxWarnings - 1
                                        ? '¡ÚLTIMA ADVERTENCIA! El siguiente intento bloqueará tu evaluación.'
                                        : `Comportamiento sospechoso detectado. Advertencias: ${warnings}/${maxWarnings}`}
                                </span>
                                <Badge variant={warnings >= maxWarnings - 1 ? 'destructive' : 'secondary'}>
                                    {warnings}/{maxWarnings}
                                </Badge>
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            )}

            {/* Contenido de la Evaluación */}
            <div className={warnings > 0 ? 'pt-20' : ''}>
                {children}
            </div>

            {/* Indicador de Protección (esquina inferior derecha) */}
            <div className="fixed bottom-4 right-4 z-40">
                <Badge variant="outline" className="flex items-center gap-2">
                    <ShieldAlert className="h-3 w-3" />
                    <span className="text-xs">
                        Protección:{' '}
                        {protectionLevel === 'low' ? 'Baja' : protectionLevel === 'medium' ? 'Media' : 'Alta'}
                    </span>
                </Badge>
            </div>
        </div>
    )
}