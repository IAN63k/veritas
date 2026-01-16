'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CourseForm } from './course-form'
import { Course } from '@/app/types'

interface CourseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    course?: Course
}

export function CourseDialog({ open, onOpenChange, course }: CourseDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150">
                <DialogHeader>
                    <DialogTitle>
                        {course ? 'Editar Curso' : 'Crear Nuevo Curso'}
                    </DialogTitle>
                    <DialogDescription>
                        {course
                            ? 'Actualiza la información del curso'
                            : 'Completa los datos para crear un nuevo curso'}
                    </DialogDescription>
                </DialogHeader>
                <CourseForm
                    course={course}
                    onSuccess={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}