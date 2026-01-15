'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AntiCopyWrapper } from './anti-copy-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { submitEvaluationAttempt } from '@/app/api/attempts/actions'
import { Evaluation, Question } from '@/app/types'
import { Clock, Send } from 'lucide-react'
import { toast } from 'sonner'
import { QuestionRenderer } from './question-renderer'

interface EvaluationInterfaceProps {
    evaluation: Evaluation
    questions: Question[]
    attempt: any
}

export function EvaluationInterface({
    evaluation,
    questions,
    attempt,
}: EvaluationInterfaceProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [timeRemaining, setTimeRemaining] = useState(evaluation.duration_minutes * 60)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleAnswer = (questionId: string, answer: any) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    }

    const handleSubmit = async () => {
        setSubmitting(true)

        const { error } = await submitEvaluationAttempt(attempt.id, answers)

        if (error) {
            toast.error('Error al enviar', { description: error })
            setSubmitting(false)
            return
        }

        toast.success('Evaluación enviada exitosamente')
        router.push('/student/my-courses')
    }

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100
    const answeredCount = Object.keys(answers).length

    return (
        <AntiCopyWrapper
            attemptId={attempt.id}
            protectionLevel={evaluation.protection_level}
            maxWarnings={3}
        >
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{evaluation.title}</h1>
                            <p className="text-sm text-muted-foreground">
                                Pregunta {currentQuestionIndex + 1} de {questions.length}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant={timeRemaining < 300 ? 'destructive' : 'secondary'} className="text-lg px-4 py-2">
                                <Clock className="mr-2 h-4 w-4" />
                                {formatTime(timeRemaining)}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Respondidas: {answeredCount}/{questions.length}
                            </span>
                            <span className="text-muted-foreground">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} />
                    </div>
                </div>

                {/* Pregunta Actual */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Pregunta {currentQuestionIndex + 1}</CardTitle>
                            <Badge>{questions[currentQuestionIndex].points} pts</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <QuestionRenderer
                            question={questions[currentQuestionIndex]}
                            answer={answers[questions[currentQuestionIndex].id]}
                            onAnswer={(answer) => handleAnswer(questions[currentQuestionIndex].id, answer)}
                        />
                    </CardContent>
                </Card>

                {/* Navegación */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        Anterior
                    </Button>

                    <div className="flex gap-2">
                        {questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${index === currentQuestionIndex
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : answers[questions[index].id]
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-muted-foreground/30 hover:border-primary'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? (
                                'Enviando...'
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Enviar Evaluación
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={() =>
                                setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                            }
                        >
                            Siguiente
                        </Button>
                    )}
                </div>
            </div>
        </AntiCopyWrapper>
    )
}