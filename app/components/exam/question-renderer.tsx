'use client'

import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Question } from '@/app/types'

interface QuestionRendererProps {
    question: Question
    answer: any
    onAnswer: (answer: any) => void
}

export function QuestionRenderer({ question, answer, onAnswer }: QuestionRendererProps) {
    const content = question.content as any

    switch (question.type) {
        case 'multiple_choice':
            return (
                <div className="space-y-4">
                    <p className="text-lg font-medium mb-4">{content.question}</p>
                    <RadioGroup value={answer || ''} onValueChange={onAnswer}>
                        {content.options.map((option: any, index: number) => (
                            <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                                <Label htmlFor={`option-${option.id}`} className="cursor-pointer flex-1">
                                    {String.fromCharCode(65 + index)}. {option.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            )

        case 'open':
            return (
                <div className="space-y-4">
                    <p className="text-lg font-medium mb-4">{content.question}</p>
                    <Textarea
                        value={answer || ''}
                        onChange={(e) => onAnswer(e.target.value)}
                        placeholder="Escribe tu respuesta aquí..."
                        rows={8}
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        {answer?.length || 0} caracteres
                    </p>
                </div>
            )

        case 'code':
            return (
                <div className="space-y-4">
                    <p className="text-lg font-medium mb-4">{content.question}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                        Lenguaje: {content.language}
                    </p>
                    <Textarea
                        value={answer || content.starter_code || ''}
                        onChange={(e) => onAnswer(e.target.value)}
                        placeholder="// Escribe tu código aquí..."
                        rows={15}
                        className="font-mono text-sm resize-none"
                    />
                </div>
            )

        case 'true_false':
            return (
                <div className="space-y-4">
                    <p className="text-lg font-medium mb-4">{content.statement}</p>
                    <RadioGroup value={answer?.toString() || ''} onValueChange={(v) => onAnswer(v === 'true')}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="true" />
                            <Label htmlFor="true" className="cursor-pointer">
                                Verdadero
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="false" />
                            <Label htmlFor="false" className="cursor-pointer">
                                Falso
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            )

        default:
            return <p>Tipo de pregunta no soportado</p>
    }
}