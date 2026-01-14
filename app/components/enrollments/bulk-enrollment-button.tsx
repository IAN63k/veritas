'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BulkEnrollmentDialog } from './bulk-enrollment-dialog'
import { Upload } from 'lucide-react'

interface BulkEnrollmentButtonProps {
    courseId: string
}

export function BulkEnrollmentButton({ courseId }: BulkEnrollmentButtonProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Carga Masiva
            </Button>
            <BulkEnrollmentDialog
                open={open}
                onOpenChange={setOpen}
                courseId={courseId}
            />
        </>
    )
}