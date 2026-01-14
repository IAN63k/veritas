'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StudentSearchDialog } from './student-search-dialog'
import { UserPlus } from 'lucide-react'

interface AddStudentButtonProps {
    courseId: string
}

export function AddStudentButton({ courseId }: AddStudentButtonProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Inscribir Estudiante
            </Button>
            <StudentSearchDialog
                open={open}
                onOpenChange={setOpen}
                courseId={courseId}
            />
        </>
    )
}