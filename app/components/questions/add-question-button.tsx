'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { QuestionFormDialog } from './question-form-dialog'
import { Plus } from 'lucide-react'

interface AddQuestionButtonProps {
    evaluationId: string
}

export function AddQuestionButton({ evaluationId }: AddQuestionButtonProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Pregunta
            </Button>
            <QuestionFormDialog open={open} onOpenChange={setOpen} evaluationId={evaluationId} />
        </>
    )
}