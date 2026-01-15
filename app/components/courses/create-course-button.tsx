'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CourseDialog } from './course-dialog'
import { Plus } from 'lucide-react'

export function CreateCourseButton() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Curso
            </Button>
            <CourseDialog open={open} onOpenChange={setOpen} />
        </>
    )
}