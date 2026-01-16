'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Question } from '@/app/types'
import { deleteQuestion } from '@/app/api/questions/actions'
import { Pencil, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { QuestionFormDialog } from './question-form-dialog'

interface QuestionsListProps {
    questions: Question[]
    evaluationId: string
}

export function QuestionsList({ questions, evaluationId }: QuestionsListProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editQuestion, setEditQuestion] = useState<Question | null>(null)
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return 'Opción Múltiple'
            case 'open':
                return 'Abierta'
            case 'code':
                return 'Código'
            case 'true_false':
                return 'Verdadero/Falso'
            default:
                return type
        }
    }

    const getQuestionPreview = (question: Question) => {
        const content = question.content as any
        switch (question.type) {
            case 'multiple_choice':
                return content.question
            case 'open':
                return content.question
            case 'code':
                return content.question
            case 'true_false':
                return content.statement
            default:
                return 'Sin vista previa'
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        setDeleting(true)
        const { error } = await deleteQuestion(deleteId)

        if (error) {
            toast.error('Error al eliminar', { description: error })
            setDeleting(false)
            return
        }

        toast.success('Pregunta eliminada')
        setDeleteId(null)
        router.refresh()
    }

    if (questions.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">
                    No hay preguntas agregadas a esta evaluación.
                </p>
            </div>
        )
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                        <p className="text-sm font-medium">Total de Preguntas</p>
                        <p className="text-2xl font-bold">{questions.length}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Puntaje Total</p>
                        <p className="text-2xl font-bold">{totalPoints}</p>
                    </div>
                </div>

                {questions.map((question, index) => (
                    <Card key={question.id}>
                        <CardHeader>
                            <div className="flex items-start gap-4">
                                <div className="flex items-center gap-2 mt-1">
                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                                    <span className="font-bold text-lg">{index + 1}.</span>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{getTypeLabel(question.type)}</Badge>
                                        <Badge>{question.points} pts</Badge>
                                    </div>
                                    <p className="text-sm">{getQuestionPreview(question)}</p>

                                    {question.type === 'multiple_choice' && (
                                        <div className="space-y-1">
                                            {(question.content as any).options.map((opt: any, i: number) => (
                                                <div
                                                    key={opt.id}
                                                    className={`text-xs pl-4 ${opt.is_correct ? 'text-green-600 font-medium' : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    {String.fromCharCode(65 + i)}. {opt.text}
                                                    {opt.is_correct && ' ✓'}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditQuestion(question)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteId(question.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            {editQuestion && (
                <QuestionFormDialog
                    open={!!editQuestion}
                    onOpenChange={(open) => !open && setEditQuestion(null)}
                    evaluationId={evaluationId}
                    question={editQuestion}
                />
            )}

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La pregunta será eliminada permanentemente.
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