'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { unenrollStudent, bulkUnenrollStudents } from '@/app/api/enrollments/actions'
import { Trash2, Mail, Hash, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface EnrolledStudent {
    id: string
    enrolled_at: string
    students: {
        id: string
        name: string
        email: string
        student_code: string
    }
}

interface EnrolledStudentsTableProps {
    enrollments: EnrolledStudent[]
    courseId: string
}

export function EnrolledStudentsTable({
    enrollments,
    courseId,
}: EnrolledStudentsTableProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
    const router = useRouter()

    const handleUnenroll = async () => {
        if (!deleteId) return

        setDeleting(true)
        const { error } = await unenrollStudent(deleteId, courseId)

        if (error) {
            toast.error('Error al desinscribir', { description: error })
            setDeleting(false)
            return
        }

        toast.success('Estudiante desinscrito exitosamente')
        setDeleting(false)
        setDeleteId(null)
        router.refresh()
    }

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return

        setDeleting(true)
        const { error, count } = await bulkUnenrollStudents(Array.from(selectedIds), courseId)

        if (error) {
            toast.error('Error al desinscribir estudiantes', { description: error })
            setDeleting(false)
            return
        }

        toast.success(`${count} estudiante(s) desinscrito(s) exitosamente`)
        setDeleting(false)
        setSelectedIds(new Set())
        setBulkDeleteOpen(false)
        router.refresh()
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === enrollments.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(enrollments.map(e => e.id)))
        }
    }

    const toggleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    if (enrollments.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">
                    No hay estudiantes inscritos en este curso aún.
                </p>
            </div>
        )
    }

    return (
        <>
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
                    <span className="text-sm font-medium">
                        {selectedIds.size} estudiante(s) seleccionado(s)
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setBulkDeleteOpen(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Desinscribir seleccionados
                    </Button>
                </div>
            )}

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.size === enrollments.length && enrollments.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Seleccionar todos"
                                />
                            </TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Fecha de Inscripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {enrollments.map((enrollment) => (
                            <TableRow key={enrollment.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(enrollment.id)}
                                        onCheckedChange={() => toggleSelectOne(enrollment.id)}
                                        aria-label={`Seleccionar ${enrollment.students.name}`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    {enrollment.students.name}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm">{enrollment.students.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-3 w-3 text-muted-foreground" />
                                        <Badge variant="outline">{enrollment.students.student_code}</Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(enrollment.enrolled_at), 'PP', { locale: es })}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteId(enrollment.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desinscribir estudiante?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará al estudiante del curso. El estudiante perderá acceso
                            a todas las evaluaciones del curso.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleUnenroll}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? 'Desinscribiendo...' : 'Desinscribir'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desinscribir {selectedIds.size} estudiante(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará a los estudiantes seleccionados del curso. Perderán acceso
                            a todas las evaluaciones del curso.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? 'Desinscribiendo...' : 'Desinscribir todos'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}