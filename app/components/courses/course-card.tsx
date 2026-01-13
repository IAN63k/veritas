'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Course } from '@/app/types'
import { deleteCourse } from '@/app/api/courses/actions'
import { MoreVertical, Pencil, Trash2, Users, FileText, Eye } from 'lucide-react'
import { CourseDialog } from './course-dialog'
import { toast } from 'sonner'

interface CourseCardProps {
    course: Course
    stats?: {
        students: number
        evaluations: number
    }
}

export function CourseCard({ course, stats }: CourseCardProps) {
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setDeleting(true)
        const result = await deleteCourse(course.id)

        if (result.error) {
            toast.error('Error al eliminar', {
                description: result.error,
            })
            setDeleting(false)
            return
        }

        toast.success('Curso eliminado', {
            description: 'El curso ha sido eliminado exitosamente',
        })

        setShowDeleteDialog(false)
        router.refresh()
    }

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                            <CardTitle className="text-xl">{course.name}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">{course.code}</Badge>
                                <Badge variant="outline">{course.period}</Badge>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/teacher/courses/${course.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    {course.description && (
                        <CardDescription className="line-clamp-2">
                            {course.description}
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {stats?.students || 0} estudiantes
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {stats?.evaluations || 0} evaluaciones
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/teacher/courses/${course.id}`)}
                    >
                        Ver Curso
                    </Button>
                </CardFooter>
            </Card>

            {/* Edit Dialog */}
            <CourseDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                course={course}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el curso "{course.name}" y todos sus datos asociados
                            (evaluaciones, inscripciones, etc.). Esta acción no se puede deshacer.
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