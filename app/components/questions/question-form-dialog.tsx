'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createQuestion, updateQuestion } from '@/app/api/questions/actions'
import { Question } from '@/app/types'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface QuestionFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    evaluationId: string
    question?: Question
}

export function QuestionFormDialog({
    open,
    onOpenChange,
    evaluationId,
    question,
}: QuestionFormDialogProps) {
    const [questionType, setQuestionType] = useState<string>(question?.type || 'multiple_choice')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Estados para opción múltiple
    const [multipleChoiceQuestion, setMultipleChoiceQuestion] = useState(
        question?.type === 'multiple_choice' ? (question.content as any).question : ''
    )
    const [options, setOptions] = useState<{ id: string; text: string; is_correct: boolean }[]>(
        question?.type === 'multiple_choice'
            ? (question.content as any).options
            : [
                { id: '1', text: '', is_correct: false },
                { id: '2', text: '', is_correct: false },
                { id: '3', text: '', is_correct: false },
                { id: '4', text: '', is_correct: false },
            ]
    )

    // Estados para pregunta abierta
    const [openQuestion, setOpenQuestion] = useState(
        question?.type === 'open' ? (question.content as any).question : ''
    )
    const [keywords, setKeywords] = useState(
        question?.type === 'open' ? (question.content as any).expected_keywords?.join(', ') || '' : ''
    )

    // Estados para pregunta de código
    const [codeQuestion, setCodeQuestion] = useState(
        question?.type === 'code' ? (question.content as any).question : ''
    )
    const [language, setLanguage] = useState(
        question?.type === 'code' ? (question.content as any).language : 'javascript'
    )
    const [starterCode, setStarterCode] = useState(
        question?.type === 'code' ? (question.content as any).starter_code || '' : ''
    )

    // Estados para verdadero/falso
    const [trueFalseStatement, setTrueFalseStatement] = useState(
        question?.type === 'true_false' ? (question.content as any).statement : ''
    )
    const [correctAnswer, setCorrectAnswer] = useState(
        question?.type === 'true_false' ? (question.content as any).correct_answer : true
    )

    const [points, setPoints] = useState(question?.points || 1)

    const addOption = () => {
        const newId = (Math.max(...options.map((o) => parseInt(o.id))) + 1).toString()
        setOptions([...options, { id: newId, text: '', is_correct: false }])
    }

    const removeOption = (id: string) => {
        if (options.length > 2) {
            setOptions(options.filter((o) => o.id !== id))
        }
    }

    const updateOption = (id: string, field: 'text' | 'is_correct', value: string | boolean) => {
        setOptions(
            options.map((o) => {
                if (o.id === id) {
                    return { ...o, [field]: value }
                }
                return o
            })
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        let content: any = {}

        // Validaciones y construcción del contenido según el tipo
        switch (questionType) {
            case 'multiple_choice':
                if (!multipleChoiceQuestion.trim()) {
                    toast.error('La pregunta es requerida')
                    setLoading(false)
                    return
                }
                if (options.some((o) => !o.text.trim())) {
                    toast.error('Todas las opciones deben tener texto')
                    setLoading(false)
                    return
                }
                if (!options.some((o) => o.is_correct)) {
                    toast.error('Debe marcar al menos una opción como correcta')
                    setLoading(false)
                    return
                }
                content = {
                    question: multipleChoiceQuestion,
                    options: options,
                }
                break

            case 'open':
                if (!openQuestion.trim()) {
                    toast.error('La pregunta es requerida')
                    setLoading(false)
                    return
                }
                content = {
                    question: openQuestion,
                    expected_keywords: keywords ? keywords.split(',').map((k: string) => k.trim()) : [],
                }
                break

            case 'code':
                if (!codeQuestion.trim()) {
                    toast.error('La pregunta es requerida')
                    setLoading(false)
                    return
                }
                content = {
                    question: codeQuestion,
                    language,
                    starter_code: starterCode,
                }
                break

            case 'true_false':
                if (!trueFalseStatement.trim()) {
                    toast.error('La afirmación es requerida')
                    setLoading(false)
                    return
                }
                content = {
                    statement: trueFalseStatement,
                    correct_answer: correctAnswer,
                }
                break
        }

        const questionData = {
            type: questionType,
            content,
            points: parseFloat(points.toString()),
        }

        const result = question
            ? await updateQuestion(question.id, questionData)
            : await createQuestion(evaluationId, questionData)

        if (result.error) {
            toast.error('Error al guardar', { description: result.error })
            setLoading(false)
            return
        }

        setLoading(false)
        toast.success(question ? 'Pregunta actualizada' : 'Pregunta creada')
        onOpenChange(false)
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-175 max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{question ? 'Editar Pregunta' : 'Nueva Pregunta'}</DialogTitle>
                    <DialogDescription>
                        Configura el tipo de pregunta y su contenido
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Selector de Tipo */}
                    {!question && (
                        <div className="space-y-2">
                            <Label>Tipo de Pregunta</Label>
                            <Select value={questionType} onValueChange={setQuestionType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="multiple_choice">Opción Múltiple</SelectItem>
                                    <SelectItem value="open">Pregunta Abierta</SelectItem>
                                    <SelectItem value="code">Código</SelectItem>
                                    <SelectItem value="true_false">Verdadero/Falso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Puntos */}
                    <div className="space-y-2">
                        <Label htmlFor="points">Puntos</Label>
                        <Input
                            id="points"
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={points}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value)
                                setPoints(isNaN(value) ? 0 : value)
                            }}
                            required
                        />
                    </div>

                    {/* Contenido según tipo */}
                    {questionType === 'multiple_choice' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="mc-question">Pregunta *</Label>
                                <Textarea
                                    id="mc-question"
                                    value={multipleChoiceQuestion}
                                    onChange={(e) => setMultipleChoiceQuestion(e.target.value)}
                                    placeholder="Escribe tu pregunta aquí..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Opciones</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Opción
                                    </Button>
                                </div>

                                {options.map((option, index) => (
                                    <div key={option.id} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={option.is_correct}
                                            onCheckedChange={(checked) =>
                                                updateOption(option.id, 'is_correct', checked as boolean)
                                            }
                                        />
                                        <Input
                                            value={option.text}
                                            onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                                            placeholder={`Opción ${index + 1}`}
                                            required
                                        />
                                        {options.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeOption(option.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Alert>
                                <AlertDescription className="text-xs">
                                    Marca con ✓ la(s) opción(es) correcta(s)
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {questionType === 'open' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="open-question">Pregunta *</Label>
                                <Textarea
                                    id="open-question"
                                    value={openQuestion}
                                    onChange={(e) => setOpenQuestion(e.target.value)}
                                    placeholder="Escribe tu pregunta aquí..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="keywords">Palabras Clave Esperadas (opcional)</Label>
                                <Input
                                    id="keywords"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    placeholder="Ej: algoritmo, recursión, complejidad (separadas por coma)"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Ayudan en la revisión manual de respuestas
                                </p>
                            </div>
                        </div>
                    )}

                    {questionType === 'code' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code-question">Pregunta *</Label>
                                <Textarea
                                    id="code-question"
                                    value={codeQuestion}
                                    onChange={(e) => setCodeQuestion(e.target.value)}
                                    placeholder="Describe el problema a resolver..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="language">Lenguaje</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="java">Java</SelectItem>
                                        <SelectItem value="cpp">C++</SelectItem>
                                        <SelectItem value="csharp">C#</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="starter-code">Código Inicial (opcional)</Label>
                                <Textarea
                                    id="starter-code"
                                    value={starterCode}
                                    onChange={(e) => setStarterCode(e.target.value)}
                                    placeholder="function solucion() {&#10;  // Tu código aquí&#10;}"
                                    rows={5}
                                    className="font-mono text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {questionType === 'true_false' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tf-statement">Afirmación *</Label>
                                <Textarea
                                    id="tf-statement"
                                    value={trueFalseStatement}
                                    onChange={(e) => setTrueFalseStatement(e.target.value)}
                                    placeholder="Escribe la afirmación a evaluar..."
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Respuesta Correcta</Label>
                                <Select
                                    value={correctAnswer.toString()}
                                    onValueChange={(v) => setCorrectAnswer(v === 'true')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Verdadero</SelectItem>
                                        <SelectItem value="false">Falso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : question ? (
                                'Actualizar'
                            ) : (
                                'Crear Pregunta'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}