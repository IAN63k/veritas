'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { bulkEnrollStudents } from '@/app/api/enrollments/actions'
import { Upload, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface BulkEnrollmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    courseId: string
}

export function BulkEnrollmentDialog({
    open,
    onOpenChange,
    courseId,
}: BulkEnrollmentDialogProps) {
    const [csvData, setCsvData] = useState('')
    const [processing, setProcessing] = useState(false)
    const [result, setResult] = useState<any>(null)
    const router = useRouter()

    const handleProcess = async () => {
        if (!csvData.trim()) {
            toast.error('Por favor ingresa los datos')
            return
        }

        setProcessing(true)
        setResult(null)

        // Parsear CSV manual (formato: nombre,email,codigo)
        const lines = csvData.trim().split('\n')
        const students = lines
            .filter(line => line.trim())
            .map(line => {
                const [name, email, student_code] = line.split(',').map(s => s.trim())
                return { name, email, student_code }
            })
            .filter(s => s.name && s.email && s.student_code)

        if (students.length === 0) {
            toast.error('No se encontraron estudiantes válidos')
            setProcessing(false)
            return
        }

        const { data, error } = await bulkEnrollStudents(courseId, students)

        if (error) {
            toast.error('Error al procesar', { description: error })
            setProcessing(false)
            return
        }

        setResult(data)
        setProcessing(false)
        router.refresh()
    }

    const handleEditFailed = () => {
        if (!result) return

        // Filtrar solo los estudiantes con error
        const failedStudents = result.details
            .filter((detail: any) => detail.status === 'error')
            .map((detail: any) => `${detail.name},${detail.email},${detail.student_code}`)
            .join('\n')

        setCsvData(failedStudents)
        setResult(null)
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'created':
            case 'enrolled':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'exists':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-175 max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Inscripción Masiva de Estudiantes</DialogTitle>
                    <DialogDescription>
                        Ingresa los datos en formato CSV: nombre,email,codigo (uno por línea)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!result && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="csv">Datos de Estudiantes</Label>
                                <Textarea
                                    id="csv"
                                    placeholder="Juan Pérez,juan@example.com,2024001&#10;María García,maria@example.com,2024002&#10;Carlos López,carlos@example.com,2024003"
                                    value={csvData}
                                    onChange={(e) => setCsvData(e.target.value)}
                                    rows={10}
                                    disabled={processing}
                                />
                            </div>

                            <Alert>
                                <AlertDescription>
                                    <strong>Formato:</strong> nombre,email,codigo<br />
                                    <strong>Ejemplo:</strong> Juan Pérez,juan@example.com,2024001
                                </AlertDescription>
                            </Alert>

                            <Button
                                onClick={handleProcess}
                                disabled={processing || !csvData.trim()}
                                className="w-full"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Procesar Estudiantes
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {result && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Alert>
                                    <AlertDescription>
                                        <strong>Exitosos:</strong> {result.success}
                                    </AlertDescription>
                                </Alert>
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        <strong>Fallidos:</strong> {result.failed}
                                    </AlertDescription>
                                </Alert>
                            </div>

                            <div className="space-y-2 max-h-100 overflow-y-auto">
                                {result.details.map((detail: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-3 border rounded-lg"
                                    >
                                        {getStatusIcon(detail.status)}
                                        <div className="flex-1 space-y-1">
                                            <p className="font-medium">{detail.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {detail.email} • {detail.student_code}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {detail.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setResult(null)
                                        setCsvData('')
                                    }}
                                    className="flex-1"
                                >
                                    Nuevo Ingreso
                                </Button>
                                {result.failed > 0 ? (
                                    <Button
                                        onClick={handleEditFailed}
                                        className="flex-1"
                                        variant="destructive"
                                    >
                                        Editar Fallidos ({result.failed})
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => onOpenChange(false)}
                                        className="flex-1"
                                    >
                                        Cerrar
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}