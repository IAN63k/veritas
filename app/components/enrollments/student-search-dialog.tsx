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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { searchStudents, enrollStudent } from '@/app/api/enrollments/actions'
import { Search, Loader2, UserPlus, Mail, Hash } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Student {
    id: string
    name: string
    email: string
    student_code: string
}

interface StudentSearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    courseId: string
}

export function StudentSearchDialog({
    open,
    onOpenChange,
    courseId,
}: StudentSearchDialogProps) {
    const [query, setQuery] = useState('')
    const [students, setStudents] = useState<Student[]>([])
    const [searching, setSearching] = useState(false)
    const [enrolling, setEnrolling] = useState<string | null>(null)
    const router = useRouter()

    const handleSearch = async () => {
        if (!query.trim()) return

        setSearching(true)
        const { data, error } = await searchStudents(query)

        if (error) {
            toast.error('Error al buscar', { description: error })
            setSearching(false)
            return
        }

        setStudents(data || [])
        setSearching(false)
    }

    const handleEnroll = async (studentId: string) => {
        setEnrolling(studentId)
        const { error } = await enrollStudent(courseId, studentId)

        if (error) {
            toast.error('Error al inscribir', { description: error })
            setEnrolling(null)
            return
        }

        toast.success('Estudiante inscrito exitosamente')
        setEnrolling(null)
        setQuery('')
        setStudents([])
        router.refresh()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150">
                <DialogHeader>
                    <DialogTitle>Inscribir Estudiante</DialogTitle>
                    <DialogDescription>
                        Busca estudiantes por nombre, email o código para inscribirlos al curso
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="search">Buscar Estudiante</Label>
                            <Input
                                id="search"
                                placeholder="Nombre, email o código..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleSearch} disabled={searching || !query.trim()}>
                                {searching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {students.length === 0 && query && !searching && (
                        <Alert>
                            <AlertDescription>
                                No se encontraron estudiantes con ese criterio de búsqueda.
                            </AlertDescription>
                        </Alert>
                    )}

                    {students.length > 0 && (
                        <div className="space-y-2 max-h-100 overflow-y-auto">
                            {students.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium">{student.name}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {student.email}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Hash className="h-3 w-3" />
                                                {student.student_code}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleEnroll(student.id)}
                                        disabled={enrolling === student.id}
                                    >
                                        {enrolling === student.id ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Inscribiendo...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Inscribir
                                            </>
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}