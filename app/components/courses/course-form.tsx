'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createCourse, updateCourse } from '@/app/api/courses/actions'
import { Course } from '@/app/types'
import { Loader2 } from 'lucide-react'

interface CourseFormProps {
    course?: Course
    onSuccess?: () => void
}

export function CourseForm({ course, onSuccess }: CourseFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const result = course
                ? await updateCourse(course.id, formData)
                : await createCourse(formData)

            if (result.error) {
                setError(result.error)
                setLoading(false)
                return
            }

            // Éxito
            if (onSuccess) {
                onSuccess()
            } else {
                router.push('/teacher/courses')
                router.refresh()
            }
        } catch (err) {
            setError('Ocurrió un error inesperado')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Nombre del Curso *</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Ej: Programación III"
                    defaultValue={course?.name}
                    required
                    disabled={loading}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Código *</Label>
                    <Input
                        id="code"
                        name="code"
                        placeholder="Ej: PROG-301"
                        defaultValue={course?.code}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="period">Período *</Label>
                    <Input
                        id="period"
                        name="period"
                        placeholder="Ej: 2024-1"
                        defaultValue={course?.period}
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Descripción opcional del curso..."
                    defaultValue={course?.description || ''}
                    rows={4}
                    disabled={loading}
                />
            </div>

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
                            {course ? 'Actualizando...' : 'Creando...'}
                        </>
                    ) : (
                        course ? 'Actualizar Curso' : 'Crear Curso'
                    )}
                </Button>
            </div>
        </form>
    )
}